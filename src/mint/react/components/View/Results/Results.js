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
    lastUpdatedId: PropTypes.string
  }

  state = {
    myItems: []
  }

  shouldComponentUpdate = (nextProps, nextState) =>
    nextProps.lastUpdatedId !== this.props.lastUpdatedId
    || nextProps.user.id !== this.props.user.id
    || numberOfItems(nextProps.results) !== numberOfItems(this.props.results)
    || numberOfItems(nextProps.cart.items) !== numberOfItems(this.props.cart.items)
    || nextProps.selectedItemId !== this.props.selectedItemId
    || nextProps.results[0] && (nextProps.results[0].id !== this.props.results[0].id)

  componentWillReceiveProps = ({ results, replace, loading, cart: { items }, user: { id } }) => {
    if (results.length === 0 && !loading && this.props.loading !== loading) {
      console.log({ msg: 'REDIRECTING!!!!', results, loading })
      // replace(`${location.pathname}${location.search}&toast=No Results Found!&status=warn`)
    }

    if ((items && numberOfItems(items) !== numberOfItems(this.props.cart.items)) || (items && !this.state.myItems.length)) {
      // do only when the number of items in the cart changes, instead of on rerender
      const myItems = items.reduce((acc, i) => i.added_by === id ? [...acc, i.asin] : acc, []);
      this.setState({ myItems })
    }
  }

  render() {
    // Needs refactor, too many loop-di-loops here.
    let arrow, selected;
    const {
      props: { cart, query, page, results, selectedItemId, getMoreSearchResults, loading, lazyLoading },
      state: { myItems }
    } = this;

    if (!results.length && !loading) return <EmptyContainer />; // don't bother with the loops if there aren't results

    const displayedResults = (loading || lazyLoading) // best: O(1)(just copying) worst: O(2n)(filling and then mapping)
      ? [...results, ...(new Array(10)).fill({ loading: true })]
      : results;

    // best: O(n), worst O(n*m) where m is myItems.length
    const partitionResults = displayedResults.reduce((acc, result, i) => {
      if (i % size === 0) acc.push([]);

      acc[acc.length - 1].push({
        ...result,
        inCart: (result.asin && myItems.includes(result.asin))
      });

      if (result.id && (result.id === selectedItemId || result.oldId === selectedItemId)) {
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

    if (selected) partitionResults.splice(selected.row, 0, [{ ...selected.result, selected: true, index: selected.index, options: selected.options }]);

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
                  itemrow.map((item, i) => 
                    item.loading
                      ? <LoadingTile key={i}/>
                      : item.selected
                        ? <Selected
                          key={item.id}
                          inCart={item.inCart}
                          arrow={arrow}
                          item={item}
                          numResults={results.length}
                          {...this.props}
                        /> 
                        : <Default
                            key={item.id}
                            item={item}
                            inCart={item.inCart}
                            {...this.props}
                          />
                  )
                }
              </tr>
          ))

          }
        </tbody>
        <td className='load'><span onClick={() => getMoreSearchResults(query, cart.store, cart.store_locale, page+1)}>Load more results</span></td>
      </table>
    );
  }
}
