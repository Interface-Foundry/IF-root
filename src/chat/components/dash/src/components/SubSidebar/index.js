import React,{
  Component,
  PropTypes
} from 'react';
import classNames from 'classnames';
import history from '../../core/history';
import fetch from '../../core/fetch';
import co from 'co';

class SubSidebar extends Component {

  constructor(props) {
  super(props);
    this.state = {
      uiElementsCollapse: true,
      chartsElementsCollapsed: true,
      multiLevelDropdownCollapsed: true,
      thirdLevelDropdownCollapsed: true,
      samplePagesCollapsed: true,
      searchTerm: '',
      selectedTeam: '',
    };
    this.handleSearchInput = this.handleSearchInput.bind(this)
    this.filterData = this.filterData.bind(this)
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

  handleSearchInput(event) {
    this.setState({
      searchString: event.target.value
    });
  }

  filterData(teams, filter) {
    if (filter === "" || !filter) {
      return teams
    };
    return (
      teams.filter(function(team) {
        return (team.team_name.toLowerCase().includes(filter.toLowerCase()))
      })
    );
  }

  render() {
    var { selectedTeam } = this.state;
    var self = this;
    const { teams } = this.state;
    let filteredData = this.filterData(teams, this.state.searchString);
    const displayTeams = filteredData ? filteredData.map( function(team) { 
      var teamName = team.team_name;
      return <li key={team.team_id}> <a href="" onClick={(e) => { e.preventDefault(); self.setState({selectedTeam: teamName}); }}> <i className="fa fa-dashboard fa-fw" /> {teamName}</a></li>}) : []
          
    return (
      <div className="sidebar-nav navbar-collapse collapse">
        <ul className="nav in" id="side-menu">
          <li className="sidebar-search">
            <div className="input-group custom-search-form">
              <input type="text" className="form-control" onChange={this.handleSearchInput} placeholder="Search..." />
              <span className="input-group-btn">
                <button className="btn btn-default" type="button">
                  <i className="fa fa-search" />
                </button>
              </span>
            </div>
          </li>
          <li>
            <a href="" onClick={(e) => { e.preventDefault(); this.setState({selectedTeam: ''}); }}> <i className="fa fa-dashboard fa-fw" /> All teams</a>
          </li>
          {
            displayTeams
          }

        </ul>
      </div>
    );
  }
}

SubSidebar.propTypes = {
  selectedTeam: PropTypes.string
}

export default SubSidebar;
