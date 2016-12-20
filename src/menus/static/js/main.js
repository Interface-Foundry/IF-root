Vue.component('choice', {
  template: '#choice',
  props: ['choice', 'type', 'option'],
  data: function() {
    return {
      maxSelection : this.option.max_selection,
      selected: false
    }
  },
  methods: {
    selectChoice: function() {
      var options = this.$parent.$parent.options;
      var option = this.option;
      var newOptions = options || {};      
      if (!options.hasOwnProperty(option.id) || this.maxSelection === 1) {
        newOptions[option.id] = {}
        newOptions[option.id].option = option
        newOptions[option.id].choices = []
        newOptions[option.id].choices.push(this.choice)
      } else if (options[option.id].choices.length > 1 && options[option.id].choices.length === this.maxSelection){
        console.log('you have over' + this.maxSelection + 'selected')
        return
      } else {
        newOptions[option.id] = options[option.id]
        newOptions[option.id].option = option
        newOptions[option.id].choices.push(this.choice)
      }
      this.$set(this.$parent.$parent, 'options', newOptions)
    }
  }
})

Vue.component('option-set', {
  props: ['option', 'item'],  
  template: '#option-set',  
  data: function() {
    return {
      isMealAddition: this.option.name === "Meal Additions",
      inputType: this.option.max_selection === 1 ? "radio" : "checkbox",
    }
  }
})


Vue.component('cart-item', {
  props: ['item'],  
  template: '#cart-item',
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
      quantity: this.item.min_qty ? this.item.min_qty : 1,
      options: {},
      instructions: ""
    }
  },
  methods: {
    addItemToCart: function() {
      this.$set(this.item, 'options', this.options)
      this.$emit('add')
      this.$emit('close')
    },
    increaseQty: function() {
      if(this.quantity > 0 && this.quantity < this.item.max_qty) {
        this.quantity += 1 
        this.$set(this.item, 'quantity', this.quantity) 
      }  
    },
    decreaseQty: function() {
      if(this.quantity > this.item.min_qty) {
        this.quantity -= 1;
        this.$set(this.item, 'quantity', this.quantity)         
      }          
    },
    updateInstructions: function() {
      this.$set(this.item, 'instructions', this.instructions);     
    }
  },
  computed: {
    totalPrice: function() {
      var totalPrice = parseFloat((this.item.price * this.quantity)).toFixed(2)
      this.$set(this.item, 'totalPrice', totalPrice)
      return totalPrice
    },
  },
  created: function() {
    this.$set(this.item, 'quantity', this.item.min_qty ? this.item.min_qty : 1);
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
    cartItems: [],
  },
  methods: {
    setSelectedItem: function(item) {
      this.selectedItem = item
    },
    addItemToCart: function() {
      this.cartItems.push(this.selectedItem)
    },
  },
  computed: {
    cartItemsTotal: function() {
      var total = 0;
      for (var i = 0; i < this.cartItems.length; i++) {
        total += this.cartItems[i].totalPrice
      }
      return parseFloat(total).toFixed(2);
    },
    taxAmount: function() {
      return parseFloat((this.cartItemsTotal * .075)).toFixed(2)
    },
    totalCartAmount: function() {
      return parseFloat((this.cartItemsTotal + this.taxAmount)).toFixed(2)
    },
    showCart: function() {
     return this.cartItems.length ? true : false
    }
  },
  watch: {
    menu: function() {
      this.navCategories = this.menu.children.slice(0, 5)
      this.moreCategories = this.menu.children.slice(5, -1)
    } 
  },
  created: function() {
    var key = window.location.search.split("=")[1]
    var ms = axios.post('/session', {session_token: key})
    .then((response) => {
      this.menu = response.data.menu.data[0];
      this.merchant = response.data.merchant;
    })
    .catch((err) => {
    });
  }
})
