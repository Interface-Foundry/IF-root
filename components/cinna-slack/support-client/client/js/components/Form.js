import React, {Component} from 'react';
import {reduxForm} from 'redux-form';
export const fields = ['msg', 'bucket'];

class Form extends Component {
  constructor (props) {
      super(props)
    }



  render() {
    var self = this
    const {fields: {msg, bucket },handleSubmit} = this.props;
    return (
      <form onSubmit={handleSubmit}>
        <div>
          <label>Message</label>
          <input type="text" placeholder='message' {...msg}/>
        </div>
        <div>
          <label>Bucket</label>
          <input type="text" placeholder='bucket' {...msg}/>
        </div>
        <div>
 
        </div>
        <button onClick={handleSubmit}>Submit</button>
      </form>
    );
  }
}

Form = reduxForm({ // <----- THIS IS THE IMPORTANT PART!
  form: 'contact',                           // a unique name for this form
  fields, // all the fields in your form
})(Form);

export default Form;