import React from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

export default class DeliveryTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  // cartsAreSame(deliveries1,deliveries2){
  //   if(deliveries1.length == deliveries2.length){
  //     if(JSON.stringify(deliveries1) == JSON.stringify(deliveries2)){
  //       return true;
  //     }
  //   }
  //     return false;
  // }
  // shouldComponentUpdate(nextProps, nextState){
  //   if(this.state.deliveries && this.cartsAreSame(nextState.deliveries,this.state.deliveries)){
  //     if(new Date(nextProps.start).toLocaleString() == new Date(this.props.start).toLocaleString() && new Date(nextProps.end).toLocaleString() == new Date(this.props.end).toLocaleString()){
  //       return false;
  //     }
  //   }
  //   return true;
  // }
  // componentDidUpdate(){
  //   var self = this;
  //   co(function * () {
  //       var {data} = self.props.data;
  //       if (data){
  //         let deliveries = data.deliveries.reduce(self.props.process, []);
  //         self.setState({deliveries: deliveries},)
  //       } else  {
  //         throw new Error('Failed to load deliveries.')
  //       }
  //     })
  // }
  // componentDidMount() {
  //   var self = this;
  //   co(function * () {
  //       var {data} = self.props.data;
  //       if (data){
  //         let deliveries = data.deliveries.reduce(self.props.process, []);
  //         self.setState({deliveries: deliveries},)
  //       } else  {
  //         throw new Error('Failed to load deliveries.')
  //       }
  //     })
  // }


  render() {
    return (
      <BootstrapTable data={this.props.data} hover>
        <TableHeaderColumn isKey={true} dataField='created_date'>Created Date</TableHeaderColumn>
        <TableHeaderColumn dataField='team_name'>Slack ID</TableHeaderColumn>
        <TableHeaderColumn dataField='cart_total'>Cart Total</TableHeaderColumn>
        <TableHeaderColumn dataField='restaurant'>Restaurant</TableHeaderColumn>
        <TableHeaderColumn dataField='cart_size'>Cart Size</TableHeaderColumn>
        <TableHeaderColumn dataField='user'>User ID</TableHeaderColumn>
        <TableHeaderColumn dataField='order'>Order</TableHeaderColumn>
      </BootstrapTable>
    );
  }
}