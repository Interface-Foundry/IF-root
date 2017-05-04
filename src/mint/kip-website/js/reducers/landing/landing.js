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

    if(scrollTop > 745 && scrollTop < 1100 && animationState !== 'fixed') {
      	console.log('fixed first')
        newState = {
			animationState: 'fixed'
		}
    }

    if(scrollTop > 1100 && scrollTop < 1500 && animationState !== 'fixed second') {
      	console.log('fixed second')
        newState = {
			animationState: 'fixed second'
		}
    }

    if(scrollTop > 1500 && scrollTop < 2253 && animationState !== 'fixed third') {
        console.log('fixed third')
        newState = {
            animationState: 'fixed third'
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

    if(scrollTop > 1600 && scrollTop < 2000 && animationState !== 'fixed') {
      	console.log('fixed first')
        newState = {
			animationState: 'fixed'
		}
    }

    if(scrollTop > 2000 && scrollTop < 2500 && animationState !== 'fixed second') {
      	console.log('fixed second')
        newState = {
			animationState: 'fixed second'
		}
    }

    if(scrollTop > 2500 && scrollTop < 3345 && animationState !== 'fixed third') {
        console.log('fixed third')
        newState = {
            animationState: 'fixed third'
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