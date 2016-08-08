import numpy as np
from sklearn.cluster import AgglomerativeClustering
from pymongo import MongoClient
from gensim.models import Word2Vec

# pull data from mongo

client = MongoClient()
db = client.amazonData
products = db.products

data = products.find({'asin': {'$exists': True}, 'name': {'$exists': True}})

data = [("ITEM_" + product['asin'], product['name'], product['frequentlyBought'], product['boughtAfterView'], product['category'], product['alsoBought']) for product in data]
# [0] is asin
# [1] is name
# [2] is frequentlyBought
# [3] is boughtAfterView
# [4] is category
# [5] is alsoBought

asins = [d[0] for d in data]

names_dict = {}
for d in data:
    if len(d[1]) > 90:
        names_dict[d[1][:91]] = d[0]
    else:
        names_dict[d[1]] = d[0]

fbasins = []
fb_adj_matrix = {}
sentences = []
for d in data:
    tmp = []
    for fb in d[2]:
        if len(fb) > 90:
            if (fb[:91] in names_dict):
                tmp.append(names_dict[fb[:91]])
        else:
            if fb in names_dict:
                tmp.append(names_dict[fb])
    if tmp:
        sentences.append([d[0]] + tmp)
        fb_adj_matrix[d[0]] = tmp
        fbasins.append(d[0])

N = len(fbasins)
adjacency_matrix = np.zeros((N, N))
for i, asin in enumerate(fbasins):
    for item in fb_adj_matrix[asin]:
        try:
            adjacency_matrix[i][fbasins.index(item)]
        except ValueError:
            pass

model = Word2Vec(sentences, min_count=1)
model.save('dict_data/product_model')

X = np.array([model[asin] for asin in fbasins])


average = {}
complete = {}
ward = {}
dicts = (average, complete, ward)
for connectivity in (None, adjacency_matrix):
    for index, linkage in enumerate(('average', 'complete', 'ward')):
        cluster = AgglomerativeClustering(linkage=linkage,
                                          connectivity=connectivity,
                                          n_clusters=10001)
        cluster.fit(X)
        print("Linkage: " + linkage)
        for i, label in enumerate(cluster.labels_):
            if label in dicts[index]:
                dicts[index][label].append(fbasins[i])
            else:
                dicts[index][label] = [fbasins[i]]
#######
# average, complete, ward contain dictionaries for the clusters
for i, name in enumerate(('average', 'complete', 'ward')):
    with open('dict_data/' + name + '.csv', 'w') as csv_file:
        writer = csv.writer(csv_file)
        for key, value in dicts[i]:
            writer.writerow([key] + value)


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