// react/components/EditCart/EditCart.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Field } from 'redux-form';
import { cloudinary } from '../../utils';
import Image from './Image';

class EditCart extends Component {
  static propTypes = {
    onSubmit: PropTypes.func,
    cart: PropTypes.object,
    handleSubmit: PropTypes.func.isRequired
  }

  onSubmitMiddleware = async(values, e, state) => {
    const { onSubmit, cart } = this.props, { thumbnail_url } = values;
    if (thumbnail_url && thumbnail_url !== cart.thumbnail_url) {
      onSubmit({
        ...cart,
        ...values,
        thumbnail_url: (await cloudinary(thumbnail_url))
          .secure_url
      }, e, state);
    } else {
      onSubmit(values, e, state);
    }
  }

  render() {
    const { handleSubmit } = this.props, { onSubmitMiddleware } = this;

    return (
      <form className="editCart" onSubmit={handleSubmit(onSubmitMiddleware)}> 
          <div className="input custom src">
              <Field name="thumbnail_url" component={Image} />
          </div>
          <div className="input name">
              <Field name="name" component="input" type="text" placeholder="Add Cart Name"/>
          </div>
          <footer className='editCart__footer' onClick={handleSubmit(onSubmitMiddleware)}>
              <button className="submit" type="submit">Submit</button>
          </footer>
      </form>
    );
  }
}

export default EditCart;
