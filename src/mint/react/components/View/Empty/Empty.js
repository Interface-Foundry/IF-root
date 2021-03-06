// mint/react/components/View/Empty/Empty.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

import EmptySearch from './EmptySearch';
import EmptyCart from './EmptyCart';

export default class empty extends Component {

  static propTypes = {
    tab: PropTypes.string
  }

  render() {
    const { tab } = this.props;

    switch (tab) {
    case 'search':
      return <EmptySearch {...this.props}/>;
    case 'cart':
      return <EmptyCart {...this.props}/>;
    }
  }
}
