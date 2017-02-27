import React, { PropTypes } from 'react';
import {
  MenuItem,
  DropdownButton,
  Panel, PageHeader, ListGroup, ListGroupItem, Button, Alert
} from 'react-bootstrap';
import StatWidget from '../../../components/Widget';
import Donut from '../../../components/Donut';
import CartTable from '../../../components/CartTable';

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
/******* */

function sessions(props, context) {
  context.setTitle(title);
  return (
    <div className="container-fluid data-display">
      <Panel
        header={<span>
          <i className="fa fa-bar-chart-o fa-fw" /> Purchased Carts
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
      <Panel className='fillSpace' header={<span>
          <i className="fa fa-bar-chart-o fa-fw" /> Open Carts </span>}>
        <CartTable 
          query={'{carts(purchased: "false") {created_date,slack_id,items}}'}
          heads={['Open Since', 'Created Date', 'Slack ID', 'Number of Items']}
          colorBy={2}
          process = {
            cart => {
              return fetch('/graphql', {
                  method: 'post',
                  headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    query: `{teams(team_id:"${cart.slack_id}"){team_name}}`,
                  }),
                  credentials: 'include',
                })
                .then((data) => data.json())
                .then(json => [
                  vagueTime.get({
                    from: Date.now(),
                    to: Date.parse(cart.created_date)
                  }),
                  (new Date(cart.created_date)).toLocaleString(), json.data.teams && json.data.teams[0] ? json.data.teams[0].team_name : cart.slack_id, cart.items.split(',').length
                ])
            }
          }
          sort={(a, b) =>  new Date(b.created_date) - new Date(a.created_date)}
        />
      </Panel>
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
