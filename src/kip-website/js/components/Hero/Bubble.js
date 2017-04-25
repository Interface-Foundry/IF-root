/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

export default class Bubble extends Component {
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
			}, 5000);
		}
	}

  	render() {
  		const { state: { typing }, props: { name, price, imgSrc } } = this;
	    return (
	      	<div className={`dot__bubble text`}>
                {
    				typing ? <div>
	    				<span className='typing__dot'>.</span>
	    				<span className='typing__dot'>.</span>
	    				<span className='typing__dot'>.</span>
	    			</div> : <div className='item'>
	    				<div className='row-1 image' style={
			                {
			                  backgroundImage: `url(${imgSrc})`
			                }}/>
	    				<div className="row-1 details">
			              	<p className="col-12 row-2">
			              		{name}
			              	</p><p className="col-12 row-2 price">
			              		Price: <span>${price}</span>
			              	</p>
		              	</div>
		            </div> 
    			}
    		</div> 
	    );
  	}
}