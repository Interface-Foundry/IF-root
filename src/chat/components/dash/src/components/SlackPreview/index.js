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
    this.displayActions = this.displayActions.bind(this);
    this.state = {
      text: '',
      attachments: []
    }
  }

  displayActions(actions) {
     return actions.reduce((html, actions) => {
      html.push(
        <li className='slackAction'>
          <p>{action.text}</p>
        </li>
      )
      return html;
    }, [])
  }

  displayAttachments(attachments) {
    return attachments.reduce((html, attachment) => {
      html.push(
        <li className='slackAttachment'>
          <p>{attachment.text}</p>
          {this.displayActions(attachment.actions)}
        </li>
      )
      return html;
    }, [])
  }

  componentDidMount() {
    var self = this;
  }

  render() {
    <div className='SlackPreivew'>
      <p>{this.state.text}</p>
      <ul>
        {this.displayAttachments(this.state.attachments)}
      </ul>
    </div>
  }
}

export default SlackPreivew;
