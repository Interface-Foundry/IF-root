var nice_menu = {
  categories: [{
    name: String,
    description: String
  }],
  items: [{
    name: 'Sashimi Lunch Special',
    description: '10 pcs. sashimi and white rice.',
    price: 12,
    id: 'E80',
    options: [{
      name: 'Choice of Side',
      required: true,
      values: [{
        name: 'House Salad with Ginger Dressing',
        price: 0,
        id: 'E91',
        _to_add: 'https://api.deliver.com/merchants/13451/item/e45/add',
        _to_remove: 'https://sdfadf', // should probably save this so that it's easy to remove when we need to
      }, {
        name: 'Add-ons',
        required: false,
        values: [{
          name: 'Ice cream',
          price: 2,
          id: 'E929',
          _to_add: 'https://api.deliver.com/merchants/13451/item/e45/add'
        }, {
          name: 'Asari Clam Soup: Red',
          price: 3,
          id: 'E930'
          _to_add: 'https://api.deliver.com/merchants/13451/item/e45/add'
        }]
      }]
    }]
  }]
}
