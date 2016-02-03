import React, { Component, PropTypes} from 'react';
import ChannelListItem from './ChannelListItem';
import ChannelListModalItem from './ChannelListModalItem';
import { Modal, Glyphicon, Input, Button } from 'react-bootstrap';
const socket = io();
import * as UserAPIUtils from '../utils/UserAPIUtils';
// const img = document.createElement('img');
// img.src = require('./kip-icon.png');


class Channels extends Component {

  static propTypes = {
    channels: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
    messages: PropTypes.array.isRequired,
    chanIndex: PropTypes.number.isRequired
  };
  constructor(props, context) {
    super(props, context);
    this.state = {
      addChannelModal: false,
      channelName: '',
      moreChannelsModal: false
    };
  }

 componentWillUpdate() {
  const { channels } = this.props
 }  

  handleChangeChannel(channel) {
    this.props.onClick(channel);
  }
  openAddChannelModal() {
    event.preventDefault();
    this.setState({addChannelModal: true});
  }
  closeAddChannelModal() {
    event.preventDefault();
    this.setState({addChannelModal: false});
  }
  handleModalChange(event) {
    this.setState({channelName: event.target.value});
  }
  handleModalSubmit(event) {
    const { channels, actions } = this.props;
    event.preventDefault();
    if (this.state.channelName.length < 1) {
      this.refs.channelName.getInputDOMNode().focus();
    }
    if (this.state.channelName.length > 0 && channels.filter(channel => {
      return channel.name === this.state.channelName.trim();
    }).length < 1) {
      const newChannel = {
        name: this.state.channelName.trim(),
        id: Date.now()
      };
      UserAPIUtils.createChannel(newChannel);
      actions.addChannel(newChannel);
      this.handleChangeChannel(newChannel);
      socket.emit('new channel', newChannel);
      this.setState({channelName: ''});
      this.closeAddChannelModal();
    }
  }
  validateChannelName() {
    const { channels } = this.props;
    if (channels.filter(channel => {
      return channel.name === this.state.channelName.trim();
    }).length > 0) {
      return 'error';
    }
    return 'success';
  }
  openMoreChannelsModal() {
    event.preventDefault();
    this.setState({moreChannelsModal: true});
  }
  closeMoreChannelsModal() {
    event.preventDefault();
    this.setState({moreChannelsModal: false});
  }
  createChannelWithinModal() {
    this.closeMoreChannelsModal();
    this.openAddChannelModal();
  }
  changeChannelWithinModal(channel) {
    this.closeMoreChannelsModal();
    this.handleChangeChannel(channel);
  }
  closeAllChannels() {
    const { channels } = this.props;
    const restOfTheChannels = channels.filter(channel => channel.bucket !== 'supervisor')



    const filtered = messages.filter(message => message.source).filter(message => message.source.channel === channel.name)
    const firstMsg = filtered[0]
    UserAPIUtils.resolveChannel(channel)
    const resolveMessageInState = function(msg) {
        return new Promise(function(resolve, reject) {
              var identifier = {id: channel.id, properties: []} 
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
    const { channels, actions, messages, chanIndex } = this.props;
    const filteredChannels = channels.filter(channel => (!channel.resolved) || (channel.name === 'Lobby'))
    const moreChannelsBoolean = true;
    const restOfTheChannels = channels.filter(channel => (channel.resolved) && (channel.name !== 'Lobby'))
    // console.log('Channels136: ',filteredChannels,restOfTheChannels)
    const newChannelModal = (
      <div>
        <Modal key={1} show={this.state.addChannelModal} onHide={::this.closeAddChannelModal}>
          <Modal.Header closeButton>
            <Modal.Title>Add New Channel</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={::this.handleModalSubmit} >
            <Input
              ref="channelName"
              type="text"
              help={this.validateChannelName() === 'error' && 'A channel with that name already exists!'}
              bsStyle={this.validateChannelName()}
              hasFeedback
              name="channelName"
              autoFocus="true"
              placeholder="Enter the channel name"
              value={this.state.channelName}
              onChange={::this.handleModalChange}
            />
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={::this.closeAddChannelModal}>Cancel</Button>
            <Button disabled={this.validateChannelName() === 'error' && 'true'} onClick={::this.handleModalSubmit} type="submit">
              Create Channel
            </Button>
          </Modal.Footer>
          </Modal>
      </div>
    );
    const moreChannelsModal = (
      <div style={{background: 'grey'}}>
        <Modal key={2} show={this.state.moreChannelsModal} onHide={::this.closeMoreChannelsModal}>
          <Modal.Header closeButton >
            <Modal.Title>More Channels</Modal.Title>
            <a onClick={::this.createChannelWithinModal} style={{'cursor': 'pointer', 'color': '#85BBE9'}}>
              Create a channel
            </a>
          </Modal.Header>
          <Modal.Body>
            <ul style={{height: 'auto', margin: '0', overflowY: 'auto', padding: '0'}}>
              {restOfTheChannels.map(channel =>
                <ChannelListModalItem channel={channel} channels={channels} actions={actions} messages={messages} key={channel.id} {...actions} onClick={::this.changeChannelWithinModal} />
                )}
            </ul>
          </Modal.Body>
          <Modal.Footer>
            <Button bsStyle='danger' style={{ marginRight: '5%'}} onClick={::this.closeAllChannels}>Clear Channels</Button>
            <button onClick={::this.closeMoreChannelsModal}>Cancel</button>
          </Modal.Footer>
        </Modal>
      </div>
    );
    return (
      <section>
        <div>
          <span style={{paddingLeft: '0.8em', fontSize: '1.5em'}}>
            Channels
            <button onClick={::this.openAddChannelModal} style={{fontSize: '0.8em', 'background': 'Transparent', marginLeft: '2.8em', 'backgroundRepeat': 'noRepeat', 'border': 'none', 'cursor': 'pointer', 'overflow': 'hidden', 'outline': 'none'}}>
              <Glyphicon glyph="plus" />
            </button>
          </span>
        </div>
          {newChannelModal}
        <div>
          <ul style={{display: 'flex', flexDirection: 'column', listStyle: 'none', margin: '0', overflowY: 'auto', padding: '0'}}>
            {filteredChannels.map(channel =>
              <ChannelListItem  chanIndex={chanIndex} actions={actions} channels={channels} messages={messages} style={{paddingLeft: '0.8em', backgroundColor: '#45a5f4', height: '0.7em'}} messageCount={messages.filter(msg => {
                return msg.channelID === channel.name;
              }).length} channel={channel} key={channel.id} {...actions} onClick={::this.handleChangeChannel} />
              )}
          </ul>
          {moreChannelsBoolean && <a onClick={::this.openMoreChannelsModal} style={{'cursor': 'pointer', 'color': '#85BBE9'}}> + {restOfTheChannels.length} un-supervised channels...</a>}
          {moreChannelsModal}
        </div>
      </section>
    );
  }
}

export default Channels
