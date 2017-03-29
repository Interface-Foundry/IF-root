export const fakeStore = (state) => ({
	default: () => {},
	subscribe: () => {},
	dispatch: () => {},
	getState: () => {
		return { ...state };
	}
})

// export const mockRequest = ( url, requestArgs, dummyData) => (
// 	new Promise((resolve, reject) => {
//     	const userID = parseInt(url.substr('/users/'.length), 10);
//     	process.nextTick(() => dummyData[userID] ? 
//     		resolve(dummyData[userID]) : 
//     		reject({
//         		error: 'User with ' + userID + ' not found.',
//       		})
//     	);
//   	});
// )
