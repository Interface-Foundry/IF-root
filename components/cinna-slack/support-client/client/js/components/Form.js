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
    submitting: PropTypes.bool.isRequired,
    actions: PropTypes.object.isRequired
  };

  constructor (props) {
      super(props)
    }

  renderJSON() {
      const {activeMessage, actions} = this.props
      const msg = (this.props.values && this.props.values.msg && this.props.values.msg.length > 0) ? this.props.values.msg :  ((activeMessage && activeMessage.msg) ? activeMessage.msg : null)
      const bucket = (this.props.values && this.props.values.bucket && this.props.values.bucket.length > 0) ? this.props.values.bucket :  ((activeMessage && activeMessage.bucket) ? activeMessage.bucket : null)
      const action = (this.props.values && this.props.values.action && this.props.values.action.length > 0) ? this.props.values.action :  ((activeMessage && activeMessage.action) ? activeMessage.action : null)
      return (
        <div style={{fontSize: '0.2em'}}>
        <pre>
          <div>
          <label>msg: </label>{ msg } 
          </div>
          <div>
          <label>bucket: </label>{ bucket } 
          </div>
          <div>
          <label>action: </label>{ action } 
          </div>
        </pre>
        </div>
        )
  }

  // componentDidUpdate() {
  //   const { actions, activeMessage, values} = this.props;
  //   var copy = Object.assign({}, activeMessage);
  //      Object.keys(values).forEach(function(key) {
  //        if (values[key]) {
  //         copy[key] = values[key]
  //        }
  //   });
  //   actions.changeMessage(copy)
  // }

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