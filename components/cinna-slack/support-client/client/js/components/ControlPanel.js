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
        activeControl: PropTypes.object.isRequire,
        activeChannel: PropTypes.object.isRequire,
        activeMessage: PropTypes.object.isRequire,
        onSubmit: PropTypes.func.isRequired 
    }

    constructor (props) {
      super(props)
    }

    sendCommand(newMessage) {
      const { activeChannel, actions } = this.props
      socket.emit('new message', newMessage);
      UserAPIUtils.createMessage(newMessage);
    }

    renderJSON() {
        const {activeMessage} = this.props

        return (<div style={{fontSize: '0.2em'}}><pre>{JSON.stringify(activeMessage,null, 2) }</pre></div>)
    }

    renderForm() {
      const {activeMessage} = this.props
      return (
       <div className="data-message">
       <div className="header">
       </div>
       <div className="content">
         <div className="input-group">
         </div>
         <div className="input-group">
           <label for="text">Text</label>
           <input ref="text" defaultValue= { JSON.stringify(activeMessage.msg)} />
         </div>
       </div>
       <div className="footer">
       </div>
     </div>
      )
    }

    renderControl(){
       const {activeControl,activeChannel} = this.props
        switch (activeControl.name) {
          case 'initial':
            return (
                <div className='col-sm-12 itemcontent'>
                    <h3>INITIAL CONTROL PANEL</h3>
                  < Button bsSize = "medium" bsStyle = "primary" onClick = { () => this.resolveIssue(activeChannel)} >
                    Resolve 
                  < /Button>  
                </div> 
            );
          case 'similar':
            return (
                <div className='col-sm-12 itemcontent'>
                    <h3>SIMILAR CONTROL PANEL</h3>
                  < Button bsSize = "medium" bsStyle = "primary" onClick = { () => this.resolveIssue(activeChannel)} >
                    Resolve 
                  < /Button>  
                </div> 
            );
          case 'modify':
            return (
                <div className='col-sm-12 itemcontent'>
                    <h3>MODIFY CONTROL PANEL</h3>
                     < Button bsSize = "medium" bsStyle = "primary" onClick = { () => this.resolveIssue(activeChannel)} >
                    Resolve 
                  < /Button>  
                </div> 
            );
          case 'focus':
            return (
                <div className='col-sm-12 itemcontent'>
                    <h3>FOCUS CONTROL PANEL</h3>
                     < Button bsSize = "medium" bsStyle = "primary" onClick = { () => this.resolveIssue(activeChannel)} >
                    Resolve 
                  < /Button>  
                </div> 
            );
          case 'more':
            return (
                <div className='col-sm-12 itemcontent'>
                    <h3>MORE CONTROL PANEL</h3>
                     < Button bsSize = "medium" bsStyle = "primary" onClick = { () => this.resolveIssue(activeChannel)} >
                    Resolve 
                  < /Button>  
                </div> 
            );
          case 'save':
            return (
                <div className='col-sm-12 itemcontent'>
                   <h3> SAVE CONTROL PANEL</h3>
                     < Button bsSize = "medium" bsStyle = "primary" onClick = { () => this.resolveIssue(activeChannel)} >
                    Resolve 
                  < /Button>  
                </div> 
            );
          case 'removeall':
            return (
                <div className='col-sm-12 itemcontent'>
                   <h3> REMOVEALL CONTROL PANEL</h3>
                     < Button bsSize = "medium" bsStyle = "primary" onClick = { () => this.resolveIssue(activeChannel)} >
                    Resolve 
                  < /Button>  
                </div> 
            );
          case 'list':
            return (
                <div className='col-sm-12 itemcontent'>
                   <h3> LIST CONTROL PANEL</h3>
                     < Button bsSize = "medium" bsStyle = "primary" onClick = { () => this.resolveIssue(activeChannel)} >
                    Resolve 
                  < /Button>  
                </div> 
            );
          case 'checkout':
            return (
                <div className='col-sm-12 itemcontent'>
                    <h3>CHECKOUT CONTROL PANEL</h3>
                     < Button bsSize = "medium" bsStyle = "primary" onClick = { () => this.resolveIssue(activeChannel)} >
                    Resolve 
                  < /Button>  
                </div> 
            );
          default:
            return 
        }
    }

  state = {
    msg: true,
    bucket: true,
    action: true
  }
    render() {
       const { activeControl, activeMessage} = this.props;
       const fields = {
        msg : '',
        bucket: '',
        action: ''
       }
        var self = this;
        return ( 
        <section className='rightnav'>
          <h1>Control</h1> 
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
          onSubmit={this.props.onSubmit}
          fields={Object
            .keys(this.state)
            .reduce((accumulator, field) =>
              this.state[field] ? accumulator.concat(field) : accumulator, [])}/>
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