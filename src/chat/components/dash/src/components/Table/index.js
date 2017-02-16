import React, {
  Component,
  PropTypes
} from 'react';
import {
  Table
} from 'react-bootstrap';

class CustomTable extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Table>
        <thead>
            {createTableHeaders(this.props.heads)}
        </thead>
        <tbody>
            {createTableRows(this.props.data)}
        </tbody>
    </Table>
    )
  }
}

function createTableHeaders(heads) {
  return <tr>{heads.map((head, i) => <th key={i}>{head}</th>)}</tr>
}

function createTableRow(row) {
  return row.map((col, i) => <td key={i}>{col}</td>)
}

function createTableRows(data) {
  return data.map((row, i) => <tr key={i} data-toggle="collapse" data-target="#demo1" className="accordion-toggle">{createTableRow(row)}</tr>)
}


export default CustomTable;