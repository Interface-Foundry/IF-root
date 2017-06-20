const initialState = {
  loading: false,
  sidenav: false,
  popup: false,
  viewTab: 'cart',
  editId: null 
};

export default (state = initialState, action = {}) => {
  if(action.type.includes('_LOADING')) state = { ...state, loading: true };
  else if(action.type.includes('_SUCCESS')) state = { ...state, loading: false };

  switch (action.type) {
    case 'EDIT_ITEM': {
      return {
        ...state,
        editId: action.response.editId
      };
    }
    case 'TOGGLE_SIDENAV':
      return {
        ...state,
        sidenav: !state.sidenav
      };
    case 'CODE_SUCCESS':
      return {
        ...state,
        popup: false
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        popup: !action.response.user_account
      };
    case 'TOGGLE_POPUP':
      return {
        ...state,
        popup: !state.popup
      };
    case 'ITEM_SUCCESS':
    case 'SEARCH_SUCCESS':
    case 'SELECT_VIEW_TAB':
      return {
        ...state,
        viewTab: action.response.tab
      };
    case '@@router/LOCATION_CHANGE':
    default:
      return {
        ...state
      };
  }
};
