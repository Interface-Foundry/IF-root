// react/components/NotFound/index.js
// our shiny 404 page
import React, { PropTypes, Component } from 'react';
import classnames from 'classnames';

import '../style.css';

export default class NotFound extends Component {
  // static propTypes = {}
  // static defaultProps = {}
  // state = {}

  render() {
    const { className, ...props } = this.props;
    return (
      <div className={classnames('NotFound', className)}>
        <h1>
          404 <small>Not Found :(</small>
        </h1>
      </div>
    );
  }
}
