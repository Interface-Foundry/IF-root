import React from 'react';
import { Link } from 'react-router-dom';
export const replaceHtml = str =>
  str.split(/(\${.+?})/)
  .map(swapForHtml);

/**
 * swapForHtml
 * swaps out identified strings for jsx elements
 * @param {string} str string to converted to jsx
 * @param {number} i index of element, for key
 * @returns {React} element to be rendered
 */
const swapForHtml = (str, i) => {
  // this is becoming markdown
  const text = str.match(/\[(.+?)\]/),
    link = str.match(/\((.+?)\)/);
  if (link && text) return <span key={i}><a href={link[1]}>{text[1]}</a></span>;
  switch (str) {
  case '${Kip}':
    return <span key={i}><Link to='/howitworks'>Kip</Link></span>;
  case '${mail}':
    return <span key={i}><a href='mailto:hello@kipthis.com'>hello@kipthis.com</a></span>;
  case '${br}':
    return <br key={i}/>;
  default:
    return str;
  }
}