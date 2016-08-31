
import bottlenose, json, time, re
import xml.etree.cElementTree as ElementTree
from urllib.error import HTTPError
from pprint import pprint
from bs4 import BeautifulSoup
import pandas as pd
import os

##############################################################################
# Pulled directly from
# http://stackoverflow.com/questions/2148119/how-to-convert-an-xml-string-to-a-dictionary-in-python
##############################################################################
class XmlListConfig(list):
    def __init__(self, aList):
        for element in aList:
            if element:
                # treat like dict
                if len(element) == 1 or element[0].tag != element[1].tag:
                    self.append(XmlDictConfig(element))
                # treat like list
                elif element[0].tag == element[1].tag:
                    self.append(XmlListConfig(element))
            elif element.text:
                text = element.text.strip()
                if text:
                    self.append(text)


class XmlDictConfig(dict):
    '''
    Example usage:

    >>> tree = ElementTree.parse('your_file.xml')
    >>> root = tree.getroot()
    >>> xmldict = XmlDictConfig(root)

    Or, if you want to use an XML string:

    >>> root = ElementTree.XML(xml_string)
    >>> xmldict = XmlDictConfig(root)

    And then use xmldict for what it is... a dict.
    '''
    def __init__(self, parent_element):
        if parent_element.items():
            self.update(dict(parent_element.items()))
        for element in parent_element:
            if element:
                # treat like dict - we assume that if the first two tags
                # in a series are different, then they are all different.
                if len(element) == 1 or element[0].tag != element[1].tag:
                    aDict = XmlDictConfig(element)
                # treat like list - we assume that if the first two tags
                # in a series are the same, then the rest are the same.
                else:
                    # here, we put the list in dictionary; the key is the
                    # tag name the list elements all share in common, and
                    # the value is the list itself 
                    aDict = {element[0].tag: XmlListConfig(element)}
                # if the tag has attributes, add those to the dict
                if element.items():
                    aDict.update(dict(element.items()))
                self.update({element.tag: aDict})
            # this assumes that if you've got an attribute in a tag,
            # you won't be having any text. This may or may not be a 
            # good idea -- time will tell. It works for the way we are
            # currently doing XML configuration files...
            elif element.items():
                self.update({element.tag: dict(element.items())})
            # finally, if there are no child tags and no attributes, extract
            # the text
            else:
                self.update({element.tag: element.text})

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
						   MaxQPS=1.0,
						   ErrorHandler=error_handler)

def main():
	try:
		os.remove('test.txt')
	except OSError:
		pass

	with open('test.txt', 'w') as f:
		with open('asins.txt', 'r') as f1:
			i = 0
			while i < 100000:
				# each line contains an ASIN.
				# this will bulk read from the file and search.
				line = ','.join([f1.readline().strip() for i in range(10)])
				print(i)
				i += 1
				#line = f1.readline()

				#response = amazon.ItemLookup(ItemId=line.strip(), ResponseGroup="ItemAttributes, Accessories, BrowseNodes")
				response = amazon.ItemLookup(ItemId=line, ResponseGroup="ItemAttributes, Similarities")
				#titles = response.find_all('title')
				#asins = response.find_all('asin')
				#groups = response.find_all('productgroup')
				for item in response.find_all('item'):
					similarproducts = item.find_all('similarproducts')
					
					f.write(item.find('asin').text + '|')
					f.write(item.find('title').text + '|')
					f.write(item.find('productgroup').text + '|')
					f.write(time.strftime("%Y-%m-%d %H:%M") + '|')
					#print("ASIN: %s , Title: %s , Product Group: %s" % (item.find('asin').text, item.find('title').text, item.find('productgroup').text))
					if similarproducts:
					#	print("Similar items: ")
						for similarproduct in similarproducts:
							
							similar_titles = [x.text for x in similarproduct.find_all('title')]
							similar_asins = [x.text for x in similarproduct.find_all('asin')]
							f.write('~~~'.join(similar_titles) + '|')
							f.write('~~~'.join(similar_asins) + '\n')
							#similarities = list(zip(similar_titles, similar_asins))
							
							#f.write('~~~'.join(similarities) + '\n')
					#		print("\tTitle: %s" % ', '.join([x.text for x in similarproduct.find_all('title')]))
					#		print("\tASIN: %s" % ', ' .join([x.text for x in similarproduct.find_all('asin')]))
							#print(similarproduct.prettify())
					else:
						f.write('|\n')
					#print()
				

				#for index, title in enumerate(titles):
				#	f.write(title.text + '|' + asins[index].text + '|' + groups[index].text + '|' + time.strftime("%Y-%m-%d %H:%M") + '\n')
				
				#categories = [tree.find_all('name') for tree in response.find_all('browsenodes')]

				if not line: break

if __name__ == '__main__':
	main()




