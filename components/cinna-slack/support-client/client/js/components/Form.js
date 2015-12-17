import React, {Component, PropTypes} from 'react';
import {reduxForm} from 'redux-form';
export const labels = {
  msg: "Message",
  bucket: "Bucket",
  action: "Action"
}


class DynamicForm extends Component {
  static propTypes = {
    fields: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired
  };

  renderJSON() {
      const {activeMessage, actions} = this.props
      const msg = (this.props.values.msg && this.props.values.msg.length > 0) ? JSON.stringify(this.props.values.msg,null,2) :  JSON.stringify(activeMessage.msg,null, 2)
      return (
        <div style={{fontSize: '0.2em'}}>
          <pre>
          <label>msg: { JSON.stringify(msg) }
          </pre>
        </div>
        )
  }

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

      <div className="jsonBox">
        {this.renderJSON()}
      </div>
      </form>
    );
  }
}

export default reduxForm({form: 'dynamic'})(DynamicForm);