import React, {
    Component, PropTypes
}
from 'react';
import {
    Button
}
from 'react-bootstrap';
import classnames from 'classnames';
import * as UserAPIUtils from '../utils/UserAPIUtils';
import DynamicForm,{labels} from './Form';
const socket = io();

export default class ControlPanel extends Component {
    static propTypes = {
        activeControl: PropTypes.object.isRequired,
        activeChannel: PropTypes.object.isRequired,
        activeMessage: PropTypes.object.isRequired,
        messages: PropTypes.array.isRequired,
        onSubmit: PropTypes.func.isRequired ,
        actions: PropTypes.object.isRequired
    }

    constructor (props) {
      super(props)
    }


    sendCommand(newMessage) {
      const { activeChannel, activeMessage,actions } = this.props
      newMessage.parent = activeMessage.source.id
      newMessage.resolved = true
      socket.emit('new message', newMessage);
      UserAPIUtils.createMessage(newMessage);
    }

    renderJSON() {
        const {activeMessage, actions} = this.props
        return (<div style={{fontSize: '0.2em'}}><pre>{JSON.stringify(activeMessage,null, 2) }</pre></div>)
    }

  changeMessageProperties() {
    const { actions } = this.props;
    // console.log('YO: ', this.refs.form1)
  }

    state = {
        msg : true,
        bucket: true,
        action: true
    }

    render() {
       const { activeControl, activeMessage, activeChannel, messages,actions} = this.props;
       const fields  = ['msg','bucket','action']
       const ref = this.refs.form1
        var self = this;
        return ( 
        <section className='rightnav'>
          <h1>Control</h1> 
          <h1>{this.ref}</h1>
            <div>
        <div>
          {Object.keys(this.state).map(field =>
            <label key={field}>
              <input type="checkbox"
                     checked={this.state[field]}
                     onChange={event => this.setState({[field]: event.target.checked})}/> {labels[field]}
            </label>
          )}
        </div>
        <DynamicForm
          onSubmit={this.props.onSubmit} ref="form1" changed=""
          fields={fields} activeMessage={activeMessage} activeChannel={activeChannel} messages={messages} actions={actions} />
        < Button bsSize = "medium" bsStyle = "primary" onClick = { () => this.sendCommand(activeMessage)} >
            Send Command
          < /Button> 
      </div>   
      <div className="jsonBox">
        {self.renderJSON()}
      </div>
      </section>
        );
    }
}