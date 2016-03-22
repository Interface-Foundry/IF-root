import React, { Component, PropTypes } from 'react';
import * as UserAPIUtils from '../utils/UserAPIUtils';
const socket = io.connect();
import strftime from 'strftime';
import { Input } from 'react-bootstrap';

class MessageComposer extends Component {

  static propTypes = {
    activeChannel: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
    user: PropTypes.string.isRequired,
    messages:  PropTypes.array.isRequired
  };
  constructor(props, context) {
    super(props, context);
    this.state = {
      text: '',
      typing: false
    };
  }
  handleSubmit(event) {
    const {
        user, activeChannel, messages, resolved
    } = this.props;
    if (activeChannel.name === 'Lobby') { 
      console.log('activeChannel name is Lobby'); 
      return 
    }
    const text = event.target.value.trim();
    let activeMsg = this.props.activeMsg ? this.props.activeMsg : messages.filter(message => (message.source && message.source.id === activeChannel.id))[0]
    console.log('activeChannel: ',activeChannel,'activeMsg: ',activeMsg, ' this.props.activeMsg: ', this.props.activeMsg, ' messages.filer: ', messages.filter(message => (message.source && message.source.id === activeChannel.id))[0] )
    if (event.which === 13 && !resolved) {
        event.preventDefault();
        let thread;
        if (activeMsg && activeMsg.thread) {
          thread = activeMsg.thread
          thread.parent.id = activeMsg.thread.id
          thread.parent.isParent = false;
          thread.sequence = parseInt(activeMsg.thread.sequence) + 1
        } 
        if (!thread) { 
          console.log('thread is not defined!')
          console.log('activeChannel: ',activeChannel,'activeMsg: ',activeMsg, ' this.props.activeMsg: ', this.props.activeMsg, ' messages.filer: ', messages.filter(message => (message.source && message.source.id === activeChannel.id))[0] )
          return
        }
        var newMessage = {
            id: messages.length,
            msg: text,
            client_res: [text],
            incoming: false,
            source: {
                origin: 'slack',
                channel: activeChannel.name,
                org: activeChannel.id.split('_')[0],
                id: activeChannel.id
            },
            bucket: 'response',
            ts: new Date().toISOString(),
            thread: thread,
            flags: {toClient: true}
        };
        socket.emit('new message', newMessage);
        var copy = Object.assign({}, newMessage);
        delete copy.msg
        UserAPIUtils.createMessage(copy);
        this.props.onSave(newMessage);
        this.setState({
            text: '',
            typing: false
        });
        socket.emit('stop typing');
    }
  }
  handleChange(event) {
    const { resolved } = this.props
    if (resolved) return
    this.setState({ text: event.target.value });
    if (event.target.value.length > 0 && !this.state.typing) {
      socket.emit('typing');
      this.setState({ typing: true});
    }
    if (event.target.value.length === 0 && this.state.typing) {
      socket.emit('stop typing');
      this.setState({ typing: false});
    }
  }
  
  render() {
    const disabled = (this.props.resolved || this.props.AFK) ? true : false
    return (
      <div style={{
        zIndex: '52',
        left: '21.1rem',
        right: '1rem',
        width: '100%',
        flexShrink: '0',
        order: '2',
        height: '5rem',
        marginBottom: '0',
        marginTop: '0.5em'
      }}>
        <Input
          style={{
            height: '100%',
            fontSize: '2em'
          }}
          type="textarea"
          name="message"
          autoFocus="true"
          placeholder="Type here to chat!"
          value={this.state.text}
          onChange={::this.handleChange}
          onKeyDown={::this.handleSubmit}
          disabled= {disabled}
        />
      </div>
    );
  }
}

export default MessageComposer
