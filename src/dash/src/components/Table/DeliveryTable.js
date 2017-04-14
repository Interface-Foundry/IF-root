import React from 'react';
import PropTypes from 'prop-types';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

class DeliveryTable extends React.Component {
  render() {
    if (!this.props.data.deliveries) {
      return null;
    }
    return (
      <BootstrapTable data={this.props.data.deliveries} hover>
        <TableHeaderColumn isKey={true} dataField='time_started'>Created Date</TableHeaderColumn>
        <TableHeaderColumn dataField='team_id'>Team ID</TableHeaderColumn>
        <TableHeaderColumn dataField='item_count'>Item Count</TableHeaderColumn>
        <TableHeaderColumn dataField='chosen_restaurant'>Restaurant</TableHeaderColumn>
      </BootstrapTable>
    )
  }
}

DeliveryTable.propTypes = {
  data: PropTypes.object,
};

export default DeliveryTable;