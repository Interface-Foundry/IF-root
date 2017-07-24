// react/components/Refresh/Refresh.js
import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { Icon } from '../../../react-common/components';
import { Timeout } from '../../utils';

class Refresh extends Component {

  static propTypes = {
    refresh: PropTypes.func,
    cartId: PropTypes.string,
    createTimeout: PropTypes.func,
    userId: PropTypes.string
  }

  state = {
    loading: false
  }

  _update = () => {
    const { props: { refresh, cartId, userId, createTimeout } } = this;
    this.setState({ loading: true });
    createTimeout(() => {
      this.setState({ loading: false })
    }, 2000);
    refresh(cartId, userId);
  }
  // shouldComponentUpdate = (_, { loading }) => this.state.loading !== loading

  render = () => {
    const { state: { loading }, _update } = this;
    return (
      <div className={`refresh ${loading? 'rotating':''}`} onClick={_update}>
        <div className='wrapper'><Icon icon='Refresh'/></div>
      </div>
    );
  }
}
export default Timeout(Refresh);