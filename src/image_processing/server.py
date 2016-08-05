import logging
import time

from flask import Flask, request

import boto
from gcloud import storage

from picstitch import load_review_stars, load_amazon_prime, load_fonts, \
    PicStitch


logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')

port_num = 5000
app = Flask(__name__)


def get_s3():
    # aws stuff
    s3_region = 'us-east-1'
    s3_bucket_name = 'if-kip-chat-images'
    conn = boto.s3.connect_to_region(s3_region)
    s3_bucket = conn.get_bucket(s3_bucket_name)
    return s3_bucket


def get_gcloud():
    # gcloud stuff
    gcloud_config = {
        'proj_name': 'kip_styles',
        'key': 'Kip Styles-8da42a8a7423.json',
        'bucket': 'if-kip-chat-images'
    }
    gcloud_client = storage.Client(project=gcloud_config[
        'proj_name']).from_service_account_json(
        'gcloud_key/' + gcloud_config['key'])
    gcloud_bucket = gcloud_client.get_bucket(gcloud_config['bucket'])
    # gcloud_bucket.make_public(future=True)
    return gcloud_bucket


@app.route('/', methods=['POST'])
def main():
    '''
    return upload_image_tos_s3(create_image(request.json))
    '''
    t1 = time.time()
    img_req = request.json
    pic_url = PicStitch(img_req=img_req,
                        bucket=s3_bucket,
                        gcloud_bucket=gcloud_bucket,
                        amazon_prime_image=amazon_images,
                        review_stars_images=review_star_images,
                        font_dict=font_dict).get_url()
    logging.info('total time taken: ' + str(time.time() - t1))
    return pic_url

if __name__ == '__main__':
    # load connections to gcloud and aws
    gcloud_bucket = get_gcloud()
    s3_bucket = get_s3()

    # load images to paste
    review_star_images = load_review_stars()
    amazon_images = load_amazon_prime()
    font_dict = load_fonts()

    # run app
    logging.info('__threaded__')
    logging.info('running app on port ' + str(port_num))
    app.run(host='0.0.0.0', threaded=3, port=port_num)
