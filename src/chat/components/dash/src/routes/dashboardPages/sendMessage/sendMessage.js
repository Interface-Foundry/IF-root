import React, {
  Component
} from 'react';
import fetch from '../../../core/fetch';
import Select from 'react-select';

class SendMessage extends Component {
  constructor(props) {
    super(props);
    console.log(props)
    console.log('hi!')
    this.state = {
      member: '',
      message: '',
      members: [],
      text: '',
      error: '',
      sent: false
    }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.processMembers = this.processMembers.bind(this)
    this.userSelected = this.userSelected.bind(this)
  }

  async handleSubmit(e) {
    e.preventDefault();
    this.setState({
      error: ''
    })
    const attachments = this.state.message ? encodeURIComponent(this.state.message) : ''
    const res = await fetch(`https://slack.com/api/chat.postMessage?token=${this.props.token}&channel=${this.state.member}&attachments=${attachments}&text=${this.state.text}`, {
      method: 'post',
    })
    let json = await res.json();
    console.log(json);
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

  async componentWillReceiveProps(newProps) {
    let members = this.processMembers(newProps.members);
    console.log(newProps);
    this.setState({
      members: members,
      sent: false
    })
  }

  processMembers(members) {
    members = members.map(member => {
      let mem = Object.assign({}, member);
      if (member.is_bot == 'true') {
        mem.label = '(🤖) ' + member.label;
      } else if (member.is_admin == 'true') {
        mem.label = '(😎) ' + member.label;
      } else {
        mem.label = '(🙂) ' + member.label;
      }
      if (member.is_owner == 'true' || member.is_primary_owner == 'true') {
        mem.label = mem.label.replace(') ', ', 🤠) ');
      }
      return mem;
    })
    return members.filter(member => Boolean(member.value))
  }

  userSelected(val) {
    console.log(val)
    this.setState({
      sent: false,
      member: val ? val.value : ''
    });
  }

  render() {
    return (
      <form className="container-fluid data-display" onSubmit={this.handleSubmit}>
        {this.state.error ? 
          <div className="form-group"><div className="alert alert-danger" role="alert">
              Hmm looks like Slack didn't like that.
              Error: {this.state.error}
          </div></div>
        : ''}
          <div className="form-group">
            <label htmlFor="memberSelect">Select a member</label>
            <span id="helpBlock" className="help-block">🤖=Bot, 😎=Admin, 🙂=Member, 🤠=Owner</span>
            <Select
              name="memberSelect"
              id="memberSelect"
              required
              value={this.state.member}
              onChange={this.userSelected}
              disabled={this.state.members.length===0}
              options={this.state.members}
            />
          </div>
          <div className="form-group">
            <label htmlFor="textInput">Text (optional)</label>
            <input
              name="textInput"
              className="form-control"
              id="textInput"
              type="text"
              placeholder='Text'
              value={this.state.text}
              onChange={e=>this.setState({text: e.target.value, sent:false})}
            />
          </div>
          <div className="form-group">
            <label htmlFor="messageInput">Attachments (optional)</label>
            <textarea 
              className="form-control"
              rows="20" 
              placeholder="Message Attachments"
              value={this.state.message} 
              onChange={e=>this.setState({message: e.target.value, sent: false})} 
              id="messageInput"/>
          </div>
        {this.state.sent ?
        <div className="form-group">
          <div className="alert alert-success" role="alert">
            <strong>Sent!</strong>
        </div></div> : ''}
        <button type="submit" className="btn btn-default">Submit</button>
      </form>)
  }
}

export default SendMessage;