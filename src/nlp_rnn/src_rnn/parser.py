import argparse
import json
import sys

from googleapiclient import discovery
import httplib2
from oauth2client.client import GoogleCredentials


def get_service():
    credentials = GoogleCredentials.get_application_default()
    scoped_credentials = credentials.create_scoped(
        ['https://www.googleapis.com/auth/cloud-platform'])
    http = httplib2.Http()
    scoped_credentials.authorize(http)
    return discovery.build('language', 'v1beta1', http=http)


def get_native_encoding_type():
    """Returns the encoding type that matches Python's native strings."""
    if sys.maxunicode == 65535:
        return 'UTF16'
    else:
        return 'UTF32'


def analyze_entities(text, encoding='UTF32'):
    body = {
        'document': {
            'type': 'PLAIN_TEXT',
            'content': text,
        },
        'encodingType': encoding,
    }

    service = get_service()

    request = service.documents().analyzeEntities(body=body)
    response = request.execute()

    return response


def analyze_sentiment(text):
    body = {
        'document': {
            'type': 'PLAIN_TEXT',
            'content': text,
        }
    }

    service = get_service()

    request = service.documents().analyzeSentiment(body=body)
    response = request.execute()

    return response


def analyze_syntax(text, encoding='UTF32'):
    body = {
        'document': {
            'type': 'PLAIN_TEXT',
            'content': text,
        },
        'features': {
            'extract_syntax': True,
        },
        'encodingType': encoding,
    }

    service = get_service()

    request = service.documents().annotateText(body=body)
    response = request.execute()

    return response


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('command', choices=[
        'entities', 'sentiment', 'syntax'])
    parser.add_argument('text')

    args = parser.parse_args()

    if args.command == 'entities':
        result = analyze_entities(args.text, get_native_encoding_type())
    elif args.command == 'sentiment':
        result = analyze_sentiment(args.text)
    elif args.command == 'syntax':
        result = analyze_syntax(args.text, get_native_encoding_type())

    print(json.dumps(result, indent=2))