import React, {
  Component,
  PropTypes
} from 'react';
import classNames from 'classnames';
import co from 'co';

class SlackPreivew extends Component {

  constructor(props) {
    super(props);
    this.state = {
      text:'',
      attachments:[]
    }
  }

  componentDidMount() {
    var self = this;
  }

  render() {
}

export default SlackPreivew;