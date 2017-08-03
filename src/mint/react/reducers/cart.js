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
  case 'LIKE_CART_SUCCESS':
  case 'METRICS_SUCCESS':
  case 'UPDATE_CART_SUCCESS':
  case 'SELECT_CART_ITEM':
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
      items: [action.response, ...state.items]
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
  return state.cart.items.reduce((acc, item) => {
    let linkedMember = getMemberById(state.cart, { id: item.added_by }) || {};
    if (acc.find(member => member.id === linkedMember.id)) {
      return acc.map(member => member.id === linkedMember.id ? {
        ...member,
        items: [...member.items, item]
      } : member);
    } else {
      return [...acc, {
        ...linkedMember,
        id: item.added_by,
        price_locale: state.cart.price_locale,
        items: [item]
      }];
    }
  }, []);
};