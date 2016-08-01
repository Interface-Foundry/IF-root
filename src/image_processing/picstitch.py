import urllib.request
import random
import uuid
import os
import io
import textwrap
import logging
from PIL import Image, ImageFont, ImageDraw

logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s - %(levelname)s - %(message)s')


THIS_FOLDER = os.path.dirname(os.path.realpath(__file__))


def load_number_images():
    '''
    '''
    images = []
    # [1, 2, 3]
    number_images = [x for x in range(1, 4)]
    for i in number_images:
        f = THIS_FOLDER + '/numbers/' + repr(i) + '.png'
        images.append(Image.open(f))
    return images


def load_review_stars():
    # images = []
    # star_images = [x * .5 for x in range(1, 11, 1)]
    # for i in star_images:
    #     f = 'review_stars/' + repr(i) + '.png'
    #     images.append(Image.open(f))
    star_images = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]
    rs_dict = {}
    for i in star_images:
        f = THIS_FOLDER + '/review_stars/' + repr(i) + '.png'
        rs_dict[i] = Image.open(f)
    return rs_dict


def load_amazon_prime():
    amzn_prime_logo = Image.open(THIS_FOLDER + '/amazon/prime.png')
    return amzn_prime_logo


def download_image(url):
    fd = urllib.request.urlopen(url)
    image_file = io.BytesIO(fd.read())
    im = Image.open(image_file)
    return im


def upload_image_to_s3(image, bucket, bucket_name='if-kip-chat-images'):
    '''
    '''
    s3_file = str(uuid.uuid4())
    tmp_img = io.BytesIO()
    image.save(tmp_img, 'PNG', quality=90)
    k = bucket.new_key(s3_file)
    k.set_contents_from_string(tmp_img.getvalue(),
                               headers={"Content-Type": "image/png"})
    url_string = 'https://s3.amazonaws.com/' + bucket_name + '/' + s3_file
    return url_string


def create_image(images, REVIEW_STARS, AMAZON_PRIME):
    # get all the posted files

    CHAT_WIDTH = 365
    CHAT_HEIGHT = 140
    PADDING = 5
    BGCOLOR = 'white'
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
    review_count_font = ImageFont.truetype(
        THIS_FOLDER + "/HelveticaNeue-Regular.ttf", 16)

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
            # , mask=AMAZON_PRIME)
            img.paste(AMAZON_PRIME, (x + 110, last_y + 2))

        last_y = last_y + 28

        # move reviews down a bit
        if images[0]['origin'] in ['skype', 'facebook']:
            last_y = last_y + 10

        # draw - (Review Number)
        if 'reviews' in im and 'rating' in im['reviews']:
            image_revs_rating = im['reviews']['rating']
            logging.info('rating is ' + str(image_revs_rating))
            if image_revs_rating <= 0.5:  # ignoring if 0.0 < rating
                selectRating = 0.5
            elif image_revs_rating <= 1.0:
                selectRating = 1
            elif image_revs_rating <= 1.5:
                selectRating = 1.5
            elif image_revs_rating <= 2:
                selectRating = 2
            elif image_revs_rating <= 2.5:
                selectRating = 2.5
            elif image_revs_rating <= 3:
                selectRating = 3
            elif image_revs_rating <= 3.5:
                selectRating = 3.5
            elif image_revs_rating <= 4:
                selectRating = 4
            elif image_revs_rating <= 4.5:
                selectRating = 4.5
            else:  # ignoring if rating < 5
                selectRating = 5

            img.paste(REVIEW_STARS[selectRating],
                      (x, last_y + 3),
                      mask=REVIEW_STARS[selectRating])

            if 'reviewCount' in im['reviews']:
                draw.text((x + 82, last_y),
                          ' - ' + im['reviews']['reviewCount'],
                          font=review_count_font,
                          fill="#2d70c1")

            last_y = last_y + 20

        # # #fake reviews for skype!! lmao
        elif images[0]['origin'] and images[0]['origin'] == 'skype':
            selectRating = random.randint(6, 8)
            img.paste(REVIEW_STARS[selectRating],
                      (x, last_y + 3),
                      mask=REVIEW_STARS[selectRating])
            # selectRating = random.randint(6,7)
            reviewCount = random.randint(15, 1899)
            # img.paste(REVIEW_STARS[7], (x, last_y), mask=REVIEW_STARS[7])
            draw.text((x + 80, last_y), ' - ' + str(reviewCount),
                      font=font2, fill="#2d70c1")
            last_y = last_y + 20

        last_y = last_y + 5

        if images[0]['origin'] and images[0]['origin'] in ['skype', 'facebook']:
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
