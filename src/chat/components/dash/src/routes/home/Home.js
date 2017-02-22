import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {
  MenuItem,
  DropdownButton,
  Panel, PageHeader, ListGroup, ListGroupItem, Button, Alert
} from 'react-bootstrap';
import s from './Home.css';
import StatWidget from '../../components/Widget';
import Donut from '../../components/Donut';
import Table from '../../components/Table';
import SubSidebar from '../../components/SubSidebar';

import {
  Tooltip,
  XAxis, YAxis, Area,
  CartesianGrid, AreaChart, Bar, BarChart,
  ResponsiveContainer } from '../../vendor/recharts';

const title = 'Pokemon Gym - Escape Velocity';


/************************************************
    ┏━┳━┳┓┏┳━┳┓┏━┓┏━┳━┳━━┳━┓
    ┃━┫╻┃ ┗┛┃┃┃┃┃━┫┃┃┃╻┣ ┓┏┫╻┃
    ┣━┃╻┃ ┃┃┃┏┫┗┫━┫┃┃┃╻┃ ┃┃┃╻┃
    ┗━┻┻┻┻┻┻┛┗━┻━┛┗━┻┻┛┗┛┗┻┛
************************************************/
const data = [
  { name: 'Page A', uv: 4000, pv: 2400, amt: 2400, value: 600 },
  { name: 'Page B', uv: 3000, pv: 1398, amt: 2210, value: 300 },
  { name: 'Page C', uv: 2000, pv: 9800, amt: 2290, value: 500 },
  { name: 'Page D', uv: 2780, pv: 3908, amt: 2000, value: 400 },
  { name: 'Page E', uv: 1890, pv: 4800, amt: 2181, value: 200 },
  { name: 'Page F', uv: 2390, pv: 3800, amt: 2500, value: 700 },
  { name: 'Page G', uv: 3490, pv: 4300, amt: 2100, value: 100 },
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
  ['01/15/17 3:15 pm',
    'kipsearch',
    'Alyx Baldwin',
    'Shnozzleberries',
    '$2,321.55',
    '2',
    '$5,643.10',
    'slack_212344234',
    'slack'
  ], ['01/22/17 8:15 pm',
    'kipsearch',
    'Alyx Baldwin',
    'Berryberries',
    '$1,218.63',
    '5',
    '$6,093.15',
    'slack_212344234',
    'slack'
  ]
];
/* *********************************************** */

function Home(props, context) {
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
                    <Area type="monotone" dataKey="uv" stackId="1" stroke="#8884d8" fill="#8884d8" />
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

Home.propTypes = {
  // news: PropTypes.arrayOf(PropTypes.shape({
  //   title: PropTypes.string.isRequired,
  //   link: PropTypes.string.isRequired,
  //   contentSnippet: PropTypes.string,
  // })).isRequired,
};

Home.contextTypes = { setTitle: PropTypes.func.isRequired };

export default withStyles(s)(Home);
