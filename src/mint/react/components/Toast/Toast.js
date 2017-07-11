// react/components/Toast/Toast.js

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

export default class Toast extends Component {
  static propTypes = {
    toast: PropTypes.string,
    status: PropTypes.string,
    loc: PropTypes.object,
    replace: PropTypes.func
  }

  redirect = null

  state = {
    showToast: false
  }

  componentWillMount() {
    const { status, toast } = this.props;
    if (toast && status)::this._showToast(status, toast);
  }

  componentWillReceiveProps(nextProps) {
    const { toast, status, loc: { pathname: path } } = this.props;
    const { toast: newToast, status: newStatus, loc: { pathname: newPath } } = nextProps;
    if ((newToast && newStatus) && (toast !== newToast || status !== newStatus))::this._showToast(newStatus, newToast);
    else if (newPath !== path)::this._cancelRedirect();
  }

  _cancelRedirect() {
    this.setState({ toast: null, status: null, showToast: false });
    clearTimeout(this.redirect);
    this.redirect = null;
  }

  _showToast(status, toast) {
    setTimeout(() => this.setState({ status, toast, showToast: true }), 1);
    setTimeout(() => {
      this.setState({ toast: null, status: null, showToast: false });
      ::this._clearParams();
    }, 4000);
  }

  _clearParams() {
    const { replace, loc } = this.props;
    clearTimeout(this.redirect);
    this.setState({ showToast: false });
    let cleanSearch = loc.search
      .replace(/toast=.*?&status=.*?($|&)/, '')
      .replace(/(&*|\?*)$/, ''); // remove toast stuff from the url, then clean out any trailing &s or ?s
    replace(loc.pathname + cleanSearch);
  }

  render() {
    const { props: { status, toast }, state: { showToast } } = this;
    return (
      <CSSTransitionGroup
        transitionName='toastTransition'
        transitionEnterTimeout={0}
        transitionLeaveTimeout={0}>
        {
          showToast 
            ? <div className={`${status} toast`} key={toast}>
                {toast}
            </div>
            : null
        }
      </CSSTransitionGroup>
    );
  }
}
