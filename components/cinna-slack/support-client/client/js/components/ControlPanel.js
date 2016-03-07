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
import {isColor} from '../../../../nlp/colors'
import colorHex from '../../../../nlp/colors'
import priceModify from '../../../../nlp/price'

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
      // this.moveCard = this.moveCard.bind(this);
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
        count: 0,
        client_res: null,
        rawAmazonResults: [],
        // lastSeen: [],
        lastAction: ''
    }
  }

  componentDidMount() {
    const {actions, activeChannel, messages, resolved} = this.props;
    const self = this
     self.setState({ mounted: true });


     //------------ON RECEIVING RESULTS FROM SEARCH PREVIEW-----------//
     
     socket.on('results', function (msg) {
      //-Stop loading spinner
      self.state.spinnerloading = false
      //-Reset search param
      self.state.searchParam = ''
      if (msg.action !== 'checkout') {
        //Store raw amazon results in state unless action was focus bc focus returns empty amazon for some reason
        if (msg.action !== 'focus') {
          self.setState({rawAmazonResults:msg.amazon})
          //convert returned results into local state format
          try {
               for (var i = 0; i < msg.amazon.length; i++) {
                self.state.items[i].index = i
                self.state.items[i].id = msg.amazon[i].ASIN[0]
                self.state.items[i].name = msg.amazon[i].ItemAttributes[0].Title[0]
                self.state.items[i].price = msg.amazon[i].realPrice ? msg.amazon[i].realPrice : (msg.amazon[i].ItemAttributes[0].ListPrice ? msg.amazon[i].ItemAttributes[0].ListPrice[0].FormattedPrice[0] : null )
                self.state.items[i].changed = true
                try {

                  let imageURL;
                  if (msg.amazon[i].MediumImage && msg.amazon[i].MediumImage[0].URL[0]){
                      imageURL = msg.amazon[i].MediumImage[0].URL[0];
                  }
                  else if (msg.amazon[i].ImageSets && msg.amazon[i].ImageSets[0].ImageSet && msg.amazon[i].ImageSets[0].ImageSet[0].MediumImage && msg.amazon[i].ImageSets[0].ImageSet[0].MediumImage[0]){
                      imageURL = msg.amazon[i].ImageSets[0].ImageSet[0].MediumImage[0].URL[0];
                  }
                  else if (msg.amazon[i].altImage){
                      imageURL = msg.amazon[i].altImage;
                  }
                  else {
                      console.log('NO IMAGE FOUND ',item);
                      imageURL = 'https://pbs.twimg.com/profile_images/425274582581264384/X3QXBN8C.jpeg'; //TEMP!!!!
                  }
                  self.state.items[i].img = imageURL;
                } catch(err) {
                  console.log('Could not get image for item: ',i)
                }
              } 
          } catch(err) {
            console.log('CPanel Error 114 Could not get results :',err, msg)
            return
          }
        }
      }
    //-Store focus info
    if (msg.focusInfo && msg.client_res && msg.client_res.length > 0) {
      self.setState({focusInfo: msg.focusInfo})
    } else if (msg.action !== 'focus'){
      self.setState({focusInfo: null})
    }
    //-Store client_res for focus,more, and checkout commands
    if (
      // (msg.action === 'focus' || msg.action === 'more' || msg.action === 'checkout') && 
      msg.client_res && msg.client_res.length > 0) {
      // if (findIndex(self.state.client_res, function(el){ if (el) {return !((el.indexOf(msg.client_res) > -1) || (el.indexOf(msg.client_res[0]) > -1))} }) > -1 ) {
              self.setState({client_res: msg.client_res})
      // }
    }
  })
  //---------------------------------------------------------//

  //------------ON CHANGING CHANNELS  ---------------------------//
   socket.on('change channel bc', function(channels) {
    const filtered = self.props.messages.filter(message => message.source).filter(message => message.source.id === channels.next.id)
    const filteredOld = self.props.messages.filter(message => message.source).filter(message => message.source.id === channels.prev.id)
    const nextMsg = self.props.activeMsg
    const currentMsg = filteredOld[0]
    // console.log('THIS IS PROB IT CPANEL143: ',self.props.activeMsg)

    console.log('Switching channels from: ',currentMsg.source.id,' to: ',nextMsg.source.id)
    //-Emit change state event
    // socket.emit('change state', self.state);

    //Reset selected state
     // self.setState({ selected: {name: null, index: null}})

    //If there is atleast one channel existing...aka this is not the first channel opened
    if (currentMsg) {
          //Save search results and searchSelect     
          // const reduxItems = firstMsgOld.amazon.filter(function(obj){ return true })
          // const result = []
          // self.state.items.forEach(function(stateItem){
          //   reduxItems.forEach(function(reduxItem){
          //     if (stateItem.id == reduxItem.ASIN[0]) {
          //      result.push(reduxItem)
          //     }
          //   })
          // })
          let identifier = {id: currentMsg.source.id, properties: []}
          identifier.properties.push({ amazon : self.state.rawAmazonResults.slice(0)})
          identifier.properties.push({ searchSelect : self.state.searchSelect })
          identifier.properties.push({ lastAction : self.state.lastAction })
          actions.setMessageProperty(identifier)
          self.state.lastSeen = [];
     }
     
     //Load redux state into local state for next channel
     let nextItems = []
     if (nextMsg) {
      //Load items into state for next channel 
       try {
           for (var i = 0; i < nextMsg.amazon.length; i++) {
            let item = { index: null, id: null, name: null, price: null, changed: true}
            item.index = i
            item.id = nextMsg.amazon[i].ASIN[0]
            item.name = nextMsg.amazon[i].ItemAttributes[0].Title[0]
            item.price = nextMsg.amazon[i].realPrice ? nextMsg.amazon[i].realPrice : (nextMsg.amazon[i].ItemAttributes[0].ListPrice ? nextMsg.amazon[i].ItemAttributes[0].ListPrice[0].FormattedPrice[0] : null )
            try {
               let imageURL;
              if (nextMsg.amazon[i].MediumImage && nextMsg.amazon[i].MediumImage[0].URL[0]){
                  imageURL = nextMsg.amazon[i].MediumImage[0].URL[0];
              }
              else if (nextMsg.amazon[i].ImageSets && nextMsg.amazon[i].ImageSets[0].ImageSet && nextMsg.amazon[i].ImageSets[0].ImageSet[0].MediumImage && nextMsg.amazon[i].ImageSets[0].ImageSet[0].MediumImage[0]){
                  imageURL = nextMsg.amazon[i].ImageSets[0].ImageSet[0].MediumImage[0].URL[0];
              }
              else if (nextMsg.amazon[i].altImage){
                  imageURL = nextMsg.amazon[i].altImage;
              }
              else {
                  console.log('NO IMAGE FOUND ',item);
                  imageURL = 'http://kipthis.com/img/kip-cart.png'; 
              }
              item.img = imageURL
            } catch(err) {
              console.log('Could not get image for item: ',i)
            }
            nextItems.push(item)
          } 
            // console.log('Checking if state items transferred CPanel175: ',firstMsg, nextItems)
          //Load lastAction for next channel
          // if (nextMsg.lastAction) {
            self.setState({ lastAction: nextMsg.lastAction, rawAmazonResults: nextMsg.amazon })
          // }
        } catch(err) {
          console.log('CPanel Error 169 Could not get results :',err)
          return
        } 

     }

    if (nextMsg && nextItems.length > 0) {
        self.setState({ items: nextItems })
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
        }]})
      }

     //-Reset local state params as necessary
      self.state.msg =  nextMsg.msg
      self.state.bucket =  nextMsg.bucket
      self.state.action =  nextMsg.action
      self.state.spinnerloading = false
      self.setState({modifier: { color: null, size: null}})
      self.state.color = false
      self.state.size = false
      self.state.searchParam = ''
      self.state.focusInfo = null
      self.state.count = 0
      self.state.lastAction = nextMsg.lastAction;
      self.forceUpdate()
    })
  //---------------------------------------------------------//

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
    const {activeMsg, activeChannel,messages} = this.props
    const selected = this.state.searchSelect
    const self = this;
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
    let newQuery = {}
    newQuery.source = activeMsg.source
    newQuery.source.org = activeChannel.id.split('_')[0]
    newQuery.id = messages.length
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
    let thread = activeMsg.thread
    thread.parent.id = activeMsg.thread.id
    thread.parent.isParent = false;
    newQuery.thread = thread
    // newQuery.client_res.unshift('Hi, here are some options you might like. Use `more` to see more options or `buy 1`, `2` or `3` to get it now 😊')
    this.setState({
      spinnerloading: true,
      searchParam: '',
      bucket: 'search',
      action: 'initial'
    })
    socket.emit('new message', newQuery);
    self.setState({lastAction: newQuery.action})
    setTimeout(function(){
      if (self.state.spinnerloading === true) {
         self.setState({
            spinnerloading: false
          })
      }
     },8000)
    document.querySelector('#search-input').value = ''
  }

  searchSimilar() {
    const { activeMsg, activeChannel, messages } = this.props
    const selected = this.state.searchSelect
    const self = this
    if (selected.length === 0 || !selected[0] || !this.state.rawAmazonResults) {
      console.log('Please select an item or do an initial search.')
      return
    }
    let newQuery = {}
    newQuery.source = activeMsg.source
    newQuery.source.org = activeChannel.id.split('_')[0]
    newQuery.id = messages.length
    if (newQuery._id) {
      delete newQuery._id
    }
    newQuery.bucket = 'search'
    newQuery.action = 'similar'
    newQuery.flags = {}
    newQuery.flags.toCinna = true
    newQuery.flags.recalled = true
    let thread = activeMsg.thread
    thread.parent.id = activeMsg.thread.id
    thread.parent.isParent = false;
    newQuery.thread = thread
    // newQuery.tokens = newQuery.msg.split()
    newQuery.source.origin = 'supervisor';
    newQuery.recallHistory =  { amazon: this.state.rawAmazonResults}
    newQuery.amazon =  this.state.rawAmazonResults
    newQuery.searchSelect = selected
    // console.log('Form209-searchSimilar(): newQuery: ',newQuery)
    socket.emit('new message', newQuery);
    this.setState({
      spinnerloading: true
    })
    self.setState({lastAction: newQuery.action})
    setTimeout(function(){
      if (self.state.spinnerloading === true) {
         self.setState({
            spinnerloading: false
          })
      }
     },8000)
  }

  searchModify() {
    let { activeMsg, activeChannel, messages } = this.props;
    let selected = this.state.searchSelect
    let modifier = this.state.modifier
    let dataModify = { type: '', val: [] }
    let self = this;
    if (selected.length > 1 || !selected[0] || !this.state.rawAmazonResults) {
      console.log('Please select one item.')
      return
    }
    let key = Object.keys(modifier)[0]
    let value = document.querySelector('#modify-color').value ? document.querySelector('#modify-color').value : (document.querySelector('#modify-size').value ? document.querySelector('#modify-size').value : document.querySelector('#modify-price').value )
    // console.log(key,value)
    switch(key) {
      case 'color': 
        if(isColor(value)){
          dataModify.type = 'color'
          dataModify.val = colorHex(value)
        } else {
          console.log('Not a color!')
          return
        }
        break;
       case 'size': 
        let size_names = [
        'xs',
        's',
        'm',
        'l',
        'xl',
        'xxl',
        'xxxl',
        'small',
        'medium',
        'large',
        'extra large',
        'extra small'
        ];
        if (findIndex(size_names, function(el) { return el === value })  > -1) {
           dataModify.type = 'size'
           dataModify.val = value
        } else {
          return
        }
        break;
      // case 'price': 
      //   dataModify = priceModify(value)
      //   console.log('Cpanel433 dataModify: ', dataModify)
      //   break;
      case 'brand': 
        break;
   
    }
    let newQuery = {}
    newQuery.msg = value
    newQuery.tokens = [value]
    newQuery.dataModify = dataModify
    newQuery.source = activeMsg.source
    newQuery.source.org = activeChannel.id.split('_')[0]
    newQuery.id = messages.length
    newQuery.bucket = 'search'
    newQuery.action = 'modify'
    newQuery.source.origin = 'supervisor'
    newQuery.recallHistory =  { amazon: this.state.rawAmazonResults}
    newQuery.searchSelect = selected
    newQuery.flags = {}
    newQuery.flags.toCinna = true
    newQuery.flags.recalled = true
    let thread = activeMsg.thread
    thread.parent.id = activeMsg.thread.id
    thread.parent.isParent = false;
    newQuery.thread = thread
    socket.emit('new message', newQuery);
    this.setState({
      spinnerloading: true
    })
    self.setState({lastAction: newQuery.action})
    setTimeout(function(){
      if (self.state.spinnerloading === true) {
         self.setState({
            spinnerloading: false
          })
      }
     },8000)
  }

  searchMore() {
    const { activeMsg, messages, activeChannel} = this.props
    // const newQuery = activeMsg;
    const selected = this.state.searchSelect
    // if (selected.length === 0 || !selected[0] || !this.state.rawAmazonResults) {
    //   console.log('Please select an item or do an initial search.')
    //   return
    // }
    const self = this
    let newQuery = {}
    newQuery.msg = 'more'
    newQuery.source = activeMsg.source
    newQuery.source.org = activeChannel.id.split('_')[0]
    newQuery.id = messages.length
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
    let thread = activeMsg.thread
    thread.parent.id = activeMsg.thread.id
    thread.parent.isParent = false;
    newQuery.thread = thread
    socket.emit('new message', newQuery);
    this.setState({
      spinnerloading: true
    })
    self.setState({lastAction: newQuery.action})
    setTimeout(function(){
      if (self.state.spinnerloading === true) {
         self.setState({
            spinnerloading: false
          })
      }
     },8000)
  }

  searchFocus(selected) {
    const { activeMsg, messages, activeChannel} = this.props
    const lastSeen = this.state.lastSeen
    const self = this
    if (!selected || !this.state.lastSeen) {
      console.log('Please select an item or do an initial search.')
      return
    }
    this.setField('focus')
    console.log('firing searchFocus: selected: ',selected, lastSeen)
    let newQuery = {}
    newQuery.msg = selected
    newQuery.source = activeMsg.source
    newQuery.source.org = activeChannel.id.split('_')[0]
    newQuery.id = messages.length
    newQuery.bucket = 'search'
    newQuery.action = 'focus'
    newQuery.source.origin = 'supervisor';
    newQuery.recallHistory =  { amazon: lastSeen.slice(0)}
    UserAPIUtils.urlShorten({url: lastSeen[selected-1].DetailPageURL[0]}).then(function(res){
      newQuery.recallHistory.urlShorten = [res.body]
      // console.log('Cpanel490: ',newQuery.recallHistory.urlShorten)
      newQuery.amazon =  lastSeen.slice(0)
      newQuery.searchSelect = [selected]
      newQuery.flags = {}
      newQuery.flags.toCinna = true
      newQuery.flags.recalled = true
      let thread = activeMsg.thread
      thread.parent.id = activeMsg.thread.id
      thread.parent.isParent = false;
      newQuery.thread = thread
      socket.emit('new message', newQuery);
      self.setState({
        spinnerloading: true
      })
      self.setState({lastAction: newQuery.action})
      setTimeout(function(){
        if (self.state.spinnerloading === true) {
           self.setState({
              spinnerloading: false
            })
        }
       },8000)
    }).catch(function(err){
        console.log('Cpanel511: urlShorten error: ',err)
    })
  }

  checkOut(selected) {
    const { activeMsg, messages, activeChannel } = this.props;
    if (!selected || !this.state.lastSeen) {
      console.log('Please select an item or do an initial search.')
      return
    }
    const self = this;
    console.log('checkOut(), selected: ',selected)
    this.setField('checkout')
    let newQuery = {}
    newQuery.msg = 'more'
    newQuery.source = activeMsg.source
    newQuery.source.org = activeChannel.id.split('_')[0]
    newQuery.id = messages.length
    if (newQuery._id) {
      delete newQuery._id;
    }
    newQuery.bucket = 'purchase';
    newQuery.action = 'checkout';
    newQuery.tokens = newQuery.msg.split();
    newQuery.source.origin = 'supervisor';
    newQuery.recallHistory =  { amazon: this.state.lastSeen}
    newQuery.amazon = this.state.lastSeen
    newQuery.searchSelect = [selected];
    newQuery.msg = 'buy ' + newQuery.selected
    newQuery.flags = {}
    newQuery.flags.toCinna = true
    newQuery.flags.recalled = true
    let thread = activeMsg.thread
    thread.parent.id = activeMsg.thread.id
    thread.parent.isParent = false;
    newQuery.recallHistory.thread = thread 
    newQuery.thread = thread
    socket.emit('new message', newQuery);
    this.setState({
      spinnerloading: true
    })
    self.setState({lastAction: newQuery.action})
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

  picStitch(items) {
    return new Promise(function(resolve, reject) {
        let toStitch = [];
        items.forEach(function(item){
           if (item){
              let price;
              if (item.realPrice){
                price = item.realPrice;
              }
              else{ 
                if (!item.ItemAttributes[0].ListPrice){
                    price = ''; //price missing, show blank
                }
                else{
                    if (item.ItemAttributes[0].ListPrice[0].Amount[0] == '0'){
                        price = '';
                    }
                    else {
                        // add price
                        price = item.ItemAttributes[0].ListPrice[0].FormattedPrice[0];
                    }
                }                     
              }
              if(price == 'Add to cart to see product details. Why?' || price == 'Too low to display' || price == 'See price in cart'){
                price = '';
              }
              let primeAvail = 0;
              if (item.Offers && item.Offers[0].Offer && item.Offers[0].Offer[0].OfferListing && item.Offers[0].Offer[0].OfferListing[0].IsEligibleForPrime){
                  primeAvail = item.Offers[0].Offer[0].OfferListing[0].IsEligibleForPrime[0];
              }

              let imageURL;
              if (item.MediumImage && item.MediumImage[0].URL[0]){
                  imageURL = item.MediumImage[0].URL[0];
              }
              else if (item.ImageSets && item.ImageSets[0].ImageSet && item.ImageSets[0].ImageSet[0].MediumImage && item.ImageSets[0].ImageSet[0].MediumImage[0]){
                  imageURL = item.ImageSets[0].ImageSet[0].MediumImage[0].URL[0];
              }
              else if (item.altImage){
                  imageURL = item.altImage;
              }
              else {
                  console.log('NO IMAGE FOUND ',item);
                  imageURL = 'https://pbs.twimg.com/profile_images/425274582581264384/X3QXBN8C.jpeg'; //TEMP!!!!
              }
              if(item.reviews && item.reviews.rating == 0){
                delete item.reviews;
              }
              if (item && item.ItemAttributes && item.ItemAttributes[0].Title){
                toStitch.push({
                    url: imageURL,
                    price: price,
                    prime: primeAvail, //is prime available?
                    name: item.ItemAttributes[0].Title[0].trim(),
                    reviews: item.reviews
                });                      
              }
              else {
                toStitch.push({
                    url: imageURL,
                    price: price,
                    prime: primeAvail, //is prime available?
                    name: '',
                    reviews: item.reviews
                });                       
              }
          }
          else {
              console.log('IMAGE MISSING!',item);
          }
        })
        UserAPIUtils.stitch(toStitch).then(function(res){
           return resolve(res.body);
        }).catch(function(err){
          return resolve();
        })
    })
  }

  sendCommand() {
    const { activeChannel, actions, activeMsg, messages } = this.props
    const { rawAmazonResults, searchSelect, bucket, action, items} = this.state
    let newMessage = { client_res: []}
    newMessage.bucket = bucket
    newMessage.action = action
    newMessage.source = activeMsg.source
    newMessage.source.org = activeChannel.id.split('_')[0]
    newMessage.id = messages.length
    newMessage.flags = {toClient: true}
    newMessage.amazon = rawAmazonResults ? rawAmazonResults : null
    newMessage.source.origin = 'slack'
    let thread = activeMsg.thread
    thread.parent.id = activeMsg.thread.id
    thread.parent.isParent = false;
    newMessage.thread = thread
    thread.sequence = parseInt(activeMsg.thread + 1)
    let item1, item2, item3;
    switch(searchSelect.length) {
      case 0:
        item1 = rawAmazonResults[0];
        item2 = rawAmazonResults[1];
        item3 = rawAmazonResults[2];
        break;
      case 1: 
        item1 = rawAmazonResults[searchSelect[0]-1];
        let temp = rawAmazonResults.slice(0);
        temp.splice(searchSelect[0]-1,1);
        item2 = temp[0]
        item3 = temp[1]
        break;
      case 2: 
        item1 = rawAmazonResults[searchSelect[0]-1];
        item2 = rawAmazonResults[searchSelect[1]-1];
        let temp1 = rawAmazonResults.slice(0)
        temp1.splice(searchSelect[0]-1,1);
        temp1.splice(searchSelect[1]-1,1);
        item3 = temp1[0];
        break;
      case 3: 
        item1 = rawAmazonResults[searchSelect[0]-1];
        item2 = rawAmazonResults[searchSelect[1]-1];
        item3 = rawAmazonResults[searchSelect[2]-1];
        break;
      default:
        item1 = rawAmazonResults[0];
        item2 = rawAmazonResults[1];
        item3 = rawAmazonResults[2];
    }
    const self = this;
    let toStitch = [item1,item2,item3]
    // console.log('toStitch: ', toStitch)
    if (newMessage.action == 'focus') {
        newMessage.client_res = this.state.client_res
        newMessage.focusInfo = this.state.focusInfo
        newMessage.searchSelect = searchSelect
        console.log('Cpanel649: Send Command: ', newMessage)
        socket.emit('new message', newMessage);
        self.setState({sendingToClient: true})
        setTimeout(function(){
          self.setState({sendingToClient: false})
        }, 1500)
      } else if (newMessage.action == 'checkout') {
          UserAPIUtils.urlShorten({url: this.state.client_res[0]}).then(function(res){
            newMessage.client_res = [res.body]
            socket.emit('new message', newMessage);
            self.setState({
              spinnerloading: true
            })
            setTimeout(function(){
              if (self.state.spinnerloading === true) {
                 self.setState({
                    spinnerloading: false
                  })
              }
             },8000)
          }).catch(function(err){
              console.log('Cpanel511: urlShorten error: ',err)
          })

      } else {
         this.picStitch(toStitch).then(function(url){
            if (url && self.state.client_res) {
              let text = ''
             switch (newMessage.action){
              case 'initial':
              case 'more':
                text = 'Hi, here are some options you might like. Use `more` to see more options or `buy 1`, `2` or `3` to get it now 😊'
                break;
              case 'similar':
                text = 'We found some options similar to '+ searchSelect[0] +', would you like to see their product info? Just use `1`, `2` or `3` or `help` for more options';
                break;
              case 'checkout':
                text = 'Great! Please click the link to confirm your items and checkout. Thank you 😊';
                break;
              default:
                text = 'Hmm, something went wrong.'          
             } 
              newMessage.client_res.push(text)
              newMessage.client_res.push(url)
            }
            console.log('Cpanel649: Send Command: ', newMessage)
            socket.emit('new message', newMessage);
            self.setState({sendingToClient: true})
            setTimeout(function(){
              self.setState({sendingToClient: false})
            }, 1500)
        }).catch(function(err) {
          console.log('***Cpanel653: ERROR: Picstitch FAILED: ',err)
        })
      }

      //Store the last items client SAW in state 
      if (newMessage.action !== 'focus' && newMessage.action !== 'checkout' ) {
        if (!searchSelect || searchSelect.length == 0 ) {
          let lastSeen = [];
          rawAmazonResults.forEach(function(item){
            let temp = Object.assign({},item)
            lastSeen.push(temp)
          })
          this.setState({lastSeen: lastSeen.slice(0)})
        } else {
            for (var i = 0; i < searchSelect.length; i++) {
              let selectedItem = rawAmazonResults[searchSelect[i]-1]
              let residentItem = rawAmazonResults[i]
              newMessage.amazon[i] = selectedItem
              newMessage.amazon[searchSelect[i]-1] = residentItem
            }
         self.setState({lastSeen: newMessage.amazon.slice(0)})
        } 
      }

      // let itemOneOld = Object.assign({},items[0])
      // let itemTwoOld = Object.assign({}, items[1])
      // let itemThreeOld = Object.assign({}, items[2])
      // let itemOneNew = Object.assign({},items[searchSelect[0]-1])
      // let itemTwoNew = Object.assign({}, items[searchSelect[1]-1])
      // let itemThreeNew = Object.assign({}, items[searchSelect[2]-1])
     
      // console.log('LASTSEEN: ',this.state.lastSeen, lastSeen)
      //Reorder items in state if searchselected
      // if (searchSelect && searchSelect.length > 0 && newMessage.amazon && rawAmazonResults && ('initialsimilarmodifymore'.indexOf(newMessage.action) > -1)) {    
      //       for (var i = 0; i < searchSelect.length; i++) {
      //         let selectedItem = rawAmazonResults[searchSelect[i]-1]
      //         let residentItem = rawAmazonResults[i]
      //         newMessage.amazon[i] = selectedItem
      //         newMessage.amazon[searchSelect[i]-1] = residentItem
      //       }
      //    self.setState({rawAmazonResults: newMessage.amazon})
      // }
  }



  //This function selects items for top 3
  handleClick(index) {
    // let count = this.state.count
    switch (this.state.searchSelect.length) {
      case 0:
           // this.setState(update(this.state, {searchSelect: {$push: [index]}}));
      case 1:
      case 2:
          if (!some(this.state.searchSelect, function(el){ return el === index}) ) {
           this.setState(update(this.state, {searchSelect: {$push: [index]}}));
          }
          // console.log('searchSelect updated: ',this.state.searchSelect)
         break;
      case 3:
          this.setState({searchSelect: []})
          // this.setState(update(this.state, {searchSelect: []}));   
          // console.log('searchSelect updated: ',this.state.searchSelect)  
         break;
      default:
        return
    } 
  }


  handleChange(field, e) {
    const self = this
    if(field.target.value == ''){
       document.querySelector('#modify-color').disabled = false
       document.querySelector('#modify-size').disabled = false
       self.setState({ modifier: {}})
    } else {
    switch(field.target.id) {
      case 'modify-color':
        document.querySelector('#modify-size').disabled = true
        // document.querySelector('#modify-price').disabled = true
        let modifier = {color : document.querySelector('#modify-color').value}
        self.setState({ modifier: modifier })
        break;
      case 'modify-size':
        document.querySelector('#modify-color').disabled = true
        // document.querySelector('#modify-price').disabled = true
        let modifier2 = {size : document.querySelector('#modify-size').value}
        self.setState({ modifier: modifier2 })
        break;
      // case 'modify-price':
      //   document.querySelector('#modify-color').disabled = true
      //   document.querySelector('#modify-size').disabled = true
      //   let modifier3 = {price : document.querySelector('#modify-price').value}
      //   self.setState({ modifier: modifier3 })
      //   break;
      }
    }

  }

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
                    />
          </div>   
      )
    }

  render() {
     const { activeMsg, activeControl, activeChannel, messages,actions,changeMode} = this.props;
     // const fields  = ['msg','bucket','action']
     const self = this;
     const { items,searchSelect,rawAmazonResults } = this.state;
     const list = (this.state.mounted)? <ReactList itemRenderer={::this.renderItem} length={this.state.items.length} type='simple' /> : null
     const statusText = activeChannel.resolved ? 'CLOSED' : 'OPEN'
     const statusStyle = activeChannel.resolved ?  { fontSize:'3em' ,color: 'green'} : { fontSize:'3em',color: 'red'}
     const sendDisabled = activeChannel.resolved || this.state.sendingToClient ? true : false
     const showSearchBox = this.state.action === 'initial' ? {textAlign: 'center', marginTop: '5em'} : {display: 'none'};
     const showSimilarBox = this.state.action === 'similar' ? { textAlign: 'center', marginTop: '5em'} : {display: 'none'};
     const showModifyBox = this.state.action === 'modify' ? { textAlign: 'center', marginTop: '0.1em'} : {display: 'none'};
     const showFocusBox = this.state.action === 'focus' ? { textAlign: 'center', marginTop:'0.4em'} : { display: 'none'};
     const showMoreBox = this.state.action === 'more' ? { textAlign: 'center', marginTop:'0.4em'} : { display: 'none'};
     const showPrompt = (!searchSelect || searchSelect.length === 0) ? { color: 'black'} : { color: 'white'}
     const showCheckoutBox = this.state.action === 'checkout' ? { textAlign: 'center', marginTop:'0.4em'} : { display: 'none'};
     const spinnerStyle = (this.state.spinnerloading === true) ? {backgroundColor: 'orange',color: 'black'} : {backgroundColor: 'orange',color: 'orange',display: 'none'}
     const focusInfoStyle = this.state.focusInfo ? { fontSize: '0.9em', textAlign: 'left', margin: 0, padding: 0, border: '1px solid black'} : { display: 'none'}
     const selectedStyle = this.state.lastSeen ? {} : { display: 'none'}
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
                  <h3 style={showPrompt}> Please select an item. </h3>
                  <div>
                     <label>Color: <input type="text" id="modify-color" onChange={this.handleChange.bind(this)} /> </label> <br /> <br />
                     <label>Size: <input type="text" id="modify-size" onChange={this.handleChange.bind(this)} />  </label> <br /> <br />
                  </div>
                  <Button bsSize = "large" disabled={(!searchSelect || searchSelect.length ===  0) || this.state.spinnerloading || !this.state.modifier} style={{ marginTop: '0.01em', backgroundColor: 'orange'}} bsStyle = "primary" onClick = { () => this.searchModify()} >
                    Search Modify
                    <div style={spinnerStyle}>
                      <Spinner />
                    </div>
                  </Button>
            </div>

            <div id="focus-box" style={showFocusBox}>
                          <div style={focusInfoStyle}> 
                               {this.state.client_res}
                          </div>
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
                 <a href={this.state.client_res}> Item checkout link.  </a>
            </div>

            <div  style={{fontSize: '0.6em', position: 'fixed', bottom:'20%',maxWidth: '15em',textAlign: 'center'}} >
                   <h5 style={{textAlign: 'center'}}>Last seen by client: </h5>
               <div className='flexbox-container'>
                   <div>
                     <img width='75' height='75' src={(this.state.lastSeen && this.state.lastSeen[0]) ? this.state.lastSeen[0].SmallImage[0].URL[0] : null}  />  
                   </div>  
                   <div style={{padding:'0', marginLeft:'20%'}}>  
                     <Button bsSize='xsmall' bsStyle='info' className="form-button" style={selectedStyle} onClick = { () => this.searchFocus(1) } >
                         Focus
                     </Button>
                     <Button bsSize='xsmall' bsStyle='info' className="form-button" style={selectedStyle} onClick = { () => this.checkOut(1)} >
                         Checkout
                     </Button>
                   </div>  
              </div>
             <div className='flexbox-container'>    
               <div>
                <img width='75' height='75' src={(this.state.lastSeen && this.state.lastSeen[1])  ? this.state.lastSeen[1].SmallImage[0].URL[0] : null}  />
               </div> 
               <div style={{padding:'0', marginLeft:'20%'}}>  
                 <Button bsSize='xsmall' bsStyle='info' className="form-button" style={selectedStyle} onClick = { () => this.searchFocus(2)} >
                       Focus
                 </Button>
                 <Button bsSize='xsmall' bsStyle='info' className="form-button" style={selectedStyle} onClick = { () => this.checkOut(2)} >
                       Checkout
                  </Button>
               </div>
              </div>
            <div className='flexbox-container'>    
                <div>
                 <img width='75' height='75' src={(this.state.lastSeen && this.state.lastSeen[2])  ? this.state.lastSeen[2].SmallImage[0].URL[0] : null}  />
                </div>
                 <div style={{padding:'0', marginLeft:'20%'}}>  
                   <Button bsSize='xsmall' bsStyle='info' className="form-button" style={selectedStyle} onClick = { () => this.searchFocus(3)} >
                       Focus
                   </Button>
                   <Button bsSize='xsmall' bsStyle='info' className="form-button" style={selectedStyle} onClick = { () => this.checkOut(3)} >
                       Checkout
                     </Button>
                 </div>
               </div>
            </div>
              <Button block bsSize = "large" style={{ position: 'fixed', bottom:'10%',maxWidth: '15em',textAlign: 'center', backgroundColor: '#1de9b6' }} bsStyle = "danger" onClick = { () => this.sendCommand(activeMsg)} disabled={sendDisabled} >
              SEND TO CLIENT: { self.state.lastAction ? self.state.lastAction.toUpperCase() : '' } 
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
                <form ref='form1' onSubmit={::this.handleSubmit}>
                    <div style={{ display: 'flexbox', textAlign:'center',marginTop: '0.8em' }}>
                      <ButtonGroup bsSize = "medium" bsStyle = "primary"  style={{margin: '0.2em'}}>
                        <Button className="form-button" style={{backgroundColor: '#1976d2', color: 'white'}} onClick = { () => this.setField('initial')} >
                          Initial
                        </Button>
                        <Button className="form-button" style={{backgroundColor:  '#1976d2', color: 'white'}} onClick = { () => this.setField('similar')} >
                          Similar
                        </Button>
                        <Button className="form-button" style={{backgroundColor:  '#1976d2', color: 'white'}} onClick = { () => this.setField('modify')} >
                          Modify
                        </Button>
                        <Button className="form-button" style={{backgroundColor:  '#1976d2', color: 'white'}} onClick = { () => this.setField('more')} >
                          More
                        </Button>
                      </ButtonGroup>
                    </div>
                  </form> 
                  <div style={{overflow: 'auto', maxHeight: 570, maxWidth: '95%',border: 'grey solid 0.3em'}}>
                    {list}
                  </div>

            </div>
        </div>
      );
  }
}

//Helper functions
Array.prototype.move = function(from, to) {
    this.splice(to, 0, this.splice(from, 1)[0]);
};
function uniq(a) {
    var seen = {};
    return a.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}



export default ControlPanel