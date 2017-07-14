// react/components/Refresh/Refresh.js
import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { Icon } from '../../../react-common/components';
import { Timeout } from '../../utils';

class Refresh extends Component {

  static propTypes = {
    refresh: PropTypes.func,
    cartId: PropTypes.string,

    userId: PropTypes.string
    // loading: PropTypes.bool
  }

  state = {
    loading: false
  }

  _update = () => {
    const { refresh, cartId, userId } = this.props;
    this.setState({ loading: true });
    this.props.setTimeout(() => this.setState({ loading: false }), 2000);
    refresh(cartId, userId);
  }

  render = () => (
    <div className={`refresh${this.state.loading? ' rotating':''}`} onClick={()=>::this._update()}>
        <div className='wrapper'>
          <Icon icon='Refresh'/>
        </div>
      </div>
  )
}
export default Timeout(Refresh);
