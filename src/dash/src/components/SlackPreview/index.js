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

  displayActions(attachment) {
    console.log(attachment)
    if (attachment.actions) {
      return attachment.actions.map(action =>
        <li className='slackAction slackList'>
          <p>{action.text}</p>
        </li>)
    }
  }

  displayAttachments(attachments) {
    return attachments.map(attachment =>
      <li className='slackAttachment slackList'>
          <p>{attachment.text}</p>
          <ul>
            {this.displayActions(attachment)}
          </ul>
        </li>
    )
  }
  getAttachments(attachmentString) {
    console.log(attachmentString)
    attachmentString = attachmentString ? attachmentString : '[]'
    let attachments;
    try {
      attachments = JSON.parse(attachmentString)
    } catch (e) {
      attachments = [];
    }
    return attachments;
  }
  componentDidMount() {
    this.setState({
      text: this.props.text,
      attachments: this.getAttachments(this.props.attachments),
      photoUrl: this.props.photoUrl,
      username: this.props.username
    })
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      text: newProps.text,
      attachments: this.getAttachments(newProps.attachments),
      photoUrl: newProps.photoUrl,
      username: newProps.username
    })
  }

  render() {
    return (
      <div className='slackPreivew'>
        <img src={this.state.photoUrl}/>
        <div className='slackMessage'>
          <p className='slackUsername'><strong>{this.state.username}</strong></p>
          <p className='slackText'>{this.state.text}</p>
          <ul className='slackAttachments'>
            {this.displayAttachments(this.state.attachments)}
          </ul>
        </div>
      </div>)
  }
}

export default SlackPreivew;
