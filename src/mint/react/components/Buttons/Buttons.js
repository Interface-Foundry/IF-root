// react/components/Buttons/Buttons.js

import React, { Component } from 'react';
import { Route } from 'react-router';

import Default from './Default';

export default class Buttons extends Component {

  render() {
    return (
      <nav className='buttons'>
        <Route path={'/cart/:cart_id'} exact component={() => 
              <Default {...this.props}/>
            }
        />
      </nav>
    );
  }
}
