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
import sortBy from 'lodash/collection/sortBy'

const style = {
  width: 400,
  marginBottom: '2em',
  textAlign: 'center'
};
const socket = io();
const defaultItems = [{
        id: 'product-0',
        name: 'Product 0',
        index: 0,
        img: 'http://kipthis.com/img/kip-cart.png',
        changed: false
      },{
        id: 'product-1',
        name: 'Product 1',
        index: 1,
        img: 'http://kipthis.com/img/kip-cart.png',
        changed: false
      },{
        id: 'product-2',
        name: 'Product 2',
        index: 2,
        img: 'http://kipthis.com/img/kip-cart.png',
        changed: false
      },{
        id: 'product-3',
        name: 'Product 3',
        index: 3,
        img: 'http://kipthis.com/img/kip-cart.png',
        changed: false
      },{
        id: 'product-4',
        name: 'Product 4',
        index: 4,
        img: 'http://kipthis.com/img/kip-cart.png',
        changed: false
      },
      {
        id: 'product-5',
        name: 'Product 5',
        index: 5,
        img: 'http://kipthis.com/img/kip-cart.png',
        changed: false
      },{
        id: 'product-6',
        name: 'Product 6',
        index: 6,
        img: 'http://kipthis.com/img/kip-cart.png',
        changed: false
      },{
        id: 'product-7',
        name: 'Product 7',
        index: 7,
        img: 'http://kipthis.com/img/kip-cart.png',
        changed: false
      },{
        id: 'product-8',
        name: 'Product 8',
        index: 8,
        img: 'http://kipthis.com/img/kip-cart.png',
        changed: false
      },{
        id: 'product-9',
        name: 'Product 9',
        index: 9,
        img: 'http://kipthis.com/img/kip-cart.png',
        changed: false
        }
      ]

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
        items: defaultItems,
        msg : true,
        bucket: true,
        action: true
    }
  }

  componentDidMount() {
    const {actions, activeChannel, activeMessage, messages} = this.props;
    const self = this

     socket.on('results', function (msg) {
      console.log('ControlPanel: Received results',msg)
      try {
           for (var i = 0; i < msg.amazon.length; i++) {
            self.state.items[i].index = i
            self.state.items[i].id = msg.amazon[i].ASIN[0]
            self.state.items[i].name = msg.amazon[i].ItemAttributes[0].Title[0]
            self.state.items[i].changed = true
            try {
              self.state.items[i].img = msg.amazon[i].ImageSets[0].ImageSet[0].LargeImage[0].URL[0]
            } catch(err) {
              console.log('Could not get image for item: ',i)
            }
          } 
      } catch(err) {
        console.log('CPanel Error 114 Could not get results :',err)
        return
      }
      var identifier = {channel: msg.source.id, properties: []}
      for (var key in msg) {
        if ((key === 'msg' || key === 'bucket' || key === 'action' || key === 'amazon') && msg[key] !== '' && msg[key] !== [] ) {
          identifier.properties.push({ [key] : msg[key]})
        }
      }  
      console.log('identifier: ', identifier)
      //if no fields were updated on form take no action
      if (identifier.properties.length === 0 ) {
        return
      } else {
        actions.setMessageProperty(identifier)
      }
    })

   socket.on('change channel bc', function(channels) {
    const filtered = self.props.messages.filter(message => message.source).filter(message => message.source.channel === channels.next.name)
    const filteredOld = self.props.messages.filter(message => message.source).filter(message => message.source.channel === channels.prev.name)
    const firstMsg = filtered[0]
    const firstMsgOld = filteredOld[0]
      if (firstMsgOld) {
          var globalitems = firstMsgOld.amazon.filter(function(obj){ return true })
          var result = []
          self.state.items.forEach(function(stateItem){
            globalitems.forEach(function(globalItem){
              if (stateItem.id == globalItem.ASIN[0]) {
               result.push(globalItem)
              }
            })
          })
          var identifier = {channel: firstMsgOld.source.id, properties: []}
          identifier.properties.push({ amazon : result})
          actions.setMessageProperty(identifier)
      }

        var arrayvar= []
         try {
           for (var i = 0; i < firstMsg.amazon.length; i++) {
            var item = { index: null, id: null, name: null, changed: true}
            item.index = i
            item.id = firstMsg.amazon[i].ASIN[0]
            item.name = firstMsg.amazon[i].ItemAttributes[0].Title[0]
            try {
              item.img = firstMsg.amazon[i].ImageSets[0].ImageSet[0].LargeImage[0].URL[0]
            } catch(err) {
              console.log('Could not get image for item: ',i)
            }
            arrayvar.push(item)
          } 
      } catch(err) {
        console.log('CPanel Error 169 Could not get results :',err)
        return
      }
      // console.log('Arrayvar is: ',arrayvar)
      if (arrayvar.length > 0) {
        self.setState({ items: arrayvar })
      } else {
        self.setState({items: [{
        id: 'product-0',
        name: 'Product 0',
        index: 0,
        img: 'http://kipthis.com/img/kip-cart.png',
        changed: false
      },{
        id: 'product-1',
        name: 'Product 1',
        index: 1,
        img: 'http://kipthis.com/img/kip-cart.png',
        changed: false
      },{
        id: 'product-2',
        name: 'Product 2',
        index: 2,
        img: 'http://kipthis.com/img/kip-cart.png',
        changed: false
      },{
        id: 'product-3',
        name: 'Product 3',
        index: 3,
        img: 'http://kipthis.com/img/kip-cart.png',
        changed: false
      },{
        id: 'product-4',
        name: 'Product 4',
        index: 4,
        img: 'http://kipthis.com/img/kip-cart.png',
        changed: false
      },
      {
        id: 'product-5',
        name: 'Product 5',
        index: 5,
        img: 'http://kipthis.com/img/kip-cart.png',
        changed: false
      },{
        id: 'product-6',
        name: 'Product 6',
        index: 6,
        img: 'http://kipthis.com/img/kip-cart.png',
        changed: false
      },{
        id: 'product-7',
        name: 'Product 7',
        index: 7,
        img: 'http://kipthis.com/img/kip-cart.png',
        changed: false
      },{
        id: 'product-8',
        name: 'Product 8',
        index: 8,
        img: 'http://kipthis.com/img/kip-cart.png',
        changed: false
      },{
        id: 'product-9',
        name: 'Product 9',
        index: 9,
        img: 'http://kipthis.com/img/kip-cart.png',
        changed: false
        }
      ]})
      }

    

    })
  }

  componentDidUpdate() {
      const {activeMessage} = this.props;
      const self = this;
    
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
 
  render() {
     const { activeControl, activeMessage, activeChannel, messages,actions} = this.props;
     const fields  = ['msg','bucket','action','searchParam']
     const self = this;
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

              <Button bsSize = "large" style={{ marginLeft: '3em',textAlign: 'center', backgroundColor: '#45a5f4' }} bsStyle = "primary" onClick = { () => this.sendCommand(activeMessage)} >
                      Send Command
              </Button>
       
          </div>

          <div id="third-column" style= {{ padding: 0}}>          
              <div style={style}>
                {items.map((item, i) => {
                  return (
                    <Card key={item.id}
                          index={i}
                          id={item.id}
                          text={item.name}
                          img = {item.img}
                          moveCard={this.moveCard} />
                  );
                })}
             
              </div>
                 
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