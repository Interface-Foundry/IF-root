import './css/chatapp.css';
import React from 'react';
import Root from './js/containers/Root';
// import HashHistory from 'react-router/lib/HashHistory';
import createHistory from 'history/lib/createBrowserHistory';  
import ReactDOM from 'react-dom';

// const history = new HashHistory();

ReactDOM.render(
  <Root history={createHistory()} />,
  document.getElementById('react')
);
