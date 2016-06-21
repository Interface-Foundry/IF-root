# test cases
# started on basic tests, trying to use tests based on prod db msgs
multiple_query_search_with_modifiers = [
    u'Find an office chair with the highest reviews and highest price',
    u'Find an office chair with good reviews and below $100',
    u'Find an office chair with extra back support, below $100 and at ' +
    'least 3 stars.',
]

# (quantity vs version vs descriptor)
multiple_query_search_with_different_types = [
    u'Find a 42" monitor thats below $1000',
    u'Find 42 monitors thats below $1000',
    u'Find iOS 8 cable at least 1.5ft long for new lighting port',
]

# (superlatives, comparatives)
complex_comparisons = [
    u'Best chocolate',
    u'Most inexpensive chocolate',
    u'Cheaper than Hersheys chocolate',
    u'Most expensive and highest rated chocolate',
    u'Better than Ghiradelli chocolate',
    u'Belgian chocolate not Lindt',
    u'Best reviews chocolate',
    u'Chocolate with most reviews',
    u'Best-rated chocolate',
    u'Cheapest chocolate',
    u'Best seller chocolate',
]

# (irregular adjectives, comparatives)
irregulars = [
    u'White dress everything but bridal',
    u'Little black dress in size 2',
]

shopping_cart = [
    u'Let me checkout',
    u'Id like to checkout',
    u'Take me to checkout',
    u'Checkout',
    u'Take me to checkout please',
]