import React, {Component, PropTypes} from 'react';
import {reduxForm} from 'redux-form';
import { Button } from 'react-bootstrap';
export const labels = {
  msg: "Message",
  bucket: "Bucket",
  action: "Action"
}

const socket = io();

class DynamicForm extends Component {
  static propTypes = {
    fields: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
  };

  constructor (props, context) {
      super(props, context)
      this.state = {
       filteredMessages: null,
       channel: '',
       msg: '',
       bucket: '',
       action: '',
       bucketOptions: { initial: false, purchase: false, banter: false },
       searchParam: ''
      };
    }

  componentDidMount() {
   const {activeMessage, actions, messages, activeChannel, resetForm, dirty} = this.props; 
   var self = this
   socket.on('change channel bc', function(channels) {
      if (self.props.dirty) {
        self.state.channel = channels.prev.name
        socket.emit('change state',self.state);
      }
      //reset local state
      // console.log('messages: ', self.props.messages, ' channel: ',channel)
      const filtered = self.props.messages.filter(message => message.source).filter(message => message.source.channel === channels.next.name)
      const firstMsg = filtered[0]
      // console.log('first: ', firstMsg)
      self.state = {
       filteredMessages: filtered,
       msg: firstMsg.msg,
       bucket: firstMsg.bucket,
       action: firstMsg.action,
       channel: channels.next.name,
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

  renderJSON(filtered) {
      const {activeMessage, actions, messages, activeChannel} = this.props    
      return (
        <div style={{fontSize: '0.2em', marginTop: '5em'}}>
        <pre>
        <div>
          <label>channel: </label>{ this.state.channel } 
          </div>
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

  onChange(e) {
    const val = e.target.value;
    this.setState({searchParam: val})
  }

  setField(choice) {
    const { fields } = this.props;
    this.setState({ bucket : choice})
    // fields['bucket'].value = choice;
  }

  render() {
    const { fields, saveState,messages, activeChannel} = this.props;
    const filtered = messages.filter(message => message.source).filter(message => message.source.channel === activeChannel.name)
    const showSearchBox =  this.state.bucket === 'initial' ? {} : {display: 'none'};
    var self = this
    return (
       <div>
          <form ref='form1' onSubmit={null}>
           <div className="jsonBox">
            {self.renderJSON(filtered)}
           </div>
            
            <div className="flexbox-container" style={{ marginTop: '3em' }}>

                <Button bsSize = "large" style={{ margin: '0.3em' }} bsStyle = "primary" onClick = { () => this.setField('initial')} >
                  Initial
                </Button>
                <Button bsSize = "large" style={{ margin: '0.3em' }} bsStyle = "primary" onClick = { () => this.setField('purchase')} >
                  Purchase
                </Button>
                <Button bsSize = "large" style={{ margin: '0.3em' }} bsStyle = "primary" onClick = { () => this.setField('banter')} >
                  Banter
                </Button>
            </div>
          </form>

              <div id="search-box" style={showSearchBox}>
                 <input type="text" id="seach-input" {...fields['action']} onChange={this.handleChange} />
                <Button bsSize = "medium" style={{ margin: '1em' }} bsStyle = "primary" onClick = { () => this.searchAmazon(activeMessage)} >
                  Search Amazon
                </Button>
              </div>

       </div>
    );
  }
}

// {Object.keys(fields).map(name => {
//               const field = fields[name];
//               if (name === 'bucket' || name === 'action' || name === '') return
//               return (<div key={name}>
//                 <label>{labels[name]}</label>
//                 <div>
//                   <input type="text" placeholder={labels[name]} {...field}/>
//                 </div>
//               </div>);
//             })}


export default reduxForm({form: 'dynamic'})(DynamicForm);