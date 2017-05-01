import { connect } from 'react-redux';
import Hero from '../components/Hero';

import { shuffleItems } from '../actions/hero';

const mapStateToProps = (state, props) => ({
    items: state.hero.items
})

const mapDispatchToProps = dispatch => ({
    shuffleItems: () => dispatch(shuffleItems())
})

export default connect(mapStateToProps, mapDispatchToProps)(Hero);
