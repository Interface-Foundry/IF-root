// react/containers/AppContainer.js

import { connect } from 'react-redux';
import { Share } from '../components';

import { selectTab } from '../actions';

const mapStateToProps = (state, ownProps) => {
  return {
    tab: state.app.viewTab

  };
};

const mapDispatchToProps = dispatch => ({
  setTab: () => dispatch(selectTab('share'))
});

export default connect(mapStateToProps, mapDispatchToProps)(Share);