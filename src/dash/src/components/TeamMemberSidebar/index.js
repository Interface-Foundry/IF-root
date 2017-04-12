import React, {
  Component,
  PropTypes
} from 'react';
import history from '../../core/history';
import fetch from '../../core/fetch';
import co from 'co';

class TeamMemberSidebar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      uiElementsCollapse: true,
      chartsElementsCollapsed: true,
      multiLevelDropdownCollapsed: true,
      thirdLevelDropdownCollapsed: true,
      samplePagesCollapsed: true,
      searchTerm: '',
      selectedMember: '',
    };
    this.handleSearchInput = this.handleSearchInput.bind(this)
    this.filterData = this.filterData.bind(this)
    this.navToMember = this.navToMember.bind(this)
  }

  componentDidMount() {
    var self = this;
    this.setState({
      members: this.props.members
    })
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      members: newProps.members,
    })
  }

  handleSearchInput(event) {
    this.setState({
      searchString: event.target.value
    });
  }

  navToMember(e, member) {
    e.preventDefault();
    this.props.navToMember(member)
  }

  filterData(members, filter) {
    if (filter === "" || !filter) {
      return members
    };
    return (
      members.filter(member => member.label.toLowerCase().includes(filter.toLowerCase()))
    );
  }

  render() {
    var self = this;
    const {
      members
    } = this.state;
    let filteredData = this.filterData(members, this.state.searchString);
    const displayMembers = filteredData ? filteredData.map(member => <li key={member.value}> <a href="" onClick={(e) => self.navToMember(e, member)}> {member.label}</a></li>) : [];

    return (
      <div className="navbar-default sidebar page-sidebar">
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
          {
            displayMembers
          }
        </ul>
      </div>
      </div>
    );
  }
}

TeamMemberSidebar.propTypes = {
  selectedMember: PropTypes.string
}

export default TeamMemberSidebar;