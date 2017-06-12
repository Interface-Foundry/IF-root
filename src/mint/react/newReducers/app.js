const initialState = {
  sidenav: false,
  popup: false,
  viewTab: 'cart',
  editId: null 
};

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case 'EDIT_ITEM_SUCCESS':
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
      }
    case 'CODE_SUCCESS':
      return {
        ...state,
        popup: false
      }
    case 'TOGGLE_POPUP':
      return {
        ...state,
        popup: !state.popup
      }
    case 'SEARCH_SUCCESS':
    case 'SELECT_VIEW_TAB':
      return {
        ...state,
        viewTab: action.response.tab
      }
    case '@@router/LOCATION_CHANGE':
      return {
        ...state
      }
    default:
      return state;
  }
}
