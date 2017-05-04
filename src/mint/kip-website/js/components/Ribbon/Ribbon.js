/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';

import { Icon } from '../../themes';

export default class Ribbon extends Component {
  render() {
    const { fixed, _toggleSidenav } = this.props;
    
    return (
      <nav className={`ribbon ${fixed ? 'background' : ''}`}>
        <div className='col-12 row-1'> 
          <div className="row row-1">
            <div className="row-1">
              <div className='image' style={
                {
                  backgroundImage: `url(https://storage.googleapis.com/kip-random/head%40x2.png)`
                }}/>
              <h1>KIP</h1>
            </div>
          </div>
          <div className="right row row-1">
            <div className="right row row-1" onClick={() => _toggleSidenav()}>
              <Icon icon='Menu' />
            </div>
          </div>
          <div className="right desktop row row-1">

          </div>
        </div>
      </nav>
    );
  }
}

