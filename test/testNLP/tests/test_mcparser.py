from ..mcparser import McParser

from test_queries import (
    multiple_query_search_with_modifiers,
    multiple_query_search_with_different_types,
    complex_comparisons,
    irregulars,
    shopping_cart,)


lists = [
    multiple_query_search_with_modifiers,
    multiple_query_search_with_different_types,
    complex_comparisons,
    irregulars,
    shopping_cart]


def test_parse(self):
    pass


def test_shopping_cart():
    pass


def test_irregulars():
    for line in irregulars:
        McParser(line)
        # assert 'irregular' == McParser(line)



def test_complex_comparisons():
    pass


def test_multiple_query():
    pass


def func(x):
    return x + 1


def test_answer():
    assert func(3) == 4


# if __name__ == '__main__':
#     pytest.main([__file__])
