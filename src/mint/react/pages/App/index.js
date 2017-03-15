// react/components/App/index.js
// the source page
import React, { PropTypes, Component } from 'react';
import classnames from 'classnames';
import { fetchUser } from '../../actions';

import logo from '../logo.svg';
import '../style.css';

class App extends Component {
  // static propTypes = {}
  // static defaultProps = {}
  // state = {}

  render() {
    console.log(this.state);
    const { className, ...props } = this.props;
    const { params } = props.match;
    return (
      <div className={classnames('App', className)}>
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          You're using Cart {params.cart_id}!
        </p>
        <button onClick={() => this.state.dispatch(fetchUser('abc123'))}>Button</button>
      </div>
    );
  }
}

export default App;
