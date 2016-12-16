Vue.component('category-item', {
  props: ['item'],  
  template: '#category-item',
  methods: {
    selectItem: function(item) {
      this.$emit('show')
    }
  },
})


Vue.component('selected-item', {
  template: '#item-detail',
  props: ['item'],
  data: function() {
    return {
      quantity: this.item.min_qty ? this.item.min_qty : 1
    }
  },
  methods: {
    isMealAddition: function(option) {
      return !(option.name === "Meal Additions") 
    },
    addItemToCart: function() {
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
        this.quantity -= 1
        this.$set(this.item, 'quantity', this.quantity)         
      }          
    },
  },
  computed: {
    totalPrice: function() {
      var totalPrice = (this.item.price * this.quantity).toFixed(2) 
      this.$set(this.item, 'totalPrice', parseFloat(totalPrice))
      return totalPrice
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
    cartItems: [],
  },
  methods: {
    setSelectedItem: function(item) {
      this.selectedItem = item
    },
    addItemToCart: function() {
      console.log(this.selectedItem)
      this.cartItems.push(this.selectedItem)
    },
  },
  computed: {
    cartTotal: function() {
      var total = 0;
      for (var i = 0; i < this.cartItems.length; i++) {
        total += this.cartItems[i].totalPrice
      }
      return total;
    }
  },
  watch: {
    menu: function() {
      this.navCategories = this.menu.children.slice(0,5)
      this.moreCategories = this.menu.children.slice(5, -1)
    } 
  },
  created: function() {
    var key = window.location.search.split("=")[1]
    var ms = axios.post('/session', {session_token: key})
    .then((response) => {
      this.menu = response.data.menu.data[0];
      this.merchant = response.data.merchant;
    });
  }
})
