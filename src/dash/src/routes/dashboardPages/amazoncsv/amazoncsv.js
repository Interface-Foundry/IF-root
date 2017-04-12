import React, { PropTypes } from 'react';
import { PageHeader } from 'react-bootstrap';
import CSVDrop from '../../../components/CSVDrop';

const title = 'Amazon CSV';

function displayAmazonCSV(props, context) {
  context.setTitle(title);
  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <PageHeader>Amazon CSV</PageHeader>
          <CSVDrop />
        </div>
      </div>
    </div>
  );
}


displayAmazonCSV.contextTypes = { setTitle: PropTypes.func.isRequired };
export default displayAmazonCSV;
