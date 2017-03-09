import React, {
  Component
} from 'react';
import fetch from '../../../core/fetch';
import TeamMemberSidebar from '../../../components/TeamMemberSidebar'
import SlackPreview from '../../../components/SlackPreview';

class SendMessage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      member: {},
      attachments: '',
      members: [],
      text: '',
      error: '',
      sent: false
    }
    this.handleSubmit = this.handleSubmit.bind(this);
    this.processMembers = this.processMembers.bind(this);
    this.userSelected = this.userSelected.bind(this);
    this.navToMember = this.navToMember.bind(this);
  }

  async handleSubmit(e) {
    e.preventDefault();
    this.setState({
      error: ''
    })
    const attachments = this.state.attachments ? encodeURIComponent(this.state.attachments) : ''
    const res = await fetch(`https://slack.com/api/chat.postMessage?token=${this.state.member.token}&channel=${this.state.member.value}&attachments=${attachments}&text=${this.state.text}`, {
      method: 'post',
    })
    let json = await res.json();
    if (!json.ok) {
      this.setState({
        error: json.error
      });
    } else {
      this.setState({
        sent: true
      })
    }
  }

  async componentDidMount() {
    let members = this.processMembers(this.props.members);
    this.setState({
      members: members
    })
  }

  async componentWillReceiveProps(newProps) {
    let members = this.processMembers(newProps.members);
    this.setState({
      members: members,
      member: newProps.member,
      sent: false
    })
  }

  processMembers(members) {
    members = members.map(member => {
      let mem = Object.assign({}, member);
      if (member.is_bot == 'true') {
        mem.label = `${member.label} (🤖)`;
      } else if (member.is_admin == 'true') {
        mem.label = `${member.label} (😎)`;
      } else {
        mem.label = `${member.label} (🙂)`;
      }
      if (member.is_owner == 'true' || member.is_primary_owner == 'true') {
        mem.label = mem.label.replace(')', ', 🤠)');
      }
      return mem;
    })
    return members.filter(member => Boolean(member.value))
  }

  userSelected(val) {
    this.setState({
      sent: false,
      member: val ? val : {}
    });
  }

  navToMember(member) {
    this.setState({
      member: member,
    })
  }

  render() {
    return (
      <div>
    	<TeamMemberSidebar members={this.state.members} navToMember={this.navToMember}/>
        <form className="container-fluid data-display" onSubmit={this.handleSubmit}>
          {this.state.error ? 
            <div className="form-group"><div className="alert alert-danger" role="alert">
                Hmm looks like Slack didn't like that.
                Error: {this.state.error}
            </div></div>
            : ''}
            <div className="form-group">
              <label htmlFor="memberSelect">{this.state.member.label !== undefined ? `Sending to ${this.state.member.label}` :'Select a member'}</label>
              <span id="helpBlock" className="help-block">🤖=Bot, 😎=Admin, 🙂=Member, 🤠=Owner</span>
            </div>
            <div className="form-group">
              <label htmlFor="textInput">Text (optional)</label>
              <input
                name="textInput"
                className="form-control"
                id="textInput"
                type="text"
                placeholder='Text'
                onBlur = {
                  e => this.setState({
                    text: e.target.value,
                    sent: false
                  })
                }
              />
            </div>
            <div className="form-group">
              <label htmlFor="attachmentInput">Attachments (optional)</label>
              <textarea 
                className="form-control"
                rows="20" 
                placeholder="Message Attachments"
                onBlur = {
                  e => this.setState({
                    attachments: e.target.value,
                    sent: false
                  })
                }
                id="attachmentInput"/>
            </div>
          {this.state.sent ?
          <div className="form-group">
            <div className="alert alert-success" role="alert">
              <strong>Sent!</strong>
          </div></div> : ''}
          <button type="submit" className="btn btn-default">Send Message</button>
          <SlackPreview text={this.state.text} attachments={this.state.attachments} username='Kip' photoUrl='http://lorempixel.com/50/50/cats/' />
        </form>
      </div>)
  }
}

export default SendMessage;
