import React from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

function nameFormatter(data, cell) {
  return `<p>${cell[data]}</p>`;
}

const CafeTable = ({data}) => {
  // data transformation here
  return (
    <BootstrapTable data={data} hover>
      <TableHeaderColumn isKey={true} dataField='time_started'>Created Date</TableHeaderColumn>
      <TableHeaderColumn dataField='team_id'>Team ID</TableHeaderColumn>
      <TableHeaderColumn dataField='team' dataFormat={ nameFormatter.bind(this, 'team_name') }>Team</TableHeaderColumn>
      <TableHeaderColumn dataField='item_count'>Item Count</TableHeaderColumn>
      <TableHeaderColumn dataField='chosen_restaurant'>Restaurant</TableHeaderColumn>
    </BootstrapTable>
  );
};

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

export { CafeTable, CartTable };
