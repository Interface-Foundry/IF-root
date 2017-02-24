import React, {
  Component,
  PropTypes
} from 'react';
import {
  Table
} from 'react-bootstrap';


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

  render() {

    return (
      <div className="table-responsive">
        <Table className='table-hover'>
          <thead>
              {createTableHeaders(this.props.heads)}
          </thead>
          <tbody>
              {createTableRows(this.props.data)}
          </tbody>
      </Table>
    </div>
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
