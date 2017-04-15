import React from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
//carts{created_date, team{team_name}, type, item_count, cart_total, items{title}}}
const CartTable = ({data}) => {
  return (
    <BootstrapTable data={data} hover>
      <TableHeaderColumn isKey={true} dataField='created_date'>Created Date</TableHeaderColumn>
      <TableHeaderColumn dataField='item_count'>Item Count</TableHeaderColumn>
      <TableHeaderColumn dataField='cart_total'>Cart Total</TableHeaderColumn>
    </BootstrapTable>
  );
};
      // <TableHeaderColumn dataField='team.team_name'>Team ID</TableHeaderColumn>

export default CartTable;
