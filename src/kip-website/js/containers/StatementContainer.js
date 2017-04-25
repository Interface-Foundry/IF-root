import { connect } from 'react-redux';
import Statement from '../components/Statement';

const mapStateToProps = (state, props) => ({
    selectedItemIndex: state.hero.selectedItemIndex,
    items: state.hero.items
})

export default connect(mapStateToProps)(Statement);
