import React, {
  Component,
  PropTypes
} from 'react';
import classNames from 'classnames';
import co from 'co';

class SlackPreivew extends Component {

  constructor(props) {
    super(props);
    this.displayAttachments = this.displayAttachments.bind(this);
    this.state = {
      text: '',
      attachments: []
    }
  }

  displayAttachments(attachments) {
    return attachments.reduce((html, attachment) => {
      
    })
  }

  componentDidMount() {
    var self = this;
  }

  render() {
    <div className='SlackPreivew'>
      <p>{this.state.text}</p>
      {this.displayAttachments(this.state.attachments)}
    </div>
  }
}

export default SlackPreivew;