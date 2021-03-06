import os
import io
import time
import uuid
import random
import logging
import textwrap
import urllib.request

from PIL import Image, ImageFont, ImageDraw

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
    try:
        fonts_file = os.path.join(
            THIS_FOLDER,
            'fonts',
            'HelveticaNeue-Regular.ttf')
        logging.debug('fonts loaded correctly')
    except:
        fonts_file = os.path.join(
            '/image_processing',
            'fonts',
            'HelveticaNeue-Regular.ttf')
        logging.debug('error loading fonts')
    font = {}
    font_size = [x for x in range(12, 30)]
    for s in font_size:
        font[s] = ImageFont.truetype(fonts_file, s)
    return font


def load_review_stars():
    '''
    '''
    star_images = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0]
    rs_dict = {}
    for i in star_images:
        f = os.path.join(THIS_FOLDER, 'review_stars', str(i) + '.png')
        rs_dict[str(i)] = Image.open(f)
    return rs_dict


def load_amazon_prime():
    amzn_prime_logo = Image.open(
        os.path.join(THIS_FOLDER, 'amazon', 'prime.png'))
    return amzn_prime_logo


def download_image(url):
    fd = urllib.request.urlopen(url)
    image_file = io.BytesIO(fd.read())
    image = Image.open(image_file)
    return image


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
                 # bucket,
                 # gcloud_bucket,
                 amazon_prime_image,
                 review_stars_images,
                 font_dict):
        '''
        '''
        self.thumbnails = []
        self.origin = None
        self.uploaded_to_gcloud = False
        self.uploaded_to_s3 = False

        self.img_req = img_req[0]
        self.uniq_fn = uuid.uuid4().hex
        # self.bucket = bucket
        # self.gcloud_bucket = get_gcloud()
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

    def _get_config(self):
        '''
        '''
        if self.img_req['origin']:
            if self.img_req['origin'] in ['facebook', 'slack', 'skype']:
                logging.debug('img_req one of  facebook, slack, skype')
                self.origin = self.img_req['origin']
            else:
                logging.debug('img_req has origin but not of allowed types')
                logging.debug('img_req: ', self.img_req)
                self.origin = 'slack'
        else:
            self.origin = 'slack'
            logging.critical('NO_ORIGIN_ASSUMING_SLACK')

        if self.origin in ['skype']:
            logging.debug('changing skype to facebook tmp')
            self.origin = 'facebook'

        logging.debug('using origin: ' + self.origin)
        self.config = self.make_image_configs()
        logging.debug('using config: ')
        logging.debug(self.config)

    def _make_image(self):
        '''
        should be 1 image_req...
        create blank image based on source (slack/facebook/skype)
        '''

        img = Image.new(mode='RGB',
                        size=(self.config['CHAT_WIDTH'],
                              self.config['CHAT_HEIGHT']),
                        color=self.config['BGCOLOR'])

        # get image in thumbnail format
        logging.debug('making image for__: ' + str(self.img_req))
        thumb_img = download_image(self.img_req['url'])
        logging.debug('using pic_size:' + str(self.config['PIC_SIZE']))

        orig_sizing = self.config['PIC_SIZE'][0]

        if thumb_img.size[1] < thumb_img.size[0]:
            x1 = round(
                (thumb_img.size[0] / thumb_img.size[1]) * orig_sizing)
            self.config['PIC_SIZE'] = x1, x1
        thumb_img.thumbnail(self.config['PIC_SIZE'], Image.ANTIALIAS)

        sub_amount = 0
        if thumb_img.size[0] > orig_sizing:
            # sub_amount = thumb_img.size[0] - orig_sizing
            sub_amount = 0

        img.paste(thumb_img,
                  (round(self.config['PIC_COORDS']['x'] - sub_amount),
                   self.config['PIC_COORDS']['y']))
        # post text
        last_y = 5
        x = self.config['TEXTBOX_COORDS'][0]['x'] - 30
        y = self.config['TEXTBOX_COORDS'][0]['y']

        draw = ImageDraw.Draw(img, 'RGBA')
        draw.rectangle(((orig_sizing, 0), (self.config[
                       'CHAT_WIDTH'], self.config['CHAT_HEIGHT'])), fill="white")

        if self.origin is 'skype':
            last_y = last_y + 50

        if self.origin in ['skype', 'facebook']:
            draw.rectangle(((210, 5), (330, 300)), fill="white")
            # poly = Image.new('RGBA', (125, 295))
            # pdraw = ImageDraw.Draw(poly)
            # poly_offset = (205, 5)  # location in larger image
            # pdraw.polygon(
            #   [(0, 0), (0, 256), (125, 295), (256, 0)], fill="white")
            # img.paste(poly, poly_offset, mask=poly)

        # add price
        draw.text((x, 0),  # last_y - 5),
                  self.img_req['price'],
                  font=self.config['font1'],
                  fill="#f54740")

        # add prime logo
        if self.prime and self.origin not in ['skype']:
            # resize it to be more like kip cafe
            amzn_width, amzn_height = self.amazon_prime_image.size
            resize_proportion = 0.8
            amzn_width = round(amzn_width * resize_proportion)
            amzn_height = round(amzn_height * resize_proportion)
            img.paste(self.amazon_prime_image.resize(
                (amzn_width, amzn_height), Image.ANTIALIAS), (x + 140, 0))  # last_y + 2))

        last_y = last_y + 20

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
                      (x, last_y),
                      mask=self.review_stars_images[selectRating])

            # make number count in blue to right of stars
            if 'reviewCount' in self.img_req['reviews']:
                draw.text((x + 80, last_y - 2),
                          ' - ' + self.img_req['reviews']['reviewCount'],
                          font=self.config['review_count_font'],
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

        filler = ''
        add_filler = False
        wrap_list_of_lists = [textwrap.wrap(
            l, width=self.config['BOX_WIDTH']) for l in self.img_req['name']]
        wrap_list = [
            item for sublist in wrap_list_of_lists for item in sublist]
        if len(wrap_list) > 3:
            add_filler = True
            wrap_list = wrap_list[:3]
        for i, line in enumerate(wrap_list):
            if add_filler and len(wrap_list) == i + 1:
                filler = '...'
            draw.text((x, last_y - 0),
                      line + filler,
                      font=self.config['font2'],
                      fill="#909497")
            last_y += self.config['font2'].getsize(line)[1]
            last_y = last_y + 2

        y += self.config['font1'].getsize(line)[1]
        last_y = y

        self.created_image = img

    def make_image_configs(self):
        logging.debug('using self._make_image_configs')
        config = {}
        config['CHAT_WIDTH'] = 324
        config['CHAT_HEIGHT'] = 110
        config['PADDING'] = 0
        config['BGCOLOR'] = 'white'
        config['length'] = 3
        config['biggest_width'] = 0
        config['biggest_height'] = 0
        config['thumbnails'] = []
        config['PIC_SIZE'] = 110, 110
        # where to draw main pics

        config['PIC_COORDS'] = {'x': 0, 'y': 0}
        #                       {'x': 24, 'y': 174},
        #                       {'x': 24, 'y': 336}]
        # where to draw choice numbers
        config['TEXTBOX_COORDS'] = [{'x': 150, 'y': 0}]
        #                           {'x': 190, 'y': 174},
        #                           {'x': 190, 'y': 336}]

        config['BOX_WIDTH'] = 30
        config['font1'] = self.font_dict[16]
        config['font2'] = self.font_dict[14]
        config['review_count_font'] = self.font_dict[14]

        if self.origin in ['facebook']:
            logging.debug('using origin==facebook in config')
            config['BOX_WIDTH'] = 22
            config['CHAT_HEIGHT'] = 223
            config['CHAT_WIDTH'] = 425
            config['PIC_COORDS'] = {'x': 5, 'y': 5}  # where to draw main pic
            # where to draw text boxes
            config['TEXTBOX_COORDS'] = [{'x': 250, 'y': 5}]
            config['PIC_SIZE'] = 223, 223
            config['font1'] = self.font_dict[28]
            config['font2'] = self.font_dict[20]
            config['review_count_font'] = self.font_dict[20]

        if self.origin in ['skype']:
            logging.debug('using origin==skype in config')
            config['BOX_WIDTH'] = 22
            config['CHAT_HEIGHT'] = 230
            config['CHAT_WIDTH'] = 381
            config['PIC_COORDS'] = {'x': 20, 'y': 50}  # where to draw main p
            # where to draw text boxes
            config['TEXTBOX_COORDS'] = [{'x': 250, 'y': 100}]
            config['PIC_SIZE'] = 250, 250
            config['font1'] = self.font_dict[28]
            config['font2'] = self.font_dict[20]
            config['review_count_font'] = self.font_dict[18]

        return config

    def get_url(self):
        if self.uploaded_to_gcloud:
            return self.object_upload.public_url
        else:
            t1 = time.time()
            self._upload_image_to_s3()
            logging.info('upload time for s3: ' + str(time.time() - t1))
            return self.s3_url
