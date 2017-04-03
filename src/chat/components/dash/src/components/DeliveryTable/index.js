import React, {
  Component,
  PropTypes
} from 'react';
import {Panel} from 'react-bootstrap';
import Table from '../Table';
import fetch from '../../core/fetch';
import co from 'co';

class DeliveryTable extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    var self = this;
    co(function * () {
      const resp = yield fetch('/graphql', {
          method: 'post',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: self.props.query,
          }),
          credentials: 'include',
        });
        const { data } = yield resp.json();
        if (data && data.teams){
          let deliveries = data.teams.reduce(self.props.process, []);
          self.setState({deliveries: deliveries})
        } else  {
          throw new Error('Failed to load deliveries.')
        }
    })
  }

  render() {
    const {deliveries} = this.state;
    const data = deliveries ? deliveries : [[]];
    return (
      <Panel className='fillSpace' header={<span><i className="fa fa-bar-chart-o fa-fw" /> Purchased Cafe Carts </span>}>
        <Table heads={this.props.heads} data={data} colorBy={this.props.colorBy} />
      </Panel>
    )
  }
}


export default DeliveryTable;