import React, { PropTypes, Component } from 'react';
import {Item, AddAmazonItem} from '..';
import { Row, Col, ListGroup, ListGroupItem, Panel} from 'react-bootstrap';

export default class Cart extends Component {
  static propTypes = {
    addItem: PropTypes.func.isRequired,
    fetchItems: PropTypes.func.isRequired,
    cart_id: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.object).isRequired
  }

  componentDidMount() {
    const { fetchItems, cart_id } = this.props;
    fetchItems(cart_id);
  }

  listItems(hasItems, items) {
    return hasItems ? items.map((item, i) => <Item key={i} item={item} />) : <em>Please add some products to the cart.</em>;
  }

  render() {
    const { cart_id, addItem, items } = this.props;

    const hasItems = items.length > 0;
    return (
      <div>
          <Row>
              <Col xs={12}>
                  <AddAmazonItem cart_id={cart_id} addItem={addItem} />
              </Col>
          </Row>
          <Row>
              <Col xs={12} className="text-center">
                  <h4>Group Shopping Cart</h4>
              </Col>
          </Row>
          <Row>
              <Col xs={12}>
                  <Panel header="Email@email.com">
                      <ListGroup fill>
                          {this.listItems(hasItems, items)}
                      </ListGroup>
                  </Panel>

              </Col>
          </Row>
    </div>
    );
  }
}
