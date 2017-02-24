import React, {
  Component,
  PropTypes
} from 'react';
import Table from '../Table';
import fetch from '../../core/fetch';
import co from 'co';

class CartTable extends Component {

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
        if (!data || !data.carts) throw new Error('Failed to load carts.')
        else  {
          data.carts.sort(self.props.sort);
          data.carts = yield data.carts.map(self.props.process);
          self.setState({carts: data.carts})
        }
    })
  }

  render() {
    const {carts} = this.state;
    const data = carts ? carts : [[]];
    return (
      <Table heads={this.props.heads} data={data} colorBy={this.props.colorBy} />
    )
  }
}


export default CartTable;