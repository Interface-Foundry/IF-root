# test cases
from mcparser import McParser

multiple_query_search_with_modifiers = [
    'Find an office chair with the highest reviews and highest price',
    'Find an office chair with good reviews and below $100',
    'Find an office chair with extra back support, below $100 and at least 3 stars.',
]

multiple_query_search_with_different_types = [
    'Find a 42” monitor that’s below $1000',
    'Find 42 monitors that’s below $1000',
    'Find iOS 8 cable at least 1.5ft long for new lighting port',
]

complex_comparisons = [
    'Best chocolate',
    'Most inexpensive chocolate',
    'Cheaper than Hershey’s chocolate',
    'Most expensive and highest rated chocolate',
    'Better than Ghiradelli chocolate',
    'Belgian chocolate not Lindt',
    'Best reviews chocolate',
    'Chocolate with most reviews',
    'Best-rated chocolate',
    'Cheapest chocolate',
    'Best seller chocolate',
]

irregulars = [
    'White dress everything but bridal',
    'Little black dress in size 2',
]

shopping_cart = [
    'Let me checkout',
    'Id like to checkout',
    'Take me to checkout',
    'Checkout'
]


def test_shopping_cart():
    pass


def test_irregulars():
    for line in irregulars:
        assert 'irregular' == McParser(line)._type
    pass

def test_complex_comparisons():
    pass

def test_multiple_query()
    pass