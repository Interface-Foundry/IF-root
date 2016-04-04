'use strict';
const forge = require('node-forge');
const fs = require('fs');
const debug = require('debug')('skype-sdk.azure-utils');

const ExpectedRootAuthority = 'CN=Baltimore CyberTrust Root OU=CyberTrust O=Baltimore C=IE';
const Sha2Prefixes = [ 'sha256', 'sha384', 'sha512' ];
const Sha1WithRsaOid = '1.3.14.3.2.29';
/**
 * Create a middleware for checking https connection in Azure.
 * 
 * @param {bool} redirect - If true, http traffic will be redirected to https endpoint.
 * @param {Number} errorStatus - If redirect is false, errorStatus is the returned error code.
 */
function ensureHttps(redirect, errorStatus) {
    errorStatus = errorStatus || 404;
    debug(`Creating ensureHttps middleware. Redirect: ${redirect}, in case of no redirect, the error will be ${errorStatus}`);
        
    return (req, res, next) => {
        debug('New request received, checking if over HTTPS');
        if (req.headers['x-site-deployment-id'] && req.headers['x-arr-ssl']) {
            debug('Request received over HTTPS, continuing.');
            return next();
        } else if (req.secure) {
            debug('Request received over HTTPS, continuing.');
            return next();
        } else if (redirect) {
            debug('Request not received over HTTPS, redirecting to HTTPS endpoint.');
            res.redirect(`https://${req.hostname}${req.originalUrl}`, next);
        } else {
            debug(`Request not received over HTTPS, responding with error status ${errorStatus}.`);
            res.send(errorStatus);
        }
    };
}

function loadCaCertificates(dirPath)
{
    try {

        let caDir = fs.lstatSync(dirPath);
        let caCertFiles = [];

        if (caDir.isDirectory()) {
            let files = fs.readdirSync(dirPath);
            for(let i in files)
            {
                try {
                    let fileData = fs.readFileSync(dirPath + '/' + files[i], 'binary');
                    let certificates = forge.pem.decode(fileData);
                    if(certificates != null)
                    {
                        certificates.forEach(item => {
                            let asnCertificate = forge.asn1.fromDer(item.body);
                            caCertFiles.push(forge.pki.certificateFromAsn1(asnCertificate, true));
                        });
                    }
                }
                catch(e)
                {
                    debug(`Failed to load CA certificate from ${files[i]}, error: ${e.message}.`);
                }
            }

            return caCertFiles;
        }
        else
        {
            throw new Error(`Path to CA certificates directory ${dirPath} is not a valid directory`);
        }
    }
    catch (e) {
        throw new Error(`Failed to load CA certificate files from directory ${dirPath}, error: ${e.message}`);
    }
}

function getFullSubject(subject)
{
    let fullName;
    subject.attributes.forEach(item => { fullName = item.shortName + '=' + item.value + ' ' + (fullName == null ? '' : fullName); } );
    return fullName.trim();
}

function determineHashAlgorithm(certificate)
{
    if(certificate.signatureOid in forge.pki.oids) {
        return forge.pki.oids[certificate.signatureOid];
    }

    if(certificate.signatureOid == Sha1WithRsaOid)
    {
        return 'sha1WithRSA';
    }

    return null;
}

/**
 * Create a middleware for verifying client certificates in Azure.
 * The service needs to have [TLS Mutual Authentication]{@link https://azure.microsoft.com/en-gb/documentation/articles/app-service-web-configure-tls-mutual-auth/} enabled.
 * 
 * @param {Object} options - The configuration for the middleware.
 * @param {Number} [options.errorStatus=403] - The error status that should be returned if client doesn't provide valid certificate.
 * @param {string[]} [options.allowedCommonNames] - The list of allowed certificates (CNs). Clients with .skype.net and .skype.com are always enabled.
 * @param {string[]} [options.caCertsDir] - Directory with certificates of all the relevant CA authoritites in PEM format (can be multiple in one file)
 */
function verifySkypeCert(options) {
    options = options || {};
    const errorStatus = options.errorStatus || 403;
    const allowedCommonNames = options.allowedCommonNames || [];
    allowedCommonNames.push('.skype.net');
    allowedCommonNames.push('.skype.com');
    const caCertsDir = options.caCertsDir || (__dirname + '/../../certificates/ca');

    debug(`Creating verifySkypeCert middleware. Allowed common names are: ${allowedCommonNames}. If certificate not allowed, the error will be ${errorStatus}`);
    
    const caCerts = loadCaCertificates(caCertsDir);

    const caStore = forge.pki.createCaStore(caCerts);
    
    return (req, res, next) => {
        debug('New request received, checking certificate');
        if (req.headers['x-site-deployment-id']) { 
            if (req.headers['x-arr-clientcert']) {
                debug('Running in Azure and client certificate found.');
                const parsedCert = forge.pki.certificateFromAsn1(forge.asn1.fromDer(forge.util.decode64(req.headers['x-arr-clientcert'])));
                try {
                    const cn = parsedCert.subject.getField('CN').value.trim();
                    const algorithm = determineHashAlgorithm(parsedCert);
                    const validFrom = parsedCert.validity.notBefore;
                    const validTo = parsedCert.validity.notAfter;

                    // check it is not expired
                    let now = Date.now();
                    if(validFrom > now || validTo < now)
                    {
                        debug(`Certificate is expired or not active yet, validity: ${validFrom}-${validTo}, now: ${now}`);
                        return res.send(errorStatus);
                    }

                    // check it is a SHA2 certificate
                    let algorithmFound = algorithm == null;
                    if(algorithm != null) {
                        for (let i = 0; i < Sha2Prefixes.length; ++i) {
                            if (algorithm.startsWith(Sha2Prefixes[i])) {
                                algorithmFound = true;
                                break;
                            }
                        }
                    }
                    if(algorithm == null)
                    {
                        debug(`Unknown algorithm with OID ${parsedCert.signatureOid}, but allowing it to continue`);
                    }
                    if(!algorithmFound)
                    {
                        debug(`Unsupported certificate signature algorithm, expected SHA2, found ${algorithm}`);
                        return res.send(errorStatus);
                    }

                    // check it has valid CN name
                    let cnFound = false;
                    for(let i = 0; i < allowedCommonNames.length; ++i)
                    {
                        if(cn.endsWith(allowedCommonNames[i])){
                            cnFound = true;
                            break;
                        }
                    }
                    if(!cnFound)
                    {
                        debug(`Unexpected client name in certificate, found ${cn}`);
                        return res.send(errorStatus);
                    }

                    // finally validate the CA chain up to the expected root certificate
                    let currentCert = parsedCert;
                    for(;;)
                    {
                        let currentName = getFullSubject(currentCert.subject);
                        let issuerName = getFullSubject(currentCert.issuer);
                        let issuerCert = caStore.getIssuer(currentCert);
                        if(issuerCert == null)
                        {
                            debug(`Haven't found issuer certificate ${issuerName} in the CA store for ${currentName}`);
                            return res.send(errorStatus);
                        }
                        let verified = issuerCert.verify(currentCert);
                        if(!verified)
                        {
                            debug(`Issuer certificate ${issuerName} didn't verify ${currentName} successfully`);
                            return res.send(errorStatus);
                        }
                        if(issuerName === currentName) break;
                        currentCert = issuerCert;
                    }

                    let rootAuthorityName = getFullSubject(currentCert.subject);
                    if(rootAuthorityName === ExpectedRootAuthority)
                    {
                        debug('Client certificate is valid');
                        return next();
                    }
                    debug(`Certificate chain is valid, but root authority name is not, found ${rootAuthorityName}`);
                    return res.send(errorStatus);
                } catch (e) {
                    debug(`Exception received -  ${e.message} - ${e.error}`);
                    return res.send(errorStatus);
                }
            }
            debug(`Valid client certificate not received, sending error code ${errorStatus}`);
            res.send(errorStatus);
        } else {
            debug('Not running in Azure, ignoring certificates.');
            next();
        }
    };
}

module.exports = {
    ensureHttps,
    verifySkypeCert
};