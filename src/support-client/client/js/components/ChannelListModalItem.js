import React, { PropTypes } from 'react';
import classnames from 'classnames';
import { Button } from 'react-bootstrap';
import * as UserAPIUtils from '../utils/UserAPIUtils';

class ChannelListModalItem extends React.Component {

  static propTypes = {
    channel: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired
  };

  closeChannel() {
    const { channel, channels,actions, messages, onClick } = this.props;
    const filtered = messages.filter(message => message.source).filter(message => message.source.channel === channel.name)
    const firstMsg = filtered[0]
    UserAPIUtils.resolveChannel(channel)
    const resolveMessageInState = function(msg) {
        return new Promise(function(resolve, reject) {
              msg.thread.ticket = (msg.thread.ticket && msg.thread.ticket.id &&  msg.thread.ticket.isOpen) ? { id: msg.thread.ticket.id, isOpen: false }  : { id: shortid.generate(), isOpen: false };
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
    const { channel } = this.props;
    const { channel: selectedChannel, onClick } = this.props;
    return (
         <div className="flexbox-container">
          <Button bsSize="xsmall" bsStyle="primary"  style={{backgroundColor: 'white'}}>
              <a className={classnames({ selected: channel === selectedChannel })}
                 style={{ cursor: 'hand', color: 'black'}}
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

export default ChannelListModalItem