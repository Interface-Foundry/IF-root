from flask import (
    Flask,
    abort,
    redirect,
    render_template,
    request,
    url_for,
)

from PIL import Image, ImageFont, ImageDraw
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

# Constants bestowed upon us by a higher power
DESKTOP_WIDTH = 1000
DESKTOP_HEIGHT = 800
MOBILE_WIDTH = 0 # TODO
MOBILE_HEIGHT = 800 # TODO
PADDING = 5
BGCOLOR = 'white'
BUCKET = 'if-kip-chat-images'
REGION = 'us-east-1'

NUMBER_IMAGES = []
for i in [1, 2, 3, 4, 5, 6]:
    f = THIS_FOLDER + '/Numbers-' + `i` + '-Black-icon.png'
    NUMBER_IMAGES.append(Image.open(f))

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
    max_width = ( DESKTOP_WIDTH  - (length + 1) * PADDING ) / length
    max_height = DESKTOP_HEIGHT - 2 * PADDING


    biggest_width = 0
    biggest_height = 0
    thumbnails = []

    #add images
    for i, data in enumerate(images):
        print i, data[u'url']

        im = download_image(data[u'url'])
        im.thumbnail((max_width, max_height), Image.ANTIALIAS)
        thumbnails.append(im)
        if im.size[0] > biggest_width:
            biggest_width = im.size[0]
        if im.size[1] > biggest_height:
            biggest_height = im.size[1]

    #add select numbers
    img = Image.new('RGB', (DESKTOP_WIDTH, biggest_height + 2 * PADDING), BGCOLOR)
    for i, im in enumerate(thumbnails):
        x = PADDING + (PADDING + max_width) * i
        y = PADDING + (biggest_height - im.size[1]) / 2
        img.paste(im, (x, y))
        img.paste(NUMBER_IMAGES[i], (x + PADDING, 2 * PADDING), mask=NUMBER_IMAGES[i])

    #add white rectangles
    for i, im in enumerate(images):
        x = PADDING + (PADDING + max_width) * i
        y = PADDING + (biggest_height - 30)
        dr = ImageDraw.Draw(img,'RGBA') #RGBA for shape opacity
        dr.rectangle(((x,y-30),(x+100,y+50)), fill=(255,255,255,120))

    #add prices
    font = ImageFont.truetype("HelveticaNeue-Regular.ttf", 14)
    for i, im in enumerate(images):
        x = PADDING + (PADDING + max_width) * i
        y = PADDING + (biggest_height - 30)
        draw = ImageDraw.Draw(img)
        draw.text((x, y),im[u'price'],(0,0,0),font=font)

    #add names
    font = ImageFont.truetype("HelveticaNeue-Regular.ttf", 14)
    for i, im in enumerate(images):
        x = PADDING + (PADDING + max_width) * i
        y = PADDING + (biggest_height - 50)
        draw = ImageDraw.Draw(img)
        draw.text((x, y),im[u'name'],(0,0,0),font=font)

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
