// mint/react/components/View/View.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { displayCost } from '../../../utils';
import { Right } from '../../../../react-common/kipsvg';

//Analytics!
import ReactGA from 'react-ga';

const size = 3;

export default class Results extends Component {

  shouldComponentUpdate(nextProps, nextState) {
    // need this, otherwise page always rerender every scroll
    if(
      nextProps.results.length !== this.props.results.length ||
      nextProps.cart.items.length !== this.props.cart.items.length ||
      nextProps.results[0] && nextProps.results[0].asin !== this.props.results[0].asin
    ) return true

    return false
  }


  render() {
    const { cart, query, results, addItem } = this.props,
          numResults = results.length,
          cartAsins = cart.items.map((item) => item.asin),
          showcase = results.splice(0, 1)[0],
          partitionResults = results.map( (e,i) => (i % size === 0) ? results.slice(i, i + size) : null ).filter( (e) => e );


    return (
      <table className='results'>
        <tbody>
          <tr>
            <th colSpan='100%'>
              <nav>
                <button>Back</button>
                <p> Showing {numResults} results for: <span className='price'>"{query}"</span>  </p>
              </nav>
            </th>
          </tr>
          <tr>
            {
              showcase ? <td colSpan='100%'>
                <div className='card'>
                  <div className={`image`} style={{
                    backgroundImage: `url(${showcase.main_image_url})`,
                  }}/>
                  <div className='text'> 
                    <h1>{showcase.name}</h1>
                    <p> Store: {showcase.store} | {cart.store_locale} </p>
                    <h4> Price: <span className='price'>{displayCost(showcase.price)}</span> </h4>
                  </div> 
                  <div className='action'>
                    <button onClick={() => addItem(cart.id, showcase.id)}><span>Add to Cart <Right/></span></button>
                  </div>
                </div>
              </td> : null
            }
          </tr>
          {
            partitionResults.map((itemrow, i) => (
              <tr key={i}>
                {
                  itemrow.map((item) => (
                    <td key={item.id}>
                      <div className={`card ${cartAsins.includes(item.asin) ? 'incart' : ''}`}>
                        <div className={`image`} style={{
                          backgroundImage: `url(${item.main_image_url})`,
                        }}/>
                        <div className='text'> 
                          <h1>{item.name}</h1>
                          <p> Store: {item.store} | {cart.store_locale} </p>
                          <h4> Price: <span className='price'>{displayCost(item.price)}</span> </h4>
                        </div> 
                        <div className='action'>
                          <button onClick={() => addItem(cart.id, item.id)}><span>Add to Cart <Right/></span></button>
                        </div>
                      </div>
                    </td>
                  ))
                }
              </tr>
            ))
          }
        </tbody>
      </table>
    );
  }
}
