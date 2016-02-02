import React from 'react';
import {Motion, spring} from 'react-motion';
import util from 'lodash'
import isNaN from 'lodash/lang/isNaN'
import findIndex from 'lodash/array/findIndex'
const socket = io();
function reinsert(arr, from, to) {
  const _arr = arr.slice(0);
  const val = _arr[from];
  _arr.splice(from, 1);
  _arr.splice(to, 0, val);
  return _arr;
}

function clamp(n, min, max) {
  return Math.max(Math.min(n, max), min);
}

const springConfig = [300, 50];
const itemsCount = 10;

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
        }]

const DraggableList = React.createClass({
  getInitialState() {
    return {
      delta: 0,
      mouse: 0,
      isPressed: false,
      lastPressed: 0,
      order: this.props.items,
      pageY: 0,
      switching: false
    };
  },

  componentDidMount() {
    const {delta} = this.state;
    window.addEventListener('touchmove', this.handleTouchMove);
    window.addEventListener('touchend', this.handleMouseUp);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
    const self = this
    socket.on('change channel bc', function(channels) {
      // console.log('DraggableList105: delta: ', self.state.delta)
      
      const firstMsg = self.props.messages.filter(message => message.source).filter(message => message.source.id === channels.next.id)[0]
      const firstMsgOld = self.props.messages.filter(message => message.source).filter(message => message.source.id === channels.prev.id)[0]
      if (typeof firstMsgOld !== 'undefined') {
        
            self.setState({switching: true})
           
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
      console.log('DraggableList124: Arrayvar is: ',arrayvar)
      if (arrayvar.length > 0) {
        self.setState({ order: arrayvar })
      } else {
        self.setState({order: defaultItems})
      }
      setTimeout(function(){
         self.setState({switching: false})
      }, 2000)
    })
  },

  handleTouchStart(key, pressLocation, e) {
    this.handleMouseDown(key, pressLocation, e.touches[0]);
  },

  handleTouchMove(e) {
    e.preventDefault();
    this.handleMouseMove(e.touches[0]);
  },

  handleMouseDown(pos, pressY, {pageY}) {
    this.setState({
      delta: pageY - pressY,
      mouse: pressY,
      isPressed: true,
      lastPressed: pos
    });
  },

  handleMouseMove({pageY}) {
    const {isPressed, delta, order, lastPressed} = this.state;
    if (isPressed) {
      const mouse = pageY - delta;
      const row = clamp(Math.round(mouse / 100), 0, itemsCount - 1);
          // console.log('DELTA:',delta)
      const newOrder = reinsert(order, findIndex(order, function(o) { return o.index == lastPressed }), row);
      // console.log(order, order.indexOf(lastPressed), row)
      this.setState({mouse: mouse, order: newOrder});

    }
  },

  handleMouseUp() {
    const {isPressed, delta, order, lastPressed} = this.state;
    // console.log('delta: ',delta)
    this.setState({isPressed: false, delta: 0}); 
     if ((delta !== 0) && (this.props.items !== defaultItems) && (order !== defaultItems) && this.props.items !== order) {
       this.props.reorder(order)
      }
  },

  render() {
    const {mouse, isPressed, lastPressed, order, switching} = this.state;
    const { items } = this.props
     const allStyle = this.state.switching ? { y: (spring(5, springConfig)) } : {} 
    return (
      <div className="demo8">
        { items.slice(0,10).map(item => {
          const style = lastPressed === item.index && (isPressed)
            ? {
                scale: spring(1.1, springConfig),
                shadow: spring(16, springConfig),
                y: mouse,
                textAlign: 'center'
              }
            : {
                scale: spring(1, springConfig),
                shadow: spring(1, springConfig),
                y: this.state.switching ? (spring(-600, springConfig)) : (spring(findIndex(order, function(o) { return o.index == item.index }) * 100, springConfig)), 
                textAlign: 'center'
              };
          return (
            <Motion style={style} key={item.index}>
              {({scale, shadow, y}) =>
                <div
                  onMouseDown={this.handleMouseDown.bind(null, item.index, y)}
                  onTouchStart={this.handleTouchStart.bind(null, item.index, y)}
                  className="demo8-item"
                  style={{
                    boxShadow: `rgba(0, 0, 0, 0.2) 0px ${shadow}px ${2 * shadow}px 0px`,
                    transform: `translate3d(0, ${y}px, 0) scale(${scale})`,
                    WebkitTransform: `translate3d(0, ${y}px, 0) scale(${scale})`,
                    zIndex: item.index === lastPressed ? 99 : item.index
                  }}>
                  <div className="flexbox-container">
                  <span style={{fontSize:'0.4em', color:'#000', margin: '0 auto', display:'inlineBlock', textAlign:'left'}}>{item.name.substring(0,20)} </span>   
                  <img height='90px' width='90px' style={{'MozUserSelect': 'none',
                      'WebkitUserSelect': 'none',
                      'WebkitUserDrag': 'none',
                      'userSelect': 'none',
                      'userDrag' : 'none',
                      // 'marginRight':'90%',
                      'display' : 'inlineBlock'
                      }} src={item.img} />
                      
                    
                  </div>
                </div>  
              }
            </Motion>
          );
        })}
      </div>
    );
  },
});
 
export default DraggableList;
