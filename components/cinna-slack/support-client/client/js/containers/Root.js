import React, { Component, PropTypes } from 'react';
import { Redirect, Router, Route } from 'react-router';
import { Provider } from 'react-redux';
import ChatContainer from './ChatContainer';
import configureStore from '../store/configureStore';
import DevTools from './DevTools';
const store = configureStore();

class Root extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired
  };
  render() {
    const processENV = process.env.NODE_ENV;
    const { history } = this.props;
    return (
      <div className="root">
        <Provider store={store} >
          <Router history={history}>
       
            <Redirect from="/_=_" to="/" />
            <Route path="/" component={ChatContainer} />
          </Router>
        </Provider>
   <DevTools store={store} />
 
      </div>
    );
  }
}

export default Root

  // <DevTools store={store} />

       // <Redirect from="/" to="/chat" />



