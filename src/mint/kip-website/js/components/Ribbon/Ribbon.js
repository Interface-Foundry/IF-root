/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';

import { Icon } from '../../themes';

export default class Ribbon extends Component {
  render() {
    const { fixed, _toggleSidenav, _toggleModal, currentUser } = this.props;
    
    return (
      <nav className={`ribbon ${fixed ? 'background' : ''}`}>
        <div className='row-1'> 
          <div className="row row-1">
            <a href="/">
              <div className="row-1">
                <div className='image' style={
                  {
                    backgroundImage: `url(https://storage.googleapis.com/kip-random/head%40x2.png)`
                  }}/>
                <h1>Kip</h1>
              </div>
            </a>
          </div>

          {
            currentUser && currentUser.email_address ? <div className="right row row-1">
              <div className="right row row-1" onClick={() => _toggleSidenav()}>
                <Icon icon='Menu' />
              </div>
            </div> : null     
          }

          {
            currentUser && currentUser.email_address ? <div className="right row row-1 action2">
                <a href='/newcart'><button>
                  + New Cart
                </button></a>
            </div> : null  
          }

          {
            currentUser ? null : <div className="right row row-1 action2">
                <a href='/newcart'><button>
                  Try Kip For Free
                </button></a>
            </div> 
          }

          {
            currentUser ? null : <div className="right row row-1">
              <div className="col-12 row-1 action">
                <button onClick={() => _toggleModal()}>Log in</button>
              </div>
            </div>
          }

        </div>
      </nav>
    );
  }
}

