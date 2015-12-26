import React, {
    Component, PropTypes
}
from 'react/addons';
import {
    Button
}
from 'react-bootstrap';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import * as UserAPIUtils from '../utils/UserAPIUtils';
import DynamicForm,{labels} from './Form';
import Draggable from 'react-draggable';
// import React.addons from 'react-addons';
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

    constructor (props, context) {
      super(props, context)
      this.state = {
        items: [{
        id: 'product-0',
        deltaPosition: {
          top: 0
        }
      },{
        id: 'product-1',
        deltaPosition: {
          top: 0
        }
      },{
        id: 'product-2',
        deltaPosition: {
          top: 0
        }
      }
      // ,{
      //   id: 'product-3',
      //   deltaPosition: {
      //     left: 0,
      //     top: 0
      //   }
      // },{
      //   id: 'product-4',
      //   deltaPosition: {
      //     left: 0,
      //     top: 0
      //   }
      // },{
      //   id: 'product-5',
      //   deltaPosition: {
      //     left: 0,
      //     top: 0
      //   }
      // },{
      //   id: 'product-6',
      //   deltaPosition: {
      //     left: 0,
      //     top: 0
      //   }
      // },{
      //   id: 'product-7',
      //   deltaPosition: {
      //     left: 0,
      //     top: 0
      //   }
      // },{
      //   id: 'product-8',
      //   deltaPosition: {
      //     left: 0,
      //     top: 0
      //   }
      // },{
      //   id: 'product-9',
      //   deltaPosition: {
      //     left: 0,
      //     top:0
      //   }
      // }
      ],
        msg : true,
        bucket: true,
        action: true
    }
  }

  componentDidMount() {
    const self = this
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
      // return (<div style={{fontSize: '0.2em'}}><pre>{JSON.stringify(activeMessage,null, 2) }</pre></div>)
  }

  changeMessageProperties() {
    const { actions } = this.props;
    // console.log('YO: ', this.refs.form1)
  }

  handleDrag(e, ui) { 
     const index = this.state.items.getIndexBy("id", ui.node.id)
     var top = this.state.items[index].deltaPosition["top"];
     // console.log('id: ',ui.node.id, this.state, index)
     console.log('original state: ', this.state.items)
     var newPosition = {
      id: ui.node.id,
      deltaPosition: {
          top: top + ui.deltaY,
      }
    }
  // console.log('new position: ', newPosition))
     var newItems = React.addons.update(this.state.items, {[index]: {$set: newPosition}});
  // console.log('new items: ', newItems)
    this.setState({
      items: newItems
    })
  console.log('next state: ', this.state.items)
   }

  render() {
     const { activeControl, activeMessage, activeChannel, messages,actions} = this.props;
     const fields  = ['msg','bucket','action']
     const ref = this.refs.form1
      const self = this;
      const drags = {onStart: this.onStart, onStop: this.onStop};
      const {top, left} = this.state.items[0].deltaPosition;
      return ( 
         <div className="flexbox-container">
          <div id="second-column">
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
            <Button bsSize = "medium" bsStyle = "primary" onClick = { () => this.sendCommand(activeMessage)} >
                Send Command
              </Button> 
            </div>   
          </section>
          </div>
          <div id="third-column" style= {{ padding: 0}}>
             <h1>Results Preview:</h1>
              <div className="box" style={{display: "flex", "flexFlow": "column wrap", height: '500px', width: '500px', position: 'relative'}}>
               <Draggable  axis="y" onDrag={::this.handleDrag} ref="product-0" grid={[100, 100]} bounds="parent" {...drags}>
                  <div id="product-0" className="box cursor-y product-box">First Product </div>
               </Draggable>
               <Draggable  axis="y" onDrag={::this.handleDrag} grid={[100, 100]} bounds="parent" {...drags}>
                  <div id="product-1" className="box cursor-y product-box">Second Product </div>
               </Draggable>
               <Draggable axis="y" onDrag={::this.handleDrag} grid={[100, 100]} bounds="parent" {...drags}>
                  <div id="product-2" className="box cursor-y product-box">Third Product </div>
               </Draggable>
              </div>
          </div>
         </div>
      );
  }
}

Array.prototype.getIndexBy = function (name, value) {
    for (var i = 0; i < this.length; i++) {
        if (this[i][name] == value) {
            return i;
        }
    }
    return -1;
}