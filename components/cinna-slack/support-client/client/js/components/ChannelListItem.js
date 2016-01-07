import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import { Button } from 'react-bootstrap';
import * as UserAPIUtils from '../utils/UserAPIUtils';

export default class ChannelListItem extends Component {

  static propTypes = {
    channel: PropTypes.object.isRequired,
    messages: PropTypes.array.isRequired,
    onClick: PropTypes.func.isRequired,
    actions: PropTypes.object.isRequired,
    channels: PropTypes.array.isRequired,
    chanIndex: PropTypes.number.isRequired
  }

  closeChannel() {
    const { chanIndex, channel, channels,actions, messages, onClick } = this.props;
    const filtered = messages.filter(message => message.source).filter(message => message.source.channel === channel.name)
    const firstMsg = filtered[0]
    UserAPIUtils.resolveChannel(channel)
    const resolveMessageInState = function(msg) {
        return new Promise(function(resolve, reject) {
              var identifier = {channel: channel.name, properties: []} 
              identifier.properties.push({ resolved : true})
                actions.setMessageProperty(identifier)
                msg.resolved = true
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
      <Button type="button" className="close" style={{ padding: 0}} onClick={() => this.closeChannel()}>&times;</Button>
    </div>
    );
  }
}

