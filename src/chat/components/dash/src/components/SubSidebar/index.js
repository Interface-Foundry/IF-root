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
    this.navToTeam = this.navToTeam.bind(this)
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
          console.log(data.teams);
          self.setState({teams: data.teams})
        }
    })
  }

  handleSearchInput(event) {
    this.setState({
      searchString: event.target.value
    });
  }

  navToTeam(e, team_id) {
    e.preventDefault();
    //history.push(`/team?id=${team_id}`)
    var url = window.location.pathname
    if(url.includes('?')){
      url_pieces = url.split('?')
      history.push(url_pieces[0]+`?id=${team_id}`)
    }
    history.push(url+`?id=${team_id}`)
  }

  filterData(teams, filter) {
    if (filter === "" || !filter) {
      return teams
    };
    return (
      teams.filter(team => team.team_name.toLowerCase().includes(filter.toLowerCase()))
    );
  }

  render() {
    var self = this;
    const { teams } = this.state;
    let filteredData = this.filterData(teams, this.state.searchString);
    const displayTeams = filteredData ? filteredData.map(team => <li key={team.team_id}> <a href="" onClick={(e) => self.navToTeam(e, team.team_id)}> <i className="fa fa-dashboard fa-fw" /> {team.team_name}</a></li>) : [];
          
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
            <a href="" onClick={(e) => self.navToTeam(e, '')}> <i className="fa fa-dashboard fa-fw" /> All teams</a>
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
