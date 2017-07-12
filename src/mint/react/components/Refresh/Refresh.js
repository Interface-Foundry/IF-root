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

  _update = () => {
    const { refresh, cartId, userId } = this.props;
    refresh(cartId, userId);
  }

  render = () => (
    <div className={'refresh'} onClick={()=>::this._update()}>
        <div className='wrapper'><Icon icon='Refresh'/></div>
      </div>
  )
}
export default Timeout(Refresh);
