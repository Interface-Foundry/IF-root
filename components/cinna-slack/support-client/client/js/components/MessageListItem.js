import React, { Component, PropTypes } from 'react';

export default class MessageListItem extends Component {

  static propTypes = {
    message: PropTypes.object.isRequired
  }
  
   constructor (props) {
    super(props)
    this.state = { isImage: null}
  }

  componentDidMount() {
    const { message } = this.props 

     function checkImgURL (msg) {
        return(msg.match(/\.(jpeg|jpg|gif|png)$/) != null);
    }

   if (checkImgURL(this.props.message.msg)) {
      this.setState({ isImage : 'true'  })
    } else {
      this.setState({ isImage : 'false'  })
    }
  }

  renderMsg() {
     const {message} = this.props
     switch (this.state.isImage){
      case 'true' : 
        return (
          <img width='200' src={message.msg} />
          )
      default:
        return message.msg
     }
  }

  render() {
    var self = this;
    const { message} = this.props;
    return (
      <li>
        <span>
          <b style={{color: '#66c'}}>{message.source.id} </b>
          <i style={{color: '#aad', opacity: '0.8'}}>{message.ts}</i>
        </span>
        <div style={{clear: 'both', paddingTop: '0.1em', marginTop: '-1px', paddingBottom: '0.3em'}}> {self.renderMsg()} </div>
      </li>
    );
  }
}
