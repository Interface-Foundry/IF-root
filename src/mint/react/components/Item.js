import React, { PropTypes, Component } from 'react';
import {ListGroupItem, Button, Col, Row, Image} from 'react-bootstrap';

export default class Item extends Component {
  static propTypes = {
    item: PropTypes.object.isRequired
  }

  render() {
    const { item } = this.props;
    return (
      <ListGroupItem href={item.original_link} header={`Item #${item.id} Name: ${item.descrip}`}>
        {item.email}
        <Row>
            <Col sm={1} xs={2}>
                <Image src="//placehold.it/100x100" responsive rounded/>
            </Col>
            <Col sm={7} xs={7}>
                Qty: {item.quantity}<br/>
                Price: ${item.price}<br/>
                {/* {item.paid ? 'Paid' : 'Unpaid'}, Total: ${item.total} */}
            </Col>
            <Col sm={4} xs={3}>
                <Button bsStyle="default" className='pull-right' disabled>Edit</Button>
            </Col>
        </Row>
    </ListGroupItem>);
  }
}
