// react/index.js
// renders react, using react router
import React from 'react';
import ReactDOM from 'react-dom';
import Routes from './routes';

if (module.hot) {
  module.hot.accept();
}

ReactDOM.render(
  <Routes />,
  document.getElementById('root')
);
