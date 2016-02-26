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
// import picstitch from '../utils/stitcher'
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
        client_res: null
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
    //-Store client_res for focus,more, and checkout commands
    if (
      // (msg.action === 'focus' || msg.action === 'more' || msg.action === 'checkout') && 
      msg.client_res && msg.client_res.length > 0) {
      // if (findIndex(self.state.client_res, function(el){ if (el) {return !((el.indexOf(msg.client_res) > -1) || (el.indexOf(msg.client_res[0]) > -1))} }) > -1 ) {
              self.setState({client_res: msg.client_res})
      // }
    }

    //Change active message in state
    // var identifier = {id: msg.source.id, properties: []}
    // for (var key in msg) {
    //   if ((
    //     key === 'amazon' || 
    //     key === 'client_res' || 
    //     key === 'searchSelect') && msg[key] !== '' ) {
    //     identifier.properties.push({ [key] : msg[key]})
    //   }
    // }  
    // if (identifier.properties.length === 0 ) {
    //   return
    // } else {
    //   actions.setMessageProperty(identifier)
    // }
  })
  //---------------------------------------------------------//

  //------------ON CHANGE CHANNEL  ---------------------------//
   socket.on('change channel bc', function(channels) {
    const filtered = self.props.messages.filter(message => message.source).filter(message => message.source.id === channels.next.id)
    const filteredOld = self.props.messages.filter(message => message.source).filter(message => message.source.id === channels.prev.id)
    const firstMsg = self.props.activeMsg
    const firstMsgOld = filteredOld[0]

    //-Emit change state event
    // socket.emit('change state', self.state);

    //Reset selected state
     // self.setState({ selected: {name: null, index: null}})

    //If there is atleast one channel existing...
    if (firstMsgOld) {
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
          let identifier = {id: firstMsgOld.source.id, properties: []}
          identifier.properties.push({ amazon : self.state.rawAmazonResults})
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
    // const newQuery = activeMsg;
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
    // const newQuery = activeMsg;
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
    if (selected.length === 0 || !selected[0] || !this.state.rawAmazonResults) {
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
    if (selected.length === 0 || !selected[0] || !this.state.rawAmazonResults) {
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
    // if (selected.length === 0 || !selected[0] || !this.state.rawAmazonResults) {
    //   console.log('Please select an item or do an initial search.')
    //   return
    // }
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
    if (selected.length === 0 || !selected[0] || !this.state.rawAmazonResults) {
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
    const { rawAmazonResults, searchSelect, bucket, action} = this.state
    let newMessage = { client_res: []}
    newMessage.bucket = bucket
    newMessage.action = action
    newMessage.source = activeMsg.source
    newMessage.source.org = activeChannel.id.split('_')[0]
    newMessage.id = messages.length
    newMessage.flags = {toClient: true}
    newMessage.amazon = rawAmazonResults ? rawAmazonResults : null
    // if (searchSelect && searchSelect.length > 0 && newMessage.amazon) {
    //     for (var i = 0; i < searchSelect.length; i++) {
    //       let selectedItem = rawAmazonResults[searchSelect[i]-1]
    //       let residentItem = rawAmazonResults[i]
    //       newMessage.amazon[i] = selectedItem
    //       newMessage.amazon[searchSelect[i]-1] = residentItem
    //     }
    //  }
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
    // console.log('SendCommand toStitch:', toStitch)
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
      newMessage.source.origin = 'slack'
      let thread = activeMsg.thread
      thread.parent.id = activeMsg.thread.id
      thread.parent.isParent = false;
      newMessage.thread = thread
      thread.sequence = parseInt(activeMsg.thread + 1)
      // if (newMessage.action === 'focus' || newMessage.action === 'checkout' || newMessage.bucket === 'purchase') {
        // if (!self.state.client_res || (self.state.client_res && self.state.client_res.length === 0)) { console.log('Cpanel244 CLIENT_RES MISSING!!!!',newMessage); return}
        // else { 
      //   }
      // } 
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
    var nextState = {}
    nextState[field] = e.target.checked
    this.setState(nextState)
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
          {this.state.searchSelect}
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
                <form ref='form1' onSubmit={::this.handleSubmit}>
                    <div style={{ display: 'flexbox', textAlign:'center',marginTop: '3em' }}>
                      <ButtonGroup bsSize = "xsmall" bsStyle = "primary"  style={{margin: '0.2em'}}>
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