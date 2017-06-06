import { animateScroll } from '../utils';

export const handleScroll = (containerHeight, animationOffset, scrollTop, animationState, fixed) => {
  // animate scroll, needs height of the container, and its distance from the top
  return animateScroll(containerHeight, animationOffset, scrollTop, animationState, fixed)
}

export const toggleSidenav = () => ({
  type: 'TOGGLE_SIDENAV'
})

export const toggleModal = (loginText = '', loginSubtext = '') => ({
  type: 'TOGGLE_MODAL',
  loginText,
  loginSubtext
});

export const registerHeight = (heightFromTop, containerHeight) => ({
  type: 'REGISTER_HEIGHT',
  response: {
    animationOffset: heightFromTop,
    containerHeight: containerHeight
  }
})
