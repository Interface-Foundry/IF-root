import React, {
    Component, PropTypes
}
from 'react';
import {
    Button
}
from 'react-bootstrap';
import classnames from 'classnames';

export default class ControlPanel extends Component {
    static propTypes = {
        activeControl: PropTypes.object.isRequire
    }

    renderControl(){
       const {activeControl} = this.props
        switch (activeControl.name) {
          case 'initial':
            return (
                <div className='col-sm-12 itemcontent'>
                    INITIAL CONTROL PANEL
                </div> 
            );
          case 'similar':
            return (
                <div className='col-sm-12 itemcontent'>
                    SIMILAR CONTROL PANEL
                </div> 
            );
          case 'modify':
            return (
                <div className='col-sm-12 itemcontent'>
                    MODIFY CONTROL PANEL
                </div> 
            );
          case 'focus':
            return (
                <div className='col-sm-12 itemcontent'>
                    FOCUS CONTROL PANEL
                </div> 
            );
          case 'more':
            return (
                <div className='col-sm-12 itemcontent'>
                    MORE CONTROL PANEL
                </div> 
            );
          case 'save':
            return (
                <div className='col-sm-12 itemcontent'>
                    SAVE CONTROL PANEL
                </div> 
            );
          case 'removeall':
            return (
                <div className='col-sm-12 itemcontent'>
                    REMOVEALL CONTROL PANEL
                </div> 
            );
          case 'list':
            return (
                <div className='col-sm-12 itemcontent'>
                    LIST CONTROL PANEL
                </div> 
            );
          case 'checkout':
            return (
                <div className='col-sm-12 itemcontent'>
                    CHECKOUT CONTROL PANEL
                </div> 
            );
          default:
            return 
        }
    }

    render() {
       const { activeControl } = this.props;
        var self = this;
        return ( 
        <section className='rightnav'>
          <h1>Control Panel</h1> 
        <div >
        {self.renderControl()}
        </div>
      </section>
        );
    }

}