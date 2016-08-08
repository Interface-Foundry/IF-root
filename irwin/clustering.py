# import numpy as np
from nltk.tokenize import word_tokenize

from sklearn.cluster import AgglomerativeClustering, KMeans
from sklearn.feature_extraction.text import TfidfVectorizer

from pymongo import MongoClient
# from gensim.models import Word2Vec

from sklearn.preprocessing import Normalizer
from sklearn.decomposition import TruncatedSVD
from sklearn.pipeline import make_pipeline

# from keras.preprocessing.text import Tokenizer
import pandas as pd


def preprocess(s, tokenize_words=False):
    s = s.lower()
    s = s.replace(' - ', ' ')
    s = ''.join(x for x in s if x not in ['(', ')', '[', ']', ',', '®', ':', '-', '+'])
    s = s.replace(' mm', 'mm')
    s = s.replace('/', ' ')
    s = s.replace('gold edition', 'gold_edition')
    s = s.replace('premium edition', 'premium_edition')
    s = s.replace('standard edition', 'standard_edition')
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
        if type == 'item':
            tmp.append(preprocess(x, tokenize_words=True))
    return tmp


def flatten_lists(l):
    return [item for sublist in l for item in sublist]

# pull data from mongo
client = MongoClient()
db = client.irwin  # changed from amazonproducts
products = db.products
data = products.find({'asin': {'$exists': True}, 'name': {'$exists': True}})

df = pd.DataFrame(list(data))
df['name_n'] = df['name'].apply(lambda x: normalize_in_list([x], type='item'))
df['boughtAfterView_n'] = df['boughtAfterView'].apply(lambda x: normalize_in_list(x, type='item'))
df['category_n'] = df['category'].apply(lambda x: normalize_in_list(x, type='cat'))

asin = {}
for i, row in df.iterrows():
    asin[str(row['_id'])] = row['name']
rev_asin = {}
for k, v in asin.items():
    rev_asin[v] = k




vectorizer = TfidfVectorizer(max_df=0.5, max_features=None, stop_words='english', use_idf=True)
X = vectorizer.fit_transform(df.to_embed2)


svd = TruncatedSVD(10)
normalizer = Normalizer(copy=False)
lsa = make_pipeline(svd, normalizer)
X2 = lsa.fit_transform(X)

km = KMeans(n_clusters=4, max_iter=10, n_init=1, verbose=2)
km.fit(X2)

df['predicted_cluster'] = km.predict(X2)


print



# ----------------

# model = Word2Vec(df['to_embed'])


# data = products.find({'asin': {'$exists': True}, 'name': {'$exists': True}})
# data = [("ITEM_" + product['asin'], product['name'], product['frequentlyBought'], product['boughtAfterView'], product['category'], product['alsoBought']) for product in data]

# # [0] is asin
# # [1] is name
# # [2] is frequentlyBought
# # [3] is boughtAfterView
# # [4] is category
# # [5] is alsoBought



# # asins = [d[0] for d in data]

# names_dict = {}
# for d in data:
#     if len(d[1]) > 90:
#         names_dict[d[1][:91]] = d[0]
#     else:
#         names_dict[d[1]] = d[0]

# fbasins = []
# fb_adj_matrix = {}
# sentences = []
# for d in data:
#     tmp = []
#     for fb in d[2]:
#         if len(fb) > 90:
#             if (fb[:91] in names_dict):
#                 tmp.append(names_dict[fb[:91]])
#         else:
#             if fb in names_dict:
#                 tmp.append(names_dict[fb])
#     if tmp:
#         sentences.append([d[0]] + tmp)
#         fb_adj_matrix[d[0]] = tmp
#         fbasins.append(d[0])

# N = len(fbasins)
# adjacency_matrix = np.zeros((N, N))
# for i, asin in enumerate(fbasins):
#     for item in fb_adj_matrix[asin]:
#         try:
#             adjacency_matrix[i][fbasins.index(item)]
#         except ValueError:
#             pass

# model = Word2Vec(sentences, min_count=1)
# model.save('dict_data/product_model')

# X = np.array([model[asin] for asin in fbasins])


# average = {}
# complete = {}
# ward = {}
# dicts = (average, complete, ward)
# for connectivity in (None, adjacency_matrix):
#     for index, linkage in enumerate(('average', 'complete', 'ward')):
#         cluster = AgglomerativeClustering(linkage=linkage,
#                                           connectivity=connectivity,
#                                           n_clusters=10001)
#         cluster.fit(X)
#         print("Linkage: " + linkage)
#         for i, label in enumerate(cluster.labels_):
#             if label in dicts[index]:
#                 dicts[index][label].append(fbasins[i])
#             else:
#                 dicts[index][label] = [fbasins[i]]
# #######
# # average, complete, ward contain dictionaries for the clusters
# for i, name in enumerate(('average', 'complete', 'ward')):
#     with open('dict_data/' + name + '.csv', 'w') as csv_file:
#         writer = csv.writer(csv_file)
#         for key, value in dicts[i]:
#             writer.writerow([key] + value)


"""
samples = []
for document in cursor:
    samples.append(document['asin'])

n_samples = samples.length()
n_features = 4 * samples.length()

data = []
for sample in samples:
    product = coll.find({'asin': sample})
    alsoViewed = product['alsoViewed']
    alsoBought = product['alsoBought']
    boughtAfterView = product['boughtAfterView']
    categories = product['category']

    features = samples + samples + samples + samples
    for i in range(samples):
        # also viewed field
        if (samples[i]['asin'] in alsoViewed):
            features[i] = 1
        else:
            features[i] = 0
        # also bought feature
        if (samples[i]['asin'] in alsoBought):
            features[i + n_samples] = 1
        else:
            features[i + n_samples] = 0
        # bought after viewing feature
        if (samples[i]['asin'] in boughtAfterView):
            features[i + 2 * n_samples] = 1
        else:
            features[i + 2 * n_samples] = 0
        # categories shared feature
        features[i + 3 * n_samples] = [x for x in categories if x in samples[i]["category"]]

    data.append(features)

X = np.array(data)
print(X)
"""