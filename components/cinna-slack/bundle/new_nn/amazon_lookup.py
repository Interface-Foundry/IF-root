
import bottlenose, json, time, re
import xml.etree.cElementTree as ElementTree
from urllib.error import HTTPError
from pprint import pprint
from bs4 import BeautifulSoup
import pandas as pd


def error_handler(err):
    ex = err['exception']
    if isinstance(ex, HTTPError) and ex.code == 503:
        time.sleep(random.expovariate(0.1))
        return True

AMAZON_ACCESS_KEY = "AKIAIKMXJTAV2ORZMWMQ"
AMAZON_SECRET_KEY = "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"
AMAZON_ASSOC_TAG = "quic0b-20"

amazon = bottlenose.Amazon(AMAZON_ACCESS_KEY, 
						   AMAZON_SECRET_KEY, 
						   AMAZON_ASSOC_TAG, 
						   Parser=BeautifulSoup,
						   ErrorHandler=error_handler)

with open('test.txt', 'w') as f:
	with open('asins.txt', 'r') as f1:
		i = 0
		while i < 100:
			# each line contains an ASIN.
			# this will bulk read from the file and search.
			line = ','.join([f1.readline() for i in range(10)])
			i += 1
			#line = f1.readline()

			response = amazon.ItemLookup(ItemId=line.strip(), ResponseGroup="ItemAttributes, BrowseNodes")
			titles = response.find_all('title')
			for title in titles:
				f.write(title.text + '\n')
			
			#asins = response.find_all('asin')
			
			#categories = [tree.find_all('name') for tree in response.find_all('browsenodes')]

			time.sleep(1.1)
			if not line: break







