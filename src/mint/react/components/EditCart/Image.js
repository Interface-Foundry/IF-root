
import React, { Component } from 'react';
import { getCartItems, getCartTotal } from '../../reducers';

import { Icon } from '..'; 

class Image extends Component {
  	render() {
		const { input } = this.props,
				{ onChange, value } = input;

		return (
			<ul className="cartImage input-row">
				<li>
					<label className={`upload ${value ? '' : 'empty'}`}>
						<div>
							<div className='image column-2' style={
						  	{
							  	backgroundImage: `url(${value ? value : 'http://tidepools.co/kip/head@x2.png'})`,
							 	backgroundRepeat: 'no-repeat',
							  	backgroundPosition: 'center',
							  	backgroundSize: 'contain'
						  	}}/>
						  	<div className='cartImage__editButton'>
						  		<Icon icon='Camera' />
						  		<p>edit</p>
						  	</div>
						</div>
						<input
						  	type="file"
						  	onChange={( e ) => {      
						      	e.preventDefault();
								const file = e.target.files[0];
								const reader = new FileReader();
								const url = reader.readAsDataURL(file);

								reader.onloadend = e => {
									const fileSrc = reader.result
						      		onChange(fileSrc);
								}
						    }}/>
					</label>
				</li>
			</ul>
		)
  	}
}

export default Image;