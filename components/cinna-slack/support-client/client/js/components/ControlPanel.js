import React, { Component, PropTypes } from 'react/addons';
import { Button, ButtonGroup, DropdownButton, MenuItem } from 'react-bootstrap';
import ReactDOM from 'react-dom';
import Spinner from 'react-spinner';
import classnames from 'classnames';
import * as UserAPIUtils from '../utils/UserAPIUtils';
import DynamicForm,{labels} from './Form';
import { DragDropContext  } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'react/lib/update';
import Card from './Card';
import sortBy from 'lodash/collection/sortBy'
import findIndex from 'lodash/array/findIndex'
import some from 'lodash/collection/some'
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
        msg: '',
        bucket: '',
        action: '',
        searchParam: '',
        spinnerloading: false,
        modifier: {},
        color: false,
        size: false,
        mounted: false,
        focusInfo: null,
        visible: false,
        searchSelect: [],
        count: 0
    }
  }

  componentDidMount() {
    const {actions, activeChannel, messages, resolved} = this.props;
    const self = this
     self.setState({ mounted: true });
     socket.on('results', function (msg) {
      //-Stop loading spinner
      self.state.spinnerloading = false
      //-Reset search param
      self.state.searchParam = ''
      if (msg.action !== 'checkout') {
        //Store raw amazon results in state unless action was focus bc focus returns empty amazon for some reason
        if (msg.action !== 'focus') {
          self.setState({rawAmazonResults:msg.amazon})
        }
        //convert returned results into local state format
        try {
             for (var i = 0; i < msg.amazon.length; i++) {
              self.state.items[i].index = i
              self.state.items[i].id = msg.amazon[i].ASIN[0]
              self.state.items[i].name = msg.amazon[i].ItemAttributes[0].Title[0]
              self.state.items[i].price = msg.amazon[i].realPrice ? msg.amazon[i].realPrice : (msg.amazon[i].ItemAttributes[0].ListPrice ? msg.amazon[i].ItemAttributes[0].ListPrice[0].FormattedPrice[0] : null )
              self.state.items[i].changed = true
              try {
                self.state.items[i].img = msg.amazon[i].ImageSets[0].ImageSet[0].LargeImage[0].URL[0]
              } catch(err) {
                console.log('Could not get image for item: ',i)
              }
            } 
        } catch(err) {
          console.log('CPanel Error 114 Could not get results :',err, msg)
          return
        }
      }
    //-Store focus info
    if (msg.focusInfo && msg.client_res && msg.client_res.length > 0) {
      self.setState({focusInfo: msg.focusInfo})
    } else if (msg.action !== 'focus'){
      self.setState({focusInfo: null})
    }
    //-Store client_res for focus and more commands
    if ((msg.action === 'focus' || msg.action === 'more' || msg.action === 'checkout') && msg.client_res && msg.client_res.length > 0) {
      self.setState({client_res: msg.client_res})
    }

    //Change active message in state
    var identifier = {id: msg.source.id, properties: []}
    for (var key in msg) {
      if ((key === 'amazon' || key === 'client_res' || key === 'searchSelect') && msg[key] !== '' ) {
        identifier.properties.push({ [key] : msg[key]})
      }
    }  
    if (identifier.properties.length === 0 ) {
      return
    } else {
      actions.setMessageProperty(identifier)
    }
  })

   socket.on('change channel bc', function(channels) {
    const filtered = self.props.messages.filter(message => message.source).filter(message => message.source.id === channels.next.id)
    const filteredOld = self.props.messages.filter(message => message.source).filter(message => message.source.id === channels.prev.id)
    const firstMsg = self.props.activeMsg
    const firstMsgOld = filteredOld[0]

    //-Emit change state event
    socket.emit('change state', self.state);

    //Reset selected state
     // self.setState({ selected: {name: null, index: null}})

    //If there is atleast one channel existing...
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
          identifier.properties.push({ searchSelect : self.state.searchSelect })
          actions.setMessageProperty(identifier)
     }
        
    //Load items into state for next channel
     const nextItems = []
     try {
       for (var i = 0; i < firstMsg.amazon.length; i++) {
        let item = { index: null, id: null, name: null, price: null, changed: true}
        item.index = i
        item.id = firstMsg.amazon[i].ASIN[0]
        item.name = firstMsg.amazon[i].ItemAttributes[0].Title[0]
        item.price = firstMsg.amazon[i].realPrice ? firstMsg.amazon[i].realPrice : (firstMsg.amazon[i].ItemAttributes[0].ListPrice ? firstMsg.amazon[i].ItemAttributes[0].ListPrice[0].FormattedPrice[0] : null )
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

     //-Reset local state params as necessary
      self.state.msg =  firstMsg.msg
      self.state.bucket =  firstMsg.bucket
      self.state.action =  firstMsg.action
      self.state.spinnerloading = false
      self.setState({modifier: { color: null, size: null}})
      self.state.color = false
      self.state.size = false
      self.state.searchParam = ''
      self.state.focusInfo = null
      self.state.count = 0
    })
  }

  // onChange(e) {
  //   const val = e.target.value;
  //   this.setState({
  //     searchParam: val
  //   })
  // }

  setField(choice) {
    let bucket = ''
    if (choice === 'checkout') {
      bucket = 'purchase'
    }
    this.setState({
        bucket: choice === 'checkout' ? 'purchase' : 'search',
        action: choice
      })
  }

  searchAmazon(query) {
    const {activeMsg} = this.props
    const newQuery = activeMsg;
    const self = this;
     //TODO
     // processData.urlShorten(data,function(res){
     //    var count = 0;
     //    //put all result URLs into arr
     //    async.eachSeries(res, function(i, callback) {
     //        data.urlShorten.push(i);//save shortened URLs
     //        processData.getNumEmoji(data,count+1,function(emoji){
     //            data.client_res.push(emoji + ' ' + res[count]);
     //            count++;                           
     //            callback();
     //        });
     //    }, function done(){
             if (!this.state.searchParam) {
              if (query) {
                this.state.searchParam = query
              } else if (document.querySelector('#search-input').value !== ''){
                this.state.searchParam = document.querySelector('#search-input').value
              } else {
                console.log('search input is empty.')
                return
              }
            }
            if (newQuery._id) {
              delete newQuery._id
            }
            newQuery.msg = this.state.searchParam
            newQuery.bucket = 'search'
            newQuery.action = 'initial'
            newQuery.tokens = newQuery.msg.split()
            newQuery.source.origin = 'supervisor'
            newQuery.flags = {}
            newQuery.flags.toCinna = true
            newQuery.client_res = []
            socket.emit('new message', newQuery);
            this.setState({
              spinnerloading: true,
              searchParam: ''
            })
            setTimeout(function(){
              if (self.state.spinnerloading === true) {
                 self.setState({
                    spinnerloading: false
                  })
              }
             },8000)
        // });
      // });
    document.querySelector('#search-input').value = ''
  }

  searchSimilar() {
    const { activeMsg } = this.props
    const newQuery = activeMsg;
    const selected = this.state.searchSelect
    const self = this
    if (selected.length === 0 || !selected[0] || !selected[0].name || !selected[0].id || !this.state.rawAmazonResults) {
      console.log('Please select an item or do an initial search.')
      return
    }
    if (newQuery._id) {
      delete newQuery._id
    }
    newQuery.bucket = 'search'
    newQuery.action = 'similar'
    newQuery.flags = {}
    newQuery.flags.toCinna = true
    newQuery.flags.recalled = true
    newQuery.tokens = newQuery.msg.split()
    newQuery.source.origin = 'supervisor';
    newQuery.recallHistory =  { amazon: this.state.rawAmazonResults}
    newQuery.amazon =  this.state.rawAmazonResults
    newQuery.searchSelect = selected
    // console.log('Form209-searchSimilar(): newQuery: ',newQuery)
    socket.emit('new message', newQuery);
    this.setState({
      spinnerloading: true
    })
    setTimeout(function(){
      if (self.state.spinnerloading === true) {
         self.setState({
            spinnerloading: false
          })
      }
     },8000)
  }

  searchModify() {
    const { activeMsg} = this.props;
    const newQuery = activeMsg;
    const selected = this.state.searchSelect
    const self = this;
    if (selected.length === 0 || !selected[0] || !selected[0].name || !selected[0].id || !this.state.rawAmazonResults) {
      console.log('Please select an item or do an initial search.')
      return
    }
   if (newQuery._id) {
      delete newQuery._id
    }
    newQuery.bucket = 'search'
    newQuery.action = 'modify'
    newQuery.tokens = newQuery.msg.split()
    newQuery.source.origin = 'supervisor'
    newQuery.recallHistory =  { amazon: this.state.rawAmazonResults}
    newQuery.searchSelect = selected
    newQuery.flags = {}
    newQuery.flags.toCinna = true
    newQuery.flags.recalled = true
    newQuery.dataModify = { type: '', val: []}
    if (this.state.color) {
      newQuery.dataModify.type = 'color'
      switch (this.state.modifier.color) {
        case 'Purple': 
          newQuery.dataModify.val.push({"hex": "#A020F0","name": "Purple","rgb": [160, 32, 240],"hsl": [196, 222, 136]})
          break
        case 'Blue Violet': 
          newQuery.dataModify.val.push({"hex": "#8A2BE2","name": "Blue Violet", "rgb": [138, 43, 226], "hsl": [192, 193, 134]})
          break
        case 'Slate Blue': 
          newQuery.dataModify.val.push({"hex": "#6A5ACD","name": "Slate Blue","rgb": [106, 90, 205],"hsl": [175, 136, 147]})
          break
        case 'Royal Blue': 
          newQuery.dataModify.val.push({"hex": "#4169E1","name": "Royal Blue","rgb": [65, 105, 225],"hsl": [159, 185, 145]})
          break
        default:
         console.log('No color selected.')
      }
    }
    socket.emit('new message', newQuery);
    this.setState({
      spinnerloading: true
    })
    setTimeout(function(){
        if (self.state.spinnerloading === true) {
           self.setState({
              spinnerloading: false
            })
        }
       },8000)
  }

  searchFocus() {
    const { activeMsg} = this.props
    const newQuery = activeMsg;
    const selected = this.state.searchSelect
    const self = this
    if (selected.length === 0 || !selected[0] || !selected[0].name || !selected[0].id || !this.state.rawAmazonResults) {
      console.log('Please select an item or do an initial search.')
      return
    }
    if (newQuery._id) {
      delete newQuery._id
    }
    newQuery.bucket = 'search'
    newQuery.action = 'focus'
    newQuery.tokens = newQuery.msg.split()
    newQuery.source.origin = 'supervisor';
    newQuery.recallHistory =  { amazon: this.state.rawAmazonResults}
    newQuery.searchSelect = selected
    newQuery.flags = {}
    newQuery.flags.toCinna = true
    newQuery.flags.recalled = true
    socket.emit('new message', newQuery);
    this.setState({
      spinnerloading: true
    })
    setTimeout(function(){
              if (self.state.spinnerloading === true) {
                 self.setState({
                    spinnerloading: false
                  })
              }
             },8000)
  }

  searchMore() {
    const { activeMsg} = this.props
    const newQuery = activeMsg;
    const selected = this.state.searchSelect
    if (selected.length === 0 || !selected[0] || !selected[0].name || !selected[0].id || !this.state.rawAmazonResults) {
      console.log('Please select an item or do an initial search.')
      return
    }
    const self = this
    if (newQuery._id) {
      delete newQuery._id
    }
    newQuery.bucket = 'search'
    newQuery.action = 'more'
    newQuery.tokens = newQuery.msg.split()
    newQuery.source.origin = 'supervisor';
    newQuery.recallHistory =  { amazon: this.state.rawAmazonResults}
    newQuery.flags = {}
    newQuery.searchSelect = selected
    newQuery.flags.toCinna = true
    newQuery.flags.recalled = true
    socket.emit('new message', newQuery);
    this.setState({
      spinnerloading: true
    })
    setTimeout(function(){
      if (self.state.spinnerloading === true) {
         self.setState({
            spinnerloading: false
          })
      }
     },8000)
  }

  checkOut() {
    const { activeMsg } = this.props;
    const newQuery = activeMsg;
    const selected = this.state.searchSelect
    if (selected.length === 0 || !selected[0] || !selected[0].name || !selected[0].id || !this.state.rawAmazonResults) {
      console.log('Please select an item or do an initial search.')
      return
    }
    const self = this;
    if (newQuery._id) {
      delete newQuery._id;
    }
    newQuery.bucket = 'purchase';
    newQuery.action = 'checkout';
    newQuery.tokens = newQuery.msg.split();
    newQuery.source.origin = 'supervisor';
    newQuery.recallHistory =  { amazon: this.state.rawAmazonResults}
    newQuery.searchSelect = selected
    newQuery.msg = 'buy ' + newQuery.searchSelect.toString(); 
    newQuery.flags = {}
    newQuery.flags.toCinna = true
    newQuery.flags.recalled = true
    socket.emit('new message', newQuery);
    this.setState({
      spinnerloading: true
    })
    setTimeout(function(){
      if (self.state.spinnerloading === true) {
         self.setState({
            spinnerloading: false
          })
      }
     },8000)
  }

 handleSelect(evt, val) {
    const self = this
    const field = ( 'Purple Blue Violet Slate Blue Royal Blue'.indexOf(val.trim()) > -1 ) ? 'color' : ''
    switch (field) {
      case 'color' : 
        self.setState( {modifier: { color : val } })
        break
      case 'size' : 
        self.setState( {modifier: { size : val }})
        break
    } 
  }

  //Function to search amazon if key hit enter
  handleSubmit(e) {
    e.preventDefault()
    //*note: increase the numerical value of below property when adding new buttons to form.  yeah it's weird sorry
    let query = e.target[6].value
    this.searchAmazon(query)
  }

  sendCommand(newMessage) {
    const { activeChannel, actions } = this.props
    newMessage.source.org = activeChannel.id.split('_')[0]
    newMessage.flags = {toClient: true}
    newMessage.amazon = this.state.rawAmazonResults ? this.state.rawAmazonResults : null
    newMessage.source.origin = 'slack'
    if (newMessage.action === 'focus' || newMessage.action === 'checkout' || newMessage.bucket === 'purchase') {
      if (!this.state.client_res || (this.state.client_res && this.state.client_res.length === 0)) { console.log('Cpanel244',newMessage); return}
        else {
           // if (newMessage.action === 'checkout') { newMessage.client_res = [this.state.client_res] }
          // else { 
            newMessage.client_res = this.state.client_res
          // }
        }
    }
    console.log('Cpanel246: Send Command: ', newMessage)
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

  //This function selects items for top 3
  handleClick(index) {
    let count = this.state.count
    switch (this.state.searchSelect.length) {
      case 0:
      case 1:
      case 2:
          // console.log(!some(this.state.searchSelect, index))
          if (!some(this.state.searchSelect, function(el){ return el === index}) ) {
           this.setState(update(this.state, {searchSelect: {$push: [index]}}));
          }
         break;
      case 3:
         if (count >= 3) {
          count = 1
         } else {
          count++
         }
         // console.log(!some(this.state.searchSelect, index))
         if (!some(this.state.searchSelect, function(el){ return el === index})) {
         let tempArray = this.state.searchSelect
         tempArray[count-1] = index
         this.setState({searchSelect: tempArray})
         this.setState({count: count})

         }
         break;
      default:
        return
    }
    console.log('searchSelect : ',this.state.searchSelect)
    // this.forceUpdate()
    // this.setState(update(searchSelect, {$push: [item]}));
    // this.setState({ selected: {id: this.state.items[index].id, name: this.state.items[index].name, index: index, price: this.state.items[index].price}})
  }


  handleChange(field, e) {
    var nextState = {}
    nextState[field] = e.target.checked
    this.setState(nextState)
  }

  // handleMouseMove(lastPressed, row) {
  //   const { items } = this.state;
  //   function reinsert(arr, from, to) {
  //     const _arr = arr.slice(0);
  //     const val = _arr[from];
  //     _arr.splice(from, 1);
  //     _arr.splice(to, 0, val);
  //     return _arr;
  //   }
  //   const itemsReordered = reinsert(items, findIndex(items, function(o) { return o.index == lastPressed }), row);
  //   this.setState({items: itemsReordered});
  // }


  // handleMouseUp(index) {
  //   const { items } = this.state;
  //   let selectedIndex = findIndex(items, function(o) { return o.index == index })

  //   this.setState({ selected: {id: items[selectedIndex].id, name: items[selectedIndex].name, index: selectedIndex}})
  // }

  renderItem(index, key) {
      const highlightBox =  (this.state.searchSelect && (some(this.state.searchSelect, function(el){ return (el-1) === index}))) ? {border:'1em solid #90caf9', textAlign: 'center'} : {};
      const boundClick = this.handleClick.bind(this, index+1);
      const included = (this.state.searchSelect && (some(this.state.searchSelect, function(el){ return (el-1) === index})))
      const number =  (included && findIndex(this.state.searchSelect, function(el) { return (el-1) === index }) === 0) ? 1 
                    : ((included && (findIndex(this.state.searchSelect, function(el) { return (el-1) === index }) === 1)) ? 2 
                            : ((included && (findIndex(this.state.searchSelect, function(el){ return (el-1) === index }) === 2)) ? 3 
                                    : null))
       return  (  
          <div key={this.state.items[index].id} onClick={boundClick} style={highlightBox} >
           <h5 style={{color: 'blue', fontWeight: 'bold'}}> {number} </h5>
              <Card key={this.state.items[index].id}
                    index={index}
                    id={this.state.items[index].id}
                    text={this.state.items[index].name}
                    price={this.state.items[index].price}
                    img = {this.state.items[index].img}
                    moveCard={this.moveCard}  />
          </div>   
      )
    }

  render() {
     const { activeMsg, activeControl, activeChannel, messages,actions,changeMode} = this.props;
     // const fields  = ['msg','bucket','action']
     const self = this;
     const { items,searchSelect } = this.state;
     const list = (this.state.mounted)? <ReactList itemRenderer={::this.renderItem} length={this.state.items.length} type='simple' /> : null
     const statusText = activeChannel.resolved ? 'CLOSED' : 'OPEN'
     const statusStyle = activeChannel.resolved ?  { fontSize:'3em' ,color: 'green'} : { fontSize:'3em',color: 'red'}
     const sendDisabled = activeChannel.resolved || this.state.sendingToClient ? true : false
     const showSearchBox = this.state.action === 'initial' ? {textAlign: 'center', marginTop: '5em'} : {display: 'none'};
     const showSimilarBox = this.state.action === 'similar' ? { textAlign: 'center', marginTop: '5em'} : {display: 'none'};
     const showModifyBox = this.state.action === 'modify' ? { textAlign: 'center', marginTop: '5em'} : {display: 'none'};
     const showFocusBox = this.state.action === 'focus' ? { textAlign: 'center', marginTop:'0.4em'} : { display: 'none'};
     const showMoreBox = this.state.action === 'more' ? { textAlign: 'center', marginTop:'0.4em'} : { display: 'none'};
     const showPrompt = (!searchSelect || searchSelect.length === 0) ? { color: 'black'} : { color: 'white'}
     const showCheckoutBox = this.state.action === 'checkout' ? { textAlign: 'center', marginTop:'0.4em'} : { display: 'none'};
     const spinnerStyle = (this.state.spinnerloading === true) ? {backgroundColor: 'orange',color: 'black'} : {backgroundColor: 'orange',color: 'orange',display: 'none'}
     const focusInfoStyle = this.state.focusInfo ? { fontSize: '0.6em', textAlign: 'left', margin: 0, padding: 0, border: '1px solid black'} : { display: 'none'}
     return ( 
         <div className="flexbox-container">
          <div id="second-column">
            <div id="search-box" style={showSearchBox}>
              <input type="text" id="search-input" />
                <Button bsSize = "large" disabled={this.state.spinnerloading}  style={{ marginTop: '1em', backgroundColor: 'orange'}} bsStyle = "primary" onClick = { () => this.searchAmazon()} >
                  Search Amazon
                   <div style={spinnerStyle}>
                    <Spinner />
                   </div>
                </Button>      
            </div>

            <div id="similar-box" style={showSimilarBox}>
                <h3 style={showPrompt}> Please select an item. </h3>
                <Button bsSize = "large" disabled={(!searchSelect || searchSelect.length === 0) || this.state.spinnerloading} style={{ marginTop: '1em', backgroundColor: 'orange'}} bsStyle = "primary" onClick = { () => this.searchSimilar()} >
                  Search Similar 
                    <div style={spinnerStyle}>
                    <Spinner />
                   </div>
                </Button>
            </div>

             <div id="modify-box" style={showModifyBox}>
                  <h3 style={showPrompt}> Please select a modifier. </h3>
                  <br />
                  <div>
                      <input type="checkbox"
                        checked={this.state.modifier.color}
                        onChange={this.handleChange.bind(this, 'color')} style={{margin: '1em'}}/> 
                       <DropdownButton disabled={!this.state.color} bsStyle='info' title='Color' key='1' id='dropdown-basic-1' onSelect={::this.handleSelect}>
                        <MenuItem eventKey="Purple">Purple</MenuItem>
                        <MenuItem eventKey="Blue Violet">Blue Violet</MenuItem>
                        <MenuItem eventKey="Slate Blue">Slate Blue</MenuItem>
                        <MenuItem eventKey="Royal Blue" active>Royal Blue</MenuItem>
                        <MenuItem divider />
                        <MenuItem eventKey="4">Separated link</MenuItem>
                      </DropdownButton>
                      <input type="checkbox"
                        checked={this.state.modifier.size}
                        onChange={this.handleChange.bind(this, 'size')} style={{margin: '1em'}}/> 
                       <DropdownButton disabled={!this.state.size} bsStyle='info' title='Size' key='2' id='dropdown-basic-2'>
                        <MenuItem eventKey="X-Small">X-Small</MenuItem>
                        <MenuItem eventKey="Small">Small</MenuItem>
                        <MenuItem eventKey="Medium" active>Medium</MenuItem>
                        <MenuItem eventKey="Large">Large</MenuItem>
                        <MenuItem eventKey="X-Large">X-Large</MenuItem>
                        <MenuItem divider />
                        <MenuItem eventKey="4">Separated link</MenuItem>
                      </DropdownButton>
                  </div>
                  <Button bsSize = "large" disabled={(!searchSelect || searchSelect.length ===  0) || this.state.spinnerloading || (!this.state.color && !this.state.size) || (!this.state.modifier.color && !this.state.modifier.size )} style={{ marginTop: '1em', backgroundColor: 'orange'}} bsStyle = "primary" onClick = { () => this.searchModify()} >
                    Search Modify
                    <div style={spinnerStyle}>
                      <Spinner />
                    </div>
                  </Button>
            </div>

            <div id="focus-box" style={showFocusBox}>
                          <div style={focusInfoStyle}> 
                             Price: {this.state.focusInfo && this.state.focusInfo.topStr ? this.state.focusInfo.topStr : null}
                             <br />
                             Reviews: {this.state.focusInfo && this.state.focusInfo.reviews ? this.state.focusInfo.reviews : null}
                             <br />
                             Feature: {this.state.focusInfo && this.state.focusInfo.feature ? this.state.focusInfo.feature : null}
                             <br />
                          </div>
                            
                <h3 style={showPrompt}> Please select an item. </h3>
                <Button bsSize = "large" disabled={(!searchSelect || searchSelect.length ===  0) || this.state.spinnerloading} style={{ marginTop: '1em', backgroundColor: 'orange'}} bsStyle = "primary" onClick = { () => this.searchFocus()} >
                  Search Focus
                    <div style={spinnerStyle}>
                    <Spinner />
                   </div>
                </Button>
            </div>

             <div id="more-box" style={showMoreBox}>
                <Button bsSize = "large" disabled={this.state.spinnerloading} style={{ marginTop: '1em', backgroundColor: 'orange'}} bsStyle = "primary" onClick = { () => this.searchMore()} >
                  Search More
                    <div style={spinnerStyle}>
                    <Spinner />
                   </div>
                </Button>
             </div>

              <div id="checkout-box" style={showCheckoutBox}>
                <div style={focusInfoStyle}> </div>
                <h3 style={showPrompt}> Please select an item. </h3>
                <Button bsSize = "large" disabled={(!searchSelect || searchSelect.length === 0) || this.state.spinnerloading} style={{ marginTop: '1em', backgroundColor: 'orange'}} bsStyle = "primary" onClick = { () => this.checkOut()} >
                  Checkout Item
                    <div style={spinnerStyle}>
                    <Spinner />
                   </div>
                </Button>
            </div>
            <Button block bsSize = "large" style={{ position: 'fixed', bottom:'20%',maxWidth: '15em',textAlign: 'center', backgroundColor: '#1de9b6' }} bsStyle = "danger" onClick = { () => this.sendCommand(activeMsg)} disabled={sendDisabled} >
              SEND TO CLIENT
            </Button>
          </div>

          <div id="third-column" style= {{ padding: 0}}>
                <label>
                  <Toggle
                    ref='toggle'
                    defaultChecked={this.props.resolved}
                    onChange={ () => { changeMode(activeChannel) }} />
                    <span style={statusStyle}>  {statusText}</span>
                </label>
                {this.state.searchSelect}
                <form ref='form1' onSubmit={::this.handleSubmit}>
                    <div style={{ display: 'flexbox', textAlign:'center',marginTop: '3em' }}>
                      <ButtonGroup bsSize = "large" bsStyle = "primary"  style={{margin: '0.2em'}}>
                        <Button className="form-button" style={{backgroundColor: '#1976d2', color: 'white'}} onClick = { () => this.setField('initial')} >
                          Initial
                        </Button>
                        <Button className="form-button" style={{backgroundColor:  '#1976d2', color: 'white'}} onClick = { () => this.setField('similar')} >
                          Similar
                        </Button>
                        <Button className="form-button" style={{backgroundColor:  '#1976d2', color: 'white'}} onClick = { () => this.setField('modify')} >
                          Modify
                        </Button>

                         <Button className="form-button" style={{backgroundColor:  '#1976d2', color: 'white'}} onClick = { () => this.setField('focus')} >
                          Focus
                        </Button>
                        <Button className="form-button" style={{backgroundColor:  '#1976d2', color: 'white'}} onClick = { () => this.setField('more')} >
                          More
                        </Button>
                        <Button className="form-button" style={{backgroundColor:  '#1976d2', color: 'white'}} onClick = { () => this.setField('checkout')} >
                          Checkout
                        </Button>
                      </ButtonGroup>
                    </div>
                  </form> 
                  <div style={{overflow: 'auto', maxHeight: 520, maxWidth: '95%',border: 'grey solid 0.3em'}}>
                    {list}
                  </div>

            </div>
        </div>
      );
  }
}

// <div style={{overflow: 'auto', maxHeight: 700, maxWidth: 175, borderRadius: '0.3em'}}>
// </div>


// <DynamicForm
//   onSubmit={this.props.onSubmit} changed=""
//   fields={fields} selected={selected} activeMsg={activeMsg} activeChannel={activeChannel} messages={messages} actions={actions} />

// <ReactCSSTransitionGroup transitionName="example" transitionAppear={true} transitionAppearTimeout={700} transitionEnterTimeout={500} transitionLeaveTimeout={300} >
 // </ReactCSSTransitionGroup>



// <DraggableList ref='draggableList'  selected={this.state.selected} mouseMove={::this.handleMouseMove} mouseUp={::this.handleMouseUp} items={items} messages={messages}  style={{maxHeight: 700, maxWidth: 175}} className='demo8-outer' />


export default ControlPanel