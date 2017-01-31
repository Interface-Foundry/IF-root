import React, {
  Component
} from 'react';
import classNames from 'classnames';
import history from '../../core/history';

class SubSidebar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      uiElementsCollapsed: true,
      chartsElementsCollapsed: true,
      multiLevelDropdownCollapsed: true,
      thirdLevelDropdownCollapsed: true,
      samplePagesCollapsed: true
    };
  }

  render() {
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
            <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
              <i className="fa fa-dashboard fa-fw" /> Team A
            </a>
          </li>
          <li>
            <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
              <i className="fa fa-dashboard fa-fw" /> Team B
            </a>
          </li>
          <li>
            <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
              <i className="fa fa-dashboard fa-fw" /> Team A
            </a>
          </li>
          <li>
            <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
              <i className="fa fa-dashboard fa-fw" /> Team B
            </a>
          </li>
          <li>
            <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
              <i className="fa fa-dashboard fa-fw" /> Team A
            </a>
          </li>
          <li>
            <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
              <i className="fa fa-dashboard fa-fw" /> Team B
            </a>
          </li>
          <li>
            <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
              <i className="fa fa-dashboard fa-fw" /> Team A
            </a>
          </li>
          <li>
            <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
              <i className="fa fa-dashboard fa-fw" /> Team B
            </a>
          </li>
          <li>
            <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
              <i className="fa fa-dashboard fa-fw" /> Team A
            </a>
          </li>
          <li>
            <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
              <i className="fa fa-dashboard fa-fw" /> Team B
            </a>
          </li>
          <li>
            <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
              <i className="fa fa-dashboard fa-fw" /> Team A
            </a>
          </li>
          <li>
            <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
              <i className="fa fa-dashboard fa-fw" /> Team B
            </a>
          </li>
          <li>
            <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
              <i className="fa fa-dashboard fa-fw" /> Team A
            </a>
          </li>
          <li>
            <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
              <i className="fa fa-dashboard fa-fw" /> Team B
            </a>
          </li>
          <li>
            <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
              <i className="fa fa-dashboard fa-fw" /> Team A
            </a>
          </li>
          <li>
            <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
              <i className="fa fa-dashboard fa-fw" /> Team B
            </a>
          </li>
          <li>
            <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
              <i className="fa fa-dashboard fa-fw" /> Team A
            </a>
          </li>
          <li>
            <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
              <i className="fa fa-dashboard fa-fw" /> Team B
            </a>
          </li>
          <li>
            <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
              <i className="fa fa-dashboard fa-fw" /> Team A
            </a>
          </li>
          <li>
            <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
              <i className="fa fa-dashboard fa-fw" /> Team B
            </a>
          </li>
          <li>
            <a href="" onClick={(e) => { e.preventDefault(); history.push('/'); }} >
              <i className="fa fa-dashboard fa-fw" /> Team A
            </a>
          </li>
        </ul>
      </div>
    );
  }
}


export default SubSidebar;