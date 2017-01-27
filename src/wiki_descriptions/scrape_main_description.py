import requests
import json
from time import sleep
from spacy.en import English
nlp = English()
wiki_endpoint = 'https://en.wikipedia.org/w/api.php'
link  = 'https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&rvsection=0&titles=pizza&format=json'
parameters = {'action':'query','prop':'extracts','explaintext':'','exintro':'','titles':'','format':'json'}



###################################3
ex_link = 'https://en.wikipedia.org/w/api.php?action=query&format=json&titles=pizza&prop=extracts&exintro&explaintext'
TARGET = '\n\'\'\''

#make api call
def get_response():
    response = requests.get(wiki_endpoint,params = parameters)
 
    if response.status_code == 200:
        return response.text
    else:
        return None

#load json
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
#split description into sentences
def tokenize_by_sentence(excerpt):
	doc = nlp(excerpt)
	sentences = [sent.string.strip() for sent in doc.sents]
	#print(sentences)
	return sentences



file_name = 'cuisine_classifier.json'
output_file_name = 'main_food_descriptions1.json'
classifier_dict = load_json(file_name)

cuisine_description_dict = {}

i = 0
for key in classifier_dict.keys():
	parameters['titles'] = key
	text = get_response()
	#pages -1 means no page was found
	if '"pages":{"-1"' in text:
		continue
	json_dict = json.loads(text)
	keys = list(json_dict['query']['pages'].keys())
	excerpt = json_dict['query']['pages'][keys[0]]['extract']
	sentences = tokenize_by_sentence(excerpt)
	if not sentences:
		continue
	print(key)
	if len(sentences) > 1:
		cuisine_description_dict[key] = (sentences[0],sentences[1])
	if len(sentences) ==1:
		cuisine_description_dict[key] = (sentences[0])
	i = i+1
	if i %1000==0:
		write_to_json(cuisine_description_dict,output_file_name)
	sleep(.6)
	
write_to_json(cuisine_description_dict,output_file_name)







    
