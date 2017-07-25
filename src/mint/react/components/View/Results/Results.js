// mint/react/components/View/Results/Results.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

import Default from './Default';
import Trending from './Trending';
import Selected from './Selected';
import LoadingTile from './LoadingTile';
import { numberOfItems, splitOptionsByType, getStoreName } from '../../../utils';
import { EmptyContainer } from '../../../containers';

import trendingData from './trending_data';

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
    fetchSearchItem: PropTypes.func
  }

  state = {
    myItems: []
  }

  shouldComponentUpdate = ({ lastUpdatedId, selectedItemId, loading, lazyLoading, query, user: { id }, results, cart: { items = [] } }) => lastUpdatedId !== this.props.lastUpdatedId
    || id !== this.props.user.id
    || numberOfItems(results) !== numberOfItems(this.props.results)
    || numberOfItems(items) !== numberOfItems(this.props.cart.items)
    || selectedItemId !== this.props.selectedItemId
    || loading !== this.props.loading
    || lazyLoading !== this.props.lazyLoading
    || (results.length && this.props.results.length) && results[0].options && results[0].options.length > 0 && !this.props.results[0].options
    || query !== this.props.query

  componentWillReceiveProps = ({ results, replace, loading, cart: { items }, user: { id } }) => {
    if (results.length === 0 && !loading && this.props.loading !== loading) replace(`${location.pathname}${location.search}&toast=Please Paste an Item URL 😊&status=warn`);

    if ((items && numberOfItems(items) !== numberOfItems(this.props.cart.items)) || (items && !this.state.myItems.length)) {
      // do only when the number of items in the cart changes, instead of on rerender
      const myItems = items.reduce((acc, i) => i.added_by === id ? [...acc, i.id] : acc, []);
      this.setState({ myItems });
    }
  }

  componentWillMount() {
    const { cart: { items = [] }, user: { id } } = this.props;
    if(items && numberOfItems(items) > 0) {
      const myItems = items.reduce((acc, i) => i.added_by === id ? [...acc, i.id] : acc, []);
      this.setState({ myItems });
    }
  }

  render() {
    // Needs refactor, too many loop-di-loops here.
    let arrow, selected;
    const {
      props: { cart, query, page, results, selectedItemId, getMoreSearchResults, loading, lazyLoading, fetchSearchItem },
      state: { myItems }
    } = this;

    //for showing/hiding trending items for this store
    let trendingMode = false  

    const isUrl = query.match(/(\b(https?):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/ig);
    // (for cheaters: https://stackoverflow.com/a/8943487)

    //show trending items for these stores only
    if(!results.length && (cart.store == 'Lotte' || cart.store == 'Punyus' || cart.store == 'Muji')){
      trendingMode = true
    }
    else if (!results.length && !(loading || lazyLoading)){
      return <EmptyContainer />; // don't bother with the loops if there aren't results
    } 

    let displayedResults = [];  

    //trending mode true, show trending
    if(trendingMode){
      const trending = trendingData.getTrending(cart.store);
      displayedResults = trending || [];      
    }
    //not showing trending items, do normal operation
    else {
      displayedResults = (loading || lazyLoading) // best: O(1)(just copying) worst: O(2n)(filling and then mapping)
        ? isUrl
        ? [{ loading: true }]
        : [...results, ...(new Array(10)).fill({ loading: true })]
        : results;      
    }
    
    // best: O(n), worst O(n*m) where m is myItems.length
    const partitionResults = displayedResults.reduce((acc, result, i) => {
      if (i % size === 0) acc.push([]);

      acc[acc.length - 1].push({
        ...result,
        inCart: (result.id && myItems.includes(result.id))
      });

      if (result.id && (result.id === selectedItemId || result.oldId === selectedItemId)) {
        selected = {
          row: acc.length,
          result: {...result, inCart: (result.id && myItems.includes(result.id))},
          index: i,
          options: splitOptionsByType(result.options)
        };
        arrow = acc[acc.length - 1].length - 1;
      }

      return acc;
    }, []);

    if (selected) partitionResults.splice(selected.row, 0, [{ ...selected.result, selected: true, index: selected.index, options: selected.options }]);
    if (results.length === 1 && !results[0].options) fetchSearchItem(results[0].id); // get options if its a url
    return (
      <table className='results'>
        <tbody>
          <tr>
            <th colSpan='100%'>
              <nav>
                {
                  loading
                  ? 'Loading...'
                  : trendingMode
                    ? <p><b> Trending {getStoreName(cart.store, cart.store_locale)} Items</b></p>
                    : <p><b> Showing {results.length} results from {getStoreName(cart.store, cart.store_locale)} </b></p>
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
                    : item.trending
                      ? <Trending
                        key={i}
                        item={item}
                        inCart={item.inCart}
                        loading={loading}
                        {...this.props}
                      /> 
                      : <Default
                          key={i}
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
        {
          (results.length > 1 && query.length)
          ? (<tfoot>
              <tr>
                <td className='load' colSpan="100%"><span onClick={() => getMoreSearchResults(query, cart.store, cart.store_locale, page+1)}>Load more results</span></td>
              </tr>
            </tfoot>)
          : null
        }
      </table>
    );
  }
}
