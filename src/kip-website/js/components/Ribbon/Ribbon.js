/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';

import { Icon } from '../../themes';

export default class Ribbon extends Component {
  render() {
    return (
      <nav className="ribbon">
        <div className='col-12 row-1'> 
          <div className="row row-1">
            <div className="row-1">
              <div className='image' style={
                {
                  backgroundImage: `url(http://tidepools.co/kip/head@x2.png)`
                }}/>
              <h1>Kip</h1>
            </div>
          </div>
          <div className="right row row-1">
            <div className="right row row-1">
              <a href="">
                Blog
              </a>
            </div>
            <div className="right row row-1">
              <a href="">
                Help
              </a>
            </div>
            <div className="right row row-1">
              <a href="">
                Partners
              </a>
            </div>
          </div>
        </div>
      </nav>
    );
  }
}

