import React, {
    Component, PropTypes
}
from 'react';
import {
    Button
}
from 'react-bootstrap';
import classnames from 'classnames';


class TopPanel extends Component {

    static propTypes = {
        activeControl: PropTypes.object.isRequire,
        onClick: PropTypes.func.isRequired
    };

    handleChangeControl(control) {
        this.props.onClick(control);
    }

    render() {
        const {
            activeControl, actions, onClick
        } = this.props;
        return (
            <div style = {{background: '#8c9eff', height: '10%'}}>
            < Button bsSize = "medium" bsStyle = "primary" onClick = { () => this.handleChangeControl({ name: 'initial', id: 0 })} >
                SEARCH INITIAL 
              < /Button>  
              < Button bsSize = "medium" bsStyle = "primary" onClick = { () => this.handleChangeControl({ name: 'similar', id: 1 })} >
                SEARCH SIMILAR 
              < /Button>  
              < Button bsSize = "medium" bsStyle = "primary" onClick = { () => this.handleChangeControl({ name: 'modify', id: 2 })} >
                SEARCH MODIFY 
              < /Button>  
              < Button bsSize = "medium" bsStyle = "primary" onClick = { () => this.handleChangeControl({ name: 'focus', id: 3 })} >
                SEARCH FOCUS 
              < /Button>  
              < Button bsSize = "medium" bsStyle = "primary" onClick = { () => this.handleChangeControl({ name: 'more', id: 4 })} >
                SEARCH MORE
              < /Button>  
              < Button bsSize = "medium" bsStyle = "primary" onClick = { () => this.handleChangeControl({ name: 'save', id: 5 })} >
                PURCHASE SAVE 
              < /Button>  
              < Button bsSize = "medium" bsStyle = "primary" onClick = { () => this.handleChangeControl({ name: 'removeall', id: 6 })} >
                PURCHASE REMOVEALL 
              < /Button>  
              < Button bsSize = "medium" bsStyle = "primary" onClick = { () => this.handleChangeControl({ name: 'list', id: 7 })} >
                PURCHASE LIST 
              < /Button>  
               < Button bsSize = "medium" bsStyle = "primary" onClick = { () => this.handleChangeControl({ name: 'checkout', id: 8 })} >
                PURCHASE CHECKOUT 
              < /Button>
            < /div >
        );
    }

}

export default TopPanel