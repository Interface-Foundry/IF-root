export const animateScroll = (containerHeight, animationOffset, scrollTop, animationState) => {
	let newState = {}
  let animationStart = animationOffset;
  let breakPointHeight = (containerHeight/8);
  let animationEnd = containerHeight + animationOffset;

  console.log('scrollTop:', scrollTop)

  if(scrollTop <= animationStart && scrollTop < animationStart + breakPointHeight && animationState !== 0) {
    console.log('inside 0')
    newState = {
  		animationState: 0
  	}
  }

  if(scrollTop > animationStart + breakPointHeight && scrollTop < animationStart + (breakPointHeight*4)  && animationState !== 1) {
    console.log('inside 1')
    newState = {
	   	animationState: 1
    }
  }


  if(scrollTop > animationStart + (breakPointHeight*4) && scrollTop < animationStart + (breakPointHeight*8) && animationState !== 2) {
    console.log('inside 2')
    newState = {
      animationState: 2
    }
  }

  return newState;
}