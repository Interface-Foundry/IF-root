import React, {
  Component,
  PropTypes
} from 'react';
import {Panel} from 'react-bootstrap';
import Table from './common';
import co from 'co';

class DeliveryTable extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  cartsAreSame(deliveries1,deliveries2){
    if(deliveries1.length == deliveries2.length){
      if(JSON.stringify(deliveries1) == JSON.stringify(deliveries2)){
        return true;
      }
    }
      return false;
  }

  shouldComponentUpdate(nextProps, nextState){
    if(this.state.deliveries && this.cartsAreSame(nextState.deliveries,this.state.deliveries)){
      if(new Date(nextProps.start).toLocaleString() == new Date(this.props.start).toLocaleString() && new Date(nextProps.end).toLocaleString() == new Date(this.props.end).toLocaleString()){
        return false;
      }
    }
    return true;
  }

  componentDidUpdate(){
    var self = this;
    co(function * () {
        var {data} = self.props.data;
        if (data){
          let deliveries = data.deliveries.reduce(self.props.process, []);
          self.setState({deliveries: deliveries},)
        } else  {
          throw new Error('Failed to load deliveries.')
        }
      })
  }

  componentDidMount() {
    var self = this;
    co(function * () {
        var {data} = self.props.data;
        if (data){
          let deliveries = data.deliveries.reduce(self.props.process, []);
          self.setState({deliveries: deliveries},)
        } else  {
          throw new Error('Failed to load deliveries.')
        }
      })
  }

  render() {
    const {deliveries} = this.state;
    const data = deliveries ? deliveries : [[]];
    return (
        <Table heads={this.props.heads} data={data} colorBy={this.props.colorBy} />
    )
  }
}

export default DeliveryTable;