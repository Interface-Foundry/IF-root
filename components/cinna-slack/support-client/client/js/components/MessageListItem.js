import React, { Component, PropTypes } from 'react';

class MessageListItem extends Component {

  static propTypes = {
    message: PropTypes.object.isRequired
  };
  
   constructor (props) {
    super(props)
    this.state = { 
      isImage: null,
      displayMsg: ''
    }
  }

  componentDidMount() {
    const { message } = this.props 
    
    const messageToDisplay = message.msg ? message.msg : message.client_res[0]
    this.setState({ displayMsg: messageToDisplay })
    function checkImgURL (msg) {
        return(msg.match(/\.(jpeg|jpg|gif|png)$/) != null);
    }
    if (checkImgURL(this.state.displayMsg)) {
      this.setState({ isImage : 'true'  })
    } else {
      this.setState({ isImage : 'false'  })
    }
  }

  renderMsg() {
     const {message} = this.props
     const msgType = (this.state.isImage === 'true') ? 'image' : ((message.flags && message.flags.preview) ? 'preview' : ((message.flags && message.flags.response) ? 'response' : 'message'))

     switch (msgType){
      case 'image' : 
        return (
          <img width='200' src={this.state.displayMsg} />
          )
        break;
      case 'preview':
          switch(message.action) {
            case 'initial':
                return 'Previewing ' + message.action + ' search: ' + message.msg
                break;
            case 'similar': 
                return 'Previewing ' + message.action + ' search: ' + message.msg
          }
        break;
      case 'response':
          return this.state.displayMsg
          break;
      default:
        return this.state.displayMsg
        break;
     }
  }

  render() {
    var self = this;
    const { message } = this.props;
    const displayName = ((message.flags && message.flags.preview) && (message.action === 'initial' || message.action === 'similar' || message.action  === 'modify')) ? 'Console:' : ((message.bucket === 'response') ? 'Cinna' : message.source.id)
    const nameStyle = (message.flags && message.flags.preview) ? {color: '#e57373'} : {color: '#66c'}
    const messageStyle = (message.flags && message.flags.preview) ? {clear: 'both', paddingTop: '0.1em', marginTop: '-1px', paddingBottom: '0.3em', fontStyle: 'italic'} : {clear: 'both', paddingTop: '0.1em', marginTop: '-1px', paddingBottom: '0.3em'}
    return (
      <li>
        <span>
          <b style={nameStyle}>{displayName} </b>
          <i style={{color: '#aad', opacity: '0.8'}}>{message.ts}</i>
        </span>
        <div style={messageStyle}> {self.renderMsg()} </div>
      </li>
    );
  }
}

export default MessageListItem