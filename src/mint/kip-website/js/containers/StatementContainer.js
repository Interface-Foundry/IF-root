import { connect } from 'react-redux';
import Statement from '../components/Statement';

const mapStateToProps = (state, props) => ({
    quantity: state.hero.quantity,
    items: state.hero.items
})

export default connect(mapStateToProps)(Statement);
