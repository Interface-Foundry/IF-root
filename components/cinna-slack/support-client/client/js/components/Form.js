import React, {Component, PropTypes} from 'react';
import {reduxForm} from 'redux-form';
export const labels = {
  msg: 'Message',
  bucket: 'Bucket',
  action: 'Action'
};

class DynamicForm extends Component {
  static propTypes = {
    fields: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired
  };

  render() {
    const { fields, handleSubmit, submitting } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        {Object.keys(fields).map(name => {
          const field = fields[name];
          return (<div key={name}>
            <label>{labels[name]}</label>
            <div>
              <input type="text" placeholder={labels[name]} {...field}/>
            </div>
          </div>);
        })}
        <div>

          <button disabled={submitting} onClick={handleSubmit}>
            {submitting ? <i/> : <i/>} Update State
          </button>
        </div>
      </form>
    );
  }
}

export default reduxForm({form: 'dynamic'})(DynamicForm);