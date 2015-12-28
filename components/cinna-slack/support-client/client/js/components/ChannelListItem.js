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
    const { channel, channels,actions, messages, onClick } = this.props;
    const filtered = messages.filter(message => message.source).filter(message => message.source.channel === channel.name)
    const firstMsg = filtered[0]
    UserAPIUtils.resolveChannel(channel)
    const resolveMessageInState = function(msg) {
        return new Promise(function(resolve, reject) {
              var identifier = {_id: msg._id, properties: []} 
              identifier.properties.push({ resolved : true})
                actions.setMessageProperty(identifier)
                msg.resolved = true
            return resolve(msg);
        });
     };
    filtered.reduce(function(sequence, msg) {
      return sequence.then(function() {
        return resolveMessageInState(msg);
      }).then(function(chapter) {
        UserAPIUtils.resolveMessage(msg)
      });
    }, Promise.resolve());
    actions.removeChannel(channel)
    onClick(channels[0])
  }

  render() {
    const { channel, actions, channels } = this.props;
    const { channel: selectedChannel, onClick } = this.props;
    return (
    <div className="flexbox-container">
      <Button bsSize="xsmall" bsStyle="primary" >
        <a className={classnames({ selected: channel === selectedChannel })}
           style={{ cursor: 'hand', color: 'white'}}
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

