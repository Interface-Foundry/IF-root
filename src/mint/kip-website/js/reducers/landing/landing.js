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

//Utility, N.B dont be lazy move this
export const animateScroll = (containerHeight, animationOffset, scrollTop, animationState, mobile) => {
	let newState = {}
  let animationStart = animationOffset - 400;
  let breakPointHeight = containerHeight/4;
  let animationEnd = mobile ? containerHeight + 700 : containerHeight + 150 ;

	console.log('containerHeight: ', containerHeight)
  console.log(scrollTop)

  if(scrollTop <= animationStart && animationState !== 'inital') {
    console.log('inital')
    newState = {
  		animationState: 'inital'
  	}
  }

  if(scrollTop > animationStart && scrollTop < animationStart + 150  && animationState !== 'fixed first') {
  	console.log('fixed first')
    newState = {
	   	animationState: 'fixed first'
    }
  }


  if(scrollTop > animationStart + 150 && scrollTop < animationStart + breakPointHeight && animationState !== 'fixed first bubble') {
    console.log('fixed first bubble')
    newState = {
      animationState: 'fixed first bubble'
    }
  }

  if(scrollTop > animationStart + breakPointHeight && scrollTop < animationStart + (breakPointHeight*2) && animationState !== 'fixed second bubble') {
  	console.log('fixed second bubble')
    newState = {
  		animationState: 'fixed second bubble'
  	}
  }

  if(scrollTop > animationStart + (breakPointHeight*2) && scrollTop < animationEnd && animationState !== 'fixed third bubble') {
      console.log('fixed third bubble')
      newState = {
          animationState: 'fixed third bubble'
      }
  }

  if(scrollTop > animationEnd && animationState !== 'absolute') {
    console.log('absolute')
    newState = {
			animationState: 'absolute'
		}
  }

  return newState;
}