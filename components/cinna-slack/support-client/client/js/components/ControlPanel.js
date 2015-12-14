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

export default class ControlPanel extends Component {
    static propTypes = {
        activeControl: PropTypes.object.isRequire,
        activeChannel: PropTypes.object.isRequire
    }

    constructor (props) {
      super(props)
    }

    resolveIssue(channel) {
     UserAPIUtils.resolveChannel(channel)
    }

    renderJSON() {
      const {filteredMessages} = this.props
        return (<div><pre>{JSON.stringify(filteredMessages[filteredMessages.length-1],null, 2) }</pre></div>)
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

    render() {
       const { activeControl, messages } = this.props;
        var self = this;
        return ( 
        <section className='rightnav'>
          <h1>Control</h1> 
          {self.renderJSON()}
        <div >
        {self.renderControl()}
        </div>
      </section>
        );
    }

}