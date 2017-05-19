export const animateScroll = (containerHeight, animationOffset, scrollTop, animationState, fixed) => {
	let newState = {type: '', response: {}}
  let animationStart = animationOffset;
  let breakPointHeight = (containerHeight/8);
  let animationEnd = containerHeight + animationOffset;

  if(scrollTop > 400 && !fixed ||  scrollTop <= 400 && fixed) {
    console.log(-2)
    newState = {
      ...newState,
      type: 'HANDLE_SCROLL',
      response: { 
        ...newState.response,
        fixed: scrollTop > 400
      }
    }
  }

  if(scrollTop > (animationStart - breakPointHeight*3) && scrollTop < (animationStart - breakPointHeight*2) && animationState !== -1) {
    console.log(-1)
    newState = {
      ...newState,
      type: 'HANDLE_SCROLL',
      response: { 
        ...newState.response,
        animationState: -1
      }
    }
  }

  if(scrollTop > (animationStart - breakPointHeight*2) && scrollTop < animationStart + breakPointHeight && animationState !== 0) {
    console.log(0)
    newState = {
      ...newState,
      type: 'HANDLE_SCROLL',
      response: { 
        ...newState.response,
  		  animationState: 0
      }
  	}
  }

  if(scrollTop > animationStart + breakPointHeight && scrollTop < animationStart + (breakPointHeight*4)  && animationState !== 1) {
    console.log(1)
    newState = {
      ...newState,
      type: 'HANDLE_SCROLL',
      response: { 
        ...newState.response,
        animationState: 1
      }
    }
  }


  if(scrollTop > animationStart + (breakPointHeight*4) && scrollTop < animationStart + (breakPointHeight*8) && animationState !== 2) {
    console.log(2)
    newState = {
      ...newState,
      type: 'HANDLE_SCROLL',
      response: { 
        ...newState.response,
        animationState: 2
      }
    }
  }

  console.log('newState: ', newState)
  return newState;
}