'''
Script to Convert A JSON File to a CSV File.  Note that this will only work well for json files
that are composed of only key,value pairs and won't really work for json files with nested objects
'''

import csv
import json


def load_json(file_name):
    dic = {}
    with open(file_name) as json_data:
        dic = json.load(json_data)
        json_data.close()
    return dic




file_name = 'main_food_descriptions.json'
my_dict = load_json(file_name)
print(my_dict)
the_dict = {}
for k,v in my_dict.items():
    val = v.replace(',', ' ')
    the_dict[k] = val
with open('main_food_descriptions.csv', 'w') as f:
    writer = csv.writer(f)
    for row in the_dict.items():
        writer.writerow(row)

