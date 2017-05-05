/* eslint react/prefer-stateless-function: 0, react/forbid-prop-types: 0 */
/* eslint global-require: 0 */
import React, { Component } from 'react';
import { DefaultPlayer as Video } from 'react-html5video';
import ReactDOM from 'react-dom'

import { Icon } from '../../themes';

const imageSrc = [
	'https://storage.googleapis.com/kip-random/demo_1_desktop.gif',
	'https://storage.googleapis.com/kip-random/demo_2_desktop.gif',
	'https://storage.googleapis.com/kip-random/demo_3_desktop.gif'
]

export default class Showcase extends Component {

	componentDidMount () {
		const { animationState, _registerHeight } = this.props;

	    _registerHeight(ReactDOM.findDOMNode(this).offsetTop, ReactDOM.findDOMNode(this).clientHeight)
	}

	componentWillMount() {
		_.map(imageSrc, (src) => {
			let img = new Image()
			img.src = src;
		})
	}

	renderSource () {
		const { animationState } = this.props;

		switch (animationState) {
			case 'inital':
				return 'https://storage.googleapis.com/kip-random/demo_1_desktop.gif'
			case 'fixed first':
				return 'https://storage.googleapis.com/kip-random/demo_1_desktop.gif'
			case 'fixed second':
				return 'https://storage.googleapis.com/kip-random/demo_2_desktop.gif'
			case 'fixed third':
				return 'https://storage.googleapis.com/kip-random/demo_3_desktop.gif'
			case 'absolute':
				return 'https://storage.googleapis.com/kip-random/demo_3_desktop.gif'
		}
	}

  	render() {
  		const { animationState } = this.props;

	    return (
	      	<div className='showcase'> 
	      		<div className={`phone image ${animationState}`}> 
	      			<div className='image gif'
                      style={ { backgroundImage: `url(${this.renderSource()})` } }/>
	      		</div>
				<svg className="sine" width="100%" height="50px" viewBox="0 0 100 31" preserveAspectRatio="none">
					<g>
						<path d="M0,26.5c9.7,3.8,20.3,4.2,30.3,0.9c1.9-0.6,3.8-1.4,5.7-2.2c10.6-4.5,20.7-10.2,31.1-15.1s21.4-9,32.9-10
							v31.7H0V26.5z"/>
					</g>
				</svg>
				<svg className="bottom" width="100%" height="50px" viewBox="0 0 100 31" preserveAspectRatio="none">
					<g>
						<path d="M0,26.5c9.7,3.8,20.3,4.2,30.3,0.9c1.9-0.6,3.8-1.4,5.7-2.2c10.6-4.5,20.7-10.2,31.1-15.1s21.4-9,32.9-10
							v31.7H0V26.5z"/>
					</g>
				</svg>
	      	</div>
	    );
  	}
}