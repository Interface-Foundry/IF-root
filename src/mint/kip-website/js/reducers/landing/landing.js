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
export const desktopScroll = (scrollTop, animationState) => {
	let newState = {}

	console.log('desktop')
    console.log(scrollTop)

    if(scrollTop <= 745 && animationState !== 'inital') {
      	console.log('inital')
        newState = {
			animationState: 'inital'
		}
    }

    if(scrollTop > 745 && scrollTop < 1200 && animationState !== 'fixed') {
      	console.log('fixed')
        newState = {
			animationState: 'fixed'
		}
    }

    if(scrollTop > 1200 && scrollTop < 2253 && animationState !== 'fixed second') {
      	console.log('fixed second')
        newState = {
			animationState: 'fixed second'
		}
    }

    if(scrollTop > 2253 && animationState !== 'absolute') {
      	console.log('absolute')
        newState = {
			animationState: 'absolute'
		}
    }

    return newState;
}

export const mobileScroll = (scrollTop, animationState) => {
	let newState = {}

	console.log('mobile')
    console.log(scrollTop)

    if(scrollTop <= 1600 && animationState !== 'inital') {
      	console.log('inital')
        newState = {
			animationState: 'inital'
		}
    }

    if(scrollTop > 1600 && scrollTop < 2200 && animationState !== 'fixed') {
      	console.log('fixed')
        newState = {
			animationState: 'fixed'
		}
    }

    if(scrollTop > 2200 && scrollTop < 3345 && animationState !== 'fixed second') {
      	console.log('fixed second')
        newState = {
			animationState: 'fixed second'
		}
    }

    if(scrollTop > 3345 && animationState !== 'absolute') {
      	console.log('absolute')
        newState = {
			animationState: 'absolute'
		}
    }

    return newState;
}