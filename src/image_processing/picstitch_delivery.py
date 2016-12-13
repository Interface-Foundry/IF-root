# -*- coding: utf-8 -*-
import os
import io
import time
import uuid
import random
import logging
import textwrap
import urllib.request
import numpy as np

#from gcloud import storage
from PIL import Image, ImageFont, ImageDraw

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')

THIS_FOLDER = os.path.dirname(os.path.realpath(__file__))
os.environ["GOOGLE_APPLICATION_CREDENTIALS"]="gcloud_key/KipStyles-8da42a8a7423.json"

'''
# numbers each picstitch image with the number.png - we no longer do this, right?
# guessing this was the layout from before.
def load_number_images():
    images = []
    # [1, 2, 3]
    number_images = [x for x in range(1, 4)]
    for i in number_images:
        f = THIS_FOLDER + '/numbers/' + repr(i) + '.png'
        images.append(Image.open(f))
    return images
'''

def load_fonts_reg():
    try:
        fonts_fileR = os.path.join(
            os.getcwd(), 'fonts', 'HelveticaNeue-Regular.ttf')
    except:
        fonts_fileR = os.path.join(
            '/picstitch', 'fonts', 'HelveticaNeue-Regular.ttf')
        logging.debug('error loading fonts')

    fontR = {}
    font_size = [x for x in range(12, 30)]
    #defines possible font sizes
    for s in font_size:
        fontR[s] = ImageFont.truetype(fonts_fileR, s)
        # font[s] defines variable for font size font[15] = helvetic size 15 font
    return fontR

def load_fonts_bold():
    try:
        fonts_fileB = os.path.join(
            os.getcwd(), 'fonts', 'HelveticaNeue-Bold.ttf')
        logging.debug('fonts loaded correctly')
    except:
        fonts_fileB = os.path.join(
            '/picstitch', 'fonts', 'HelveticaNeue-Bold.ttf')
        logging.debug('error loading fonts')

    fontB = {}
    font_size = [x for x in range(12, 30)]
    #defines possible font sizes

    for s in font_size:
        fontB[s] = ImageFont.truetype(fonts_fileB, s)
        # font[s] defines variable for font size font[15] = helvetic size 15 font
    return fontB


def load_review_stars():
    star_images = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0]
    rs_dict = {}
    for i in star_images:
        f = THIS_FOLDER + '/review_stars/' + str(i) + '.png'
        # f defines path for each of the star images
        rs_dict[str(i)] = Image.open(f)
        # rs_dict[str(i)] opens star image and stores it in rs_dict
        # str(i) calls star from rs_dict
    return rs_dict


#def load_amazon_prime():
#    amzn_prime_logo = Image.open(THIS_FOLDER + '/amazon/prime.png')
#    return amzn_prime_logo


def download_image(url):
    logging.info('opening url for' + url)
    #gc add
    fd = urllib.request.urlopen(url)
    image_file = io.BytesIO(fd.read())
    image = Image.open(image_file)
    return image


class PicStitch:
    '''
    graham's amazon json for product data
    {'price': '$15.98',
     'name': ['Size: Large', 'Amoluv', 'Amoluv owns its own trademarks.
      Trademark number:86522196, The package contains Amoluv Tag'],
     'origin': 'slack',
     'reviews': {'rating': 3.2, 'reviewCount': '258'},
     'prime': '0',
     'url': 'http://ecx.images-amazon.com/images/I/51cgwKrncWL.jpg'}
    '''

    '''
    grace's delivery json for restaurant data
    {
    data: {
        'location':{
            'distance':0.39104587028574
        },
        'ordering':{
            'availability':{
                    'delivery_estimate': 45,
                    },
            'delivery_charge':0,
            'minimum':10
            }
        },
        'summary':{
            "merchant_logo_raw" : "https://static.delivery.com/merchant_logo.php?w=0&h=0&id=62236",
            "merchant_logo" : "https://static.delivery.com/merchant_logo.php?id=62236",
            "num_ratings":21,
            "star_ratings": 4,
            "cuisines" : [
                "American",
                "Burgers",
                "Sandwiches",
                "Diner"
            ],
            "name" : "Zafis Luncheonette"
        }
    }
    '''
    def __init__(self,
                 img_req,
                 # bucket,
                 # gcloud_bucket,
                 #amazon_prime_image,
                 review_stars_images,
                 font_dict_R,
                 font_dict_B):
        '''
        '''

        self.thumbnails = []
        self.origin = None
        self.uploaded_to_gcloud = False
        self.uploaded_to_s3 = False
        self.img_req = img_req
        self.uniq_fn = uuid.uuid4().hex

#        self.bucket = bucket
#        self.gcloud_bucket = get_gcloud()
        self.bucket_name = 'if-kip-chat-images'

#        self.amazon_prime_image = amazon_prime_image
        self.review_stars_images = review_stars_images
        self.font_dict_R = font_dict_R
        self.font_dict_B = font_dict_B

#        if self.img_req['prime']:
#           self.prime = True
#        else:
#            self.prime = False

        self._get_config()
        self._make_image()

    def _get_config(self):
        '''
        '''
        #print (self.img_req['origin'])

        if self.img_req['origin']:
            if self.img_req['origin'] in ['facebook', 'slack', 'skype']:
                self.origin = self.img_req['origin']
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
        thumb_img.thumbnail(self.config['PIC_SIZE'], Image.ANTIALIAS)

        # post image thumbnail
        # arr = np.array(thumb_img)
        # alpha = arr[:, :, 2]
        # n1 = len(alpha)
        # alpha[:] = np.interp(np.arange(n1), [0, 0.55*n1, 0.75*n1, n1], [255, 255, 0, 0])[:,np.newaxis]
        # thumb_img = Image.fromarray(alpha, mode='RGBA')
        img.paste(thumb_img,
                  (self.config['PIC_COORDS']['x'],
                   self.config['PIC_COORDS']['y']))

        # post text
        last_y = 0
        # change from: 5

        print (self.config['TEXTBOX_COORDS'])
        x = self.config['TEXTBOX_COORDS']['x']
        # x = self.config['TEXTBOX_COORDS']['x'] - 30
        y = self.config['TEXTBOX_COORDS']['y']
        draw = ImageDraw.Draw(img, 'RGBA')

        if self.origin is 'skype':
            last_y = last_y + 50

        if self.origin in ['skype', 'facebook']:
            draw.rectangle(((210, 5), (330, 300)), fill="white")
            # poly = Image.new('RGBA', (125, 295))
            # pdraw = ImageDraw.Draw(poly)
            # poly_offset = (205, 5)  # location in larger image
            # pdraw.polygon([(0, 0), (0, 256), (125, 295), (256, 0)], fill="white")
            # img.paste(poly, poly_offset, mask=poly)

        # add price --> distance

        # cuisines, like "Chinese, Japanese"
        cuisines_text = ", ".join(self.img_req['cuisines'])
        if len(cuisines_text) < 20:
            # if word count for 2 cuisines is less than 20 characters/1 line, inlcude 2 cuisines
            # else include 1 cuisine
            draw.text((x, last_y),
                cuisines_text,
                font=self.config['font3'],
                fill="#3b9ef1")
        else:
            draw.text((x, last_y+4),
                self.img_req['cuisines'][0],
                font=self.config['font1'],
                fill="#3b9ef1")

        # add prime logo
        #if self.prime and self.origin not in ['skype']:
        #    img.paste(self.amazon_prime_image, (x + 110, last_y + 2))

        last_y = last_y + 27

        # move reviews down a bit
        if self.origin in ['skype', 'facebook']:
            last_y = last_y + 10



        if not 'num_ratings' in self.img_req['summary']:
            self.img_req['summary']['num_ratings'] = 0 # setting undefined rating count to zero


        #yelp vs. delivery.com ratings
        #we should probably show whatever one has better rating

        if 'yelp_rating' in self.img_req and 'review_count' in self.img_req['yelp_rating'] and 'rating' in self.img_req['yelp_rating']:
            #use yelp rating
            print('USING YELP')

            # #if no reviews, set to zero
            # if not 'num_ratings' in self.img_req['summary']:
            #     self.img_req['summary']['num_ratings'] = 0 # setting undefined rating count to zero

            review_count = self.img_req['yelp_rating']['review_count']
            rating = self.img_req['yelp_rating']['rating']

        elif 'summary' in self.img_req and 'star_ratings' in self.img_req['summary'] and 'num_ratings' in self.img_req['summary']:
            #use delivery.com rating
            print('USING DELIVERY.COM')

            #if no reviews, set to zero
            # if not 'num_ratings' in self.img_req['summary']:
            #     self.img_req['summary']['num_ratings'] = 0 # setting undefined rating count to zero

            review_count = self.img_req['summary']['num_ratings']
            rating = self.img_req['summary']['star_ratings']            


        # draw - (Review Number)
        if review_count > 0:
      
            image_revs_rating = rating
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
                      (x - 3, last_y),
                      mask=self.review_stars_images[selectRating])

            # make number count in blue to right of stars
            draw.text((x + 80, last_y - 2),
                      ' - ' + str(review_count),
                      font=self.config['review_count_font'],
                      fill="#2d70c1")
            last_y = last_y + 18

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
            last_y = last_y + 15

        #last_y = last_y + 5

        if 'distance' in self.img_req['location'] and 'delivery_estimate' in self.img_req['ordering']['availability']:
            dist = round(self.img_req['location']['distance'], 2)
            del_est = self.img_req['ordering']['availability']['delivery_estimate']
            draw.text((x, last_y),
                       str(dist) + ' miles' + '   •   ' + str(del_est) + ' mins',
                       font=self.config['font2'],
                       fill="#909497")
            last_y = last_y + 25

        if 'minimum' in self.img_req['ordering']:
            draw.text((x, last_y +4),
                       '$ ' + str(self.img_req['ordering']['minimum']),
                       font=self.config['font4'],
                       fill='#909497')
            draw.text((x, last_y + 20),
                       'Minimum',
                       font=self.config['font2'],
                       fill='#909497')

        if 'delivery_charge' in self.img_req['ordering']:
            delivery_charge = self.img_req['ordering']['delivery_charge']
            if delivery_charge == 0:
                draw.text((x + 90, last_y + 4),
                           'Free',
                           font=self.config['font4'],
                           fill='#37a936')
                draw.text((x + 89, last_y + 20),
                           'Delivery',
                           font=self.config['font2'],
                           fill='#37a936')
            else:
                draw.text((x + 90, last_y + 4),
                           '$' + str("{0:.2f}".format(delivery_charge)),
                           font=self.config['font2'],
                           fill='#37a936')
                draw.text((x + 89, last_y + 20),
                           'Delivery Fee',
                           font=self.config['font2'],
                           fill='#37a936')
        ## if 'Size' in self.img_req['name']:
        # for z in self.img_req['name']:
        #     ## draw.text((x, last_y), z, font=font2, fill="#2d70c1")
        #     ## size = self.img_req['name']['Size']
        #     countLines = 0
        #     ## for line in textwrap.wrap(size, width=self.config['BOX_WIDTH']):
        #     for line in textwrap.wrap(z, width=self.config['BOX_WIDTH']):
        #         countLines += 1
        #         if countLines < 3:
        #             filler = ''
        #             if countLines == 3:
        #                 filler = '...'
        #             draw.text((x - 3, last_y),
        #                       line + filler,
        #                       font=self.config['font2'],
        #                       fill="#909497")
        #             last_y += self.config['font2'].getsize(line)[1]
        #             last_y = last_y + 2
        # y += self.config['font1'].getsize(line)[1]
        # last_y = y

 #       Image.open(img)
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
        config['PIC_SIZE'] = 100, 100
        # amazon pic size
        config['PIC_COORDS'] = {'x': 9, 'y': 9}
        #former {'x':14, 'y':5}
        #                       {'x': 24, 'y': 174},
        #                       {'x': 24, 'y': 336}]
        # where to draw choice numbers
        config['TEXTBOX_COORDS'] = {'x': 150, 'y': 0}
        #                           {'x': 190, 'y': 174},
        #                           {'x': 190, 'y': 336}]

        config['BOX_WIDTH'] = 30
        config['font1'] = self.font_dict_R[15]
        config['font2'] = self.font_dict_R[14]
        config['font3'] = self.font_dict_B[15]
        config['font4'] = self.font_dict_B[14]
        config['review_count_font'] = self.font_dict_R[13]

        if self.origin in ['facebook']:
            logging.debug('using origin==facebook in config')
            config['BOX_WIDTH'] = 22
            config['CHAT_HEIGHT'] = 223
            config['CHAT_WIDTH'] = 425
            config['PIC_COORDS'] = {'x': 0, 'y': 0}  # where to draw main pic
            # where to draw text boxes
            config['TEXTBOX_COORDS'] = [{'x': 250, 'y': 5}]
            config['PIC_SIZE'] = 223, 223
            config['font1'] = self.font_dict_R[28]
            config['font2'] = self.font_dict_R[20]
            config['review_count_font'] = self.font_dict_R[20]

        if self.origin in ['skype']:
            logging.debug('using origin==skype in config')
            config['BOX_WIDTH'] = 22
            config['CHAT_HEIGHT'] = 230
            config['CHAT_WIDTH'] = 381
            config['PIC_COORDS'] = {'x': 20, 'y': 50}  # where to draw main p
            # where to draw text boxes
            config['TEXTBOX_COORDS'] = [{'x': 250, 'y': 100}]
            config['PIC_SIZE'] = 250, 250
            config['font1'] = self.font_dict_R[28]
            config['font2'] = self.font_dict_R[20]
            config['review_count_font'] = self.font_dict_R[18]

        return config

    def get_url(self):
        logging.info('getting url')
        #gc add
        if self.uploaded_to_gcloud:
            return self.object_upload.public_url
        else:
            t1 = time.time()
            self._upload_image_to_s3()
            logging.info('upload time for s3: ' + str(time.time() - t1))
            return self.s3_url
