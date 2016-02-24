import React, { Component, PropTypes } from 'react';
import findIndex from 'lodash/array/findIndex'

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
    
    const messageToDisplay =  (message.client_res[0] && !message.flags.toCinna) ?  message.client_res[0] : message.msg
    this.setState({ displayMsg: messageToDisplay })
    function checkImgURL (msg) {
        return(msg.match(/\.(jpeg|jpg|gif|png)$/) != null);
    }
    if (checkImgURL(messageToDisplay)) {
      this.setState({ isImage : 'true'  })
    } else {
      this.setState({ isImage : 'false'  })
    }
  }

  renderMsg() {
     const {message} = this.props
     const msgType = (this.state.isImage === 'true') ? 'image' 
         : (message.flags.toClient ? 'toClient' 
              : (message.flags && message.flags.toCinna) ? 'toCinna' : 'message')
                  // : (message.flags && message.flags.response) ? 'response' : 'message')
     const messageStyle = (message.flags && message.flags.toCinna) ? {clear: 'both', paddingTop: '0.1em', marginTop: '-1px', paddingBottom: '0.3em', fontStyle: 'italic'} : {clear: 'both', paddingTop: '0.1em', marginTop: '-1px', paddingBottom: '0.3em'}
     let text = ''
     switch (message.action){
      case 'initial':
      case 'more':
        text = 'Hi, here are some options you might like. Use `more` to see more options or `buy 1`, `2` or `3` to get it now 😊'
        break;
      case 'similar':
        text = 'We found some options similar to '+message.searchSelect[0] +', would you like to see their product info? Just use `1`, `2` or `3` or `help` for more options';
        break;
      case 'checkout':
        text = 'Great! Please click the link to confirm your items and checkout. Thank you 😊';
        break;
      default: 
        text = message.client_res[0]          
     }
     switch (msgType){
      case 'image' : 
        return (
          <div style={messageStyle}> 
            <img width='200' src={this.state.displayMsg} />
          </div>
          )
        break;
      case 'toCinna':
        return ( <div style={messageStyle}> 
                    Previewing  {message.action} search: {message.msg}
                 </div>
                )
        break;
      case 'toClient':
              switch(message.action) {
                case 'initial': 
                case 'similar':
                case 'more':
                  // console.log('case 1')
                  message.client_res.unshift(text)
                  let imgIndex;
                  try {
                    imgIndex = findIndex(message.client_res,function(el){ if (el) {return ((el.indexOf('s3.amazonaws.com') > -1) || el.indexOf('ecx.images-amazon.com') > -1)}})
                  } catch(err) {
                    console.log('MLI81: ',err, message)
                  }

                  return (
                    <div>
                        <div style={messageStyle}> 
                            {message.client_res[0]}
                        </div>
                         <div style={messageStyle}> 
                            <img width='170' src={message.client_res[imgIndex]} />
                        </div>
                    </div>
                    )
                  break;
                case 'focus':
                  // console.log('case focus')
                  let attribs = message.amazon[message.searchSelect].ItemAttributes[0];
                  let topStr = ''
                  let cString = ''
                  if (message.amazon[message.searchSelect[0]].realPrice){ topStr = message.amazon[message.searchSelect].realPrice;}
                  if (attribs.Size){cString = cString + ' ○ ' + "Size: " +  attribs.Size[0];}
                  if (attribs.Artist){ cString = cString + ' ○ ' + "Artist: " +  attribs.Artist[0];}
                  if (attribs.Brand){cString = cString + ' ○ ' +  attribs.Brand[0];}
                  else if (attribs.Manufacturer){cString = cString + ' ○ ' +  attribs.Manufacturer[0];}
                  if (attribs.Feature){cString = cString + ' ○ ' + attribs.Feature.join(' ░ ');}
                  if (cString){message.client_res.unshift(cString);}
                  let imgIndex2;
                  try {
                    imgIndex2 = findIndex(message.client_res,function(el){ if (el) {return ((el.indexOf('s3.amazonaws.com') > -1) || el.indexOf('ecx.images-amazon.com') > -1)}})
                  } catch(err) {
                    console.log('MLI121: ',err, message)
                  }
                  return (
                    <div>
                        <div style={messageStyle}> 
                            {message.client_res[0]}
                        </div>
                         <div style={messageStyle}> 
                            <img width='170' src={message.client_res[imgIndex2]} />
                        </div>
                    </div>
                    )
                  break;
                case 'checkout':
                  // console.log('case checkout')
                  let linkIndex;
                  try {
                    linkIndex = findIndex(message.client_res,function(el){ if (el) {return (el.indexOf('www.amazon.com') > -1)}})
                  } catch(err) {
                    console.log('MLI126: ',err, message)
                  }
                  message.client_res.unshift(text)
                  return (
                    <div>
                        <div style={messageStyle}> 
                            {message.client_res[0]}
                        </div>
                         <div style={messageStyle}> 
                            <a href={message.client_res[message.client_res.length-1]}> Link to Product </a>
                        </div>
                    </div>
                    )
                  break;
                default:
                  // console.log('case default')
                  return (<div style={messageStyle}> 
                            {message.client_res[0]}
                          </div>
                          )
              }
              break;
      case 'response':
          return 
          // (<div style={messageStyle}> 
          //            {this.state.displayMsg}
          //         </div>
          //        )
          break;
      default:
        return (
                <div style={messageStyle}> 
                  {this.state.displayMsg}
                </div>
               )
     }
  }

  render() {
    var self = this;
    const { message } = this.props;
    const displayName = ((message.flags && message.flags.toCinna) && (message.action === 'initial' || message.action === 'similar' || message.action  === 'modify' || message.action  === 'focus' || message.action  === 'checkout' || message.action === 'more' )) ? 'Console:' : ((message.bucket === 'response' || message.flags.toClient) ? 'Cinna' : message.source.id)
    const nameStyle = (message.flags && message.flags.toCinna) ? {color: '#e57373'} : {color: '#66c'}
    return (
      <li>
        <span>
          <b style={nameStyle}>{displayName} </b>
          <i style={{color: '#aad', opacity: '0.8'}}>{message.ts}</i>
        </span>
        {self.renderMsg()} 
      </li>
    );
  }
}

export default MessageListItem