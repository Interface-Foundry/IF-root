import React, { Component, PropTypes, Image } from 'react';
import ReactDOM from 'react-dom';
import TopPanel from './TopPanel';
import ControlPanel from './ControlPanel';
import MessageComposer from './MessageComposer';
import MessageListItem from './MessageListItem';
import Channels from './Channels';
import * as Actions from '../actions/Actions';
import TypingListItem from './TypingListItem';
const socket = io();
import { DropdownButton, MenuItem, Button } from 'react-bootstrap';
import Infinite from 'react-infinite';


class Chat extends Component {

  static propTypes = {
    messages: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired,
    // user: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    channels: PropTypes.array.isRequired,
    activeChannel: PropTypes.object.isRequired,
    typers: PropTypes.array.isRequired,
    activeControl: PropTypes.object.isRequired,
    activeMessage: PropTypes.object.isRequired
  };
  static contextTypes = {
    router: PropTypes.object.isRequired
  };
     constructor (props, context) {
      super(props, context)
      this.state = {
        supervisor: false,
        stream: false
      }
    }

  componentDidMount() {
    const { actions, messages, activeChannel } = this.props;
    this.setState({ supervisor: false });
    const self = this
     socket.on('change state bc', function (state) {
      console.log('change state event received', state)
       var identifier = {channel: state.channel, properties: []}
      for (var key in state) {
        if ((key === 'msg' || key === 'bucket' || key === 'action' || key === 'resolved' || key == 'amazon') && state[key] !== '' ) {
          identifier.properties.push({ [key] : state[key]})
        }
      }  
      console.log('identifier: ', identifier)
      //if no fields were updated on form take no action
      if (identifier.properties.length === 0 ) {
        return
      } else if (activeChannel.name === 'Lobby' || activeMessage.source.channel === 'default') {
        return
      }else {
        actions.setMessageProperty(identifier)
      }
    })   
    socket.on('new bc message', function(msg) {      
      actions.receiveRawMessage(msg) 
    });
    socket.on('typing bc', username =>
      actions.typing(username)
    );
    socket.on('stop typing bc', username =>
      actions.stopTyping(username)
    );
    socket.on('new channel', channel =>
      actions.receiveRawChannel(channel)
    );
     socket.on('disconnect bc', socket =>
      console.log('user disconnected! ',socket)
    );
    if (!this.props.user.username) {
      actions.loadAuth();
    }
  }
  changeActiveChannel(channel) {
    const { actions, activeChannel } = this.props;
    console.log('firing changeactivechannel');
    if (channel) {
      var channels = { prev: {}, next:{}}
      channels.prev =  Object.assign({}, activeChannel);
      channels.next = Object.assign({}, channel)
      socket.emit('change channel', channels);
      // var currentChannel =  Object.assign({}, activeChannel);
      actions.changeChannel(channel);
      this.changeActiveMessage(channel)
    } else if(channel === null){
      var emptyChannel = { name: 'Kip',id: 'Kip',resolved: false}
      actions.changeChannel(emptyChannel);
      actions.changeMessage({
                _id: '',
                id: '',
                incoming: true,
                msg: 'No channels left',
                ts: '',
                resolved: false
                });
    }
  }

   changeActiveMessage(channel) {
    const { actions, messages, activeChannel} = this.props;
    const activeMessages = messages.filter(message => message.source.channel === channel.name);
    const firstMsg = activeMessages[0]
    // console.log('Chat.js 80: channel: ',channel, ' firstMsg: ',firstMsg)
    // firstMsg.id = firstMsg.id ? firstMsg.id : messages.length
    // console.log('Chat.js:108-->',firstMsg)
    if (firstMsg) {
      actions.changeMessage(firstMsg);
    } else {
      console.log('There is no previous channel: ',channel, activeMessages)
    }
  }

  componentDidUpdate() {
    const messageList = this.refs.messageList;
    // console.log('Did update fired: ', window.innerHeight-110)
    messageList.scrollTop = messageList.scrollHeight;
  }
  handleSave(newMessage) {
    const { actions } = this.props;
      actions.addMessage(newMessage);
  }
  handleSignOut() {
    const { dispatch } = this.props;
    dispatch(Actions.signOut());
    this.context.router.transitionTo('/welcome');
  }
  handleSubmit(state) {
    const { actions, activeMessage, activeChannel } = this.props;
    var copy = Object.assign({}, activeMessage);
       Object.keys(state).forEach(function(key) {
         if (state[key]) {
          copy[key] = state[key]
         }
    });
    actions.changeMessage(copy)
  }
  changeActiveControl(control) {
    const { actions } = this.props;
    actions.changeControl(control);
  }

  openMoreUsersModal() {
    event.preventDefault();
    this.setState({moreUsersModal: true});
  }
  closeMoreUsersModal() {
    event.preventDefault();
    this.setState({moreUsersModal: false});
  }

  handleSupervisorChange() {
       let current = this.state.supervisor
       this.setState({supervisor: !current});
    }

  toggleStream()  {
    let current = this.state.stream
     this.setState({stream: !current});
     // window.scrollTo(0, window.innerHeight);
  }



  render() {
    const { messages, channels, actions, activeChannel, typers, activeControl, activeMessage} = this.props;
    const filteredMessages = messages.filter(message => message.source).filter(message => message.source.channel === activeChannel.name).filter(message => (message.bucket === 'response' || message.bucket === 'supervisor'))
    const username = this.props.user.username;
    const supervisor = this.state.supervisor
    const stream = this.state.stream
    const displayMessages = this.state.stream ?   
                       messages.filter(message => message.client_res[0]).slice(messages.length-15,messages.length).map(message =>
                            <MessageListItem message={message} key={message.source.id.concat(message.ts)} />
                           )
                           :  
                        filteredMessages.map(message =>
                            <MessageListItem message={message} key={message.source.id.concat(message.ts)} />
                          )
    const chatDisplay = !this.state.stream ? <div style={{backgroundColor: '#F5F8FF', color: 'orange'}}>current channel: {activeMessage.source.channel}</div> : <div style={{backgroundColor: '#F5F8FF', color: 'red'}}> Live Feed </div>             
    const streamDisplay = !this.state.stream ? {opacity: '1', visibility: 'visible',transition: 'visibility 0.3s, opacity 0.3s', padding: '0'} :  { opacity: 0, visibility: 'hidden', transition: 'visibility 0.3s, opacity 0.3s', padding: '0' }
    const lobbyDisplay = !(activeChannel.name === 'Lobby') ? {opacity: '1', visibility: 'visible',transition: 'visibility 0.3s, opacity 0.3s', padding: '0'} :  { opacity: 0, visibility: 'hidden', transition: 'visibility 0.3s, opacity 0.3s', padding: '0' }
    return (
      <div style={{margin: '0', padding: '0', height: '100%', width: '100%', display: '-webkit-box'}}>
        <div className="nav" style={{backgroundColor: '#45a5f4'}}>

        <Button bsSize = "large" style={{backgroundColor: '#45a5f4', border: 'none' }} disabled={this.state.spinnerloading} onClick = { () => { this.toggleStream() } } >
          <div className="kipicon">
          </div>
          </Button> 
        

          <section style={{order: '2', marginTop: '1.5em'}}>
            <Channels onClick={::this.changeActiveChannel} channels={channels} messages={messages} actions={actions}  chanIndex={channels.length}/>
          </section>
        </div>
        <div className="main">
          <header style={{background: '#FFFFFF', color: 'black', flexGrow: '0', order: '0', fontSize: '2.3em', paddingLeft: '0.2em'}}>
            <div>
            <span style={{fontSize: '0.5em', marginLeft: '2em'}}>
            {chatDisplay}
            </span>
            </div>
          </header>
          

          <div className="flexbox-container">
             <div>
               <ul style={{wordWrap: 'break-word', margin: '0', overflowY: 'auto', padding: '0', width: '100%', flexGrow: '1', order: '1'}} ref="messageList">
                <Infinite elementHeight={44.5781}
                 containerHeight={window.innerHeight-90}
                 displayBottomUpwards>
                  { displayMessages }
                </Infinite>
              </ul>
            </div>
            <div style= {(activeChannel.name === 'Lobby') ? lobbyDisplay : streamDisplay} >
              <ControlPanel ref="cpanel" actions={actions} activeControl={activeControl} activeChannel={activeChannel} activeMessage={activeMessage} messages={messages} supervisor={supervisor} onSubmit={::this.handleSubmit} changeMode={::this.handleSupervisorChange} />
            </div>
          </div>
        

        </div>
        <footer style={{fontSize: '0.9em', position: 'fixed', bottom: '0.2em', left: '21.5rem', color: '#000000', width: '100%', opacity: '0.5'}}>
        <div style= {streamDisplay}>
          <MessageComposer activeChannel={activeChannel} activeMessage={activeMessage} messages={messages} user={username} onSave={::this.handleSave} messages={messages} supervisor={supervisor} stream={stream} />
        </div>  
          {typers.length === 1 &&
            <div>
              <span>
                <TypingListItem username={typers[0]} key={97}/>
                <span> is typing</span>
              </span>
            </div>}
          {typers.length === 2 &&
          <div>
            <span>
              <TypingListItem username={typers[0]} key={98}/>
              <span> and </span>
              <TypingListItem username={typers[1]} key={99}/>
              <span> are typing</span>
            </span>
          </div>}
          {typers.length > 2 &&
          <div>
            <span>Several people are typing</span>
          </div>}
        </footer>
      </div>
    );
  }
}





export default Chat
