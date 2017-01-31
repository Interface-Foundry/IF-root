import React, { Component } from 'react';
import classNames from 'classnames';
import history from '../../core/history';
import SubSidebar from '../../components/SubSidebar';

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
                <i className="fa fa-bar-chart-o fa-fw" /> &nbsp; Purchased Carts
              </a>
            </li>
            <li>
              <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
                <i className="fa fa-bar-chart-o fa-fw" /> &nbsp; Stagnant Carts
              </a>
            </li>
          
     
            <li>
              <a href="" onClick={(e) => { e.preventDefault(); history.push('/forms'); }} >
                <i className="fa fa-table fa-fw" /> &nbsp;Sessions
              </a>
            </li>
            <li>
              <a href="" onClick={(e) => { e.preventDefault(); history.push('/flotcharts'); }} >
                <i className="fa fa fa-comments-o fa-fw" /> &nbsp; Slack Team Stats
              </a>
            </li>
           
           

            <li className={classNames({ active: !this.state.samplePagesCollapsed })}>
              <a
                href=""
                onClick={(e) => {
                  e.preventDefault();
                  this.setState({
                    samplePagesCollapsed: !this.state.samplePagesCollapsed,
                  });
                  return false;
                }}
              >
                <i className="fa fa-files-o fa-fw" />
                &nbsp;Process Amazon
                <span className="fa arrow" />
              </a>
              <ul
                className={
                  classNames({
                    'nav nav-second-level': true,
                    collapse: this.state.samplePagesCollapsed,
                  })}
              >
                <li>
                  <a href="" onClick={(e) => { e.preventDefault(); history.push('/blank'); }} >
                    Blank
                  </a>
                </li>
                <li>
                  <a href="" onClick={(e) => { e.preventDefault(); history.push('/login'); }} >
                    Login
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>

        <SubSidebar className="sidebar-nav navbar-collapse collapse" />
      </div>
    );
  }
}

 // <li className={classNames({ active: !this.state.uiElementsCollapsed })}>
 //              <a
 //                href=""
 //                onClick={(e) => {
 //                  e.preventDefault();
 //                  this.setState({ uiElementsCollapsed: !this.state.uiElementsCollapsed,
 //                }); return false;
 //                }}
 //              >
 //                <i className="fa fa-edit fa-fw" /> UI Elements<span className="fa arrow" />
 //              </a>

 //              <ul
 //                className={classNames({
 //                  'nav nav-second-level': true,
 //                  collapse: this.state.uiElementsCollapsed,
 //                })}
 //              >
 //                <li>
 //                  <a href="" onClick={(e) => { e.preventDefault(); history.push('/panelwells'); }} >
 //                    Slack Team Stats
 //                  </a>
 //                </li>
 //                <li>
 //                  <a href="" onClick={(e) => { e.preventDefault(); history.push('/button'); }} >
 //                    Buttons
 //                  </a>
 //                </li>
 //                <li>
 //                  <a
 //                    href=""
 //                    onClick={(e) => { e.preventDefault(); history.push('/notification'); }}
 //                  >
 //                    Notification
 //                  </a>
 //                </li>
 //                <li>
 //                  <a href="" onClick={(e) => { e.preventDefault(); history.push('/typography'); }} >
 //                    Typography
 //                  </a>
 //                </li>
 //                <li>
 //                  <a href="" onClick={(e) => { e.preventDefault(); history.push('/icons'); }} >
 //                    Icons
 //                  </a>
 //                </li>
 //                <li>
 //                  <a href="" onClick={(e) => { e.preventDefault(); history.push('/grid'); }} >
 //                    Grid
 //                  </a>
 //                </li>
 //              </ul>
 //            </li>



 // <li className={classNames({ active: !this.state.multiLevelDropdownCollapsed })}>
 //              <a
 //                href=""
 //                onClick={(e) => {
 //                  e.preventDefault();
 //                  this.setState({
 //                    multiLevelDropdownCollapsed: !this.state.multiLevelDropdownCollapsed,
 //                  });
 //                  return false;
 //                }}
 //              >
 //                <i className="fa fa-sitemap fa-fw" />
 //                &nbsp;Multi-Level Dropdown
 //                <span className="fa arrow" />
 //              </a>
 //              <ul
 //                className={
 //                  classNames({
 //                    'nav nav-second-level': true, collapse: this.state.multiLevelDropdownCollapsed,
 //                  })}
 //              >
 //                <li>
 //                  <a href="" onClick={(e) => { e.preventDefault(); }}>Second Level Item</a>
 //                </li>
 //                <li>
 //                  <a href="" onClick={(e) => { e.preventDefault(); }}>Second Level Item</a>
 //                </li>
 //                <li className={classNames({ active: !this.state.thirdLevelDropdownCollapsed })}>
 //                  <a
 //                    href=""
 //                    onClick={(e) => {
 //                      e.preventDefault();
 //                      this.setState({
 //                        thirdLevelDropdownCollapsed: !this.state.thirdLevelDropdownCollapsed,
 //                      });
 //                      return false;
 //                    }}
 //                  >
 //                    Third Level<span className="fa arrow" />
 //                  </a>
 //                  <ul
 //                    className={
 //                      classNames({
 //                        'nav nav-second-level': true,
 //                        collapse: this.state.thirdLevelDropdownCollapsed,
 //                      })}
 //                  >
 //                    <li>
 //                      <a href="" onClick={(e) => { e.preventDefault(); }}>Third Level Item</a>
 //                    </li>
 //                    <li>
 //                      <a href="" onClick={(e) => { e.preventDefault(); }}>Third Level Item</a>
 //                    </li>
 //                    <li>
 //                      <a href="" onClick={(e) => { e.preventDefault(); }}>Third Level Item</a>
 //                    </li>
 //                    <li>
 //                      <a href="" onClick={(e) => { e.preventDefault(); }}>Third Level Item</a>
 //                    </li>
 //                  </ul>
 //                </li>
 //              </ul>
 //            </li>

export default Sidebar;
