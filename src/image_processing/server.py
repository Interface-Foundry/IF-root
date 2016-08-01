import logging

from flask import Flask, request, g
import boto

from picstitch import load_review_stars, load_amazon_prime, \
    upload_image_to_s3, create_image

port_num = 5000
REGION = 'us-east-1'
BUCKET_NAME = 'if-kip-chat-images'

# initialize stuff
review_star_images = load_review_stars()
amazon_images = load_amazon_prime()
conn = boto.s3.connect_to_region(REGION)
bucket_kip_chat_images = conn.get_bucket(BUCKET_NAME)


logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s - %(levelname)s - %(message)s')


app = Flask(__name__)


@app.route('/', methods=['POST'])
def main():
    '''
    return upload_image_tos_s3(create_image(request.json))
    '''
    logging.info('image requested...')
    img_req = request.json
    g.amazon_images = amazon_images
    g.review_star_images = review_star_images

    new_img = create_image(images=img_req,
                           REVIEW_STARS=g.review_star_images,
                           AMAZON_PRIME=g.amazon_images)

    aws_filename = upload_image_to_s3(image=new_img,
                                      bucket=bucket_kip_chat_images,
                                      bucket_name=BUCKET_NAME)
    return aws_filename

if __name__ == '__main__':
    # Constants bestowed upon us by a higher power (slack)
    # number_images_ = load_number_images()
    logging.info('__threaded__')
    logging.info('running app on port ' + str(port_num))
    app.run(host='0.0.0.0', threaded=3, port=port_num)
