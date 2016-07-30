import logging

from flask import Flask, request

from PIL import Image, ImageFont, ImageDraw
import urllib.request
import textwrap
import io
import time
import boto
import random
import string
import uuid
import os

logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s - %(levelname)s - %(message)s')

THIS_FOLDER = os.path.dirname(os.path.realpath(__file__))

app = Flask(__name__)


def load_number_images():
    logging.debug('loading number images')
    images = []
    # [1, 2, 3]
    number_images = [x for x in range(1, 4)]
    for i in number_images:
        f = THIS_FOLDER + '/numbers/' + repr(i) + '.png'
        images.append(Image.open(f))
    return images


def load_review_stars():
    images = []
    logging.debug('loading star images')
    star_images = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]
    # star_images = [x * .5 for x in range(1, 11, 1)]
    for i in star_images:
        f = THIS_FOLDER + '/review_stars/' + repr(i) + '.png'
        images.append(Image.open(f))
    return images


def load_amazon_prime():
    logging.debug('loading amazon prime')
    return Image.open(THIS_FOLDER + '/amazon/prime.png')


def download_image(url):
    fd = urllib.request.urlopen(url)
    image_file = io.BytesIO(fd.read())
    im = Image.open(image_file)
    return im


def create_image(images):
    # get all the posted files
    logging.info('received images')

    length = 3
    biggest_width = 0
    biggest_height = 0
    thumbnails = []
    PIC_SIZE = 130, 130
    CHAT_WIDTH = 365
    CHAT_HEIGHT = 140
    # where to draw main pics
    PIC_COORDS = [{'x': 14, 'y': 5}, {'x': 24, 'y': 174}, {'x': 24, 'y': 336}]
    # where to draw choice numbers
    TEXTBOX_COORDS = [{'x': 190, 'y': 10}, {'x': 190, 'y': 174}, {
        'x': 190, 'y': 336}]  # where to draw text boxes

    # messenger ratio
    if images[0]['origin'] and images[0]['origin'] == 'facebook':
        CHAT_HEIGHT = 223
        CHAT_WIDTH = 425
        PIC_COORDS = [{'x': 5, 'y': 5}]  # where to draw main pics
        TEXTBOX_COORDS = [{'x': 250, 'y': 5}]  # where to draw text boxes
        PIC_SIZE = 223, 223

    if images[0]['origin'] and images[0]['origin'] == 'skype':
        CHAT_HEIGHT = 230
        CHAT_WIDTH = 381
        PIC_COORDS = [{'x': 20, 'y': 50}]  # where to draw main pics
        TEXTBOX_COORDS = [{'x': 250, 'y': 100}]  # where to draw text boxes
        PIC_SIZE = 250, 250

    # add images
    for i, data in enumerate(images):
        im = download_image(data['url'])
        im.thumbnail(PIC_SIZE, Image.ANTIALIAS)
        thumbnails.append(im)

    # image object
    img = Image.new('RGB', (CHAT_WIDTH, CHAT_HEIGHT), BGCOLOR)

    for i, im in enumerate(thumbnails):
        # add pics
        x = PIC_COORDS[i]['x']
        y = PIC_COORDS[i]['y']
        img.paste(im, (x, y))

    # add names, text wrapped
    font = ImageFont.truetype(
        THIS_FOLDER + "/HelveticaNeue-Regular.ttf", 16)  # price
    font2 = ImageFont.truetype(THIS_FOLDER + "/HelveticaNeue-Regular.ttf", 13)
    review_count_font = ImageFont.truetype(THIS_FOLDER + "/HelveticaNeue-Regular.ttf", 16)

    if images[0]['origin'] and images[0]['origin'] in ['skype', 'facebook']:
        font = ImageFont.truetype(
            THIS_FOLDER + "/HelveticaNeue-Regular.ttf", 28)  # price
        font2 = ImageFont.truetype(
            THIS_FOLDER + "/HelveticaNeue-Regular.ttf", 20)

    for i, im in enumerate(images):
        last_y = 5
        x = TEXTBOX_COORDS[i]['x'] - 30
        y = TEXTBOX_COORDS[i]['y']
        draw = ImageDraw.Draw(img)

        if images[0]['origin'] and images[0]['origin'] in ['skype']:
            last_y = last_y + 50

        if images[0]['origin'] and images[0]['origin'] in ['skype', 'facebook']:
            draw.rectangle(((205, 5), (329, 160)), fill="white")

        # add price
        draw.text((x, last_y), im['price'], font=font, fill="#f54740")

        # add prime logo
        if im['prime'] == '1' and images[0]['origin'] != 'skype':
            img.paste(AMAZON_PRIME, (x + 110, last_y + 2)) #  , mask=AMAZON_PRIME)

        logging.debug(last_y)
        last_y = last_y + 28

        # move reviews down a bit
        if images[0]['origin'] in ['skype', 'facebook']:
            last_y = last_y + 10

        # draw - (Review Number)
        if 'reviews' in im and 'rating' in im['reviews']:
            image_revs_rating = im['reviews']['rating']

            if 0.0 < image_revs_rating <= 0.5:
                selectRating = 0
            elif image_revs_rating <= 1.0:
                selectRating = 1
            elif image_revs_rating <= 1.5:
                selectRating = 2
            elif image_revs_rating <= 2:
                selectRating = 3
            elif image_revs_rating <= 2.5:
                selectRating = 4
            elif image_revs_rating <= 3:
                selectRating = 5
            elif image_revs_rating <= 3.5:
                selectRating = 6
            elif image_revs_rating <= 4:
                selectRating = 7
            elif image_revs_rating <= 4.5:
                selectRating = 8
            elif image_revs_rating <= 5:
                selectRating = 9
            img.paste(REVIEW_STARS[selectRating],
                      (x, last_y + 3), mask=REVIEW_STARS[selectRating])

            if 'reviewCount' in im['reviews']:
                draw.text((x + 82, last_y), ' - ' + im['reviews']['reviewCount'], font=review_count_font, fill="#2d70c1")

            last_y = last_y + 20

        # # #fake reviews for skype!! lmao
        elif images[0]['origin'] and images[0]['origin'] == 'skype':
            selectRating = random.randint(6, 8)
            img.paste(REVIEW_STARS[selectRating], (x,
                                                   last_y + 3), mask=REVIEW_STARS[selectRating])
            # selectRating = random.randint(6,7)
            reviewCount = random.randint(15, 1899)
            # img.paste(REVIEW_STARS[7], (x, last_y), mask=REVIEW_STARS[7])
            draw.text((x + 80, last_y), ' - ' + str(reviewCount),
                      font=font2, fill="#2d70c1")
            last_y = last_y + 20

        last_y = last_y + 5

        if images[0]['origin'] and images[0]['origin'] == 'skype' or images[0]['origin'] == 'facebook':
            BOX_WIDTH = 22
        else:
            BOX_WIDTH = 30

        for z in im['name']:
            # draw.text((x, last_y), z, font=font2, fill="#2d70c1")
            countLines = 0
            for line in textwrap.wrap(z, width=BOX_WIDTH):
                countLines += 1
                if countLines < 3:
                    filler = ''
                    if countLines == 3:
                        filler = '...'
                    draw.text((x - 3, last_y), line + filler,
                              font=font2, fill="#909497")
                    last_y += font2.getsize(line)[1]
                    last_y = last_y + 2
        y += font.getsize(line)[1]
        last_y = y
    return img


@app.route('/', methods=['POST'])
def index():
    '''
    '''
    start_time = time.time()
    images = request.json
    img = create_image(images)
    logging.debug('_uploading')
    tmp_img = io.BytesIO()
    s3filename = str(uuid.uuid4()) + '.png'
    img.save(tmp_img, 'PNG', quality=90)
    k = bucket.new_key(s3filename)
    k.set_contents_from_string(tmp_img.getvalue(),
                               headers={"Content-Type": "image/png"})
    logging.debug('_image_uploaded')

    string_output = 'https://s3.amazonaws.com/' + BUCKET + '/' + s3filename
    logging.debug('total_time: ' + str(time.time() - start_time))
    return string_output


if __name__ == '__main__':
    # Constants bestowed upon us by a higher power (slack)
    CHAT_WIDTH = 365
    CHAT_HEIGHT = 140

    PADDING = 5
    BGCOLOR = 'white'
    BUCKET = 'if-kip-chat-images'
    REGION = 'us-east-1'

    # load images
    NUMBER_IMAGES = load_number_images()
    REVIEW_STARS = load_review_stars()
    AMAZON_PRIME = load_amazon_prime()

    logging.info('connecting to buckets')
    conn = boto.s3.connect_to_region(REGION)
    bucket = conn.get_bucket(BUCKET)
    port_num = 5000
    logging.info('running app on port ' + str(port_num))
    app.run(host='0.0.0.0', processes=1, port=port_num)
