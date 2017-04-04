import { connect } from 'react-redux';
import { Deals } from '../components';

const mapStateToProps = (state, ownProps) => {
  return {
    isDropDown: ownProps.isDropDown,
    deals: state.deals
  };
};

export default connect(mapStateToProps)(Deals);
