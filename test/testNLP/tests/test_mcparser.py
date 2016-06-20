from ..mcparser import McParser
import pytest

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


def test_parse():
    pass


def test_shopping_cart():
    pass


def test_irregulars():
    for line in irregulars:
        parsed = McParser(line)
        assert parsed.root
        # assert 'irregular' == McParser(line)


def test_complex_comparisons():
    pass


def test_multiple_query():
    pass

if __name__ == '__main__':
    pytest.main([__file__])
