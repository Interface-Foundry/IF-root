import React from 'react';
import PropTypes from 'prop-types';
import {Panel} from 'react-bootstrap';
import DeliveryTable from './DeliveryTable';

/*
          <div className="panel panel-default">
            <RenderTable
              data={this.props.data.data}
              startDate={this.state.startDate}
              endDate={this.state.endDate}
            />
          </div>
*/

const RenderTable = ({ data }) =>
  {
    return (
      <Panel header={<span><i className="fa fa-table fa-fw" /> Delivery Carts</span>}>
        <DeliveryTable />
      </Panel>
    )
}

export default RenderTable;
