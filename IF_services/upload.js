'use strict';

var express = require('express'),
    router = express.Router(),
    _ = require('lodash'),
    q = require('q'),
    async = require('async'),
    AWS = require('aws-sdk'),
    crypto = require('crypto'),
    urlify = require('urlify').create({
        addEToUmlauts: true,
        szToSs: true,
        spaces: "_",
        nonPrintable: "_",
        trim: true
    }),
    im = require('imagemagick'),
    fs = require('fs'),
    request = require('request'),
    Promise = require('bluebird');

module.exports = {
    uploadPicture: function(str, image, quality, bot) {
        var qual = quality ? quality : 100
        return new Promise(function(resolve, reject) {
            function convertBase64(image) {
                return new Promise(function(resolve, reject) {
                    //Detect if the passed image is base64 already or a URI
                    var base64Matcher = new RegExp("^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$");
                    if (base64Matcher.test(image)) {
                        resolve(image)
                    } else {
                        request({
                            url: image.toString(),
                            encoding: 'base64'
                        }, function(err, res, body) {
                            if (!err && res.statusCode == 200) {
                                var base64prefix = 'data:' + res.headers['content-type'] + ';base64,';
                                resolve(body)
                            } else {
                                if (err) {
                                    console.log(err.lineNumber + err)
                                }
                                console.log('body: ', body)
                                reject('Cannot download image.')
                            }
                        });
                    }
                })
            }

            convertBase64(image).then(function(base64) {
                    var tmpfilename = urlify(str + '_' + (new Date().toString()))
                    var inputPath = __dirname + "/temp/" + tmpfilename + ".png";
                    var outputPath = __dirname + "/temp/" + tmpfilename + ".png";
                    fs.writeFile(inputPath, base64, 'base64', function(err) {
                            if (err) console.log('57', err);
                            im.resize({
                                srcPath: inputPath,
                                dstPath: outputPath,
                                strip: true,
                                quality: qual
                                ,width: 290
                            }, function(err, stdout, stderr) {
                                if (err) console.log(err.lineNumber + err)

                                fs.readFile(outputPath, function(err, buffer) {
                                    //If bot boolean true, skip upload to AWS and resolve saved image, then delete
                                    if (bot) {
                                        // console.log('upload module 69: getting to if-->bot', outputPath,buffer,image)
                                        return resolve(outputPath)
                                        //  if (outputPath) {
                                        //     // console.log('OUTPUT PATH: ', outputPath)
                                        //     wait(function() {
                                        //         fs.unlink(outputPath, function(err, res) {
                                        //             if (err) console.log('fs error: ', err)
                                        //         })
                                        //     }, 10000);
                                        // }
                                        // if (inputPath) {
                                        //     // console.log('INPUT PATH: ', inputPath)
                                        //     wait(function() {
                                        //         fs.unlink(inputPath, function(err, res) {
                                        //             // if (err) console.log('fs error: ', err)
                                        //         })
                                        //     }, 10000);
                                        // }
                                        // return
                                    }
                                    console.log('upload.js. 90 should not be getting here/')
                                    var object_key = crypto.createHash('md5').update(str).digest('hex');
                                    var awsKey = object_key + ".png";
                                    var s3 = new AWS.S3();
                                    //Check if file already exists
                                    var params = {
                                        Bucket: 'if-server-general-images',
                                        Key: awsKey
                                    };
                                    //Check if file already exists on AWS
                                    s3.headObject(params, function(err, metadata) {
                                        //If image does not yet exist
                                        if (err && err.code == 'NotFound') {
                                            s3.putObject({
                                                Bucket: 'if-server-general-images',
                                                Key: awsKey,
                                                Body: buffer,
                                                ACL: 'public-read'
                                            }, function(err, data) {
                                                if (outputPath) {
                                                    // console.log('OUTPUT PATH: ', outputPath)
                                                    wait(function() {
                                                        fs.unlink(outputPath, function(err, res) {
                                                            // if (err) console.log('fs error: ', err)
                                                        })
                                                    }, 500);
                                                }
                                                if (inputPath) {
                                                    // console.log('INPUT PATH: ', inputPath)
                                                    wait(function() {
                                                        fs.unlink(inputPath, function(err, res) {
                                                            // if (err) console.log('fs error: ', err)
                                                        })
                                                    }, 500);
                                                }
                                                if (err) {
                                                      console.log('Upload error: ' + err)
                                                    wait(function() {
                                                         return reject(err)
                                                    }, 1000)
                                                } else {
                                                    var imgURL = "https://s3.amazonaws.com/if-server-general-images/" + awsKey
                                                    console.log('Uploaded to AWS.', imgURL)
                                                    wait(function() {
                                                        resolve(imgURL)
                                                    }, 1000)
                                                }
                                            });

                                            //If image exists                                       
                                        } else {
                                            // console.log('Image exists.', awsKey)
                                            if (outputPath) {
                                                // console.log('OUTPUT PATH: ', outputPath)
                                                wait(function() {
                                                    fs.unlink(outputPath, function(err, res) {
                                                        if (err) console.log('fs error: ', err)
                                                    })
                                                }, 500);
                                            }
                                            if (inputPath) {
                                                // console.log('INPUT PATH: ', inputPath)
                                                wait(function() {
                                                    fs.unlink(inputPath, function(err, res) {
                                                        // if (err) console.log('fs error: ', err)
                                                    })
                                                }, 500);
                                            }
                                            s3.getSignedUrl('getObject', params, function(err, imgURL) {
                                                if (err) {
                                                    console.log('s3 getSigned Url error: ' + err)
                                                    wait(function() {
                                                         return reject(err)
                                                    }, 1000)
                                                } else {
                                                    var imgURLt = "https://s3.amazonaws.com/if-server-general-images/" + awsKey
                                                    wait(function() {
                                                        resolve(imgURLt)
                                                    }, 1000)
                                                }
                                            });
                                        }
                                    });
                                }); //END OF FS READFILE
                            }); //END OF CONVERT
                        }) // END OF FS WRITEFILE
                }).catch(function(err) {
                    if (err) {
                        console.log(err.lineNumber + err)
                        reject('There was an error in converting the image')
                    }

                }) //END OF CONVERTBASE64
        }); //END OF BLUEBIRD
    },
    uploadPictures: function(str, array, quality) {
        var self = this;
        var str = str;
        var images = [];
        return new Promise(function(resolve, reject) {
            var count = 0
            async.eachSeries(array, function iterator(image, cb) {
                str = str + '_' + count.toString()
                self.uploadPicture(str, image, quality).then(function(url) {
                    images.push(url)
                    count++;
                    wait(cb, 1000)
                }).catch(function(err) {
                    if (err) {
                        console.log(err.lineNumber + err)
                    }
                    count++;
                    wait(cb, 1000)
                })
            }, function finished(err) {
                if (err) {
                    console.log(err.lineNumber + err)
                    return reject(err)
                }
                images = _.uniq(images)
                resolve(images)
            })
        })
    }
}

function wait(callback, delay) {
    var startTime = new Date().getTime();
    while (new Date().getTime() < startTime + delay);
    callback();
}