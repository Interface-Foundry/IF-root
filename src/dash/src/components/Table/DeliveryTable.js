import React from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

const DeliveryTable = ({ data }) => {
  console.log('deliver table data')
  console.log(data)
  return (
    <BootstrapTable data={data.deliveries} hover>
      <TableHeaderColumn isKey={true} dataField='time_started'>Created Date</TableHeaderColumn>
      <TableHeaderColumn dataField='team_id'>Team ID</TableHeaderColumn>
      <TableHeaderColumn dataField='item_count'>Item Count</TableHeaderColumn>
      <TableHeaderColumn dataField='chosen_restaurant'>Restaurant</TableHeaderColumn>
    </BootstrapTable>
  )
}

/* idk how to do this in react-bootstrap-table wrt the items
      <TableHeaderColumn dataField='user'>User ID</TableHeaderColumn>
      <TableHeaderColumn dataField='order'>Order</TableHeaderColumn>
*/

export default DeliveryTable;
