import ast
import urllib.request
from pymongo import MongoClient

import argparse


def arg_parse():
    parser = argparse.ArgumentParser(description='Get Data from Scraped file and import to mongodb or train')
    parser.add_argument('-f','--file', help='file to read from', required=True)
    parser.add_argument('-db','--writedatabase', help='write to mongodb or not')
    return vars(parser.parse_args())

def get_html(url):
    return urllib.request.urlopen(url).read()

def read_file(file):
    """
    @brief      Reads a file from a portia scraper.  the file seems to be list
                of dicts

    @param      file  The file

    @return     { description_of_the_return_value }
    """
    with open(file) as f:
        data = ast.literal_eval(f.read())

    return data

def write_to_mongo(data):
    """
    @brief      writes the list of data to mongodb

    @param      data  The data

    @return     { description_of_the_return_value }
    """
    client = MongoClient()
    db = client.Scraper
    result = db.Items.insert_many(data)
    return result

def main():
    # main function
    #
    #
    args = arg_parse()

    filename = args['file']
    print('getting filename', filename)
    data = read_file(filename)

    print('data[0]', data[0])
    # for i in data:
    #     i['html'] = get_html(i['url'])

    if args['writedatabase']:
        print('writing to mongodb...')
        # write_to_mongo(data)


if __name__ == '__main__':
    main()