var choiceBus = new Vue({})
var categoryNavBus = new Vue({})

Vue.component('choice', {
  template: '#choice',
  props: ['choice', 'type', 'option'],
  data: function() {
    return {
      selected: false,
      maxSelection : this.option.max_selection,
      minSelection : this.option.min_selection,
      optionId: this.option.id
    }
  },
  methods: {
    selectChoice: function() {
      
      if (this.$parent.required) {
        choiceBus.$emit('required:choice:selected', this.optionId) 
      }
      
      if (this.$parent.isPriceGroup) {
        this.$parent.item.price = this.choice.price;
      }

      // toggle selected data for checkbox options
      if (this.type === "checkbox") {
        this.selected = !this.selected
      }

      // set selected on radio to true and all other radios to false
      if (this.type === "radio") {
        choiceBus.$emit('radio-selected', this.choice, this.optionId, this.option)
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

      }


      //add or subtract choice from option's cost for checkboxes
      if (this.choice.price && this.type == "checkbox") {
        if (this.$parent.cost) {
          this.selected ? this.$parent.cost += this.choice.price : this.$parent.cost -= this.choice.price
        } else {
          this.$parent.cost = this.choice.price
        }
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
      if (this.type === "checkbox" && !this.selected) {
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
    
    choiceBus.$on('radio-selected', function(selectedChoice, optionId, selectedOptionSet) {
      if (that.choice.id == selectedChoice.id) {
        that.selected = true;
        that.$parent.cost = selectedChoice.price 
      } else if (that.choice.optionId == optionId){
        that.$parent.cost -= that.choice.price;                        
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
      isPriceGroup: this.option.type === "price group" ? true : false,
      minSelection: this.option.min_selection,
      required: false,
    }
  },
  methods: {
    updateOptions: function(options) {
      this.$emit('setOptions', options);
    }
  },
  created: function() {
    var that = this;
    if (this.option.min_selection === 1) {
      this.required = true;
    }
    if (this.option.max_selection === 1) {
      this.inputType = "radio"
    }
    else {
      this.inputType = "checkbox"
    }

    if (this.required) {
      choiceBus.$emit('option-set-required', this.option.id)
    }
    
    choiceBus.$on('required:choice:selected', function (optionId) {
      if (that.option.id == optionId) {
        choiceBus.$emit('required:selected', that.option.id);  
      }
    })      
    
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
        if (val.option.cost && val.option.type != "price group") {
          cost += val.option.cost
        }
      })

      this.optionsCost = cost;
      this.options = options;
    }
  },
  computed: {
    totalPrice: function() {
      var totalPrice = ((this.item.price + this.optionsCost)* this.quantity);
      return totalPrice
    }
  },
})

Vue.component('category-item', {
  props: ['item'],
  template: '#category-item',
  data: function() {
    return {
      descriptionDisplay: ""
    }
  },
  methods: {
    selectItem: function() {
      this.$emit('show')
    }
  },
  created: function() {
    this.descriptionDisplay = this.item.description        
  }
})

Vue.component('more-selector', {
  template: '#more-selector',
  props: ['categories'],
  data: function() {
    return {
      showMore: false,
    }
  },
  methods: {
    enter: function() {
      this.showMore = true
    },
    leave: function() {
      this.showMore = false
    }
  },
})

Vue.component('category-nav-item', {
  props: ['category'],
  template: '#category-nav-item',
  data: function() {
    return {
      isSelected: false,
      id: this.category.id,
      name: this.category.name
    }
  },
  methods: {
    setNavItem: function() {
      categoryNavBus.$emit('nav-item-selected', this)
    }
  },
  created: function() {
    var that = this;
    this.id == "all" ? this.isSelected = true : this.isSelected = false
    categoryNavBus.$on('nav-item-selected', function(item) {
      if (item == that) {
        var title = document.getElementById(that.category.id)
        window.scrollTo(0, title.offsetTop)
        that.isSelected = true
      } else {
        that.isSelected = false
      }
    })
  }
})

Vue.component('post-checkout', {
  template: "#post-checkout",
  props: ['admin_name', 'team_name'],
  data: function() {
    return {
      remaining: 5
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
      requiredOptions: [],
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
        if (val.option.cost && val.option.type !== "price group") {
          that.optionsCost += val.option.cost
        }
      })
    },
  },
  computed: {
    totalPrice: function() {
      var totalPrice = ((this.item.price + this.optionsCost)* this.quantity);
      return totalPrice
    },
    requiredDone: function() {
      var arr  = []
      this.requiredOptions.forEach(function(option, i) {
        if (option.selected == true) {
          arr.push(option)
        }
      })

      if (arr.length == this.requiredOptions.length) {
        return true;
      } else {
        return false;
      }
    }
  },
  created: function() {
    var that = this;
    if (this.item.min_qty) {
      this.quantity = this.item.min_qty
    } else {
      this.quantity = 1
    }

    choiceBus.$on('option-set-required', function(optionId) {
      var obj = {}
      obj.id = optionId;
      obj.selected = false;
      that.requiredOptions.push(obj)
    })

    choiceBus.$on('required:selected', function(optionId) {
      that.requiredOptions.forEach(function (option, i) {
        if (option.id == optionId) {
          that.requiredOptions[i]['selected'] = true
        }      
      })
    })  
  }
})


var app = new Vue({
  el: "#app",
  data: {
    merchant: "",
    menu: "",
    admin_name: "",
    team_name: "",
    navCategories: [],
    moreCategories: [],
    selectedItem: null,
    editingItem: null,
    cartItems: [],
    budget: false,
    userCheckedOut: false,
    user_id: null,
    food_session_id: null,
    notDesktop: screen.width <= 800,
    isCartVisibleOnMobile: false,
  },
  methods: {
    toggleCartOnMobile: function() {
      this.notDesktop ? this.isCartVisibleOnMobile = !this.isCartVisibleOnMobile : false;
    },
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
      var remove = window.confirm("Are you sure you want to remove " + item.name + "?")
      if (remove) {
        var i = _.indexOf(this.cartItems, item);
        this.cartItems.splice(i, 1)
      }
    },
    scrollToTop: function() {
      window.scrollTo(0,0)
      if (this.notDesktop) {
        this.isCartVisibleOnMobile = false
      }
    },
    formatCart: function() {
      var cart = [];
      this.cartItems.forEach(function(i) {
        var item = {};
        item.item_id = i.id;
        item.item_qty = i.quantity;
        item.instructions = i.instructions;
        item.option_qty = {}
        for (var opt in i.options) {
          var choices = i.options[opt].choices;
          choices.forEach(function(choice) {
            item.option_qty[choice.id] = 1
          })
        }
        cart.push(item)
      })
      this.submitOrder(cart)
    },
    submitOrder: function(cart) {
      var that = this;
      axios.post('/menus/order', {order: cart, user_id:this.user_id, deliv_id:this.food_session_id})
      .then(function(res) {
        that.cartItems = []
        if (that.notDesktop) {
          that.isCartVisibleOnMobile = false
        }
        window.close();
      })
      .catch(function(err) {
        console.log(err)
      })
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
    totalCartAmount: function() {
      var amount = this.cartItemsTotal
      return amount
    },
    showCart: function() {
     return this.cartItems.length ? true : false
    },
    exceedBudget: function() {
      if (this.budget) {
        return this.cartItemsTotal > this.budget ? true : false
      } else {
        return false
      }
    },
    remainingBudget: function() {
      if (this.budget && (this.budget - this.cartItemsTotal) > 1.50) {
        return this.budget - this.cartItemsTotal
      } else {
        return false
      }
    },
    merchantLogo: function() {
      if (this.merchant.logo) {
        return this.merchant.logo
      }
      else {
        return ""
      }
    }
  },
  watch: {
    menu: function() {
      this.navCategories = this.menu.slice(0,5)
      this.moreCategories = this.menu.slice(5, -1)
    }
  },
  created: function() {
    var that = this;
    var key = window.location.search.split("=")[1]
    // account for page refresh once key is gone
    if (key) {
      localStorage.setItem('orderKey', key)
    } else {
      key = localStorage.getItem('orderKey')
    }
    if (history.pushState) {
      var url = window.location.origin + window.location.pathname;
      history.replaceState({path: url}, '', url);
    }
    axios.post('/menus/session', {session_token: key})
    .then((response) => {
      this.admin_name = response.data.admin_name;
      this.team_name = response.data.team_name;
      this.food_session_id = response.data.foodSessionId;
      this.user_id = response.data.user.id
      this.food_session_id = response.data.foodSessionId

      var menuData = response.data.menu.data

      var menu = [];

      if (menuData.hasOwnProperty('menu')) {
        menuData = menuData.menu.menu
      }

      if (menuData.length > 1 ) {
        menuData.forEach(function(m) {
          if (_.every(m.children, ['type', 'menu'])) {
            m.children.forEach(function(child) {
              if (child.type == "menu" && _.every(child.children, ['type', 'item'])) {
                menu.push(child)
              } else if (child.type == "menu" && _.every(child.children, ['type', 'menu'])) {
                child.children.forEach(function(c) {
                  menu.push(c);
                })
              }
            })
          } else if (_.every(m.children, ['type', 'item'])) {
            menu.push(m);
          }
        })
      } else {
        if (_.every(menuData[0].children, ['type', 'menu'])) {
          menuData[0].children.forEach(function(c) {
            menu.push(c);
          })
        }
      }
      this.menu = menu;
      this.merchant = response.data.merchant;
      this.budget = response.data.budget ? response.data.budget : false
      if (response.data.selected_items.length) {
        var preSelectedId = response.data.selected_items[0]
        this.menu.forEach(function(category) {
          category.children.forEach(function (item) {
            if (item.id === preSelectedId) {
              that.selectedItem = item;
            }
          })
        })
      }
    })
    .catch((err) => {
      console.log(err);
    });
  },
})
