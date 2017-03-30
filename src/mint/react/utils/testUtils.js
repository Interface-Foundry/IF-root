export const fakeStore = (state) => ({
	default: () => {},
	subscribe: () => {},
	dispatch: () => {},
	getState: () => {
		return { ...state };
	}
})
