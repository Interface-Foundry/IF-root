import React, { Component } from 'react';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import ReactDOM from 'react-dom';
import { PropTypes } from 'prop-types';
import { replaceHtml } from '../../utils';
import { Right } from '../../themes/newSvg';
import { HeaderContainer, FooterContainer } from '../../containers';

export default class Help extends Component {
  static propTypes = {
    helpTemplate: PropTypes.object,
    src: PropTypes.string
  }
  constructor(props) {
    super(props);
    this._startLoop = this._startLoop.bind(this);
  }

  state = {
    selectedIndex: 0,
    offsetTop: 0
  }

  componentWillMount() {
    const { helpTemplate } = this.props;
    // try to preload giffs
    helpTemplate.images.map((row) => {
      let img = new Image();
      img.src = row.src;
    });
    this._startLoop();
  }

  componentDidMount() {
    this.setState({
      offsetTop: ReactDOM.findDOMNode(this.help)
        .offsetTop + 50
    });
  }

  _startLoop(stop) {
    const { selectedIndex } = this.state;

    if (stop) {
      if (self)
        clearTimeout(self.timeout);

      clearTimeout(this.timeout);
    } else {
      let self = this;
      self.timeout = setTimeout(() => {

        self.setState({
          selectedIndex: selectedIndex === 2 ? 0 : selectedIndex + 1
        });

        self._startLoop();
      }, 7500);
    }
  }

  componentWillUnmount() {
    this._startLoop(true);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextProps.helpTemplate.images.length !== this.props.helpTemplate.images.length || nextState.selectedIndex !== this.state.selectedIndex
    );
  }

  render() {
    const { state: { selectedIndex, offsetTop }, props: { helpTemplate, src, helpTemplate: { images, slackImages, faq } }, _startLoop } = this;
    const slides = src === 'slack' ? slackImages : images;
    return (
      <div className="Help">
        <HeaderContainer title={helpTemplate.titleText} subtext={helpTemplate.subtext} color={images.length ? images[selectedIndex].class: ''} offsetTop={offsetTop}/>
        <section className={`tutorial ${images.length ? images[selectedIndex].class : ''} ${src==='slack' ? 'slack' : ''}`} ref={(help) => this.help = help}>
          <nav className="services__navigation">
            <ul>
              {
                images.map((i, index) => (
                  <li key={i.id}>
                    <h2 onClick={() => { 
                      _startLoop(true);
                       this.setState({selectedIndex: index}); 
                     }
                     } className={`row-1 col-4 ${index === selectedIndex ? 'selected' : ''}`}>
                      <span className='stepText'>{helpTemplate.stepText}&nbsp;</span>
                      <span className={i.class}>{i.step}</span>
                    </h2>
                  </li>
                ))
              }
            </ul>
          </nav>
          <div className="col-12 row-1 tutorial__slideshow" >
            <CSSTransitionGroup
              transitionName="slide"
              transitionEnterTimeout={0}
              transitionLeaveTimeout={0}>
              {
                slides.map((i, index) => {
                  if(index !== selectedIndex ) return null;
                  return (
                    <div key={i.id} className={`image ${images[selectedIndex].class} ${src==='slack' ? 'slack' : ''}`} style={{backgroundImage: `url(${i.src})`}}>
                      <div className={`bubble ${src==='slack' ? 'slack' : ''}`}>
                        <p>{i.bubble}</p>
                      </div>
                    </div>
                  );
                })
              }
            </CSSTransitionGroup>
          </div> 
        </section>
        <section className = 'FAQ'>
          <div className="action">
            {
              src === 'slack' 
              ? <a href="https://slack.com/oauth/authorize?scope=commands+bot+users%3Aread&client_id=2804113073.14708197459" target="_blank" rel="noopener noreferrer">
                      <button>
                      {helpTemplate.slackText}
                      </button>
                </a>
              : <a href='/newcart'>
                  <button>
                    <span>{helpTemplate.buttonText} <Right/></span>
                  </button>
                </a>
            }
          </div>
          <section className="col-12 row-1 video">
            {src === 'slack' ? <iframe width="100%" height="100%" src="https://www.youtube.com/embed/hKL1omE4nGg?rel=0&amp;showinfo=0" frameBorder="0" allowFullScreen></iframe> : null}
          </section>
          <h1>
            <span>
              {faq.title}
            </span>
          </h1>
          <p className = 'subtext'>
            { replaceHtml(faq.subtext) } 
          </p> 
          {
            faq.qs.map((q, i) => (
              <div key={i} className='question'>
                    <h2>
                      {`${i+1}. `}
                      {q.title}
                    </h2>
                    <p>{replaceHtml(q.answer)} </p>
                  </div>
            ))
          } 
        </section>
        <FooterContainer/>
      </div>
    );
  }
}
