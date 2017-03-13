// react/components/App/index.js
// the source page
import React, { PropTypes, Component } from 'react';
import classnames from 'classnames';

import logo from '../logo.svg';
import '../style.css';

class App extends Component {
  // static propTypes = {}
  // static defaultProps = {}
  // state = {}

  render() {
    const { className, ...props } = this.props;
    console.log(this.props);
    return (
      <div className={classnames('App', className)}>
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          You're using Cart {this.props.params.cart_id}
        </p>
      </div>
    );
  }
}

export default App;
