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
import { DragDropContext  } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'react/lib/update';
import Card from './Card';
import sortBy from 'lodash/collection/sortBy'
import isNaN from 'lodash/lang/isNaN'
import ReactList from 'react-list';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import ReactTransitionGroup from 'react-addons-transition-group';
import Toggle from 'react-toggle'
import localStateItems from './localStateItems'
import DraggableList from './DraggableList.jsx'

const style = {
  width: 400,
  marginBottom: '2em',
  textAlign: 'center'
};
const socket = io();

@DragDropContext(HTML5Backend)
class ControlPanel extends Component {
    static propTypes = {
        activeControl: PropTypes.object.isRequired,
        activeChannel: PropTypes.object.isRequired,
        activeMessage: PropTypes.object.isRequired,
        messages: PropTypes.array.isRequired,
        onSubmit: PropTypes.func.isRequired ,
        actions: PropTypes.object.isRequired
    };

    constructor (props, context) {
      super(props, context)
      this.moveCard = this.moveCard.bind(this);
      this.state = {
        items: localStateItems.localState,
        msg : true,
        bucket: true,
        action: true,
        mounted: false,
        visible: false,
        newOrder: []
    }
  }

  componentDidMount() {
    const {actions, activeChannel, activeMessage, messages, resolved} = this.props;
    const self = this
     this.setState({ mounted: true });
     socket.on('results', function (msg) {
      console.log('ControlPanel: Received results in Control Panel',msg)
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
      var identifier = {id: msg.source.id, properties: []}
      for (var key in msg) {
        if ((key === 'amazon') && msg[key] !== '' && msg[key] !== [] ) {
          identifier.properties.push({ [key] : msg[key]})
        }
      }  
      // console.log('identifier: ', identifier)
      //if no fields were updated on form take no action
      if (identifier.properties.length === 0 ) {
        return
      } else {
        actions.setMessageProperty(identifier)
      }
    })

   socket.on('change channel bc', function(channels) {
    const filtered = self.props.messages.filter(message => message.source).filter(message => message.source.id === channels.next.id)
    const filteredOld = self.props.messages.filter(message => message.source).filter(message => message.source.id === channels.prev.id)
    const firstMsg = filtered[0]
    const firstMsgOld = filteredOld[0]
      // console.log('firstMsg: ',firstMsg, 'firstMsgOld: ',firstMsgOld)
    //Handle toggle change based on whether next channel is resolved or not (if handleclick doesn't work you need the hacked version of the module)
    if ( self.refs.toggle && firstMsg.resolved && self.refs.toggle.state.checked === true) {
      self.refs.toggle.handleClick('forced')
    } else if (self.refs.toggle && !firstMsg.resolved && self.refs.toggle.state.checked === false) {
      self.refs.toggle.handleClick('forced')
    }

    // if (self.state.newOrder.length > 0) {
    //    self.setState({items: self.state.newOrder})
    // }
   

    //Reset selected state
     self.setState({ selected: {name: null, index: null}})

      //If there is atleast one channel existing already
      if (firstMsgOld) {
                console.log('self.state:', self.state)

        //   //Update local state with new item ordering
        //   const updateArrayState = function(items, i, order) {
        //     return new Promise(function(resolve, reject) {
        //          if (items[i].index !== order[i]) {
        //             self.setState(update(self.state, {
        //                 items: {
        //                   $splice: 
        //                     [[i, 1], [order[i], 0, items[i]]]
        //                 }
        //               }));
        //              self.setState(update(self.state, {
        //                 items: {[order[i]]: {$merge: {index: order[i]}}}
        //             }));
        //           }
        //         return resolve();
        //     });
        //  };
        //  //proxy var to hold original items ordering
        //  const oldItems = self.state.items
        // self.state.items.reduce(function(sequence, item, i) {
        //   return sequence.then(function() {

        //     return updateArrayState(oldItems, i, self.state.newOrder);
        //   })
        //  }, Promise.resolve()).then(function() {


          // console.log('self.state.newOrder', self.state.newOrder)
            //Update redux state with new item ordering        
            var globalitems = firstMsgOld.amazon.filter(function(obj){ return true })
            var result = []
            self.state.items.forEach(function(stateItem){
              globalitems.forEach(function(globalItem){
                if (stateItem.id == globalItem.ASIN[0]) {
                 result.push(globalItem)
                }
              })
            })
            var identifier = {id: firstMsgOld.source.id, properties: []}
            identifier.properties.push({ amazon : result})
            actions.setMessageProperty(identifier)


          // });
      }
        
        //Load items into state for next channel
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
      console.log('Arrayvar: ',arrayvar, 'result:',result ,'defaultState: ',localStateItems.defaultState[0].name)
      if (arrayvar.length > 0) {
         console.log(0)
        self.setState({ items: arrayvar })
        // self.refs.draggableListRef.forceUpdate()
      } else {
        console.log(1)
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
        }]})
        // self.refs.draggableListRef.forceUpdate()
        // self.forceUpdate()
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

   handleClick(index) {
    this.setState({ selected: {id: this.state.items[index].id, name: this.state.items[index].name, index: index}})
  }

  handleReorder(order) {
    const { items } = this.state;
    const self = this
    this.setState({items: order})

    console.log('HandleReorder(): Local state items updated ',order, this.state)

    // for (var i = 0; i < items.length; i++) {
    //   if (items[i].index !== order[i]) {
    //       this.setState(update(this.state, {
    //           items: {
    //             $splice: 
    //               [[i, 1], [order[i], 0, items[i]]]
    //           }
    //         }));
    //       this.setState(update(this.state, {
    //           items: {[order[i]]: {$merge: {index: order[i]}}}
    //       }));
    //     }
    //   }
  }

  renderItem(index, key) {
      const highlightBox =  (this.state.selected && this.state.selected.index === index) ? {border:'0.2em solid #90caf9', textAlign: 'center'} : {};
      const boundClick = this.handleClick.bind(this, index);
       return  (  
                    <div key={this.state.items[index].id} onClick={boundClick} style={highlightBox} >
                        <Card key={this.state.items[index].id}
                              index={index}
                              id={this.state.items[index].id}
                              text={this.state.items[index].name}
                              img = {this.state.items[index].img}
                              moveCard={this.moveCard}  />
                    </div>   
                )
    }

  render() {
     const { activeControl, activeMessage, activeChannel, messages,actions,changeMode} = this.props;
     const fields  = ['msg','bucket','action']
     const self = this;
     const { items,selected } = this.state;
     const list = (this.state.selected && this.state.mounted)? <ReactList itemRenderer={::this.renderItem} length={this.state.items.length} type='simple' /> : null
     return ( 
         <div className="flexbox-container">
          <div id="second-column">
            <section className='rightnav'>
          <div>   

      
              <label>
                <Toggle
                  ref='toggle'
                  defaultChecked={this.props.resolved}
                  onChange={ () => { changeMode(this) }} />
                  <span style={{fontSize:'1.3em'}}> INTERACT MODE</span>
              </label>

            <DynamicForm
              onSubmit={this.props.onSubmit} changed=""
              fields={fields} selected={selected} activeMessage={activeMessage} activeChannel={activeChannel} messages={messages} actions={actions} />
          </div>   
          </section>


              <Button bsSize = "large" style={{ margin: '3em',textAlign: 'center', backgroundColor: '#45a5f4' }} bsStyle = "primary" onClick = { () => this.sendCommand(activeMessage)} >
                      Send Command
              </Button>
          </div>
          <div id="third-column" style= {{ padding: 0}}>          
              <div style={style}>  
                <div style={{textAlign: 'left'}}> {(this.state.selected) ? this.state.selected.name: null} </div>
                      <DraggableList ref='draggableListRef' items={items} messages={messages} reorder={::this.handleReorder} style={{maxHeight: 700, maxWidth: 175}} className='demo8-outer' />
               </div>
            </div>
         </div>
      );
  }
}

                      // <div style={{overflow: 'auto', maxHeight: 700, maxWidth: 175, borderRadius: '0.3em'}}>
                        // </div>


    // <ReactCSSTransitionGroup transitionName="example" transitionAppear={true} transitionAppearTimeout={700} transitionEnterTimeout={500} transitionLeaveTimeout={300} >
    //     {list}
    // </ReactCSSTransitionGroup>



export default ControlPanel