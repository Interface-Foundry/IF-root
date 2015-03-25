from scikits.crab.models import MatrixPreferenceDataModel
from scikits.crab.metrics import pearson_correlation
from scikits.crab.similarities import UserSimilarity
from pymongo import MongoClient
import os

# get data from the database
client = MongoClient('mongodb://localhost:27017/')
db = client['if']
# TODO generate a table of user bubble ratings
# can be based on number of visits or something
data = db['collaborativeFilterData'].find()

model = MatrixPreferenceDataModel(data)

# backup the old model and save the new one
os.rename("/data/models/collaborativeFilter", "/data/models/collaborativeFilter_bk")
model.save("/data/models/collaborativeFilter")
