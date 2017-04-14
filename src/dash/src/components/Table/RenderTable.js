import React from 'react';
import PropTypes from 'prop-types';
import DeliveryTable from './DeliveryTable';
// import CartTable from './CartTable';

/*
          <div className="panel panel-default">
            <RenderTable
              data={this.props.data.data}
              startDate={this.state.startDate}
              endDate={this.state.endDate}
            />
          </div>
*/


export default class RenderTable extends React.Component {
  render() {
    if (this.props.cart==="Cafe") {
      return (<DeliveryTable data={this.props.data} />);

    }
  }
}

