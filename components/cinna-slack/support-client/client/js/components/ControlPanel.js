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
import { DragDropContext  } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'react/lib/update';
import Card from './Card';

const style = {
  width: 400,
  marginBottom: '2em',
  textAlign: 'center'
};
const socket = io();

@DragDropContext(HTML5Backend)
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
      this.moveCard = this.moveCard.bind(this);
      this.state = {
        items: [{
        id: 'product-0',
        name: 'Product 0',
        index: 0
      },{
        id: 'product-1',
        name: 'Product 1',
        index: 1
      },{
        id: 'product-2',
        name: 'Product 2',
        index: 2
      },{
        id: 'product-3',
        name: 'Product 3',
        index: 3
      },{
        id: 'product-4',
        name: 'Product 4',
        index: 4
      }
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

   moveCard(dragIndex, hoverIndex) {
    const { items } = this.state;
    const dragCard = items[dragIndex];
    
    this.setState(update(this.state, {
      items: {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragCard]
        ]
      }
    }));
    this.setState(update(this.state, {
        items: {[hoverIndex]: {$merge: {index: hoverIndex}}}
     }));
  }
    // const {top, left} = this.state.items[0].deltaPosition;

  render() {
     const { activeControl, activeMessage, activeChannel, messages,actions} = this.props;
     const fields  = ['msg','bucket','action']
     const self = this;
     // const drags = {onStart: this.onStart, onStop: this.onStop};
     const { items } = this.state;

      return ( 
         <div className="flexbox-container">
          <div id="second-column">
            <section className='rightnav'>
          <div>   
            <DynamicForm
              onSubmit={this.props.onSubmit} changed=""
              fields={fields} activeMessage={activeMessage} activeChannel={activeChannel} messages={messages} actions={actions} />
         
            </div>   
          </section>
          </div>
          <div id="third-column" style= {{ padding: 0}}>
          

              <div style={style}>
                {items.map((item, i) => {
                  return (
                    <Card key={item.id}
                          index={i}
                          id={item.id}
                          text={item.name}
                          moveCard={this.moveCard} />
                  );
                })}
             
              </div>
                 <Button bsSize = "large" style={{ textAlign: 'center', backgroundColor: 'purple' }}bsStyle = "primary" onClick = { () => this.sendCommand(activeMessage)} >
                  Send Command
                </Button> 
          </div>
         </div>
      );
  }
}


 // <div>
 //                {Object.keys(this.state).map(field =>
 //                <label key={field}>
 //                  <input type="checkbox"
 //                         checked={this.state[field]}
 //                         onChange={event => this.setState({[field]: event.target.checked})}/> {labels[field]}
 //                </label>
 //                )}
 //            </div>

// <div className="box" style={{display: "flex", "flexFlow": "column wrap", height: '500px', width: '500px', position: 'relative'}}>
//    <Draggable  axis="y" onDrag={::this.handleDrag} ref="product-0" grid={[125, 125]} bounds="parent" {...drags}>
//       <div id="product-0" className="box cursor-y product-box">First Product </div>
//    </Draggable>
//    <Draggable  axis="y" onDrag={::this.handleDrag} grid={[125, 125]} bounds="parent" {...drags}>
//       <div id="product-1" className="box cursor-y product-box">Second Product </div>
//    </Draggable>
//    <Draggable axis="y" onDrag={::this.handleDrag} grid={[125, 125]} bounds="parent" {...drags}>
//       <div id="product-2" className="box cursor-y product-box">Third Product </div>
//    </Draggable>
// </div>



Array.prototype.getIndexBy = function (name, value) {
    for (var i = 0; i < this.length; i++) {
        if (this[i][name] == value) {
            return i;
        }
    }
    return -1;
}