import React, {Component, PropTypes} from 'react';
import {reduxForm} from 'redux-form';
import { Button } from 'react-bootstrap';
import Spinner from 'react-spinner';

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
       searchParam: '',
       dirty: false,
       spinnerloading: false
      };
    }

  componentDidMount() {
   const {activeMessage, actions, messages, activeChannel, resetForm, dirty} = this.props; 
   var self = this

    socket.on('results', function (msg) {
       console.log('Form: Received results',msg)
       self.state.spinnerloading=false 
       self.state.searchParam = ''
       //store raw results for use in searchSimilar function
       self.state.rawAmazonResults = msg.amazon
    })

   socket.on('change channel bc', function(channels) {
      if (self.state.dirty) {
        self.state.channel = channels.prev.name
        console.log('saving state: ',self.state)
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
       received: firstMsg.ts,
       bucket: firstMsg.bucket,
       action: firstMsg.action,
       channel: channels.next.name,
       _id: firstMsg._id,
       dirty: false,
       spinnerloading: false
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
      const {activeMessage, actions, messages, activeChannel, selected} = this.props    
      return (
        <div style={{fontSize: '0.2em', marginTop: '5em'}}>
        <pre>
          <div>
          <label>channel: </label>{ this.state.channel } 
          </div>
          <div>
          <label>received: </label>{ new Date(this.state.received).toLocaleString()} 
          </div>
          <div>
          <label>original msg: </label>{ this.state.msg } 
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
    const { fields, dirty } = this.props;
    this.setState({ bucket: 'search', action : choice, dirty: true})
    // fields['bucket'].value = choice;
  }

  searchAmazon(query) {
     const {activeMessage, resetForm} = this.props 
     const newQuery = activeMessage;
     if (!this.state.searchParam) {
      if (query) {
        this.state.searchParam = query
      } else {
        console.log('search input is empty: ',this.state.searchParam)
        return
      }
     }
     newQuery.msg = this.state.searchParam
     newQuery.bucket = 'search'
     newQuery.action = 'initial'
     newQuery.client_res = [newQuery.msg]
     newQuery.tokens = newQuery.msg.split(' ')
     newQuery.source.origin = 'supervisor'
     // newQuery.source.channel = 'supervisor'
     socket.emit('new message', newQuery); 
     this.setState({ spinnerloading: true})
     
  }

  searchSimilar() {
     const {activeMessage, resetForm, selected} = this.props 
     const newQuery = activeMessage;
     if (!selected || !selected.name || !selected.id) {
      console.log('Please select an item.')
      return
     }

  // {
  //   searchSelect: [ 1 ],
  //   bucket: 'search',
  //   action: 'similar', 
  //   recallHistory: {
  //     amazon:["mZON1","2323"]
  //   },
  //   flag: 'recalled'
  //  }

     newQuery.bucket = 'search'
     newQuery.action = 'similar'
     newQuery.client_res = [newQuery.msg]
     newQuery.tokens = newQuery.msg.split(' ')
     newQuery.source.origin = 'supervisor'
     newQuery.recallHistory = {
      amazon: this.state.rawAmazonResults
     }
     newQuery.searchSelect = []
     newQuery.searchSelect.push(parseInt(selected.index) + 1)
     newQuery.flag = 'recalled'
     socket.emit('new message', newQuery); 
     this.setState({ spinnerloading: true})
     resetForm()
  }

  handleSubmit(e) {
    e.preventDefault()
    let query = e.target[3].value
    this.searchAmazon(query)
  }

  render() {
    const { fields, saveState,messages, activeChannel, selected} = this.props;
    const filtered = messages.filter(message => message.source).filter(message => message.source.channel === activeChannel.name)
    const showSearchBox =  this.state.action === 'initial' ? {textAlign: 'center', marginTop: '5em'} : {textAlign: 'center', marginTop: '5em', display: 'none'};
    const showSimilarBox =  this.state.action === 'similar' ? {textAlign: 'center', marginTop: '5em'} : {textAlign: 'center', marginTop: '5em', display: 'none'};
    const showPrompt = (!selected || !selected.name) ? { color:'black'} : {color:'white'}
   var self = this
    const spinnerStyle = (this.state.spinnerloading === true) ? {backgroundColor: 'orange', color: 'black'} : {backgroundColor: 'orange', color: 'orange', display: 'none'}
    return (
       <div className='flexbox-container' style={{ height: '40em', width: '100%'}}>
          <form ref='form1' onSubmit={::this.handleSubmit}>
           <div className="jsonBox" style={{width: '50em'}}>
            {self.renderJSON(filtered)}
           </div>
            
            <div style={{ display: 'flexbox', textAlign:'center',marginTop: '3em' }}>
                <Button className="form-button" bsSize = "large" style={{ margin: '0.2em', backgroundColor: '#45a5f4' }} bsStyle = "primary" onClick = { () => this.setField('initial')} >
                  Initial
                </Button>
                <Button className="form-button" bsSize = "large" style={{ margin: '0.2em', backgroundColor: '#45a5f4' }} bsStyle = "primary" onClick = { () => this.setField('similar')} >
                  Similar
                </Button>
                <Button className="form-button" bsSize = "large" style={{ margin: '0.2em', backgroundColor: '#45a5f4' }} bsStyle = "primary" onClick = { () => this.setField('modify')} >
                  Modify
                </Button>
                <div id="search-box" style={showSearchBox}>
                  <input type="text" id="seach-input" {...fields['searchParam']} onChange={this.OnChange} />
                    
                    <Button bsSize = "large" disabled={this.state.spinnerloading}  style={{ marginTop: '1em', backgroundColor: 'orange'}} bsStyle = "primary" onClick = { () => this.searchAmazon()} >
                      Search Amazon
                       <div style={spinnerStyle}>
                        <Spinner />
                       </div>
                    </Button>
                      
                </div>
                  <div id="similar-box" style={showSimilarBox}>
                      <h3 style={showPrompt}> Please select an item. </h3>
                    <Button bsSize = "large" disabled={(!this.props.selected || !this.props.selected.name)} style={{ marginTop: '1em', backgroundColor: 'orange'}} bsStyle = "primary" onClick = { () => this.searchSimilar()} >
                      Search Similar 
                    </Button>
                </div>
            </div>
            
          </form>
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