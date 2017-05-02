/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';
import Typist from 'react-typist';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

import { Icon } from '../../themes';
import { Services } from '..';

export default class Statement extends Component {

	constructor(props) {
		super(props);
		this._animation = ::this._animation;
		this.state = {
		  typing: true
		};
	}

	componentWillUnmount() {
		const { _animation } = this;
		_animation(true);
	}

	componentDidMount() {
		const { _animation } = this;
		_animation();
	}

	componentWillReceiveProps(nextProps) {
		const { _animation, props: { items } } = this;


		if( items[0].id !== nextProps.items[0].id) {
			_animation(true);
			this.setState({
				typing: true
			});
			_animation();
		}
	}

	_animation(stop) {
		if (stop) {
			if (self) clearTimeout(self.timeout);
			clearTimeout(this.timeout);
		} else {
			let self = this;
			self.timeout = setTimeout(() => {
				self.setState({
					typing: false
				});
			}, 3500);
		}
	}

  	render() {
  		const { state: { typing }, props: { items, quantity } } = this;
  		
	    return (
	      	<div className="statement"> 
		        <div className="col-12 row-1 card">
		        	<div className='row-1 cart'>
		        		<Icon icon="Cart"/>
	        			<p className="cart__length">
        					KIP
	        			</p>
		        	</div>
		        	<div className="col-12 row-1 headline">
		        		<h1>Manage your teams spending</h1>
		        	</div>
		        	<div className="col-12 row-1 text">
		        		<p>
							Whether your a small startup, or an established buisiness, when your busy making a difference, it’s easy to forget how much things cost.
							Kip keeps your spending lean by streamlining the budgeting process, increasing the transparency of individual spending, and allowing your team to stay connected accross a multiple platforms.
		        		</p>
		        	</div>
		        	<div className="col-12 row-1 action">
		        		<button>
		        			Explore how Kip can help you
		        			&nbsp;<Icon icon='Right'/>
		        		</button>
		        	</div>
		        </div>
	      	</div>
	    );
  	}
}













