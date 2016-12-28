import sys
import json
sys.path.append('src/image_processing/')
sys.path.append('/picstitch/')
sys.path.append('/builds/kipthis/kip-mirror/src/image_processing/')

# import pytest
# import requests

# # run server and let it load
# import subprocess

# # time.sleep(5)

facebook_data = [{
    'price': '$5.99',
    'prime': '0',
    'origin': 'facebook',
    'reviews': {
        'rating': 3.8,
        'reviewCount': '73'
    },
    'url': 'http://ecx.images-amazon.com/images/I/51Z99-v-fWL.jpg',
    'name': [
        'Artist: Firm',
        'Interscope --Fontana--',
        'Format: Explicit Lyrics'
    ]
}]


def test_server():
    import server
    test_client = server.application.test_client()
    response = test_client.post('/',
                                data=json.dumps(facebook_data),
                                content_type='application/json')
    assert response.status_code == 200


def test_failing():
    assert 200 == 200
