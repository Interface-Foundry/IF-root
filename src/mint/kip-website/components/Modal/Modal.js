/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';

import { Icon } from '../../themes';

export default class Modal extends Component {

	constructor(props) {
		super(props);
		this._onSubmit = ::this._onSubmit;
		this.state = {
			error: false,
			success: false
		}
	}

	_validateEmail(email) {
		const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	    return re.test(email);
	}

	_onSubmit(e) {
		e.preventDefault()
		const { input, _validateEmail, props: { get } } = this;

		if(_validateEmail(input.value)) {
			this.setState({error: null, success: 'We just sent you a login link to ' + input.value})
			get(`/api/login?email=${input.value}&redirect=/`, 'LOGIN')
		} else {
			this.setState({error: 'Invalid email address!'})
		}
	}

  	render() {
  		const { props: { _toggleModal }, state: { error, success }, _onSubmit } = this;

	    return (
	      	<section className="modal" onClick={(e) => {if(e.target.className === "modal") _toggleModal()}}> 
	      		<form className="modal__card" onSubmit={_onSubmit}>
	      			<div className="modal__card-icon" onClick={() =>  _toggleModal()}>
		      			<Icon icon='Clear'/>
	      			</div>
		      		<h1>Enter Email to Log In</h1>
		      		{error ? <span style={{color: '#ff6961'}}>{error}</span> : null}
		      		{!success ? <input ref={(input) => this.input = input} type="email" placeholder="Enter your email"/> : <span style={{color: '#00cb7b', borderBottom: '1px dashed'}}>{success}</span> }
		      		<button disabled={success} type="submit" value="Submit"><Icon icon='Login'/>Send Login Email</button>
		      		<div className="modal__description">
		      			<p>We will send you a link to automagically log you in</p>
		      			<p>No Signup needed!</p>
		      		</div>
	      		</form>
	      	</section>
	    );
  	}
}