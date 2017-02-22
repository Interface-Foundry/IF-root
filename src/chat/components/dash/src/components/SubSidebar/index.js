import React, {
  Component
} from 'react';
import classNames from 'classnames';
import history from '../../core/history';
import fetch from '../../core/fetch';
import co from 'co';

var teams = [{name : 'Team A', url: '/slackteamstats'},
   {name : 'Team B', url: '/slackteamstats'},
   {name : 'Team C', url: '/slackteamstats'},
   {name : 'Team D', url: '/slackteamstats'},
   {name : 'Team E', url: '/slackteamstats'},
   {name : 'Team F', url: '/slackteamstats'},
   {name : 'Team G', url: '/slackteamstats'},
   {name : 'Team H', url: '/slackteamstats'},
   {name : 'Team I', url: '/slackteamstats'},
   {name : 'Team J', url: '/slackteamstats'},
   {name : 'Team K', url: '/slackteamstats'},
   {name : 'Team L', url: '/slackteamstats'},
   {name : 'Team M', url: '/slackteamstats'},
   {name : 'Team N', url: '/slackteamstats'},
   {name : 'Team O', url: '/slackteamstats'},
   {name : 'Team P', url: '/slackteamstats'},
   {name : 'Team Q', url: '/slackteamstats'},
   {name : 'Team R', url: '/slackteamstats'},
   {name : 'Team S', url: '/slackteamstats'}]



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
      return <li key={team.name}> <a href="" onClick={(e) => { e.preventDefault(); history.push('/slackteamstats'); }} > <i className="fa fa-dashboard fa-fw" /> {team.name}</a></li>}) : []
          
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
