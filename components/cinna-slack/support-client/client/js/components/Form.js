import React, {Component, PropTypes} from 'react';
import {reduxForm} from 'redux-form';
export const labels = {
  msg: "Message",
  bucket: "Bucket",
  action: "Action"
}

const socket = io();

class DynamicForm extends Component {
  static propTypes = {
    fields: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    actions: PropTypes.object.isRequired
  };

  constructor (props, context) {
      super(props, context)
      this.state = {
       filteredMessages: null,
       msg: '',
       bucket: '',
       action: ''
      };
    }

  componentDidMount() {
   const {activeMessage, actions, messages, activeChannel, resetForm, dirty} = this.props; 
   var self = this
   socket.on('change channel bc', function(channels) {
      if (self.props.dirty) {
        socket.emit('change state',self.state);
      }
      //reset local state
      // console.log('messages: ', self.props.messages, ' channel: ',channel)
      const filtered = self.props.messages.filter(message => message.source).filter(message => message.source.channel === channels.next.name)
      const firstMsg = filtered[0]
      // console.log('first: ',firstMsg)
      self.state = {
       filteredMessages: filtered,
       msg: firstMsg.msg,
       bucket: firstMsg.bucket,
       action: firstMsg.action,
       _id: firstMsg._id
      };
      //reset form
      resetForm()
    })
  }

  //Update local state on form as user types
  componentWillReceiveProps(nextProps) {
   const {activeMessage, actions, messages, activeChannel} = this.props 
   this.setState({filteredMessages: messages.filter(message => message.source).filter(message => message.source.channel === nextProps.activeChannel.name)})
    for (var key in nextProps.values) {
      if (nextProps.values[key]) {
            this.setState({
               [key]:   nextProps.values[key]
          });
      }
    } 
  }
  componentDidUpdate(prevProps, prevState) {
    const {actions} = this.props
   
  }

  renderJSON(filtered) {
      const {activeMessage, actions, messages, activeChannel} = this.props    
      return (
        <div style={{fontSize: '0.2em'}}>
        <pre>
          <div>
          <label>msg: </label>{ this.state.msg } 
          </div>
          <div>
          <label>bucket: </label>{ this.state.bucket } 
          </div>
          <div>
          <label>action: </label>{ this.state.action } 
          </div>
        </pre>
        </div>
        )
  }

  render() {
    const { fields, handleSubmit, saveState,submitting, messages, activeChannel} = this.props;
    const filtered = messages.filter(message => message.source).filter(message => message.source.channel === activeChannel.name)
    return (
      <form ref='form1' onSubmit={handleSubmit}>
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
        {this.renderJSON(filtered)}
      </div>
      </form>
    );
  }
}

export default reduxForm({form: 'dynamic'})(DynamicForm);