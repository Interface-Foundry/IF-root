import logging

from flask import Flask, request
import boto

from picstitch import load_review_stars, load_amazon_prime, load_fonts, \
    PicStitch


logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s - %(levelname)s - %(message)s')

port_num = 5000
REGION = 'us-east-1'
BUCKET_NAME = 'if-kip-chat-images'

# initialize stuff
review_star_images = load_review_stars()
amazon_images = load_amazon_prime()
font_dict = load_fonts()
conn = boto.s3.connect_to_region(REGION)
bucket_kip_chat_images = conn.get_bucket(BUCKET_NAME)


app = Flask(__name__)


@app.route('/', methods=['POST'])
def main():
    '''
    return upload_image_tos_s3(create_image(request.json))
    '''
    img_req = request.json
    logging.info('image requested...')
    pic = PicStitch(img_req,
                    bucket_kip_chat_images,
                    amazon_images,
                    review_star_images,
                    font_dict)

    return pic.s3_url

if __name__ == '__main__':
    # Constants bestowed upon us by a higher power (slack)
    # number_images_ = load_number_images()
    logging.info('__threaded__')
    logging.info('running app on port ' + str(port_num))
    app.run(host='0.0.0.0', threaded=3, port=port_num)
