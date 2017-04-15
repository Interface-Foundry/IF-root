import React from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

const DeliveryTable = ({data}) => {
  return (
    <BootstrapTable data={data} hover>
      <TableHeaderColumn isKey={true} dataField='time_started'>Created Date</TableHeaderColumn>
      <TableHeaderColumn dataField='team_id'>Team ID</TableHeaderColumn>
      <TableHeaderColumn dataField='item_count'>Item Count</TableHeaderColumn>
      <TableHeaderColumn dataField='chosen_restaurant'>Restaurant</TableHeaderColumn>
    </BootstrapTable>
  );
};

export default DeliveryTable;
