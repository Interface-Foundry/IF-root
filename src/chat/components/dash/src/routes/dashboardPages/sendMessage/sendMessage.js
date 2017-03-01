import React, {
  Component
} from 'react';
import fetch from '../../../core/fetch';
import Select from 'react-select';

class SendMessage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      team: '',
      user: '',
      message: '',
      teams: [],
      users: [],
      text: '',
      error: '',
      sent: false
    }
    this.handleSubmit = this.handleSubmit.bind(this)
    this.teamSelected = this.teamSelected.bind(this)
    this.userSelected = this.userSelected.bind(this)
  }

  async handleSubmit(e) {
    e.preventDefault();
    this.setState({error:''})
    const attachments = this.state.message ? encodeURIComponent(this.state.message): ''
    const res = await fetch(`https://slack.com/api/chat.postMessage?token=${this.state.token}&channel=${this.state.user}&attachments=${attachments}&text=${this.state.text}`, {
      method: 'post',
    })
    let json = await res.json();
    // console.log(json);
    if(!json.ok) {
      this.setState({error: json.error});
    } else {
      this.setState({sent:true})
    }
  }

  async componentDidMount() {
    const res = await fetch('/graphql', {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: '{teams {value:team_id,label:team_name, bot_access_token members{value:dm, label:name, is_bot, is_admin, is_owner, is_primary_owner}}}',
      }),
      credentials: 'include',
    });
    const {data} = await res.json();
    this.setState({
      sent:false,
      teams: data.teams
    })
  }

  async teamSelected(val) {
    let members = [];
    if (val.members) {
      members = val.members.map(member => {
        if (member.is_bot.toLowerCase() == 'true') {
          member.label = '(🤖) ' + member.label;
        } else if (member.is_admin.toLowerCase() == 'true') {
          member.label = '(😎) ' + member.label;
        } else {
          member.label = '(🙂) ' + member.label;
        }
        if (member.is_owner.toLowerCase() == 'true' || member.is_primary_owner.toLowerCase() == 'true') {
          member.label = member.label.replace(') ', ', 🤠) ');
        }
        return member;
      })
    }

    this.setState({
      sent: false,
      token: val ? val.bot_access_token : '',
      team: val ? val.value : '',
      users: val ? members : []
    })
  }

  userSelected(val) {
    this.setState({
      sent: false,
      user: val ? val.value : ''
    });
  }

  render() {
    return (
        <form onSubmit={this.handleSubmit}>
        {
        this.state.error ?
        <div className="form-group">
          <div className="alert alert-danger" role="alert">
            Hmm looks like Slack didn't like that.
            Error: {this.state.error}
          </div> 
        </div>:
          ''
      }
          <div className="form-group">
            <label htmlFor="teamSelect">Select a Team</label>
            <Select
              name="teamSelect"
              id="teamSelect"
              required
              value={this.state.team}
              onChange={this.teamSelected}
              options={this.state.teams}
            />
          </div>
          <div className="form-group">
            <label htmlFor="userSelect">Select a user</label>
            <Select
              name="userSelect"
              id="userSelect"
              required
              value={this.state.user}
              onChange={this.userSelected}
              disabled={this.state.users.length===0}
              options={this.state.users}
            />
            <span id="helpBlock" class="help-block">🤖=Bot, 😎=Admin, 🙂=Member, 🤠=Owner</span>
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
          <div className="form-group"><div className="alert alert-success" role="alert"><strong>Sent!</strong></div></div> : ''}
          <button type="submit" className="btn btn-default">Submit</button>
          
      <link rel="stylesheet" href="https://unpkg.com/react-select/dist/react-select.css"/>
      </form>)
  }
}

export default SendMessage;