import React from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

// creates a table based on an array of arrays
// Additionally, if there is a 'colorBy' prop
// tries to create unique colors
class Table extends React.Component {

  // componentDidMount() {
  //   var self = this;
  // }

  createTableHeaders(heads) {
    return heads.map((head, i) =>
      <TableHeaderColumn
      dataField={head.field}
      isKey={i==1}
      trClassName='table-row'
      dataSort={(head.allowSort || head.allowSort === undefined)}
      dataFormat={head.dataFormat} sortFunc={ head.sort }  key={i} search={ true } bordered={ false }>{head.descrip}</TableHeaderColumn>)
  }

  render() {
    return (
      <BootstrapTable ref='table' height='500px' scrollTop={ 'Top' } data={ this.props.data }  hover>
        {this.createTableHeaders(this.props.heads)}
      </BootstrapTable>
    )
  }
}

export default Table;
