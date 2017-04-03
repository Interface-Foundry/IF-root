import React, { PropTypes, Component } from 'react';
import { getMemberById } from '../../reducers';
import { getNameFromEmail } from '../../utils'

export default class Item extends Component {
  static propTypes = {
    tem: PropTypes.object.isRequired
  }

  render() {
    return (
      <div>
        Inside selected Component
      </div>
    );
  }
}
