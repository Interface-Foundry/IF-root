// react/index.js
// renders react, using react router
import React from 'react';
import ReactDOM from 'react-dom';
import {
  browserHistory
} from 'react-router';
import {
  syncHistoryWithStore
} from 'react-router-redux';
import Routes from './routes';

if (module.hot) {
  module.hot.accept();
}

ReactDOM.render(
  <Routes history={browserHistory} />,
  document.getElementById('root')
);
