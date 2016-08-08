import logging
import time

from flask import Flask, request

from picstitch import load_review_stars, load_amazon_prime, load_fonts, \
    PicStitch


logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__)



@app.route('/', methods=['POST'])
def main():
    '''
    return upload_image_tos_s3(create_image(request.json))
    '''
    img_req = request.json
    logging.info('received request to make image')
    t1 = time.time()
    pic = PicStitch(img_req=img_req,
                    bucket=s3_bucket,
                    # gcloud_bucket=gcloud_bucket,
                    amazon_prime_image=amazon_images,
                    review_stars_images=review_star_images,
                    font_dict=font_dict)
    pic_url = pic.get_url()
    logging.info('pic url@ ' + pic_url)
    logging.info('total time taken: ' + str(time.time() - t1))
    return pic_url


# load connections to gcloud and aws
# gcloud_bucket = get_gcloud()
s3_bucket = get_s3()
review_star_images = load_review_stars()
amazon_images = load_amazon_prime()
font_dict = load_fonts()

if __name__ == '__main__':
    port_num = 5000

    # run app
    logging.info('__threaded__')
    logging.info('running app on port ' + str(port_num))
    app.run(host='0.0.0.0', threaded=6, port=port_num)
