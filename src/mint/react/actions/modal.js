import { CHANGE_MODAL_COMPONENT } from '../constants/ActionTypes';

export const changeModalComponent = (componentName) => ({
  type: CHANGE_MODAL_COMPONENT,
  componentName
});
