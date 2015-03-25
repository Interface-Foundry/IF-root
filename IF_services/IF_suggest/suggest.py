from scikits.crab.models import MatrixPreferenceDataModel
from scikits.crab.metrics import pearson_correlation
from scikits.crab.similarities import UserSimilarity
import os


"""getSuggestion
Returns a scored list of suggestions for the user's search
"""
def getSuggestion(userID, searchTerm):
	# using the collaborative filter for now,
	# but eventually we'll incorporate more filters
	return collaborativeFilter(userId, searchTerm)

"""collaborativeFilter
Returns a list of recommendations based on community preference
where community preference is how often users visit this place
"""
def collaborativeFilter(userId, searchTerm):
	data = os.read("/data/models/collaborativeFilter")
	model = MatrixPreferenceDataModel(data)
	similarity = UserSimilarity(model, pearson_correlation)
	recommender = UserBasedRecommender(model, similarity, with_preference=True)
	return recommender.recommend(50)
