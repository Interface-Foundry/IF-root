import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { Field, Fields } from 'redux-form';

import { getCartItems, getCartTotal } from '../../reducers'

import { cloudinary } from '../../utils';

import Image from './Image'

class EditCart extends Component {

    onSubmitMiddleware = (values, e, state) => {
        const { handleSubmit, onSubmit, cart } = this.props,
            { thumbnail_url } = values;

        if(thumbnail_url && thumbnail_url !== cart.thumbnail_url) {
            debugger
            cloudinary(thumbnail_url).then((res) => {
                onSubmit({...values, ...cart, thumbnail_url: res.secure_url}, e, state)
            })
        } else {
            onSubmit(values, e, state)
        }

    }

    render() {
        const { handleSubmit, cart, replace } = this.props,
            { onSubmitMiddleware } = this; 
        
        return (
            <form className="editCart" onSubmit={handleSubmit(onSubmitMiddleware)}> 
                <div className="input custom src">
                    <Field name="thumbnail_url" component={Image} />
                </div>
                <div className="input name">
                    <Field name="name" component="input" type="text" placeholder="Add Cart Name"/>
                </div>
                <footer className='editCart__footer'>
                    <button className="submit" type="submit">Submit</button>
                </footer>
            </form>
        );
    }
}

EditCart.propTypes = {
    cart: PropTypes.object,
    handleSubmit: PropTypes.func.isRequired
}

export default EditCart;