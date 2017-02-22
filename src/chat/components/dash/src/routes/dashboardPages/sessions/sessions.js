import React, { PropTypes } from 'react';
import {
  MenuItem,
  DropdownButton,
  Panel, PageHeader, ListGroup, ListGroupItem, Button, Alert
} from 'react-bootstrap';
import StatWidget from '../../../components/Widget';
import Donut from '../../../components/Donut';
import Table from '../../../components/Table';

import {
  Tooltip,
  XAxis, YAxis, Area,
  CartesianGrid, AreaChart, Bar, BarChart,
  ResponsiveContainer } from '../../../vendor/recharts';

const title = 'Pokemon Gym - Escape Velocity - Sessions';


/************************************************
    ┏━┳━┳┓┏┳━┳┓┏━┓┏━┳━┳━━┳━┓
    ┃━┫╻┃ ┗┛┃┃┃┃┃━┫┃┃┃╻┣ ┓┏┫╻┃
    ┣━┃╻┃ ┃┃┃┏┫┗┫━┫┃┃┃╻┃ ┃┃┃╻┃
    ┗━┻┻┻┻┻┻┛┗━┻━┛┗━┻┻┛┗┛┗┻┛
************************************************/
const data = [
  { name: 'Page A', uv: 2000, pv: 240, amt: 20, value: 600 },
  { name: 'Page B', uv: 3000, pv: 1398, amt: 2210, value: 3000 },
  { name: 'Page C', uv: 2000, pv: 9800, amt: 2290, value: 500 },
  { name: 'Page D', uv: 2780, pv: 208, amt: 1000, value: 400 },
  { name: 'Page E', uv: 10, pv: 4800, amt: 2181, value: 200 },
  { name: 'Page F', uv: 2390, pv: 6800, amt: 2500, value: 700 },
  { name: 'Page G', uv: 8090, pv: 4300, amt: 2100, value: 100 },
];

const heads = [
  'Date / Time',
  'Team',
  'User',
  'Item',
  'Price',
  'Quantity',
  'Total',
  'Cart ID',
  'Platform'
];

const tableData = [
  ['02/15/17 3:15 pm',
    'kipfind',
    'Alyx Baldwin',
    'Shnozzleberries',
    '$2,321.55',
    '2',
    '$5,643.10',
    'slack_212344234',
    'slack'
  ], ['02/22/17 8:15 pm',
    'kipfind',
    'Alyx Baldwin',
    'Berryberries',
    '$1,218.63',
    '5',
    '$600,093.15',
    'slack_212344234',
    'slack'
  ]
];
/* *********************************************** */

function sessions(props, context) {
  context.setTitle(title);
  return (
    <div className="container-fluid">
      <div className='row'>
        <div>
          <Panel
            header={<span>
              <i className="fa fa-bar-chart-o fa-fw" /> Purchased Carts
              <div className="pull-right">
                <DropdownButton title="Dropdown" bsSize="xs" pullRight id="dropdownButton1" >
                  <MenuItem eventKey="1">Action</MenuItem>
                  <MenuItem eventKey="2">Another action</MenuItem>
                  <MenuItem eventKey="3">Something else here</MenuItem>
                  <MenuItem divider />
                  <MenuItem eventKey="4">Separated link</MenuItem>
                </DropdownButton>
              </div>
            </span>}>
              <div className="resizable">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <CartesianGrid stroke="#ccc" />
                    <Tooltip />
                    <Area type="monotone" dataKey="uv" stackId="1" stroke="#8804d8" fill="#8884d8" />
                    <Area type="monotone" dataKey="pv" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                    <Area type="monotone" dataKey="amt" stackId="1" stroke="#ffc658" fill="#ffc658" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
          </Panel>
        </div>
      </div>
      <div className='row'>
        <div>
          <Panel>
            <div className="table-responsive">
              <Table heads={heads} data={tableData}/>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

sessions.propTypes = {
  // news: PropTypes.arrayOf(PropTypes.shape({
  //   title: PropTypes.string.isRequired,
  //   link: PropTypes.string.isRequired,
  //   contentSnippet: PropTypes.string,
  // })).isRequired,
};

sessions.contextTypes = { setTitle: PropTypes.func.isRequired };

export default sessions;
