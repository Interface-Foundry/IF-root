import React, { Component } from 'react';
import { Icon } from '..';
import PropTypes from 'prop-types';
import moment from 'moment';
import { DragSource, DropTarget } from 'react-dnd';
import { findDOMNode } from 'react-dom';

const ListItemSource = ({
  beginDrag: props => ({
    id: props.cart.id,
    index: props.index,
    cart: props.cart,
    currentCartId: props.currentCartId
  })
});

const ListItemTarget = {
  hover: (props, monitor, component) => {
    const item = monitor.getItem();
    const dragIndex = item.index;
    const hoverIndex = props.index;

    // don't move the current cart
    if (item.cart.id === props.currentCartId || dragIndex === hoverIndex) return;

    // Determine rectangle on screen
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY || dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

    // Time to actually perform the action
    props.rearrangeCart(dragIndex, hoverIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex;
  }
};

@DropTarget('CartListItem', ListItemTarget, connect => ({
  connectDropTarget: connect.dropTarget()
}))
@DragSource('CartListItem', ListItemSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))
export default class CartListItem extends Component {
  static propTypes = {
    cart: PropTypes.object,
    currentCartId: PropTypes.string,
    isLeader: PropTypes.bool,
    SideNavLink: PropTypes.func,
    isDragging: PropTypes.bool.isRequired,
    connectDragSource: PropTypes.func.isRequired,
    connectDropTarget: PropTypes.func.isRequired
  }
  render = () => {
    const {
      cart: { id, thumbnail_url, name, locked, updatedAt, store, store_locale },
      currentCartId,
      SideNavLink,
      isLeader,
      isDragging,
      connectDragSource,
      connectDropTarget
    } = this.props;
    return connectDragSource(connectDropTarget(
      <li key={id} className={`sidenav__list__${isLeader?'leader':'member'} ${id === currentCartId ? 'currentCart' : ''} ${isDragging ? 'dragging' : ''}`} >
        <div className={'cart-image'} style={{
          backgroundImage: `url(${thumbnail_url || '//storage.googleapis.com/kip-random/head_smaller.png'})`
        }}>
          <SideNavLink className='settings-icon' to={`/cart/${id}/m/edit`}>
            <Icon icon='Settings'/>
          </SideNavLink>
        </div>
        <SideNavLink to={`/cart/${id}`}>
          <p>
            {name}
            {locked ? <span><br/>{moment(updatedAt).format('L')}</span> : null}
            {!locked ? <span><br/>{store} {store_locale}</span> : null}
          </p>
        </SideNavLink>
      </li>
    ));
  }
}