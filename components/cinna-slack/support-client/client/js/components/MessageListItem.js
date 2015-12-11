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

   if (checkImgURL(this.props.message.text)) {
     // console.log(0)
      this.setState({ isImage : 'true'  })
    } else {
    // console.log(1)
      this.setState({ isImage : 'false'  })
    }
  }


  renderImage() {
     const {message} = this.props
     switch (this.state.isImage){
      case 'true' : 
        return (
          <img width='200' src={message.text} />
          )
      default:
        return message.text
     }
  }

  render() {
    var self = this;
    const { message} = this.props;
    return (
      <li>
        <span>
          <b style={{color: '#66c'}}>{message.user} </b>
          <i style={{color: '#aad', opacity: '0.8'}}>{message.time}</i>
        </span>
        <div style={{clear: 'both', paddingTop: '0.1em', marginTop: '-1px', paddingBottom: '0.3em'}}> {self.renderImage()} </div>
      </li>
    );
  }
}
