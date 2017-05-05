const initialState = {
  loaded: false,
  loading: true
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    default:
      return state;
  }
}

//Selectors
export const animateScroll = (containerHeight, animationOffset, scrollTop, animationState) => {
	let newState = {}
  let animationStart = animationOffset - 270;
  let breakPointHeight = containerHeight/4;

	console.log('desktop')
  console.log(scrollTop)

  if(scrollTop <= animationStart && animationState !== 'inital') {
    console.log('inital')
    newState = {
  		animationState: 'inital'
  	}
  }

  if(scrollTop > animationStart && scrollTop < animationStart + breakPointHeight && animationState !== 'fixed first') {
  	console.log('fixed first')
    newState = {
	   	animationState: 'fixed first'
    }
  }

  if(scrollTop > animationStart + breakPointHeight && scrollTop < animationStart + (breakPointHeight*2) && animationState !== 'fixed second') {
  	console.log('fixed second')
    newState = {
  		animationState: 'fixed second'
  	}
  }

  if(scrollTop > animationStart + (breakPointHeight*2) && scrollTop < animationStart + (breakPointHeight*3) && animationState !== 'fixed third') {
      console.log('fixed third')
      newState = {
          animationState: 'fixed third'
      }
  }

  if(scrollTop > animationStart + (breakPointHeight*3) && animationState !== 'absolute') {
    console.log('absolute')
    newState = {
			animationState: 'absolute'
		}
  }

  return newState;
}