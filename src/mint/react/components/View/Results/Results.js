// mint/react/components/View/Results/Results.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

import Default from './Default';
import Selected from './Selected';
import LoadingTile from './LoadingTile';
import { numberOfItems } from '../../../utils';
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
    loading: PropTypes.bool
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !!(nextProps.user.id !== this.props.user.id || numberOfItems(nextProps.results) !== numberOfItems(this.props.results) ||
      nextProps.selectedItemId !== this.props.selectedItemId || numberOfItems(nextProps.cart.items) !== numberOfItems(this.props.cart.items) || nextProps.results[0] && nextProps.results[0].id !== this.props.results[0].id);
  }

  render() {
    // Needs refactor, too many loop-di-loops here.
    let arrow, selected;
    const { cart, query, page, results, selectedItemId, getMoreSearchResults, loading } = this.props,
      numResults = results.length,
      cartAsins = cart.items.map((item, i) => `${item.asin}-${item.added_by}`),
      partitionResults = results.reduce((acc, result, i) => {
        if (i % size === 0) acc.push([]);
        acc[acc.length - 1].push(result);

        if (result.id === selectedItemId || result.oldId === selectedItemId) {
          selected = {
            row: acc.length,
            result,
            index: i
          };
          arrow = acc[acc.length - 1].length - 1;
        }

        return acc;
      }, []);

    if (selected) partitionResults.splice(selected.row, 0, [{ ...selected.result, selected: true, index: selected.index }]);

    if (numResults === 0 && !loading) return <EmptyContainer />;

    const loadingArr = [
      ...partitionResults,
      ...(new Array(10))
        .fill()
        .map((_, i) => <LoadingTile key={i}/>)
        .reduce((a, c, i) => Object.assign([], a, {
          [Math.floor(i / size)]: a[Math.floor(i / size)] ? [...a[Math.floor(i / size)], c] : [c]
        }), [])
        .map((a, i) => <tr key={i}>{a}</tr>)
    ];

    return (
      <table className='results'>
        <tbody>
          <tr>
            <th colSpan='100%'>
              <nav>
                {
                  loading 
                  ? ''
                  : <p> About {numResults} results for <span className='price'>"{query}"</span> from {cart.store} {cart.store_locale} </p>
                }
              </nav>
            </th>
          </tr>
          { 
            loading 
            ? loadingArr
            : partitionResults.map((itemrow, i) => (
              <tr key={i} >
                {
                  itemrow.map((item, i) => {
                    return item.selected ? (
                      <Selected 
                        key={item.id}
                        cartAsins={cartAsins}
                        arrow={arrow}
                        item={item}
                        numResults={numResults}
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
        <div className='load'><span onClick={() => getMoreSearchResults(query, cart.store, cart.store_locale, page)}>Load more results</span></div>
      </table>
    );
  }
}
