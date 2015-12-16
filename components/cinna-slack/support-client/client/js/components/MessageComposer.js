import React, { Component, PropTypes } from 'react';
import * as UserAPIUtils from '../utils/UserAPIUtils';
const socket = io.connect();
import strftime from 'strftime';
import { Input } from 'react-bootstrap';

export default class MessageComposer extends Component {

  static propTypes = {
    activeChannel: PropTypes.object.isRequired,
    activeMessage: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
    user: PropTypes.string.isRequired,
    msgIndex: PropTypes.number.isRequired
  }
  constructor(props, context) {
    super(props, context);
    this.state = {
      text: '',
      typing: false
    };
  }
  handleSubmit(event) {
    const {
        user, activeChannel, activeMessage, msgIndex
    } = this.props;
    const text = event.target.value.trim();
    if (event.which === 13) {
        event.preventDefault();
        // {
        //   id: (state.data.length === 0) ? 0 : parseInt(state.data[state.data.length - 1].id + 1),
        //   incoming: true,
        //   msg: action.message.msg,
        //   tokens: action.message.tokens,
        //   bucket: action.message.bucket,
        //   action: action.message.action,
        //   amazon: action.message.amazon,
        //   dataModify: {
        //     type: (action.message.dataModify && action.message.dataModify.type) ? action.message.dataModify.type : '' ,
        //     val: (action.message.dataModify && action.message.dataModify.val) ? action.message.dataModify.val : [],
        //     param: (action.message.dataModify && action.message.dataModify.param) ? action.message.dataModify.param : ''
        //   },
        //   source: {
        //       origin: (action.message.source && action.message.source.origin) ? action.message.source.origin : 'socketio', 
        //       channel: (action.message.source && action.message.source.channel) ? action.message.source.channel : '',
        //       org: (action.message.source && action.message.source.org) ? action.message.source.org : 'kip',
        //       id: (action.message.source && action.message.source.id) ? action.message.source.id : ''
        //   },
        //   client_res: {
        //     msg: action.message.client_res
        //   },
        //   ts: action.message.ts,
        //   resolved: action.message.resolved,
        //   parent: action.message.parent
        //   }
        var newMessage = {
            id: msgIndex,
            msg: text,
            incoming: false,
            client_res: {
                msg: text
            },
            source: {
                origin: 'socket.io',
                channel: activeChannel.name,
                org: 'kip',
                id: 'Cinna'
            },
            ts: new Date().toISOString(),
            parent: activeMessage.source.id.toString()
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
        />
      </div>
    );
  }
}
