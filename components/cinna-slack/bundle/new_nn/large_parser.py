import gzip
import json
import re
from nltk.tokenize import word_tokenize
import os

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.externals import joblib
from sklearn.preprocessing import Normalizer
from sklearn.decomposition import TruncatedSVD
from sklearn.decomposition import IncrementedPCA
from sklearn.pipeline import make_pipeline

svd = TruncatedSVD(200)
normalizer = Normalizer(copy=False)

# set up supporting functions

# preprocess sentences and remove noise making words
def preprocess(s, tokenize_words=False):
    s = s.lower()
    s = s.replace('-', ' ')
    s = ''.join(x for x in s if x not in [',', '®', ':', '+', '%', '#'])
    s = s.replace('mm', ' mm')
    s = re.sub(r'\([^)]*\)', '', s)
    s = re.sub(r'\[[^)]*\]', '', s)
    s = s.replace('/', ' ')
    s = s.replace('gold edition', 'gold_edition')
    s = s.replace('premium edition', 'premium_edition')
    s = s.replace('standard edition', 'standard_edition')
    s = s.replace('feet', ' feet')
    s = s.strip()
    if tokenize_words:
        stoplist = ['&', 'a', 'and', 'the', 'for', 'of', 'to', 'in', 'into']
        s = [word for word in s.split() if word not in stoplist]
        s = word_tokenize(' '.join(s))
    return s

def normalize_in_list(row, type='cat'):
    tmp = []
    for x in row:
        if type == 'cat':
            tmp.append(preprocess(x, tokenize_words=False))
        elif type == 'item':
            tmp.append(preprocess(x, tokenize_words=True))
    return tmp

def flatten_lists(l):
    return [item for sublist in l for item in sublist]


# GET VOCABULARY FOR PRODUCT NAMES
classes = []
titles = []
brands = []

with gzip.open('productMeta.txt.gz', 'rb') as f:
    index = 0
    line = f.readline().decode().strip()
    while line:
        if ('{' in line):
            if (line[-1] == ','):
                line = line[:-1]
            product_json = json.loads(line)
            # get titles
            if 'title' in product_json.keys():
                titles.append(product_json['title'])
            
            # get categories
            #if 'categories' in product_json.keys():
            #    classes.append(product_json['categories'][0])
            #elif 'salesRank' in product_json.keys():
            #    classes.append(product_json['salesRank'].keys())
                    
            # brands
            #if 'brand' in product_json.keys():
            #    brands.append(product_json['brand'])
            
            index += 1
            if (index % 100000 == 0):
                print(str(index) + " lines parsed so far!")
                # cast to set for memory control
                #classes = list(set(classes))
                brands = list(set(brands))
            
        line = f.readline().decode().strip()


brands = set(brands)

################
# VECTORIZERRR #
################
titles_map = map(lambda x: ' '.join(normalize_in_list([x], type='item')[0]), titles)

vectorizer = TfidfVectorizer(max_df=0.5, 
                             max_features=None, 
                             stop_words='english',
                             dtype='int32',
                             use_idf=True)
X = vectorizer.fit_transform(titles_map)
print('Vectorization complete')
X = svd.fit_transform(X)
print('dimensionality reduction complete')
X = normalizer.fit(X)
print('Normalization complete')
#classes = set([category for categories in classes for category in categories])
###############

# save data
try:
    os.remove('vectorizer.pkl')
    os.remove('vectorizer.pkl_01.npy')
    os.remove('vectorizer.pkl_02.npy')
except OSError:
    pass

try:
	os.remove('category2vec.pkl')
	os.remove('category2vec.pkl_01.npy')
	os.remove('category2vec.pkl_02.npy')
except OSError:
	pass

try:
    os.remove('brands.txt')
except OSError:
    pass

try:
    os.remove('categories.txt')
except OSError:
    pass

vectorizer = make_pipeline(vectorizer, svd, normalizer)
joblib.dump(vectorizer, 'vectorizer.pkl')
print('tf-idf product name vectorizer saved to vectorizer.pkl')
del vectorizer
del titles

#category_vectorizer = pipe_it_up.fit_transform(classes)
#joblib.dump(category_vectorizer, 'category2vec.pkl')
#print('tf-idf categories vectorizer saved to category2vec.pkl')
#del classes
#del category_vectorizer

#with open('brands.txt', 'w') as f:
#    f.write('|'.join(brands))
#print('Brands saved to brands.txt')

#with open('categories.txt', 'w') as f:
#    f.write('|'.join(list(classes)))
#print('Categories saved to categories.txt')



