export const animateScroll = (containerHeight, animationOffset, scrollTop, animationState, fixed) => {
  let newState = { type: '', response: { scrollTo: 0 } }
  let animationStart = 0;
  let breakPointHeight = (containerHeight / 8);

  if (scrollTop > 1 && !fixed || scrollTop <= 1 && fixed) {
    newState = {
      ...newState,
      type: 'HANDLE_SCROLL',
      response: {
        ...newState.response,
        fixed: scrollTop > 1
      }
    }
  }

  if (scrollTop > (animationStart - breakPointHeight * 3) && scrollTop < (animationStart - breakPointHeight * 2) && animationState !== -1) {
    newState = {
      ...newState,
      type: 'HANDLE_SCROLL',
      response: {
        ...newState.response,
        animationState: -1
      }
    }
  }

  if (scrollTop > (animationStart - breakPointHeight * 2) && scrollTop < animationStart + breakPointHeight && animationState !== 0) {
    newState = {
      ...newState,
      type: 'HANDLE_SCROLL',
      response: {
        ...newState.response,
        animationState: 0
      }
    }
  }

  if (scrollTop > animationStart + breakPointHeight && scrollTop < animationStart + (breakPointHeight * 4) && animationState !== 1) {
    newState = {
      ...newState,
      type: 'HANDLE_SCROLL',
      response: {
        ...newState.response,
        animationState: 1
      }
    }
  }

  if (scrollTop > animationStart + (breakPointHeight * 4) && scrollTop < animationStart + (breakPointHeight * 8) && animationState !== 2) {
    newState = {
      ...newState,
      type: 'HANDLE_SCROLL',
      response: {
        ...newState.response,
        animationState: 2
      }
    }
  }

  return newState;
}