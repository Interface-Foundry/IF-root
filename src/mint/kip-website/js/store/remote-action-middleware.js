export default socket => store => next => action => {
  if (action.meta && action.meta.remote) {
    socket.send(JSON.stringify(action.payload));
    socket.emit('action', Object.assign({}, action, {clientId}));
  }
  return next(action);
}
