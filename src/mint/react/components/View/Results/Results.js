// mint/react/components/View/Results/Results.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

import Default from './Default';
import Selected from './Selected';
import { numberOfItems, splitAndMergeSearchWithCart } from '../../../utils';
import { EmptyContainer } from '../../../containers';

const size = 3;

export default class Results extends Component {
  static propTypes = {
    selectedItemId: PropTypes.string,
    results: PropTypes.array,
    cart: PropTypes.object,
    query: PropTypes.string
  }

  shouldComponentUpdate(nextProps, nextState) {
    // need this, otherwise page always rerender every scroll
    if (
      nextProps.user.id !== this.props.user.id ||
      numberOfItems(nextProps.results) !== numberOfItems(this.props.results) ||
      nextProps.selectedItemId !== this.props.selectedItemId ||
      numberOfItems(nextProps.cart.items) !== numberOfItems(this.props.cart.items) ||
      nextProps.results[0] && nextProps.results[0].id !== this.props.results[0].id
    ) return true;

    return false;
  }

  render() {
    // Need to think about left and right arrow keys incrementing value.
    // Needs refactor, too many loops here.
    let arrow, selected;
    const { cart, query, results, selectedItemId } = this.props,
      numResults = results.length,
      cartAsins = cart.items.map((item, i) => `${item.asin}-${item.added_by}`),
      mergedResults = splitAndMergeSearchWithCart(cart.items, results, selectedItemId),
      partitionResults = mergedResults.reduce((acc, result, i) => {
        if (i % size === 0) acc.push([]);
        acc[acc.length - 1].push(result);

        if (result.id === selectedItemId) {
          selected = {
            row: acc.length,
            result,
            index: i
          };
          arrow = acc[acc.length - 1].length - 1;
        }

        return acc;
      }, []);

    if (selected)
      partitionResults.splice(selected.row, 0, [{ ...selected.result, selected: true, index: selected.index }]);

    if (numResults === 0)
      return <EmptyContainer />;

    return (
      <table className='results'>
        <tbody>
          <tr>
            <th colSpan='100%'>
              <nav>
                <p> About {numResults} results for <span className='price'>"{query}"</span> from {cart.store} {cart.store_locale} </p>
              </nav>
            </th>
          </tr>
          {
            partitionResults.map((itemrow, i) => (
              <tr key={i} >
                {
                  itemrow.map(item => {
                    return item.selected ? (
                      <Selected 
                        key={item.id}
                        cartAsins={cartAsins}
                        arrow={arrow}
                        item={item}
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
      </table>
    );
  }
}
