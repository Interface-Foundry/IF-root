import React, {Component, PropTypes} from 'react';
import {reduxForm} from 'redux-form';
export const labels = {
  msg: "Message",
  bucket: "Bucket",
  action: "Action"
}
const socket = io.connect();

class DynamicForm extends Component {
  static propTypes = {
    fields: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    tempState: PropTypes.object.isRequired,
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

  handleSaveState() {
    const {activeMessage, actions, messages, activeChannel} = this.props 
    console.log('this.state: ',this.state)
  }


  componentDidMount() {
   const {activeMessage, actions, messages, activeChannel} = this.props  ;
   const filtered = messages.filter(message => message.source).filter(message => message.source.channel === activeChannel.name)
    // socket.on('change channel bc', function () {
    //    // actions.setMessageProperty({_id: this.state.filteredMessages[0], key: 'msg', value: 'LELELELELWOPRKINGGGGG' }) 
    //    console.log('change channel event received',this.state)
    //    // this.handleSaveState
    //     // actions.setMessageProperty({_id: filtered[0], key: 'msg', value: 'LELELELELWOPRKINGGGGG' }) 
    // })   
  }



  componentWillReceiveProps(nextProps) {
   const {activeMessage, actions, messages, activeChannel} = this.props 
   
   this.setState({filteredMessages: messages.filter(message => message.source).filter(message => message.source.channel === nextProps.activeChannel.name)})
    for (var key in nextProps.values) {
      if (nextProps.values[key]) {
        // console.log(key,': ',newProps.values[key])
            this.setState({
               [key]:   nextProps.values[key]
          });
        // actions.setMessageProperty({_id: this.state.filteredMessages[0], key: 'msg', value: 'LELELELELETESTLELELELELE'  })
        // newProps.values[key]
      }
    }
    // return false
   // console.log('Component Will receive props', nextProps, 'State:', this.state)     
  }

  componentDidUpdate(prevProps={}, prevState={}) {
    const {actions} = this.props
    //  for (var key in prevProps.values) {
    //   if (prevProps.values[key]) {
    //     actions.setMessageProperty({_id: prevState.filteredMessages[0]._id, key: key, value: prevProps.values[key] })
    //   }
    // }
    // console.log('DidUpdate: preProps--> ',prevProps,' prevState --> ',prevState)
    // return false;
     // actions.setMessageProperty({_id: this.state.filteredMessages[0], key: 'msg', value: 'LELELELELETESTLELELELELE'  })
  }

  // shouldComponentUpdate(newProps, newState) {
  //   const {activeMessage, actions, messages, activeChannel} = this.props 
  //   for (var key in newProps.values) {
  //     if (newProps.values[key]) {
  //       // console.log(key,': ',newProps.values[key])
  //       actions.setMessageProperty({_id: newState.filteredMessages[0], key: key, value: newProps.values[key] })
  //     }
  //   }
  //   // actions.setMessageProperty({_id: newState.filteredMessages[0],  })
  //   console.log('Component should update')
  //   return false
  // }

  componentWillUnmount() {
    console.log('componentWillUnmount')
  }

  updateGlobalState() {
    const {actions } = this.props
    console.log('O_)')
     // actions.setMessageProperty({_id: this.state.filteredMessages[0], key: 'msg', value: 'LELELELELWOPRKINGGGGG' })
  }

  renderJSON(filtered) {
      const {activeMessage, actions, messages, activeChannel} = this.props    
      // const filteredMessages = messages.filter(message => message.source).filter(message => message.source.channel === activeChannel.name)
      // const msg = (this.props.values && this.props.values.msg && this.props.values.msg.length > 0) ? this.props.values.msg:  ((filteredMessages[0] && filteredMessages[0].msg) ? filteredMessages[0].msg : null)
      // const bucket = (this.props.values && this.props.values.bucket && this.props.values.bucket.length > 0) ? this.props.values.bucket :  ((activeMessage && activeMessage.bucket) ? activeMessage.bucket : null)
      // const action = (this.props.values && this.props.values.action && this.props.values.action.length > 0) ? this.props.values.action :  ((activeMessage && activeMessage.action) ? activeMessage.action : null)

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
    const { fields, handleSubmit, saveState,submitting, messages, activeChannel} = this.props;
    const filtered = messages.filter(message => message.source).filter(message => message.source.channel === activeChannel.name)
    const tempState = this.state
    return (
      <form tempState={tempState} ref='form1' onSubmit={handleSubmit}>
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