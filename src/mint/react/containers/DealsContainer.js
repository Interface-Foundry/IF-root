import { connect } from 'react-redux';
import { DealsSection } from '../components';

import { fetchDeals } from '../actions/deals';

const mapStateToProps = (state, ownProps) => ({
  isDropDown: false // TODO: figure out where the form tap in is
});

const mapDispatchToProps = dispatch => ({
  fetchDeals: () => dispatch(fetchDeals())
});

export default connect(mapStateToProps, mapDispatchToProps)(DealsSection);
