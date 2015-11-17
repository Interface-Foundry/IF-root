from datetime import datetime

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

app = Flask(__name__)

# Constants bestowed upon us by a higher power
DESKTOP_WIDTH = 1000
DESKTOP_HEIGHT = 800
MOBILE_WIDTH = 0 # TODO
MOBILE_HEIGHT = 800 # TODO
PADDING = 5
BGCOLOR = 'white' # TODO what is this

NUMBER_IMAGES = []
for i in [1, 2, 3, 4, 5, 6]:
    f = 'Numbers-' + `i` + '-Black-icon.png'
    NUMBER_IMAGES.append(Image.open(f))

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
    for i, url in enumerate(images):
        print i, url
        im = download_image(url)
        im.thumbnail((max_width, max_height), Image.ANTIALIAS)
        thumbnails.append(im)
        if im.size[0] > biggest_width:
            biggest_width = im.size[0]
        if im.size[1] > biggest_height:
            biggest_height = im.size[1]

    img = Image.new('RGB', (DESKTOP_WIDTH, biggest_height + 2 * PADDING), BGCOLOR)
    for i, im in enumerate(thumbnails):
        x = PADDING + (PADDING + max_width) * i
        y = PADDING + (biggest_height - im.size[1]) / 2
        img.paste(im, (x, y))
        img.paste(NUMBER_IMAGES[i], (x + PADDING, 2 * PADDING), mask=NUMBER_IMAGES[i])

    img.save('./test.png', quality=95)

    return images[0]

def download_image(url):
    fd = urllib.urlopen(url)
    image_file = io.BytesIO(fd.read())
    im = Image.open(image_file)
    return im

if __name__ == '__main__':
    print 'running app on port 5k'
    app.debug = True
    app.run()
