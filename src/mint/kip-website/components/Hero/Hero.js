/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

import { Icon } from '../../themes';
import { Down, Right } from '../../themes/newSvg';

export default class Hero extends Component {

	componentWillMount() {
		// Preload gif
		let img = new Image()
		img.src = 'https://storage.googleapis.com/kip-random/website/kip_collect.gif'
	}

	shouldComponentUpdate(nextProps, nextState) {
   		 // need this, otherwise page always rerender every scroll
	   	if(nextProps.animate !== this.props.animate) return true

    	return false
  	}

  	render() {
  		const { animate, src } = this.props;
  		
	    return (
	      	<div className={`hero image ${animate ? 'start' : ''}`} style={{height: window.innerHeight}}>
	      		<div className='hero__main'>
		        	<div className="col-6 headline">
		        		<h1>
		        			The Simplest Way to Shop with your Friends
		        		</h1>
		        		<p>
		        			Whether your in Canada, the U.K, or Singapore, <span>KIP</span> makes sure you never miss out on your friends shopping sprees or the best deals. 
		        		</p>
		        		{
			      			src !== 'slack' ? <div className="col-12 action">
				      			<a href='/newcart'>
				        			<button>
					        			<span>Create Kip Cart <Right/></span>
					        		</button>
			        			</a>
				        	</div> : <div className="col-12 action">
			                  	<a href="https://slack.com/oauth/authorize?scope=commands+bot+users%3Aread&client_id=2804113073.14708197459" target="_blank"><button>
			                    	Add To Slack
			                  	</button></a>
			              	</div>
				      	}
				      	<p className='subtext'>
				      		<span>Easy Setup</span>
				      		<span>Free</span>
				      		<span>Cancel Anytime</span>
				      	</p>
		        	</div>
		        	<div className="col-6 animation">
		        		<div className='image'/>
		        	</div>
	        	</div>
	        	<div className="more">
	        		<h2><span>Learn More about Kip</span></h2>
	        		<Down/>
	        	</div>
	      	</div>
	    );
  	}
}



