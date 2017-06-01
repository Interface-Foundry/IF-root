import React from 'react';
import { Link } from 'react-router-dom';
export const replaceHtml = str =>
  str.split(/(\${[A-z]*})/)
  .map(swapForHtml);

const swapForHtml = (str, i) => {
  switch (str) {
  case '${Kip}':
    return <span key={i}><Link to='/about'>Kip</Link></span>;
  case '${mail}':
    return <span key={i}><a href='mailto:hello@kipthis.com'>hello@kipthis.com</a></span>;
  case '${br}':
    return <br key={i}/>;
  default:
    return str;
  }
}