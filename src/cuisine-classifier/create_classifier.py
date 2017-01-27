from pymongo import MongoClient
import pymongo
import pprint
import json
import re
import sys
import inflect
from spacy.en import English

#ignore these words
WORDS_TO_IGNORE = set([
                    'set',
                    'settings',
                    'pcs',
                    'plastic',
                    'waitress',
                    'note',
                    'storage',
                    'tidbits',
                    'meals',
                    'speciality',
                    'specialties',
                    'special',
                    'platters',
                    'load',
                    'inch',
                    'foot',
                    'cable',
                    'generations',
                    'instant',
                    'sizes',
                    'pairing',
                    'pay',
                    'store',
                    'substitutions',
                    'replacement',
                    'something',
                    'money',
                    'calories',
                    'fillings',
                    'extra',
                    'additions',
                    'addition',
                    'deal',
                    'deals',])

nlp = English()
inflect_engine = inflect.engine()

#probably unnecessary but i will leave it just in case
sys.setrecursionlimit(100000)
#function to check whether item has the proper id of length 4:
#The desired id would be of the form PE-x-x-x-x, where x is an integer of any length > 1
def check_item(k,v,d,item_dic_list):
         if(k == 'id' and isinstance(v,str)):
            if len(v.split('-'))==5:
                #print(k,v)
                item_dic_list.append(d)
#get all item names and put them into a list
def get_names(item_dics):
    item_name_list = []
    for d in item_dics:
        item_name_list.append(d['name'].lower())
    return item_name_list
#traverse through dictionary returned by pymongo and find items
def get_menu_items(d,item_dic_list):
    if isinstance(d,dict):
        for k, v in d.items():
            if isinstance(v, dict) or isinstance(v,list):
                get_menu_items(v,item_dic_list)
            else:
                check_item(k,v,d,item_dic_list)
           
    elif isinstance(d,list):
        for v in d:
           if isinstance(v, dict) or isinstance(v,list):
                get_menu_items(v,item_dic_list)

            
#parse menus
def parse_menus(menus,merchants,item_name_dic):
    merchant = None
    for menu in menus.find():
        item_dic_list = []
        merchant_id = menu['merchant_id']
        merchant = merchants.find_one({'id':merchant_id})
        cuisines = merchant['data']['summary']['cuisines']
        get_menu_items(menu,item_dic_list)
        item_name_list = get_names(item_dic_list)
        item_name_dic[merchant_id] = (cuisines,item_name_list)
    return item_name_dic


#nlp section

#conditions to check whether an item will make it into the classifier
def is_valid(string,phrase = False):
    if phrase:
        if any(word in WORDS_TO_IGNORE for word in string.split()):
            return False
        else:
            return True
    else:
        if len(string) < 3:    
            return False
        elif string in WORDS_TO_IGNORE:
            return False
        else:
            return True
#put the list of nouns in a collection
def get_nouns_from_items(item_collection):
    for k,v in item_collection.items():
        noun_list = []
        for item in v[1]:
            noun_list = noun_list + get_nouns(item)
        item_collection[k] = (v[0],v[1],noun_list)
    return item_collection

#split phrase into nouns
def get_nouns(full_item_name):
    nouns = []
    tokens = nlp(full_item_name)
    if is_noun_phrase(tokens):
        full_item_name = clean_noun(full_item_name)
        if is_valid(full_item_name,True):
            nouns.append(full_item_name)
    for token in tokens:
        if token.pos_=='NOUN' and len(str(token)) > 2:
            noun = str(token).lower()
            noun = clean_noun(noun)
            if is_valid(noun):
                nouns.append(noun)
    return nouns
#save entire item name if it's a noun phrase
def is_noun_phrase(tokens):
    found_noun = False
    found_conjunction = False
    for token in tokens:
        if token.pos_ == 'NOUN':
            found_noun = True
        elif token.pos_ == 'CONJ':
            found_conjunction = True
        else:
            return False
    #this means we either have something with nouns and conjunctions or just nouns
    if found_noun:
        return True

#remove unwanted characters
def clean_noun(noun):
    noun = noun.strip()
    return remove_non_alpha(noun)

#function to check if numbers are present
def hasNumbers(inputString):
    return any(char.isdigit() for char in inputString)

#get rid of any non alphabetic characters
def remove_non_alpha(noun):
    regex = re.compile('[^a-zA-Z -]')
    noun = regex.sub('',noun)
    return noun.replace('-',' ')

client = MongoClient()


#classifier creation section
def find_data_distribution(item_name_dic):
    distribution = {}
    for k,v in item_name_dic.items():
        for item in v[2]:
            if item not in distribution:
                    distribution[item] = {}
            for cuisine in v[0]:
                if cuisine in distribution[item]:
                    distribution[item][cuisine] = distribution[item][cuisine] + 1
                else:
                    distribution[item][cuisine] = 1
    return distribution

#output to file
def write_to_json(distribution_dic, outputfilename):
    json_str = json.dumps(distribution_dict,indent=2)
    with open(outputfilename, 'w') as outfile:
        outfile.write(json_str)

db  = client.foundry
#grab reference to databases
menus = db.menus
merchants = db.merchants

#parse out the items and cuisines for each menu
item_name_dict = {}
item_name_dict = parse_menus(menus,merchants,item_name_dict)
item_name_dict = get_nouns_from_items(item_name_dict)
distribution_dict = find_data_distribution(item_name_dict)

#output to json
outputfilename = 'cuisine_classifier.json'
write_to_json(distribution_dict,outputfilename)


