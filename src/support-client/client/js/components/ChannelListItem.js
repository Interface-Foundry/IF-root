import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import { Button } from 'react-bootstrap';
import * as UserAPIUtils from '../utils/UserAPIUtils';
import shortid from 'shortid';


class ChannelListItem extends Component {

  static propTypes = {
    channel: PropTypes.object.isRequired,
    messages: PropTypes.array.isRequired,
    onClick: PropTypes.func.isRequired,
    actions: PropTypes.object.isRequired,
    channels: PropTypes.array.isRequired,
    chanIndex: PropTypes.number.isRequired
  };

  closeChannel() {
    const { chanIndex, channel, channels,actions, messages, onClick } = this.props;
    const filtered = messages.filter(message => (message.source && message.source.channel === channel.name))
    const firstMsg = filtered[0]
    UserAPIUtils.resolveChannel(channel)
    const resolveMessageInState = function(msg) {
        return new Promise(function(resolve, reject) {
               msg.thread.ticket = (msg.thread.ticket && msg.thread.ticket.id && msg.thread.ticket.isOpen) ? { id: msg.thread.ticket.id, isOpen: false }  : { id: shortid.generate(), isOpen: false };
               var identifier = {id: channel.id, properties: [{thread: msg.thread }]}
               actions.setMessageProperty(identifier)
            return resolve(msg);
        });
     };
    filtered.reduce(function(sequence, msg) {
      return sequence.then(function() {
        return resolveMessageInState(msg);
      }).then(function(msg) {
        UserAPIUtils.resolveMessage(msg)
      });
    }, Promise.resolve());
    actions.removeChannel(channel)
    if (channel.name === channels[0].name && channels.length > 1) {
      // console.log('situation: first channel closed but more channels')
      onClick(channels[1])
    } else if (channel.name === channels[0].name && channels.length === 1){ 
      // console.log('situation: first channel closed and last channel')
      onClick(null)
    } else {
      // console.log('situation: non-first channel closed and more channels left')
      onClick(channels[0])
    }
  }

  render() {
    const { channel, actions, channels } = this.props;
    const { channel: selectedChannel, onClick } = this.props;
    const closebuttonStyle = (channel.name === 'Lobby') ? { padding: 0, visibility: 'hidden' } : { padding: 0, visibility: 'visible'};
    return (
    <div className="flexbox-container" style={{backgroundColor: '#45a5f4'}}>
      <Button bsSize="xsmall" bsStyle="primary" style={{backgroundColor: '#45a5f4'}}>
        <a className={classnames({ selected: channel === selectedChannel })}
           style={{ cursor: 'hand', color: 'white', backgroundColor: '#45a5f4'}}
           onClick={() => onClick(channel)}>
          <li style={{textAlign: 'left', cursor: 'pointer', marginRight: '0.5em'}}>
            <h5>{channel.name}</h5>
          </li>
        </a>
      </Button>
      <Button type="button" className="close" style={closebuttonStyle} onClick={() => this.closeChannel()}>&times;</Button>
    </div>
    );
  }
}

export default ChannelListItem
