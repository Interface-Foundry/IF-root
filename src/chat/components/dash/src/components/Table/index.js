import React, {
  Component,
  PropTypes
} from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

// creates a table based on an array of arrays
// Additionally, if there is a 'colorBy' prop
// tries to create unique colors
class CustomTable extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    var self = this;
    
  }

  createTableHeaders(heads) {
    return heads.map((head, i) => <TableHeaderColumn isKey={i==1} dataSort={true} dataField={head.field} key={i}>{head.descrip}</TableHeaderColumn>)
  }

  render() {
    return (
      <BootstrapTable ref='table' scrollTop={ 'Bottom' } data={ this.props.data } hover>
        {this.createTableHeaders(this.props.heads)}
      </BootstrapTable>
    )
  }
}

export default CustomTable;
