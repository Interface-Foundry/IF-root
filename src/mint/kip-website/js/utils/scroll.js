export const animateScroll = (containerHeight, animationOffset, scrollTop, animationState, mobile) => {
	let newState = {}
  let animationStart = animationOffset - 400;
  let breakPointHeight = containerHeight/4;
  let animationEnd = mobile ? containerHeight + 700 : containerHeight + 150 ;

  if(scrollTop <= animationStart && animationState !== 'inital') {
    return newState = {
  		animationState: 'inital'
  	}
  }

  if(scrollTop > animationStart && scrollTop < animationStart + 350  && animationState !== 'fixed first') {
    return newState = {
	   	animationState: 'fixed first'
    }
  }


  if(scrollTop > animationStart + 350 && scrollTop < animationStart + breakPointHeight && animationState !== 'fixed first bubble') {
    return newState = {
      animationState: 'fixed first bubble'
    }
  }

  if(scrollTop > animationStart + breakPointHeight && scrollTop < animationStart + (breakPointHeight*2) && animationState !== 'fixed second bubble') {
    return newState = {
  		animationState: 'fixed second bubble'
  	}
  }

  if(scrollTop > animationStart + (breakPointHeight*2) && scrollTop < animationEnd && animationState !== 'fixed third bubble') {
    return newState = {
        animationState: 'fixed third bubble'
    }
  }

  if(scrollTop > animationEnd && animationState !== 'absolute') {
    return newState = {
			animationState: 'absolute'
		}
  }

  return newState;
}