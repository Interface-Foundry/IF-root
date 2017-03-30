import React, { Component, PropTypes } from 'react';
import { Field } from 'redux-form';

export default class AddAmazonItem extends Component {
  render() {
    const { handleSubmit } = this.props;
    return (
      <form className="item" onSubmit={handleSubmit}> 
        <div className="input">
          <label htmlFor="url">Paste URL from Amazon</label>
          <Field name="url" component="input" type="text" placeholder='Enter the link to an amazon product'/>
        </div>
        <button className="submit" type="submit">Submit</button>
      </form>
    );
  }
}

