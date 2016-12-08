import os
import io
import time
import uuid
import random
import logging
import textwrap
import urllib.request
from PIL import Image, ImageFont, ImageDraw
import re

def menu_cat(img_req): 

	#pull menu from json
	menu_text = img_req['menu']

	#sub menu count within menu list
	sub_menu_ct = len(menu_text)
	for sm_ct in range(0,sub_menu_ct):

		#print(menu_text[sm_ct]['name']) # prints sub-menu 
		
		item_ct = len(menu_text[sm_ct]['children'])
		for it_ct in range(0,item_ct):
			item_txt = menu_text[sm_ct]['children'][it_ct]
			item_name = menu_text[sm_ct]['children'][it_ct]['name']

			#strip punctuation and numbers from menu item name
			punctuation = re.compile(r'[-.?!,":;()|0-9|^\s+]')
			item_name_strp = punctuation.sub("", item_name)
			print(item_name_strp)

			#get the first letter of item_name_strp
			item_letter = item_name_strp[0]
			
			#get sub_menu number +1 since index starts at 0
			sm_ct_plus = sm_ct+1

			#create filename 
			icon_filename = '{0}{1}.jpg'.format(sm_ct_plus, item_letter)
			icon_path = 'icons/{0}'.format(icon_filename)
			print(icon_filename)
			print(icon_path)

	#sample opens appropriate icon for test item
	icon_filename = '20J.jpg'
	icon_path = 'icons/{0}'.format(icon_filename)
	icon = Image.open(open(icon_path, 'rb')).show()