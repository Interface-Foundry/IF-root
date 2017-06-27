// mint/react/components/View/Results/Results.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

import Default from './Default';
import Selected from './Selected';
import LoadingTile from './LoadingTile';
import { numberOfItems, splitOptionsByType, getStoreName } from '../../../utils';
import { EmptyContainer } from '../../../containers';

const size = 3;

export default class Results extends Component {
  static propTypes = {
    selectedItemId: PropTypes.string,
    results: PropTypes.array,
    cart: PropTypes.object,
    query: PropTypes.string,
    user: PropTypes.object,
    getMoreSearchResults: PropTypes.func,
    page: PropTypes.number,
    loading: PropTypes.bool,
    lazyLoading: PropTypes.bool,
    lastUpdatedId: PropTypes.string,
    loaded: PropTypes.bool
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (nextProps.lastUpdatedId !== this.props.lastUpdatedId || nextProps.user.id !== this.props.user.id || numberOfItems(nextProps.results) !== numberOfItems(this.props.results) ||
      nextProps.selectedItemId !== this.props.selectedItemId || numberOfItems(nextProps.cart.items) !== numberOfItems(this.props.cart.items) || nextProps.results[0] && nextProps.results[0].id !== this.props.results[0].id || nextProps.lazyLoading !== this.props.lazyLoading || nextProps.loading !== this.props.loading);
  }

  componentWillReceiveProps = ({ results, replace, loaded }) => {
    if (results.length === 0 && loaded && this.props.loaded !== loaded) {
      replace(`${location.pathname}${location.search}&toast=No Results Found!&status=warn`)
    }
  }

  render() {
    // Needs refactor, too many loop-di-loops here.
    let arrow, selected;
    const { cart, query, page, results, selectedItemId, getMoreSearchResults, loading, lazyLoading } = this.props,
      lazyRes = loading ? (new Array(10)).fill().map((_, i) => ({ loading: true, id: null })) : lazyLoading ? [...results, ...(new Array(10)).fill().map((_, i) => ({ loading: true, id: null }))] : results,
      cartAsins = cart.items.map((item, i) => `${item.asin}-${item.added_by}`),
      partitionResults = lazyRes.reduce((acc, result, i) => {
        if (i % size === 0) acc.push([]);
        acc[acc.length - 1].push(result);

        if (result.id === selectedItemId || result.oldId === selectedItemId) {
          selected = {
            row: acc.length,
            result,
            index: i,
            options: splitOptionsByType(result.options)
          };
          arrow = acc[acc.length - 1].length - 1;
        }

        return acc;
      }, []);

    if (selected) partitionResults.splice(selected.row, 0, [{...selected.result, selected: true, index: selected.index, options: selected.options }]);

    if (!results.length && !loading) return <EmptyContainer />;

    return (
      <table className='results'>
        <tbody>
          <tr>
            <th colSpan='100%'>
              <nav>
                {
                  loading
                  ? 'Loading...'
                  : <p> About {results.length} results for <span className='price'>"{query}"</span> from {getStoreName(cart.store, cart.store_locale)} </p>
                }
              </nav>
            </th>
          </tr>
          {
            partitionResults.map((itemrow, i) => (
            <tr key={i} >
                {
                  itemrow.map((item, i) => {
                    return item.loading
                    ? <LoadingTile key={i}/>
                      : item.selected
                      ? (<Selected
                        key={item.id}
                        cartAsins={cartAsins}
                        arrow={arrow}
                        item={item}
                        numResults={results.length}
                        {...this.props}/>
                      ) : (
                        <Default
                          key={item.id}
                          item={item}
                          cartAsins={cartAsins}
                          {...this.props}/>
                      );
                  })
                }
              </tr>
          ))

          }
        </tbody>
        <div className='load'><span onClick={() => getMoreSearchResults(query, cart.store, cart.store_locale, page+1)}>Load more results</span></div>
      </table>
    );
  }
}
