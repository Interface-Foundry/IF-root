import urllib.request
import random
import uuid
import os
import io
import textwrap
import logging
from PIL import Image, ImageFont, ImageDraw
from config import make_image_configs

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


def load_fonts():
    fonts_file = os.path.join('fonts', 'HelveticaNeue-Regular.ttf')
    font = {}
    font_size = [12, 13, 14, 15, 16, 20, 28]
    for s in font_size:
        font[s] = ImageFont.truetype(fonts_file, s)
    return font


def load_review_stars():
    star_images = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0]
    rs_dict = {}
    for i in star_images:
        f = THIS_FOLDER + '/review_stars/' + str(i) + '.png'
        rs_dict[str(i)] = Image.open(f)
    return rs_dict


def load_amazon_prime():
    amzn_prime_logo = Image.open(THIS_FOLDER + '/amazon/prime.png')
    return amzn_prime_logo


def download_image(url):
    fd = urllib.request.urlopen(url)
    image_file = io.BytesIO(fd.read())
    im = Image.open(image_file)
    return im


class PicStitch:
    '''
    {'price': '$15.98',
     'name': ['Size: Large', 'Amoluv', 'Amoluv owns its own trademarks.
      Trademark number:86522196, The package contains Amoluv Tag'],
     'origin': 'slack',
     'reviews': {'rating': 3.2, 'reviewCount': '258'},
     'prime': '0',
     'url': 'http://ecx.images-amazon.com/images/I/51cgwKrncWL.jpg'}
    '''

    def __init__(self,
                 img_req,
                 bucket,
                 amazon_prime_image,
                 review_stars_images,
                 font_dict):
        '''
        '''
        self.thumbnails = []
        self.origin = None

        self.img_req = img_req[0]
        self.bucket = bucket
        self.bucket_name = 'if-kip-chat-images'

        self.amazon_prime_image = amazon_prime_image
        self.review_stars_images = review_stars_images
        self.font_dict = font_dict

        if self.img_req['prime']:
            self.prime = True
        else:
            self.prime = False

        self._get_config()
        self._make_image()
        self._upload_image_to_s3()

    def _get_config(self):
        if self.img_req['origin']:
            if self.img_req['origin'] in ['facebook', 'slack', 'skype']:
                self.origin = self.img_req['origin']
        else:
            self.origin = 'slack'
            logging.critical('NO_ORIGIN__ASSUMING_SLACK')
        self.config = make_image_configs(self.font_dict, self.origin)

    def _make_image(self):
        # should be 1 image_req...
        # image_data = self.img_req

        # create blank image based on source (slack/facebook/skype)
        img = Image.new(mode='RGB',
                        size=(self.config['CHAT_WIDTH'],
                              self.config['CHAT_HEIGHT']),
                        color=self.config['BGCOLOR'])

        # get image in thumbnail format
        thumb_img = download_image(self.img_req['url'])
        thumb_img.thumbnail(self.config['PIC_SIZE'], Image.ANTIALIAS)

        # post image thumbnail
        img.paste(thumb_img,
                  (self.config['PIC_COORDS'][0]['x'],
                   self.config['PIC_COORDS'][0]['y']))

        # post text
        last_y = 5
        x = self.config['TEXTBOX_COORDS'][0]['x'] - 30
        y = self.config['TEXTBOX_COORDS'][0]['y']
        draw = ImageDraw.Draw(img)

        if self.origin is 'skype':
            last_y = last_y + 50

        if self.origin in ['skype', 'facebook']:
            draw.rectangle(((205, 5), (329, 160)), fill="white")

        # add price
        draw.text((x, last_y),
                  self.img_req['price'],
                  font=self.config['font1'],
                  fill="#f54740")

        # add prime logo
        if self.prime and self.origin is not 'skype':
            img.paste(self.amazon_prime_image, (x + 110, last_y + 2))

        last_y = last_y + 28

        # move reviews down a bit
        if self.origin in ['skype', 'facebook']:
            last_y = last_y + 10

        # draw - (Review Number)
        if 'reviews' in self.img_req and 'rating' in self.img_req['reviews']:
            image_revs_rating = self.img_req['reviews']['rating']
            if image_revs_rating <= 0.5:  # ignoring if 0.0 < rating
                selectRating = 0.5
            elif image_revs_rating <= 1.0:
                selectRating = 1.0
            elif image_revs_rating <= 1.5:
                selectRating = 1.5
            elif image_revs_rating <= 2.0:
                selectRating = 2.0
            elif image_revs_rating <= 2.5:
                selectRating = 2.5
            elif image_revs_rating <= 3.0:
                selectRating = 3.0
            elif image_revs_rating <= 3.5:
                selectRating = 3.5
            elif image_revs_rating <= 4.0:
                selectRating = 4.0
            elif image_revs_rating <= 4.5:
                selectRating = 4.5
            else:  # ignoring if rating < 5
                selectRating = 5.0

            selectRating = str(selectRating)

            img.paste(self.review_stars_images[selectRating],
                      (x, last_y + 3),
                      mask=self.review_stars_images[selectRating])

            # make number count in blue to right of stars
            if 'reviewCount' in self.img_req['reviews']:
                draw.text((x + 82, last_y),
                          ' - ' + self.img_req['reviews']['reviewCount'],
                          font=self.config['font1'],
                          fill="#2d70c1")
            last_y = last_y + 20

        # #fake reviews for skype!! lmao <--- uhhh
        if self.origin is 'skype':
            selectRating = random.randint(6, 8)
            img.paste(self.review_stars_images[selectRating],
                      (x, last_y + 3),
                      mask=self.review_stars_images[selectRating])
            # selectRating = random.randint(6,7)
            reviewCount = random.randint(15, 1899)
            # img.paste(REVIEW_STARS[7], (x, last_y), mask=REVIEW_STARS[7])
            draw.text((x + 80, last_y),
                      ' - ' + str(reviewCount),
                      font=self.config['font2'],
                      fill="#2d70c1")
            last_y = last_y + 20

        last_y = last_y + 5

        for z in self.img_req['name']:
            # draw.text((x, last_y), z, font=font2, fill="#2d70c1")
            countLines = 0
            for line in textwrap.wrap(z, width=self.config['BOX_WIDTH']):
                countLines += 1
                if countLines < 3:
                    filler = ''
                    if countLines == 3:
                        filler = '...'
                    draw.text((x - 3, last_y),
                              line + filler,
                              font=self.config['font2'],
                              fill="#909497")
                    last_y += self.config['font2'].getsize(line)[1]
                    last_y = last_y + 2
        y += self.config['font1'].getsize(line)[1]
        last_y = y

        self.created_image = img

    def _upload_image_to_s3(self):
        s3_file = str(uuid.uuid4())
        tmp_img = io.BytesIO()
        self.created_image.save(tmp_img, 'PNG', quality=90)
        k = self.bucket.new_key(s3_file)
        k.set_contents_from_string(tmp_img.getvalue(),
                                   headers={"Content-Type": "image/png"})
        url_string = 'https://s3.amazonaws.com/' + self.bucket_name + '/' + s3_file
        self.s3_url = url_string
