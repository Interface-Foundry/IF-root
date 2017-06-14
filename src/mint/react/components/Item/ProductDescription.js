// react/components/Item/ProductDescription.js

import PropTypes from 'prop-types';
import React, { Component } from 'react';

export default class ProductDescription extends Component {
  constructor(props) {
    super(props);
    this.toggleDescrip = ::this.toggleDescrip;
    this._handleWindowResize = ::this._handleWindowResize;
  }

  state = {
    descripHeight: '100%',
    descripTall: false,
    showViewMore: false
  }

  static propTypes = {
    description: PropTypes.string
  }

  toggleDescrip() {
    const { state: { descripTall } } = this;
    this.setState({
      descripHeight: descripTall ? '3.6em' : '100%',
      descripTall: !descripTall
    });
  }

  _handleWindowResize() {
    const height = this.descrip.clientHeight;

    this.setState({
      showViewMore: height > 80,
      descripHeight: height > 80 ? '3.6em' : '100%'
    });
  }

  componentDidMount() {
    window.addEventListener('resize', this._handleWindowResize);
    this._handleWindowResize();
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this._handleWindowResize);
  }

  componentDidUpdate(nextProps) {
    if (nextProps.description !== this.props.description) this._handleWindowResize();
  }

  render() {
    const { toggleDescrip, state: { descripHeight, descripTall, showViewMore }, props: { description } } = this;

    return (
      <div ref={(c) => { this.descrip = c; }} className='item__view__description'>
        <p className='ellipsis' style={{maxHeight: descripHeight}}> { description }</p>
        {
          (showViewMore)
            ? <div className='fadeover' style={{display: descripTall ? 'none' : 'block'}}/>
            : null
        }
        {
          (showViewMore) 
          ? <a href='#' onClick={toggleDescrip}> View {descripTall ? 'less' : 'more'} </a> 
          : null
        }
      </div>
    );
  }
}
