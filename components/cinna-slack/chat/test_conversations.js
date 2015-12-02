// some constants
var IMAGE = '[image]'
var CONFIRMATION = {
  YES: 'yes',
  NO: 'no',
  MAYBE: 'maybe'
}
var CONFIRMATION_QUESTION = {
  BUY: 'buy',
  MODIFY: 'modify'
}
var PRICE = {
  LOWER: 'lower'
}
var ITEM_1, ITEM_2, ITEM_3;

//
// each state in a conversation has some basic parts
// * msg: what the user texts
// * features: the features we extract from the message
// * action: how to respond and what to do on the back end
// * label: where we are in the conversation
// * items: duh
//
// for every msg, the action and state is determined by the current msg features
// and the previous state
//
var convesation_A = [
  {
    msg: 'kip find me running leggings',
    features: {
      type: 'search',
      item: 'running leggings'
    },
    action: {
      message: IMAGE
    },
    items: [/* three items */],
    label: 'search.results'
  },
  {
    msg: 'like the first one but orange',
    features: {
      type: 'modify',
      focus: 1,
      color: 'orange'
    },
    action: {
      message: ["Sure thing, I'll find something orange", IMAGE]
    },
    items: [/* three new items */],
    label: 'search.results'
  },
  {
    msg: 'does the first one have pockets?',
    features: {
      type: 'question',
      focus: 1,
      question: 'does ITEM_1 have pockets'
    },
    action: {
      message: 'yes it does! Pocket on the left side, 65%nylon, 35%cotton, machine washable in size S/M and M/L. Would you like me to add it to your cart?'
    },
    focus: 1,
    label: 'confirm.buy',
    items: []
  },
  {
    msg: 'yes, please',
    features: {
      type: 'confirmation',
      response: CONFIRMATION.YES,
    },
    action: {
      add_to_cart: ITEM_1,
      message: 'Okay, it has been added to your cart. Type "view cart" to see all your items.'
    },
    label: 'done',
    clear_history: true
  }
];

var conversation_B = [
  {
    msg: "I'm looking for a black zara jacket",
    features: {
      type: 'search',
      item: 'jacket',
      brand: 'zara',
      color: 'black'
    },
    action: {
      message: IMAGE
    },
    label: 'search.shown'
  },
  {
    msg: 'i like the third one',
    features: {
      type: 'sentiment',
      focus: 3,
      sentiment: 100
    },
    action: {
      message: 'It has 2 side pockets and zipper front, 100% leather with lining in size L.  Would you like me to add it to your cart?'
    },
    focus: 3,
    label: 'confirm.buy'
  },
  {
    msg: 'is there a size medium?',
    features: {
      type: 'question',
      size: 'medium'
    },
    action: {
      message: 'It comes in Medium at a higher price. Should I look for a similar one in a lower price?'
    },
    focus: 3,
    label: 'confirm.search.modify'
  },
  {
    msg: 'yes, please',
    features: {
      type: 'confirmation',
      response: CONFIRMATION.YES
    },
    action: {
      message: IMAGE
    },
    items: [],
    label: 'search.shown'
  }
]
