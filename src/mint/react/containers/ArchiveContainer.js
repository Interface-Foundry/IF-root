// react/containers/ArchiveContainer.js

import { connect } from 'react-redux';
import { ArchivedCarts } from '../components';

const mapStateToProps = (state, ownProps) => ({
  archivedCarts: state.carts.archivedCarts
});

export default connect(mapStateToProps)(ArchivedCarts);
