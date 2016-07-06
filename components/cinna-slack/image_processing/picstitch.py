from flask import (
    Flask,
    abort,
    redirect,
    render_template,
    request,
    url_for,
)

from PIL import Image, ImageFont, ImageDraw
import textwrap
import urllib2 as urllib
import io
import boto
import cStringIO
import time
import random
import string
import os

THIS_FOLDER = os.path.dirname(os.path.realpath(__file__))

app = Flask(__name__)

# Constants bestowed upon us by a higher power (slack)

CHAT_WIDTH = 365
CHAT_HEIGHT = 140
# MOBILE_WIDTH = 0 # TODO
# MOBILE_HEIGHT = 800 # TODO

PADDING = 5
BGCOLOR = 'white'
BUCKET = 'if-kip-chat-images'
REGION = 'us-east-1'

#load images
NUMBER_IMAGES = []
for i in [1, 2, 3]:
    f = THIS_FOLDER + '/numbers/' + `i` + '.png'
    NUMBER_IMAGES.append(Image.open(f))
REVIEW_STARS = []
for i in [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]:
    f = THIS_FOLDER + '/review_stars/' + `i` + '.png'
    REVIEW_STARS.append(Image.open(f))
AMAZON_PRIME = Image.open(THIS_FOLDER + '/amazon/prime.png')

conn = boto.s3.connect_to_region(REGION)
bucket = conn.get_bucket(BUCKET)

@app.route('/', methods=['POST'])
def index():
    # get all the posted files
    images = request.json
    print images
    length = 3

    # DESKTOP_WIDTH = (length + 1) * padding + length * image_width
    # DESKTOP_HEIGHT = 2 * padding + image_height
    # max_width = ( DESKTOP_WIDTH  - (length + 1) * PADDING ) / length
    # max_height = DESKTOP_HEIGHT - 2 * PADDING

    # print max_height
    # print max_width

    biggest_width = 0
    biggest_height = 0
    thumbnails = []
    PIC_SIZE = 130, 130
    CHAT_WIDTH = 365
    PIC_COORDS = [{'x': 14, 'y': 5},{'x': 24, 'y': 174},{'x': 24, 'y': 336}] #where to draw main pics
    CHOICE_COORDS = [{'x': 0, 'y': 10},{'x': 0, 'y': 174},{'x': 0, 'y': 336}] #where to draw choice numbers
    TEXTBOX_COORDS = [{'x': 190, 'y': 10},{'x': 190, 'y': 174},{'x': 190, 'y': 336}] #where to draw text boxes

    #messenger ratio
    if images[0][u'origin'] and images[0][u'origin'] == 'facebook':
        CHAT_WIDTH = 267
        PIC_COORDS = [{'x': 5, 'y': 5},{'x': 24, 'y': 174},{'x': 24, 'y': 336}] #where to draw main pics
        TEXTBOX_COORDS = [{'x': 155, 'y': 5},{'x': 190, 'y': 174},{'x': 190, 'y': 336}] #where to draw text boxes


    #add images
    for i, data in enumerate(images):
        im = download_image(data[u'url'])
        im.thumbnail(PIC_SIZE, Image.ANTIALIAS)
        thumbnails.append(im)

    #add select numbers
    img = Image.new('RGB', (CHAT_WIDTH, CHAT_HEIGHT), BGCOLOR)
    for i, im in enumerate(thumbnails):
        #add pics
        x = PIC_COORDS[i][u'x']
        y = PIC_COORDS[i][u'y']
        img.paste(im, (x, y))
        # #add numbers
        # x = CHOICE_COORDS[i][u'x']
        # y = CHOICE_COORDS[i][u'y']
        # img.paste(NUMBER_IMAGES[i], (x, y), mask=NUMBER_IMAGES[i])


    #add names, text wrapped
    font = ImageFont.truetype(THIS_FOLDER + "/HelveticaNeue-Regular.ttf", 16) #price
    font2 = ImageFont.truetype(THIS_FOLDER + "/HelveticaNeue-Regular.ttf", 13)

    for i, im in enumerate(images):
        x = TEXTBOX_COORDS[i][u'x'] - 30
        y = TEXTBOX_COORDS[i][u'y']
        draw = ImageDraw.Draw(img)

        #draw white fill to cover image
        if images[0][u'origin'] and images[0][u'origin'] == 'facebook':
            #draw white boxes
            print 'boxbox'
            draw.rectangle(((115,0),(400,160)), fill="white")

            # add white box transparency in, eventually fam ~
            # # #
            # back = Image.new('RGBA', (512,512), (255,0,0,0))
            # poly = Image.new('RGBA', (512,512))
            # pdraw = ImageDraw.Draw(poly)
            # pdraw.polygon([(128,128),(384,384),(128,384),(384,128)],
            #               fill=(255,255,255,127),outline=(255,255,255,255))
            # back.paste(poly,mask=poly)
            # back.show()


        last_y = 5

        #add price
        draw.text((x, last_y),im[u'price'],font=font,fill="#f54740")

        #add prime logo
        if im[u'prime'] == '1':
            img.paste(AMAZON_PRIME, (x + 58, last_y), mask=AMAZON_PRIME)

        last_y = last_y + 27

        if 'reviews' in im and 'rating' in im[u'reviews']:
            # if isinstance(im[u'reviews'][u'rating'], int) or isinstance(im[u'reviews'][u'rating'], float): #is it an int or float?
            #add rating
            if im[u'reviews'][u'rating'] >= 0 and im[u'reviews'][u'rating'] <= 0.5:
                selectRating = 0
            if im[u'reviews'][u'rating'] > 0.5 and im[u'reviews'][u'rating'] <= 1:
                selectRating = 1
            if im[u'reviews'][u'rating'] > 1 and im[u'reviews'][u'rating'] <= 1.5:
                selectRating = 2
            if im[u'reviews'][u'rating'] > 1.5 and im[u'reviews'][u'rating'] <= 2:
                selectRating = 3
            if im[u'reviews'][u'rating'] > 2 and im[u'reviews'][u'rating'] <= 2.5:
                selectRating = 4
            if im[u'reviews'][u'rating'] > 2.5 and im[u'reviews'][u'rating'] <= 3:
                selectRating = 5
            if im[u'reviews'][u'rating'] > 3 and im[u'reviews'][u'rating'] <= 3.5:
                selectRating = 6
            if im[u'reviews'][u'rating'] > 3.5 and im[u'reviews'][u'rating'] <= 4:
                selectRating = 7
            if im[u'reviews'][u'rating'] > 4 and im[u'reviews'][u'rating'] <= 4.5:
                selectRating = 8
            if im[u'reviews'][u'rating'] > 4.5 and im[u'reviews'][u'rating'] <= 5:
                selectRating = 9
            img.paste(REVIEW_STARS[selectRating], (x, last_y), mask=REVIEW_STARS[selectRating])
            #add review count
            if 'reviewCount' in im[u'reviews']:
                draw.text((x + 80, last_y),' - ' + im[u'reviews'][u'reviewCount'],font=font2,fill="#2d70c1")

            last_y = last_y + 20

        last_y = last_y + 5

        if images[0][u'origin'] and images[0][u'origin'] == 'facebook':
            BOX_WIDTH = 26
        else:
            BOX_WIDTH = 30


        for z in im[u'name']:

            # draw.text((x, last_y), z, font=font2, fill="#2d70c1")
            countLines = 0
            for line in textwrap.wrap(z, width=BOX_WIDTH):
                countLines += 1
                if countLines < 3:
                    filler = ''
                    if countLines == 3:
                        filler = '...'
                    draw.text((x - 3, last_y), line + filler, font=font2, fill="#909497")
                    last_y += font2.getsize(line)[1]
                    last_y = last_y + 2

                # last_y = y
            # y += font.getsize(line)[1]
            # last_y = y


        # #add product names
        # for line in textwrap.wrap(im[u'name'], width=30):
        #     draw.text((x, last_y), line, font=font2, fill="#2d70c1")
        #     y += font.getsize(line)[1]
        #     last_y = y

        # last_y = last_y + 10

    cStringImg = cStringIO.StringIO()
    img.save(cStringImg, 'PNG', quality=90)
    s3filename = ''.join(random.SystemRandom().choice(string.ascii_uppercase + string.digits) for _ in range(24)) + '.png'
    k = bucket.new_key(s3filename)
    k.set_contents_from_string(cStringImg.getvalue(), headers={"Content-Type": "image/png"})

    return 'https://s3.amazonaws.com/' + BUCKET + '/' + s3filename

def download_image(url):
    fd = urllib.urlopen(url)
    image_file = io.BytesIO(fd.read())
    im = Image.open(image_file)
    return im

if __name__ == '__main__':
    print 'running app on port 5k'
    app.debug = False
    app.run(host="0.0.0.0")
