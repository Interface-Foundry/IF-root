import requests
from spacy.en import English
import json
import re
import urllib
from time import sleep
#nlp = English()
wiki_endpoint = 'https://en.wikipedia.org/w/api.php'
link  = 'https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&rvsection=0&titles=pizza&format=json'
parameters = {'action':'query','prop':'revisions','rvprop':'content','rvsection':'0','titles':'','format':'json'}
regex = re.compile("[\[\]]")

#section names in the json response
KEYS = ['main_ingredient','variations','served','ingredients','type','alternat_name','minor_ingredient']
POS = ['NOUN','CONJ','ADJ']

#make api call
def get_response():
    response = requests.get(wiki_endpoint,params = parameters)
 
    if response.status_code == 200:
        return response.text
    else:
        return None

#get all of the sections
def parse_response(text):
    sections = {key:parse_key_section('| ' + text,key) for key in KEYS}
    return sections

#get section and clean it up
def parse_key_section(text,key):
    section = grab_section(text,key)
    if section == '':
        return ''
    section = clean_section(section)
    return split_into_tokens(section)

#find the sections based on the key
def grab_section(text,key):
    start = text.find(key)
    #print(start)
    if start != -1:
        start = text.find('=',start+1)
        end = text.find('|',start+1)
    else:
        return ''
    #print(end)
    return text[start+1:end]

#cleanup the section
def clean_section(section):
    section = regex.sub('',section)
    section = section.replace(r'\n','')
    return section

#split the section items into tokens
def split_into_tokens(section):
    section = section.split(',')
    return [token.strip() for token in section]
def clean_phrase(phrase):
    if len(phrase.split()) >1:
        pass

# load json
def load_json(file_name):
    dic = {}
    with open(file_name) as json_data:
        dic = json.load(json_data)
        json_data.close()
    return dic

#write json
def write_to_json(dic, outputfilename):
    json_str = json.dumps(dic,indent=2)
    with open(outputfilename, 'w') as outfile:
        outfile.write(json_str)

#section is valid if not empty
def is_valid(sections):
    for k,v in sections.items():
        if v != '':
            return True
    return False

file_name = 'cuisine_classifier.json'
output_file_name = 'food_descriptions.json'
classifier_dict = load_json(file_name)

i=0
cuisine_description_dict = {}

for key in classifier_dict.keys():
    parameters['titles'] = key
    text = get_response()
    #pages -1 means a page was not found
    if '"pages":{"-1"' in text:
        continue
    sections = parse_response(text)
    if is_valid(sections):
        print(key)
        cuisine_description_dict[key] = sections 
    i = i+1
    if i%1000 ==0:
        print('writing')
        write_to_json(cuisine_description_dict,output_file_name)
    sleep(1)
    
write_to_json(cuisine_description_dict,output_file_name)







