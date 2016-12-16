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
  methods: {
    isMealAddition: function(option) {
      return !(option.name === "Meal Additions") 
    },
    addItemToCart: function() {
      this.$emit('add')
      this.$emit('close')
    },
    increaseQty: function() {
      this.$emit('increaseqty')
    },
    decreaseQty: function() {
      this.$emit('decreaseqty')
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
    cartItems: []
  },
  methods: {
    setSelectedItem: function(item) {
      this.selectedItem = item
      let quantity = this.selectedItem.min_qty ? this.selectedItem.min_qty : 1; 
      this.$set(this.selectedItem, 'quantity', quantity)
    },
    addItemToCart: function() {
      console.log('adding')
      console.log(this.selectedItem.quantity)
      console.log(this.cartItems)
      this.cartItems.push(this.selectedItem)
    },
    increaseQty: function() {
      if(this.selectedItem.quantity > 0 && this.selectedItem.quantity < this.selectedItem.max_qty) {
        this.selectedItem.quantity += 1 
      }
    },
    decreaseQty: function() {
      if(this.selectedItem.quantity > this.selectedItem.min_qty) {
        this.selectedItem.quantity -= 1 
      }    
    }    
  },
  watch: {
    menu: function() {
      this.navCategories = this.menu.children.slice(0,5)
      this.moreCategories = this.menu.children.slice(5, -1)
    }
  
  },
  created: function() {
    let key = window.location.search.split("=")[1]
    let ms = axios.post('/session', {session_token: key})
    .then((response) => {
      this.menu = response.data.menu.data[0];
      this.merchant = response.data.merchant;
    });
  }
})
