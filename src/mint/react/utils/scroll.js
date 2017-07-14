export const animateScroll = (containerHeight, animationOffset, scrollTop, animationState, fixed) => {
  let newState = { type: '' };

  if (scrollTop > 2 && !fixed || scrollTop <= 1 && fixed) {
    newState = {
      ...newState,
      type: 'HANDLE_SCROLL',
      response: {
        ...newState.response,
        fixed: scrollTop > 2
      }
    };
  }
  return newState;
};

export const checkPageScroll = (scrollTop, containerHeight, windowHeight) => {
  return scrollTop === containerHeight - windowHeight;
};

