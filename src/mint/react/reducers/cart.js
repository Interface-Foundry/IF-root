// react/reducers/cart.js

const initialState = {
  name: '',
  leader: {
    name: ''
  },
  store: '',
  store_locale: '',
  members: [],
  items: [],
  checkouts: 0,
  clones: 0,
  views: 0,
  likes: [],
  kip_pay_allowed: false,
  privacy: 'public',
  locked: false,
  ok: true,
  editId: null
};

export default function cart(state = initialState, action) {
  switch (action.type) {
  case 'CART_SUCCESS':
    return {
      ...initialState,
      ...action.response
    };
  case 'CART_FAIL':
    return {
      ...state,
      ok: false
    };
  case 'SELECT_CART_ITEM':
  case 'LIKE_CART_SUCCESS':
  case 'METRICS_SUCCESS':
  case 'UPDATE_CART_SUCCESS':
    return {
      ...state,
      ...action.response
    };
  case 'REMOVE_ITEM_LOADING':
    return {
      ...state
    };
  case 'REMOVE_ITEM_SUCCESS':
    return {
      ...state,
      items: state.items.filter((item, i) => item.id !== action.response)
    };
  case 'COPY_ITEM_SUCCESS':
  case 'ADD_ITEM_SUCCESS':
    return {
      ...state,
      items: [...state.items, action.response]
    };
  case 'CLEAR_CART_SUCCESS':
    return {
      ...state,
      items: []
    };
  case 'ITEM_SUCCESS':
    return {
      ...state,
      items: state.items.reduce((acc, item, i) => {
        item.id === action.response.item.id ? acc.push({ ...item, ...action.response.item, added_by: item.added_by }) : acc.push(item);
        return acc;
      }, [])
    };
  case 'UPDATE_ITEM_SUCCESS':
    return {
      ...state,
      items: state.items.reduce((acc, item, i) => {
        item.id === action.response.item.id ? acc.push(action.response.item) : acc.push(item);
        return acc;
      }, [])
    };
  case 'DELETE_CART_SUCCESS':
    return initialState;
  default:
    return state;
  }
}

// Selectors
export const getMemberById = (state, props) => [...state.members, state.leader].find(member => member.id === props.id);

export const splitCartById = (state, props) => {
  const id = props ? props.id : null;

  return state.cart.items.reduce((acc, item) => {
    acc.quantity = acc.quantity + (item.quantity || 1);
    let linkedMember = getMemberById(state.cart, { id: item.added_by }) || {};

    if (id === item.added_by) {
      acc['my'].push(item);
    } else if (acc.others.find(member => member.id === linkedMember.id)) {
      const others = acc.others.filter(member => member.id !== linkedMember.id);
      let newMember = acc.others.find(member => member.id === linkedMember.id);
      newMember = {
        ...newMember,
        createdAt: linkedMember.createdAt,
        updatedAt: item.updatedAt,
        items: [...newMember.items, item]
      };
      acc = {
        ...acc,
        others: [...others, newMember]
      };
    } else {
      acc.others.push({
        id: item.added_by,
        email_address: linkedMember.email_address,
        name: linkedMember.name,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        items: [item]
      });
    }

    return acc;
  }, {
    my: [],
    others: [],
    quantity: 0
  });
};
