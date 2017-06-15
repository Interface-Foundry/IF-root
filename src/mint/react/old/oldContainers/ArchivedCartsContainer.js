// react/containers/ArchivedCartsContainer.js

import { connect } from 'react-redux';
import { ArchivedCarts } from '../components';
import { fetchAllCarts } from '../actions/cart';

const mapStateToProps = (state, ownProps) => ({
  archivedCarts: state.otherCarts.archivedCarts
});

const mapDispatchToProps = dispatch => ({
  fetchAllCarts: () => dispatch(fetchAllCarts())
});

export default connect(mapStateToProps, mapDispatchToProps)(ArchivedCarts);
