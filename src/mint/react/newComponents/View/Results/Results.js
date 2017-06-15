// mint/react/components/View/Results/Results.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

import Default from './Default';
import Selected from './Selected';
import { EmptyContainer } from '../../../newContainers';

const size = 3;

export default class Results extends Component {
  static propTypes = {
    selectedItemId: PropTypes.string,
    results: PropTypes.array,
    cart: PropTypes.object,
    query: PropTypes.string,
    addItem: PropTypes.func,
    selectItem: PropTypes.func
  }

  shouldComponentUpdate(nextProps, nextState) {
    // need this, otherwise page always rerender every scroll
    if (
      nextProps.selectedItemId !== this.props.selectedItemId ||
      nextProps.results.length !== this.props.results.length ||
      nextProps.cart.items.length !== this.props.cart.items.length ||
      nextProps.results[0] && nextProps.results[0].id !== this.props.results[0].id
    ) return true;

    return false;
  }

  render() {
    // Add
    let arrow, selected;
    const { cart, query, results, addItem, selectedItemId, selectItem } = this.props,
      numResults = results.length,
      cartAsins = cart.items.map((item) => item.asin),
      partitionResults = results.reduce((acc, result, i) => {
        if (i % size === 0) acc.push([]);
        acc[acc.length - 1].push(result);

        if (result.id === selectedItemId) {
          selected = {
            row: acc.length,
            result
          };
          arrow = acc[acc.length - 1].length - 1;
        }

        return acc;
      }, []);

    if (selected)
      partitionResults.splice(selected.row, 0, [{...selected.result, selected: true }]);

    if(numResults === 0) 
      return <EmptyContainer />

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
                        item={item} 
                        cart={cart} 
                        arrow={arrow}
                        cartAsins={cartAsins}
                        addItem={addItem} 
                        selectedItemId={selectedItemId}
                        selectItem={selectItem}/>
                      ) : ( 
                        <Default 
                          key={item.id}
                          item={item} 
                          cart={cart} 
                          cartAsins={cartAsins}
                          addItem={addItem} 
                          selectedItemId={selectedItemId} 
                          selectItem={selectItem}/>
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
