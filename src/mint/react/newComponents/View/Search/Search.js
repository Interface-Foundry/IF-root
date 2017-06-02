
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import Input from './Input';

export default class Search extends Component {

  state = {
    showHistory: false
  }

  toggleHistory = () => {
    this.setState({ showHistory: !this.state.showHistory });
  }

	render() {
		const { state: { showHistory }, props: { cart: { store = '' } }, toggleHistory } = this;
    return (
			<form className='search card'>
		   	<label>Add { store } Item to your Kip Cart</label>
	      <Input toggleHistory={toggleHistory} showHistory={showHistory} store={store} />
      </form>
    );
	}
}
