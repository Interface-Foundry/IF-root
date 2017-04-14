import PropTypes from 'prop-types';
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

const RenderTable = ({ data }) => {
  return (
      <DeliveryTable data={data} />
  )
}

export default RenderTable;
