/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

import { Icon } from '../../themes';
import { Desktop, Desk, KipHead, Plant } from '../../themes/kipsvg';

export default class Hero extends Component {

	shouldComponentUpdate(nextProps, nextState) {
   		 // need this, otherwise page always rerender every scroll
	   	if(nextProps.animate !== this.props.animate) return true

    	return false
  	}

  	render() {
  		const { animate, src } = this.props;
  		
	    return (
	      	<div className={`hero image ${animate ? 'start' : ''}`}>
	      		<div className='hero__main'>
		        	<div className="col-6 headline">
		        		<h1>
		        			THE SIMPLEST WAY TO SHOP WITH YOUR FRIENDS
		        		</h1>
		        		<p>
		        			Whether your in Canada, the U.K, or Singapore, <span>KIP</span> makes sure you never miss out on your friends shopping sprees or the best deals. 
		        		</p>
		        		{
			      			src !== 'slack' ? <div className="col-12 action">
				      			<a href='/newcart'>
				        			<button>
					        			Create KIP Cart <Icon icon='Right'/>
					        		</button>
			        			</a>
				        	</div> : <div className="col-12 action">
			                  	<a href="https://slack.com/oauth/authorize?scope=commands+bot+users%3Aread&client_id=2804113073.14708197459" target="_blank"><button>
			                    	Add To Slack
			                  	</button></a>
			              	</div>
				      	}
		        	</div>
		        	<div className="col-6 animation">
		        		<div className='image'/>
		        	</div>
	        	</div>
	        	<div className="more">
	        		<h2><span>Learn More about Kip</span></h2>
	        		<Icon icon='Down'/>
	        	</div>
				<div className="icons">
					<div className="col-1"/>
	        		<div className="col-2"><Icon icon='Amazon'/></div>
	        		<div className="col-2"><Icon icon='Google'/></div>
	        		<div className="col-2"><Icon icon='Slack'/></div>
	        		<div className="col-2"><Icon icon='Microsoft'/></div>
	        		<div className="col-2"><Icon icon='Delivery'/></div>
	        		<div className="col-1"/>
	        	</div>
	      	</div>
	    );
  	}
}



