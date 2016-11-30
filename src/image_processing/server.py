import logging

from flask import Flask, request

from picstitch import load_review_stars, load_amazon_prime, load_fonts, \
    PicStitch

from gcloud import storage
import boto
import io
import time
import os


logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')

application = Flask(__name__)


def get_s3():
    # aws stuff
    s3_region = 'us-east-1'
    s3_bucket_name = 'if-kip-chat-images'
    conn = boto.s3.connect_to_region(s3_region)
    s3_bucket = conn.get_bucket(s3_bucket_name)
    return s3_bucket


def upload_to_s3(image, s3_bucket=get_s3()):
    tmp_img = io.BytesIO()
    image.created_image.save(tmp_img, 'PNG', quality=90)
    k = s3_bucket.new_key(image.uniq_fn)
    k.set_contents_from_string(tmp_img.getvalue(), headers={
                               "Content-Type": "image/png"})
    s3_base = 'https://s3.amazonaws.com/' + image.bucket_name + '/'
    img_url = s3_base + image.uniq_fn
    return img_url


def get_gcloud():
    # gcloud stuff
    gcloud_config = {
        'proj_name': 'kip_styles',
        'key': 'KipStyles-8da42a8a7423.json',
        'bucket': 'if-kip-chat-images'
    }
    gcloud_client = storage.Client(project=gcloud_config[
        'proj_name']).from_service_account_json(
        'gcloud_key/' + gcloud_config['key'])
    # 'gcloud_key/' + gcloud_config['key'])
    gcloud_bucket = gcloud_client.get_bucket(gcloud_config['bucket'])
    # gcloud_bucket.make_public(future=True)
    return gcloud_bucket


def upload_to_gcloud(image, gcloud_bucket=get_gcloud()):
    start = time.time()

    tmp_img = io.BytesIO()
    image.created_image.save(tmp_img, 'PNG', quality=90)
    saved = time.time()

    object_upload = gcloud_bucket.blob(
        os.path.join(image.origin, image.uniq_fn))
    blobbed = time.time()

    object_upload.upload_from_string(
        tmp_img.getvalue(), content_type='image/png')
    uploaded = time.time()

    if time.time() - start > 1:
        logging.info('slow upload. save: %.2fs, blob create: %.2fs, string upload %2fs',
            saved-start, blobbed-saved, uploaded-blobed)

    # public_url is a property func that appears to just be a string-format
    # call. Probably no value in instrumenting.
    return object_upload.public_url


@application.route('/', methods=['POST'])
def main():
    '''
    return upload_image_tos_s3(create_image(request.json))
    '''
    t1 = time.time()
    img_req = request.json
    logging.info('received req to make image')
    pic = PicStitch(img_req=img_req,
                    # bucket=s3_bucket,
                    # gcloud_bucket=gcloud_bucket,
                    amazon_prime_image=amazon_images,
                    review_stars_images=review_star_images,
                    font_dict=font_dict)
    t2 = time.time()
    gc_url = upload_to_gcloud(pic, gcloud_bucket)
    t3 = time.time()
    logging.info('request complete. make: %.2fs, upload: %.2fs, total: %.2fs to %s',
                 t2 - t1, t3 - t2, t3 - t1, gc_url)
    return gc_url

# load connections to gcloud and aws
gcloud_bucket = get_gcloud()
review_star_images = load_review_stars()
amazon_images = load_amazon_prime()
font_dict = load_fonts()


if __name__ == '__main__':
    port_num = 5000
    # run app
    logging.info('__not_threaded__')
    logging.info('running app on port ' + str(port_num))
    application.run(host='0.0.0.0', port=port_num, debug=True)
