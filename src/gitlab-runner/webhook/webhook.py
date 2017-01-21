import hmac
from hashlib import sha1
from json import loads, dumps
from subprocess import Popen, PIPE
from tempfile import mkstemp
from os import access, X_OK, remove, fdopen
from os.path import isfile, abspath, normpath, dirname, join, basename
# from threading import Thread

import subprocess
import sys

import requests
from ipaddress import ip_address, ip_network
from flask import Flask, request, abort

import logging
from sys import hexversion
# from subprocess import call

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')

application = Flask(__name__)


def run_scripts(scripts, tmpfile, event):
    # call(['/bin/bash', '/app/hooks/push-dev'])
    # ran = {}
    # for s in scripts:
    #     proc = Popen(
    #         [s, tmpfile, event],
    #         stdout=PIPE, stderr=PIPE
    #     )
    #     stdout, stderr = proc.communicate()
    #     ran[basename(s)] = {
    #         'returncode': proc.returncode,
    #         'stdout': stdout,
    #         'stderr': stderr,
    #     }

    #     # Log errors if a hook failed
    #     if proc.returncode != 0:
    #         logging.error('{} : {} \n{}'.format(
    #             s, proc.returncode, stderr
    #         ))

    # # Remove temporal file
    remove(tmpfile)
    return True


@application.route('/', methods=['GET', 'POST'])
def index():
    """
    Main WSGI application entry.
    """
    logging.info('got request')
    path = normpath(abspath(dirname(__file__)))

    # Only POST is implemented
    if request.method != 'POST':
        abort(501)

    # Load config
    with open(join(path, 'config.json'), 'r') as cfg:
        config = loads(cfg.read())

    logging.info('loaded config')
    hooks = config.get('hooks_path', join(path, 'hooks'))

    # Allow Github IPs only
    if config.get('github_ips_only', True):
        src_ip = ip_address(
            '{}'.format(request.remote_addr)
        )
        whitelist = requests.get('https://api.github.com/meta').json()['hooks']

        for valid_ip in whitelist:
            if src_ip in ip_network(valid_ip):
                break
        else:
            abort(403)

    logging.info('checking for enforce secret')
    # Enforce secret
    secret = config.get('enforce_secret', '')
    if secret:
        logging.info('enforce secret')
        # Only SHA1 is supported
        header_signature = request.headers.get('X-Hub-Signature')
        if header_signature is None:
            abort(403)

        sha_name, signature = header_signature.split('=')
        if sha_name != 'sha1':
            abort(501)

        # HMAC requires the key to be bytes, but data is string
        mac = hmac.new(secret.encode(), msg=request.data, digestmod=sha1)

        # Python prior to 2.7.7 does not have hmac.compare_digest
        if hexversion >= 0x020707F0:
            if not hmac.compare_digest(str(mac.hexdigest()), str(signature)):
                abort(403)
        else:
            # What compare_digest provides is protection against timing
            # attacks; we can live without this protection for a web-based
            # application
            if not str(mac.hexdigest()) == str(signature):
                abort(403)

    # Implement ping
    event = request.headers.get('X-GitHub-Event', 'ping')
    if event == 'ping':
        return dumps({'msg': 'pong'})

    logging.info('gathering data')
    # Gather data
    try:
        payload = request.json
        logging.info('received req')
    except:
        logging.error('request failed', request)
        abort(400)

    # Determining the branch is tricky, as it only appears for certain event
    # types an at different levels
    branch = None
    try:
        # Case 1: a ref_type indicates the type of ref.
        # This true for create and delete events.
        if 'ref_type' in payload:
            if payload['ref_type'] == 'branch':
                branch = payload['ref']

        # Case 2: a pull_request object is involved. This is pull_request and
        # pull_request_review_comment events.
        elif 'pull_request' in payload:
            # This is the TARGET branch for the pull-request, not the source
            # branch
            branch = payload['pull_request']['base']['ref']

        elif event in ['push']:
            # Push events provide a full Git ref in 'ref' and not a 'ref_type'.
            branch = payload['ref'].split('/')[2]

        logging.info('got branch')
    except KeyError:
        # If the payload structure isn't what we expect, we'll live without
        # the branch name
        logging.info('missed branch')
        pass

    # All current events have a repository, but some legacy events do not,
    # so let's be safe
    name = payload['repository']['name'] if 'repository' in payload else None

    meta = {
        'name': name,
        'branch': branch,
        'event': event
    }
    logging.info('Metadata:\n{}'.format(dumps(meta)))

    # Possible hooks
    scripts = []
    if branch:
        scripts.append(join(hooks, '{event}-{branch}'.format(**meta)))
    # if name:
    #    scripts.append(join(hooks, '{event}-{name}'.format(**meta)))
    scripts.append(join(hooks, '{event}'.format(**meta)))
    scripts.append(join(hooks, 'all'))

    # Check permissions
    # scripts = [s for s in scripts if isfile(s) and access(s, X_OK)]
    # if not scripts:
    #     return ''

    # Save payload to temporal file
    # osfd, tmpfile = mkstemp()
    # with fdopen(osfd, 'w') as pf:
    #     pf.write(dumps(payload))

    # Run scripts
    # t = Thread(target=run_scripts, args=(scripts, tmpfile, event))
    # t.start()
    logging.info('running a script...')
    subprocess.Popen(["/app/hooks/push-dev"])
    # remove(tmpfile)
    return dumps({'msg': 'hopefully cloning'})


if __name__ == '__main__':
    application.run(host='0.0.0.0', port=5000, debug=True)
