import React, { Component } from 'react';
import classNames from 'classnames';
import history from '../../core/history';

class Sidebar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      uiElementsCollapsed: true,
      chartsElementsCollapsed: true,
      multiLevelDropdownCollapsed: true,
      thirdLevelDropdownCollapsed: true,
      samplePagesCollapsed: true,
    };
  }

  render() {
    return (
      <div className="navbar-default sidebar" style={{ marginLeft: '-20px' }} role="navigation">

        <div className="sidebar-nav navbar-collapse collapse category-sidebar">
          <ul className="nav in" id="side-menu">
            <li>
              <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
                <i className="fa fa-bar-chart-o fa-fw" /> &nbsp; Paid/Unpaid Carts
              </a>
            </li>
            <li>
              <a href="" onClick={(e) => { e.preventDefault(); history.push('/sessions'); }} >
                <i className="fa fa-table fa-fw" /> &nbsp; Cart Tracking
              </a>
            </li>
            <li>
              <a href="" onClick={(e) => { e.preventDefault(); history.push('/slackteamstats'); }} >
                <i className="fa fa-users fa-fw" /> &nbsp; Team Stats
              </a>
            </li>
            <li>
              <a href="" onClick={(e) => { e.preventDefault(); history.push('/sendmessage'); }} >
                <i className="fa fa-comments-o fa-fw" /> &nbsp; Send Message
              </a>
            </li>
            <li>
              <a href="" onClick={(e) => { e.preventDefault(); history.push('/amazoncsv'); }} >
                <i className="fa fa-upload fa-fw" /> &nbsp; Upload Amazon CSV
              </a>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

export default Sidebar;
