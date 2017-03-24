import React, { PropTypes, Component } from 'react';
import AddAmazonItem from './AddAmazonItem';
import Item from './Item';
import { Row, Col, ListGroup, ListGroupItem} from 'react-bootstrap';

export default class Cart extends Component {
  static propTypes = {
    addItem: PropTypes.func.isRequired,
    cart_id: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.object).isRequired
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
                  <ListGroup>
                      {this.listItems(hasItems, items)}
                  </ListGroup>
              </Col>
          </Row>
    </div>
    );
  }
}
