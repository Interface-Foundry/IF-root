import json
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import CountVectorizer

# categories
# a description is either 'useful' or 'not_useful'
categories = ['useful','not_useful']

# csv file will be read in
# there is a json to csv converter script in this directory
file_name = 'main_food_descriptions.csv'

# read the csv into a pandas dataframe
df = pd.read_csv(file_name)

#convert to a numpy array
data = df.values

#create the words from the text
count_vect = CountVectorizer()
X_train_counts = count_vect.fit_transform(data[1].tolist())

