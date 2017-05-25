/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

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
	   	if(
	   		nextProps.animate !== this.props.animate || 
	   		nextProps.offsetTop !== this.props.offsetTop
	   	) return true

    	return false
  	}

  	render() {
  		const { animate, src, scrollToPosition, offsetTop } = this.props;
  		
	    return (
	      	<div className={`hero image ${animate ? 'start' : ''}`} style={{height: window.innerHeight}}>
	      		<div className='hero__main'>
		        	<div className="col-6 headline">
		        		<h1>
		        			Shop Online with Friends
		        		</h1>
		        		<p>
		        			<span><Link to='/whykip'>Kip</Link></span>  saves you money on 3rd party fees with wholesale prices. Use Kip Now today!
		        		</p>
		        		{
			      			src !== 'slack' ? <div className="col-12 action">
				      			<a href='/newcart'>
				        			<button>
					        			<span>Use Kip Now <Right/></span>
					        		</button>
			        			</a>
				        	</div> : <div className="col-12 action">
			                  	<a href="https://slack.com/oauth/authorize?scope=commands+bot+users%3Aread&client_id=2804113073.14708197459" target="_blank"><button>
			                    	Add To Slack
			                  	</button></a>
			              	</div>
				      	}
				      	<p className='subtext'>
				      		<span>Free</span>
				      		<span>No Setup</span>
				      		<span>Secure</span>
				      	</p>
		        	</div>
		        	<Link className="col-6 animation" to='/whykip'>
	        			<div className='image'/>
		        	</Link>
	        	</div>
	        	<div className="more" onClick={() => scrollToPosition(offsetTop)}>
	        		<h2><span>Learn More about Kip</span></h2>
	        		<Down/>
	        	</div>
	      	</div>
	    );
  	}
}



