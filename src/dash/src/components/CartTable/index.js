import React, {
  Component,
  PropTypes
} from 'react';
import {Panel} from 'react-bootstrap';
import Table from '../Table';
import fetch from '../../core/fetch';
import co from 'co';

class CartTable extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  cartsAreSame(cart1,cart2){
    if(cart1.length == cart2.length){
      if(JSON.stringify(cart1) == JSON.stringify(cart2)){
        return true;
      }
    }
      return false;
  }

  shouldComponentUpdate(nextProps, nextState){
    if(this.state.carts && this.cartsAreSame(nextState.carts,this.state.carts)){
      if(new Date(nextProps.start).toLocaleString() == new Date(this.props.start).toLocaleString() && new Date(nextProps.end).toLocaleString() == new Date(this.props.end).toLocaleString()){
        return false;
      }
    }
    return true;
  }

  componentDidUpdate(){
    var self = this;
    co(function * () {
        const data = self.props.data;
        if (data){
          let carts = data.reduce(self.props.process, []);
          self.setState({carts: carts},)
        } else  {
          throw new Error('Failed to load carts.')
        }
      })
  }

  componentDidMount() {
    var self = this;
    co(function * () {
        const data = self.props.data;
        if (data){
          let carts = data.reduce(self.props.process, []);
          self.setState({carts: carts})
        } else  {
          throw new Error('Failed to load carts.')
        }
    })
  }

  render() {
    const {carts} = this.state;
    const data = carts ? carts : [[]];
    return (
        <Table heads={this.props.heads} data={data} colorBy={this.props.colorBy} />
    )
  }
}


export default CartTable;