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
import findIndex from 'lodash/array/findIndex'
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
        visible: false
    }
  }

  componentDidMount() {
    const {actions, activeChannel, messages, resolved} = this.props;
    const self = this
     self.setState({ mounted: true });
     socket.on('results', function (msg) {
      //enable react-motion animation
      if (msg.action === 'initial' || msg.action === 'similar' || msg.action === 'modify') {
      self.refs.draggableList.setState({previewing: true}) }

      //convert returned results into local state format
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
     
      self.setState({rawAmazonResults:msg.amazon})

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

      setTimeout(function(){
         self.refs.draggableList.setState({previewing: false})
      }, 1000)
      
      

    })

   socket.on('change channel bc', function(channels) {
    // const filtered = self.props.messages.filter(message => message.source).filter(message => message.source.id === channels.next.id)
    const filteredOld = self.props.messages.filter(message => message.source).filter(message => message.source.id === channels.prev.id)
    const firstMsg = self.props.activeMsg
    const firstMsgOld = filteredOld[0]

    //Reset selected state
     self.setState({ selected: {name: null, index: null}})

      //If there is atleast one channel existing already
      if (firstMsgOld) {
            //Update redux state with new item ordering        
            const reduxItems = firstMsgOld.amazon.filter(function(obj){ return true })
            const result = []
            self.state.items.forEach(function(stateItem){
              reduxItems.forEach(function(reduxItem){
                if (stateItem.id == reduxItem.ASIN[0]) {
                 result.push(reduxItem)
                }
              })
            })
            let identifier = {id: firstMsgOld.source.id, properties: []}
            identifier.properties.push({ amazon : result})
            actions.setMessageProperty(identifier)
       }
        
        //Load items into state for next channel
         const nextItems = []
         try {
           for (var i = 0; i < firstMsg.amazon.length; i++) {
            let item = { index: null, id: null, name: null, changed: true}
            item.index = i
            item.id = firstMsg.amazon[i].ASIN[0]
            item.name = firstMsg.amazon[i].ItemAttributes[0].Title[0]
            try {
              item.img = firstMsg.amazon[i].ImageSets[0].ImageSet[0].LargeImage[0].URL[0]
            } catch(err) {
              console.log('Could not get image for item: ',i)
            }
            nextItems.push(item)
          } 
      } catch(err) {
        console.log('CPanel Error 169 Could not get results :',err)
        return
      }
      // console.log('nextItems: ',nextItems,'defaultState: ',localStateItems.defaultState[0].name)
      if (nextItems.length > 0) {
         // console.log(0)
        self.setState({ items: nextItems })
      } else {
        // console.log(1)
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
      }
    })
  }

  sendCommand(newMessage) {
    const { activeChannel, actions } = this.props
    newMessage.source.org = activeChannel.id.split('_')[0]
    newMessage.flags = {toClient: true}
    newMessage.amazon = this.state.rawAmazonResults ? this.state.rawAmazonResults : null
    newMessage.source.origin = 'slack'
    // console.log('Cpanel229: Send Command: ', newMessage)
    if (newMessage.amazon === null) return

    socket.emit('new message', newMessage);
    this.setState({sendingToClient: true})
    const self = this
    setTimeout(function(){
          self.setState({sendingToClient: false})
    }, 1500)
    // UserAPIUtils.createMessage(newMessage);
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

  handleMouseMove(lastPressed, row) {
    const { items } = this.state;
    function reinsert(arr, from, to) {
      const _arr = arr.slice(0);
      const val = _arr[from];
      _arr.splice(from, 1);
      _arr.splice(to, 0, val);
      return _arr;
    }
    const itemsReordered = reinsert(items, findIndex(items, function(o) { return o.index == lastPressed }), row);
    this.setState({items: itemsReordered});
  }


  handleMouseUp(index) {
    const { items } = this.state;
    let selectedIndex = findIndex(items, function(o) { return o.index == index })

    this.setState({ selected: {id: items[selectedIndex].id, name: items[selectedIndex].name, index: selectedIndex}})
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
     const { activeMsg, activeControl, activeChannel, messages,actions,changeMode} = this.props;
     const fields  = ['msg','bucket','action']
     const self = this;
     const { items,selected } = this.state;
     const list = (this.state.selected && this.state.mounted)? <ReactList itemRenderer={::this.renderItem} length={this.state.items.length} type='simple' /> : null
     const statusText = activeChannel.resolved ? 'CLOSED' : 'OPEN'
     const statusStyle = activeChannel.resolved ?  { fontSize:'1.3em' ,color: 'green'} : { fontSize:'1.3em',color: 'red'}
     const sendDisabled = activeChannel.resolved || this.state.sendingToClient ? true : false
     return ( 
         <div className="flexbox-container">
          <div id="second-column">
            <section className='rightnav'>
          <div>   
              <label>
                <Toggle
                  ref='toggle'
                  defaultChecked={this.props.resolved}
                  onChange={ () => { changeMode(activeChannel) }} />
                  <span style={statusStyle}>  {statusText}</span>
              </label>

            <DynamicForm
              onSubmit={this.props.onSubmit} changed=""
              fields={fields} selected={selected} activeMsg={activeMsg} activeChannel={activeChannel} messages={messages} actions={actions} />
          </div>   
          </section>


              <Button bsSize = "large" style={{ margin: '3em',textAlign: 'center', backgroundColor: '#45a5f4' }} bsStyle = "primary" onClick = { () => this.sendCommand(activeMsg)} disabled={sendDisabled} >
                      Send Command
              </Button>
          </div>
          <div id="third-column" style= {{ padding: 0}}>          
              <div style={style}>  
                <div style={{textAlign: 'left', fontSize:'1.1em'}}> {(this.state.selected && this.state.selected.name) ? this.state.selected.name: 'none selected'} </div> 
                      <DraggableList ref='draggableList'  selected={this.state.selected} mouseMove={::this.handleMouseMove} mouseUp={::this.handleMouseUp} items={items} messages={messages}  style={{maxHeight: 700, maxWidth: 175}} className='demo8-outer' />
               </div>
            </div>
         </div>
      );
  }
}

export default ControlPanel