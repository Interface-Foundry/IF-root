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

  _resetLoading = () => this.setState({ loading: false })

  _update = () => {
    const { props: { refresh, cartId, userId, createTimeout }, _resetLoading } = this;
    this.setState({ loading: true });
    createTimeout(() => _resetLoading, 2000);
    refresh(cartId, userId);
  }

  render = () =>
    <div className={`refresh${this.state.loading? ' rotating':''}`} onClick={this._update}>
      <div className='wrapper'><Icon icon='Refresh'/></div>
    </div>
}
export default Timeout(Refresh);