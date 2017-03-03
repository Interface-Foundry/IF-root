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
    return heads.map((head, i) => <TableHeaderColumn isKey={i==1} trClassName='table-row' dataSort={(head.allowSort || head.allowSort === undefined)} sortFunc={ head.sort } dataField={head.field} key={i} search={ true } bordered={ false }>{head.descrip}</TableHeaderColumn>)
  }

  render() {
    return (
      <BootstrapTable ref='table' height='500px' scrollTop={ 'Top' } data={ this.props.data }  hover>
        {this.createTableHeaders(this.props.heads)}
      </BootstrapTable>
    )
  }
}

export default CustomTable;
