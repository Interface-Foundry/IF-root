import React, {
  Component
} from 'react';
import classNames from 'classnames';
import history from '../../core/history';
import fetch from '../../core/fetch';
import co from 'co';

var teams = [{team_id: '0', team_name : 'Team A', url: '/slackteamstats'},
   {team_id: '1', team_name : 'Team B', url: '/slackteamstats'},
   {team_id: '2', team_name : 'Team C', url: '/slackteamstats'},
   {team_id: '3', team_name : 'Team D', url: '/slackteamstats'},
   {team_id: '4', team_name : 'Team E', url: '/slackteamstats'},
   {team_id: '5', team_name : 'Team F', url: '/slackteamstats'},
   {team_id: '6', team_name : 'Team G', url: '/slackteamstats'},
   {team_id: '7', team_name : 'Team H', url: '/slackteamstats'},
   {team_id: '8', team_name : 'Team I', url: '/slackteamstats'},
   {team_id: '9', team_name : 'Team J', url: '/slackteamstats'},
   {team_id: '10', team_name : 'Team K', url: '/slackteamstats'},
   {team_id: '11', team_name : 'Team L', url: '/slackteamstats'},
   {team_id: '12', team_name : 'Team M', url: '/slackteamstats'},
   {team_id: '13', team_name : 'Team N', url: '/slackteamstats'},
   {team_id: '14', team_name : 'Team O', url: '/slackteamstats'},
   {team_id: '15', team_name : 'Team P', url: '/slackteamstats'},
   {team_id: '16', team_name : 'Team Q', url: '/slackteamstats'},
   {team_id: '17', team_name : 'Team R', url: '/slackteamstats'},
   {team_id: '18', team_name : 'Team S', url: '/slackteamstats'}]



class SubSidebar extends Component {

  constructor(props) {
  super(props);
    this.state = {
      uiElementsCollapse: true,
      chartsElementsCollapsed: true,
      multiLevelDropdownCollapsed: true,
      thirdLevelDropdownCollapsed: true,
      samplePagesCollapsed: true
    };
  }

  componentDidMount() {
    var self = this;
    co(function * () {
      const resp = yield fetch('/graphql', {
          method: 'post',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: '{teams {team_id,team_name,dateAdded}}',
          }),
          credentials: 'include',
        });
        const { data } = yield resp.json();
        if (!data || !data.teams) throw new Error('Failed to load the news feed.')
        else  {
          self.setState({teams: data.teams})
        }
    })
  }

  render() {
    //const { teams } = this.state;
     const displayTeams = teams ? teams.map( function(team) { 
      return <li key={team.team_id}> <a href="" onClick={(e) => { e.preventDefault(); history.push('/slackteamstats'); }} > <i className="fa fa-dashboard fa-fw" /> {team.team_name}</a></li>}) : []
          
    return (
      <div className="sidebar-nav navbar-collapse collapse">
        <ul className="nav in" id="side-menu">
          <li className="sidebar-search">
            <div className="input-group custom-search-form">
              <input type="text" className="form-control" placeholder="Search..." />
              <span className="input-group-btn">
                <button className="btn btn-default" type="button">
                  <i className="fa fa-search" />
                </button>
              </span>
            </div>
          </li>
          <li>
            <a href="" onClick={(e) => { e.preventDefault(); history.push('/slackallstats'); }}> <i className="fa fa-dashboard fa-fw" /> All teams</a>
          </li>
          {
            displayTeams
          }

        </ul>
      </div>
    );
  }
}




          // <li>
          //   <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
          //     <i className="fa fa-dashboard fa-fw" /> Team A
          //   </a>
          // </li>
          // <li>
          //   <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
          //     <i className="fa fa-dashboard fa-fw" /> Team B
          //   </a>
          // </li>
          // <li>
          //   <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
          //     <i className="fa fa-dashboard fa-fw" /> Team A
          //   </a>
          // </li>
          // <li>
          //   <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
          //     <i className="fa fa-dashboard fa-fw" /> Team B
          //   </a>
          // </li>
          // <li>
          //   <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
          //     <i className="fa fa-dashboard fa-fw" /> Team A
          //   </a>
          // </li>
          // <li>
          //   <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
          //     <i className="fa fa-dashboard fa-fw" /> Team B
          //   </a>
          // </li>
          // <li>
          //   <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
          //     <i className="fa fa-dashboard fa-fw" /> Team A
          //   </a>
          // </li>
          // <li>
          //   <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
          //     <i className="fa fa-dashboard fa-fw" /> Team B
          //   </a>
          // </li>
          // <li>
          //   <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
          //     <i className="fa fa-dashboard fa-fw" /> Team A
          //   </a>
          // </li>
          // <li>
          //   <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
          //     <i className="fa fa-dashboard fa-fw" /> Team B
          //   </a>
          // </li>
          // <li>
          //   <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
          //     <i className="fa fa-dashboard fa-fw" /> Team A
          //   </a>
          // </li>
          // <li>
          //   <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
          //     <i className="fa fa-dashboard fa-fw" /> Team B
          //   </a>
          // </li>
          // <li>
          //   <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
          //     <i className="fa fa-dashboard fa-fw" /> Team A
          //   </a>
          // </li>
          // <li>
          //   <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
          //     <i className="fa fa-dashboard fa-fw" /> Team B
          //   </a>
          // </li>
          // <li>
          //   <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
          //     <i className="fa fa-dashboard fa-fw" /> Team A
          //   </a>
          // </li>
          // <li>
          //   <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
          //     <i className="fa fa-dashboard fa-fw" /> Team B
          //   </a>
          // </li>
          // <li>
          //   <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
          //     <i className="fa fa-dashboard fa-fw" /> Team A
          //   </a>
          // </li>
          // <li>
          //   <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
          //     <i className="fa fa-dashboard fa-fw" /> Team B
          //   </a>
          // </li>
          // <li>
          //   <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
          //     <i className="fa fa-dashboard fa-fw" /> Team A
          //   </a>
          // </li>
          // <li>
          //   <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
          //     <i className="fa fa-dashboard fa-fw" /> Team B
          //   </a>
          // </li>
          // <li>
          //   <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
          //     <i className="fa fa-dashboard fa-fw" /> Team A
          //   </a>
          // </li>

export default SubSidebar;
