import { CHANGE_KIPFORM_VIEW, TOGGLE_ANIMATION, TOGGLE_SHOW_SIBLINGS } from '../constants/ActionTypes';

export const changeKipFormView = (view) => ({
  type: CHANGE_KIPFORM_VIEW,
  view
})
export const toggleAnimation = () => ({
  type: TOGGLE_ANIMATION
})
export const toggleShowSiblings = () => ({
  type: TOGGLE_SHOW_SIBLINGS
})