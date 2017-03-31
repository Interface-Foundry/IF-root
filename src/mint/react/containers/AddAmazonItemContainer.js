import { connect } from 'react-redux';
import { changeKipFormView } from '../actions/kipForm';
import { toggleAddingToCart } from '../actions/session';
import { AddAmazonItem } from '../components';

const mapDispatchToProps = dispatch => ({
  changeKipFormView: (viewInt) => dispatch(changeKipFormView(viewInt)),
  toggleAddingToCart: () => dispatch(toggleAddingToCart())
})

const mapStateToProps = (state, ownProps) => ({
  user_accounts: state.session.user_accounts
})

export default connect(mapStateToProps, mapDispatchToProps)(AddAmazonItem)
