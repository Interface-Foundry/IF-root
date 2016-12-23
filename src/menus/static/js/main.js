var choiceBus = new Vue({})

Vue.component('choice', {
  template: '#choice',
  props: ['choice', 'type', 'option'],
  data: function() {
    return {
      selected: false,
      maxSelection : this.option.max_selection,
      minSelection : this.option.min_selection,
    }
  },
  methods: {
    selectChoice: function() {
      // toggle selected data for checkbox options
      if (this.type === "checkbox") {
        this.selected = !this.selected
      }
       
      // set selected on radio to true and all other radios to false
      if (this.type === "radio") {
        choiceBus.$emit('radio-selected', this.choice) 
      }
      
      var selectedOption;
      var selectedKey;
      
      _.pickBy(this.$parent.$parent.options, function(val, key) {
        selectedOption = val;
        selectedKey = key; 
      });

      // find choice's option in SelectedItem's options to calculate when we hit max and min selections
      if (this.type === "checkbox" && this.option.id === selectedKey && this.selected) {
        if (selectedOption.choices.length >= this.maxSelection) {
          this.selected = false;
          alert("You can only select " + this.maxSelection + " choices.")
          return
        }
        
        /*
        if (selectedOption.choices.length < this.minSelection) {
          this.$parent.remaining = (this.minSelection - (selectedOption.choices.length + 1)) 
        }
        } else if (this.selected) {
          this.$parent.remaining = (this.minSelection - 1)
        
        */
      }
      //add or subtract choice from option's cost
      if (this.choice.price && this.type == "checkbox") {
        if (this.$parent.cost) {
          this.selected ? this.$parent.cost += this.choice.price : this.$parent.cost -= this.choice.price
        } else {
          this.$parent.cost = this.choice.price
        }
      }

      if (this.choice.price && this.type == "radio") {
        this.$parent.cost = this.choice.price
      }

      var options = this.$parent.$parent.options;
      var option = this.option;
      var newOptions = options || {};     
      var choice = this.choice;

      if (this.type === "radio") {
        newOptions[option.id] = {}
        newOptions[option.id].option = option
        newOptions[option.id].choices = []
        newOptions[option.id].choices.push(choice)
      } 
      if (this.type === "checkbox" && this.selected) {
        var choiceExists;
        if (option.id in newOptions) {
          // loop through all choices to see if choice exists already
          newOptions[option.id].choices.forEach(function(c) {
            if (c.id === choice.id) {
              choiceExists = true;
            } 
          }) 
          if (!choiceExists) {
            //if option exists but choice doesn't exist, add choice
            newOptions[option.id].choices.push(choice)             
          }
        } 
        else {
          //option doesn't exist yet so create it and the choice
          newOptions[option.id] = {}
          newOptions[option.id].option = option
          newOptions[option.id].choices = []
          newOptions[option.id].choices.push(choice) 
        }
      } 
      if (this.type === "checkbox"  && !this.selected) {
        newOptions[option.id].choices.forEach(function(c) {
          if (c.id === choice.id) {
            var i = _.indexOf(newOptions[option.id].choices, choice)
            newOptions[option.id].choices.splice(i, 1)                   
          }    
        })
      }
      
      newOptions[option.id].option.cost = this.$parent.cost           
      if (this.type === "checkbox") {
        if (option.id in newOptions && !newOptions[option.id].choices.length) {
          delete newOptions[option.id]
        }           
      }     
      this.$emit('options', newOptions)
    }
  },
  created: function() {
    var choice = this.choice;
    var options = this.$parent.$parent.options;
    var that = this;
    
    _.forOwn(options, function(value, key) {
        value.choices.forEach(function(c) {
          if (c.id === choice.id) {
            that.selected = true
          }
        })
    })
    
    choiceBus.$on('radio-selected', function(selectedChoice) {
      if (that.type === "radio" && that.choice.id == selectedChoice.id && !that.selected) {
          that.selected = true; 
      } else {
        that.selected = false;
      }
    })
  }
})

Vue.component('option-set', {
  props: ['option', 'item'],  
  template: '#option-set',  
  data: function() {
    return {
      inputType: "", 
      cost: this.option.cost || 0,
      //remaining: this.option.min_selection,
      minSelection: this.option.min_selection
    }
  },
  methods: {
    updateOptions: function(options) {
      /*
      var children = this.$children;
      children.forEach(function(child) {
        if (child.selected) { this.remaining -= 1 }
      })  
      */
      this.$emit('setOptions', options)
    }
  },
  created: function() {
    if (this.option.max_selection === 1 && this.option.type === "price group") {
      this.inputType = "radio"
    } 
    else {
      this.inputType = "checkbox"
    }

  }
})


Vue.component('cart-item', {
  props: ['item'],  
  template: '#cart-item',
  methods: {
    editItem: function() {
      this.$emit('edit')
    },
    removeItem: function() {
      this.$emit('remove', this.item)
    }    
  }
})

Vue.component('edit-item', {
  props: ['item'],  
  template: '#edit-item',
  data: function() {
    return {
      quantity: this.item.quantity,
      instructions: this.item.instructions,
      options: this.item.options,
      editedItem: {},
      optionsCost: this.item.optionsCost      
    }
  },
  methods: {
    increaseQty: function() {
      if(this.quantity > 0 && this.quantity < this.item.max_qty) {
        this.quantity += 1 
      }  
    },
    decreaseQty: function() {
      if(this.quantity > this.item.min_qty) {
        this.quantity -= 1;
      }          
    },
    updateItem: function() {
      this.editedItem.quantity = this.quantity
      this.editedItem.options = this.options     
      this.editedItem.totalPrice = this.totalPrice
      this.editedItem.instructions = this.instructions   
      this.editedItem.optionsCost = this.optionsCost
      var newItem = _.assign({},this.item, this.editedItem) 
      var i = _.indexOf(this.$parent.cartItems, this.item);
      this.$set(this.$parent.cartItems, i, newItem)
      this.$emit('close')
    },
    setOptions: function(options) {
      var that = this;
      var cost = 0; 
      if (_.isEmpty(options)) { this.optionsCost = 0; return; }
      
      _.forOwn(options, function(val, key) {
        if (val.option.cost) {
          cost += val.option.cost      
        }
      }) 
      this.optionsCost = cost;
      this.options = options;
    } 
  },
  computed: { 
    totalPrice: function() {
      var totalPrice = ((this.item.price * this.quantity) + this.optionsCost);
      return totalPrice    
    }    
  },
})

Vue.component('category-item', {
  props: ['item'],  
  template: '#category-item',
  methods: {
    selectItem: function() {
      this.$emit('show')
    }
  },
})


Vue.component('selected-item', {
  template: '#item-detail',
  props: ['item'],
  data: function() {
    return {
      options: {},
      instructions: "",
      quantity: 0,
      selectedItem: {},
      optionsCost: 0,
    }
  },
  methods: {
    addItemToCart: function() {
      this.selectedItem.quantity = this.quantity
      this.selectedItem.options = this.options    
      this.selectedItem.optionsCost = this.optionsCost
      this.selectedItem.totalPrice = this.totalPrice
      this.selectedItem.instructions = this.instructions    
      var newItem = _.assign({},this.item, this.selectedItem)
      this.$parent.addItemToCart(newItem)
      this.$emit('close')
    },
    increaseQty: function() {
      if(this.quantity > 0 && this.quantity < this.item.max_qty) {
        this.quantity += 1 
      }  
    },
    decreaseQty: function() {
      if(this.quantity > this.item.min_qty) {
        this.quantity -= 1;
      }          
    },
    setOptions: function(options) {
      this.options = options;
      var that = this;
      this.optionsCost = 0
      if (_.isEmpty(this.options)) { this.optionsCost = 0 }
      _.forOwn(this.options, function(val, key) {
        if (val.option.cost) {
          that.optionsCost += val.option.cost        
        }
      })      
    }
  },
  computed: {
    totalPrice: function() {
      var totalPrice = ((this.item.price * this.quantity) + this.optionsCost);
      return totalPrice
    }
  },
  created: function() {
    if (this.item.min_qty) {
      this.quantity = this.item.min_qty
    } else {
      this.quantity = 1
    }
  }
})


var app = new Vue({
  el: "#app",
  data: {
    merchant: "",
    menu: "",
    navCategories: null,
    moreCategories: null,
    selectedItem: null,
    editingItem: null,
    cartItems: [],
    reachedMinimum: false
  },
  methods: {
    setSelectedItem: function(item) {
      this.selectedItem = item
    },
    addItemToCart: function(item) {
      this.cartItems.push(item)
    },
    setEditItem: function(item) {
      this.editingItem = item
    },
    removeItem: function(item) {
      var i = _.indexOf(this.cartItems, item);
      this.cartItems.splice(i, 1)       
    }
  },
  computed: {
    cartItemsTotal: function() {
      var total = 0;
      for (var i = 0; i < this.cartItems.length; i++) {
        total += parseFloat(this.cartItems[i].totalPrice)
      }
      return parseFloat(total);
    },
    cartItemsQty: function() {
      var qty = 0;
      for (var i = 0; i < this.cartItems.length; i++) {
        qty += this.cartItems[i].quantity
      }
      return qty
    },
    taxAmount: function() {
      var tax = (this.cartItemsTotal * .075)
      return tax 
    },
    totalCartAmount: function() {
      var amount = (this.cartItemsTotal + this.taxAmount)
      return amount
    },
    showCart: function() {
     return this.cartItems.length ? true : false
    },
    minimumMet: function() {
      if (this.merchant.minimum) {
        return this.cartItemsTotal >= this.merchant.minimum ? true : false 
      } else {
        return true
      }
    }
  },
  watch: {
    menu: function() {
      this.navCategories = this.menu.slice(0, 5)
      this.moreCategories = this.menu.slice(5, -1)
    } 
  },
  created: function() {
    var key = window.location.search.split("=")[1]
    var ms = axios.post('/session', {session_token: key})
    .then((response) => {
      var menuData = response.data.menu.data
      var menu;
      if (menuData.length > 1) {
        menu = menuData
      } else {
        menu = menuData[0].children
      }
      this.menu = menu;
      this.merchant = response.data.merchant;
    })
    .catch((err) => {
    });
  }
})
