import logging

from flask import Flask, request

from picstitch_delivery import load_review_stars, load_fonts_reg, load_fonts_bold, \
    PicStitch

from gcloud import storage
import io
import time
import os

#gcloud
# from oauth2client.client import GoogleCredentials
# credentials = GoogleCredentials.get_application_default()
# from googleapiclient.discovery import build

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')

application = Flask(__name__)

# def get_s3():
#     # aws stuff
#     s3_region = 'us-east-1'
#     s3_bucket_name = 'if-kip-chat-images'
#     conn = boto.s3.connect_to_region(s3_region)
#     s3_bucket = conn.get_bucket(s3_bucket_name)
#     return s3_bucket


# def upload_to_s3(image, s3_bucket=get_s3()):
#     tmp_img = io.BytesIO()
#     image.created_image.save(tmp_img, 'PNG', quality=90)
#     k = s3_bucket.new_key(image.uniq_fn)
#     k.set_contents_from_string(tmp_img.getvalue(), headers={
#                                "Content-Type": "image/png"})
#     s3_base = 'https://s3.amazonaws.com/' + image.bucket_name + '/'
#     img_url = s3_base + image.uniq_fn
#     return img_url

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
    tmp_img = io.BytesIO()
    image.created_image.save(tmp_img, 'PNG', quality=90)
    object_upload = gcloud_bucket.blob(
        os.path.join('delivery', image.origin, image.uniq_fn))
    object_upload.upload_from_string(
        tmp_img.getvalue(), content_type='image/png')
    return object_upload.public_url

# load connections to gcloud and aws
gcloud_bucket = get_gcloud()
review_star_images = load_review_stars()
# amazon_images = load_amazon_prime()
font_dict_R = load_fonts_reg()
font_dict_B = load_fonts_bold()
# print('this is reg:', font_dict_R)
# print('this is bold:',font_dict_B)

@application.route('/', methods=['GET','POST'])
def main():
    '''
    return upload_image_tos_s3(create_image(request.json))
    '''
    logging.info('starting main')
    t1 = time.time()
    img_req = request.json
    logging.info('received req to make image')
    pic = PicStitch(img_req=img_req,
                    # bucket=s3_bucket,
                    # gcloud_bucket=gcloud_bucket,
                    # amazon_prime_image=amazon_images,
                    review_stars_images=review_star_images,
                    font_dict_R=font_dict_R,
                    font_dict_B=font_dict_B)
    t2 = time.time()
    gc_url = upload_to_gcloud(pic, gcloud_bucket)
    logging.info('uploaded to gcloud @ ' + gc_url)
    t3 = time.time()
    logging.info('time to make img %s, ' +
                 'time to upload image %s, ' +
                 'total time: %s',
                 str(t2 - t1), str(t3 - t2), str(t3 - t1))
    return gc_url


if __name__ == '__main__':
    port_num = 5000
    # run app
    logging.info('__not_threaded__')
    logging.info('running app on port ' + str(port_num))
    application.run(host='0.0.0.0', port=port_num, debug=False)
