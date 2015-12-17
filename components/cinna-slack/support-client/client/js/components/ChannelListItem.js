import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import { Button } from 'react-bootstrap';
import * as UserAPIUtils from '../utils/UserAPIUtils';

export default class ChannelListItem extends Component {

  static propTypes = {
    channel: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
    actions: PropTypes.object.isRequired,
    channels: PropTypes.array.isRequired,
    chanIndex: PropTypes.number.isRequired
  }

  closeChannel() {
    const { channel, channels,actions, onClick } = this.props;
    UserAPIUtils.resolveChannel(channel)
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

