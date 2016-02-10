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
import shortid from 'shortid';



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
        autoToggled: false,
        stream: false
      }
    }

  componentDidMount() {
    const { actions, messages, activeChannel,activeMessage } = this.props;
    this.setState({ resolved: null });
    const self = this
     socket.on('change state bc', function (state) {
      console.log('change state event received', state)
       var identifier = {id: state.id, properties: []}
      for (var key in state) {
        if ((key === 'msg' || key === 'bucket' || key === 'action' || key === 'thread' || key == 'amazon') && state[key] !== '' ) {
          identifier.properties.push({ [key] : state[key]})
        }
      }  
      // console.log('identifier: ', identifier)
      //if no fields were updated on form take no action
      if (identifier.properties.length === 0 ) {
        return
      } else if (activeChannel.name === 'Lobby' || activeMessage.source.channel === 'Lobby') {
        return
      }else {
        actions.setMessageProperty(identifier)
      }
    })   
    socket.on('new bc message', function(msg) {      
      //Set parent boolean of incoming msg here
      let filtered = self.props.messages.filter(message => message.source.id === msg.source.id);
      // msg.parent = (filtered.length > 0) ?  false : true
      // msg.resolved = (filtered.length > 0) ? (filtered[0].thread.ticket && filtered[0].thread.ticket.isOpen) : ((msg.bucket === 'supervisor') ? false : true) 
      // console.log('Chat67:', filtered, self.props.messages,msg)
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
    socket.on('change channel bc', function(channels) {
      const filtered = self.props.messages.filter(message => message.source).filter(message => message.source.channel === channels.next.name)
      const nextmsg = filtered[0]

       //Handle toggle change based on whether next channel is resolved or not (if handleclick doesn't work you need the hacked version of the module)
      if (  self.refs.cpanel.refs.child.refs.toggle && channels.next.resolved ===  self.refs.cpanel.refs.child.refs.toggle.state.checked) {
        // console.log('Case 1 Toggle and Channel Resolved Not in Sync:  nextchan: ', channels.next.resolved ,'toggle:' ,self.refs.cpanel.refs.child.refs.toggle.state.checked)
                  self.handleToggleChange()
      }
      else if (self.refs.cpanel.refs.child.refs.toggle && channels.next.resolved !==  self.refs.cpanel.refs.child.refs.toggle.state.checked){
          // console.log('Case 2 Toggle and Channel Resolved in Sync:  nextchan: ',channels.next.resolved ,'toggle:' , self.refs.cpanel.refs.child.refs.toggle.state.checked)
      } else {
        // console.log('Case 3:  nextchan: ',channels.next.resolved ,'toggle:' , self.refs.cpanel.refs.child.refs.toggle.state.checked)
      }

      let resolved = (nextmsg.thread.ticket && nextmsg.thread.ticket.id) ? nextmsg.thread.ticket.isOpen : false;

      self.setState({ resolved: channels.next.resolved })
      // console.log('Chat84',channels, self.state)

    })

  }
  changeActiveChannel(channel) {
    const { actions, activeChannel } = this.props;
    // console.log('firing changeactivechannel');
    if (channel) {
      if (channel.name === activeChannel.name) return
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
                thread: {
                        id: 'default',
                        sequence: 0,
                        isOpen: false,
                        ticket: {
                            id: 'default',
                            isOpen: false
                        },
                        parent: {
                            isParent: false,
                            id: 'default'
                        }
                      }
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

  handleModeChange() {
       const {activeChannel, actions, messages} = this.props;
       const filtered = messages.filter(message => (message.source && message.source.channel === activeChannel.name))
       const activeMsg = filtered[0]
       if (this.state.autoToggled) {
        // console.log('handleModeChange DENIED')
        this.setState({autoToggled: false})
        return
       }
       // console.log('handleModeChange fired')
       //switch local state
       // this.setState({resolved: !this.state.resolved})
       
       //update message
       activeMsg.thread.ticket = (activeMsg.thread.ticket && activeMsg.thread.ticket.isOpen) ? { id: activeMsg.thread.ticket.id, isOpen: false } :{ id: (activeMsg.thread.ticket && activeMsg.thread.ticket.id ? activeMsg.thread.ticket.id : shortid.generate()), isOpen: true };
       var identifier = {id: activeChannel.id, properties: [{thread: activeMsg.thread }]}
       actions.setMessageProperty(identifier)
       
       //change resolved status of channel
       let tempChannel = activeChannel
       tempChannel.resolved = !tempChannel.resolved
       actions.resolveChannel(tempChannel)
       this.refs.channelsref.forceUpdate()
  }

  handleToggleChange() {
    // console.log('hangleToggleChange fired')
    this.setState({autoToggled: true})
    this.refs.cpanel.refs.child.refs.toggle.handleClick('forced')
    
  }


  toggleStream() {
    let current = this.state.stream
     this.setState({stream: !current});
     // window.scrollTo(0, window.innerHeight);
  }

  render() {
    const { messages, channels, actions, activeChannel, typers, activeControl, activeMessage} = this.props;
    const filteredMessages = messages.filter(message => (message.source && message.source.channel === activeChannel.name)).filter(message => (message.bucket === 'response' || (message.flags && message.flags.toSupervisor)))
    const activeMsg =  messages.filter(message => (message.source && message.source.channel === activeChannel.name))[0]
    const username = this.props.user.username;
    const resolved = activeChannel.resolved
    const stream = this.state.stream
    const displayMessages = this.state.stream ?   
                       messages.slice(messages.length-15,messages.length).map(message =>
                            <MessageListItem message={message} key={message.source.id.concat(message.ts)} />
                           )
                           :  
                        filteredMessages.map(message =>
                            <MessageListItem message={message} key={message.source.id.concat(message.ts)} />
                          )
    const chatDisplay = !this.state.stream ? <div style={{backgroundColor: '#F5F8FF', color: 'orange'}}>current channel: {activeChannel.name} <br/></div> : <div style={{backgroundColor: '#F5F8FF', color: 'red'}}> Live Feed </div>             
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
            <Channels ref='channelsref' onClick={::this.changeActiveChannel} channels={channels} messages={messages} actions={actions}  chanIndex={channels.length}/>
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
              <ControlPanel ref="cpanel" actions={actions} activeControl={activeControl} activeChannel={activeChannel} activeMsg={activeMsg} messages={messages} resolved={resolved} onSubmit={::this.handleSubmit} changeMode={::this.handleModeChange} changeToggle={::this.handleToggleChange}/>
            </div>
          </div>
        

        </div>
        <footer style={{fontSize: '0.9em', position: 'fixed', bottom: '0.2em', left: '21.5rem', color: '#000000', width: '100%', opacity: '0.5'}}>
        <div style= {streamDisplay}>
          <MessageComposer activeChannel={activeChannel} activeMsg={activeMsg} messages={messages} user={username} onSave={::this.handleSave} messages={messages} resolved={resolved} stream={stream} />
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
