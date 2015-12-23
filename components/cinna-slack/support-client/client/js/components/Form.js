import React, {Component, PropTypes} from 'react';
import {reduxForm} from 'redux-form';
import RadioApp from './Radio';
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

  onChange(e) {
    const val = e.target.value;
    this.setState({searchParam: val})
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
            {Object.keys(fields).map(name => {
              const field = fields[name];
              if (name === 'bucket' || name === 'action') return
              return (<div key={name}>
                <label>{labels[name]}</label>
                <div>
                  <input type="text" placeholder={labels[name]} {...field}/>
                </div>
              </div>);
            })}
            <div className="flexbox-container">
              <label>Bucket:</label>
                    <input type="radio" id="bucket-initial" {...fields['bucket']} value="initial" checked={fields['bucket'].value === 'initial'}/>
                    <label>INITIAL </label>
                    <input type="radio" id="bucket-purchase" {...fields['bucket']} value="purchase" checked={fields['bucket'].value === 'purchase'}/>
                    <label> PURCHASE </label>
                    <input type="radio" id="bucket-banter" {...fields['bucket']} value="banter" checked={fields['bucket'].value === 'banter'}/>
                    <label> BANTER </label>
            </div>

           
          </form>

              <div id="search-box" style={showSearchBox}>
                 <label>Search</label>
                 <input type="text" id="seach-input" {...fields['action']} onChange={this.handleChange} />
                <Button bsSize = "medium" bsStyle = "primary" onClick = { () => this.searchAmazon(activeMessage)} >
                  Search
                </Button>
              </div>

       </div>
    );
  }
}




export default reduxForm({form: 'dynamic'})(DynamicForm);