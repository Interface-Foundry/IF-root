import logging
from flask import Flask, request
from icon import menu_cat
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

# def get_gcloud():
#     # gcloud stuff
#     gcloud_config = {
#         'proj_name': 'kip_styles',
#         'key': 'KipStyles-8da42a8a7423.json',
#         'bucket': 'if-kip-chat-images'
#     }
#     gcloud_client = storage.Client(project=gcloud_config[
#         'proj_name']).from_service_account_json(
#         'gcloud_key/' + gcloud_config['key'])
#     # 'gcloud_key/' + gcloud_config['key'])
#     gcloud_bucket = gcloud_client.get_bucket(gcloud_config['bucket'])
#     # gcloud_bucket.make_public(future=True)
#     return gcloud_bucket


# def upload_to_gcloud(image, gcloud_bucket=get_gcloud()):
#     tmp_img = io.BytesIO()
#     image.created_image.save(tmp_img, 'PNG', quality=90)
#     object_upload = gcloud_bucket.blob(
#         os.path.join('delivery/icons', image.uniq_fn))
#     object_upload.upload_from_string(
#         tmp_img.getvalue(), content_type='image/png')
#     return object_upload.public_url


# gcloud_bucket = get_gcloud()
# icon_images = load_icon_bg()
# font_dict_R = load_fonts_reg()

@application.route('/', methods=['GET','POST'])
def main():

    logging.info('starting main')
    t1 = time.time()
    img_req = request.json
    logging.info('received req to make icon')

    t2 = time.time()
    menu_cat(img_req)

    # t3 = time.time()
    # return icon_path

if __name__ == '__main__':
    port_num = 5000
    # run app
    logging.info('__not_threaded__')
    logging.info('running app on port ' + str(port_num))
    application.run(host='0.0.0.0', port=port_num, debug=True)