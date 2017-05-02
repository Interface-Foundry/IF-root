/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

import { Icon } from '../../themes';
import Bubble from './Bubble';

export default class Hero extends Component {
	constructor(props) {
		super(props);
		this._animation = ::this._animation;
		this.state = {
		  selectedIndex: 0
		};
	}

	componentWillUnmount() {
		// const { _animation } = this;
		// _animation(true);
	}

	componentDidMount() {
		// const { _animation } = this;
		// _animation();
	}


	componentWillMount() {
		const { items } = this.props;

		// Preload hero image (not sure if this will even help if the image is too large)
		let hero = new Image();
    	hero.src = 'https://s3.amazonaws.com/datadummy/header.png';	

		// preload all images to cache on mount
		_.map(items, (i) => {
			let image = new Image();
	    	image.src = i.imgSrc;	
		})


	}

	_animation(stop) {
		if (stop) {
			if (self) clearTimeout(self.timeout);
			clearTimeout(this.timeout);
		} else {
			let self = this,
				possibleIndexs = _.filter([0,1,2,3], (i) => i !== self.state.selectedIndex);

			self.timeout = setTimeout(() => {
				self.setState({
					selectedIndex: possibleIndexs[Math.floor(Math.random() * possibleIndexs.length)],
				});
				self._animation();
				self.props.shuffleItems()
			}, 6000);
		}
	}
  	render() {
  		const { state: { selectedIndex }, props: { items } } = this;
	    return (
	      	<div className="hero image" style={
                {
                  backgroundImage: `url(https://s3.amazonaws.com/datadummy/header.png)`
                }}>

                <div className="col-12 row-1 hero__text">
                	<h1>Kip - Smart assistant for your office.</h1>
                	<p>When you’re busy building ideas, it’s easy to forget how much things cost. Kip saves you money and sets budgets for lunch and office essentials. Grow your team and keep costs lean.</p>
                </div>

                <div className="col-12 row-1 action">
	        		<button>
	        			EXPLORE KIP
	        			&nbsp;<Icon icon='Right'/>
	        		</button>
	        	</div>

				<svg className="sine" width="100%" height="50px" viewBox="0 0 100 31" preserveAspectRatio="none">
					<g>
						<path d="M0,26.5c9.7,3.8,20.3,4.2,30.3,0.9c1.9-0.6,3.8-1.4,5.7-2.2c10.6-4.5,20.7-10.2,31.1-15.1s21.4-9,32.9-10
							v31.7H0V26.5z"/>
					</g>
				</svg>

	      	</div>
	    );
  	}
}



		        // <div className="row-1 dots">

		        // 	{
		        // 		_.map([0,1,2,3], (i) => {
		        // 			const selected = i === selectedIndex;
		        // 			return (
					     //    	<div key={i} className={`dot ${selected ? 'selected' : ''}`}>
					     //    		<CSSTransitionGroup
								  //       transitionName="dot__bubble"
								  //       transitionEnterTimeout={0}
								  //       transitionLeaveTimeout={0}>
								  //       {
							   //      		selected ? <Bubble {...items[0]}/> : null
						    //     		}
							   //      </CSSTransitionGroup>
					     //    	</div>
				      //   	)
		        // 		})
		        // 	}
		        // </div>







