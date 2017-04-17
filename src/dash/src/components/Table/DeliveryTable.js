import React from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

function nameFormatter(data, cell) {
  return `<p>${cell[data]}</p>`;
}

const DeliveryTable = ({data}) => {
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

export default DeliveryTable;
