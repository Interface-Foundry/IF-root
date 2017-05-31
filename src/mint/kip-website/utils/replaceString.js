import React from 'react';
import { Link } from 'react-router-dom';
export const replaceKip = str =>
  str.split('${Kip}')
  .reduce(
    (res, s, i) => [...res, <span key={i}><Link to='/about'>Kip</Link></span>, s]
  );

export const replaceMail = str =>
  str.split('${mail}')
  .reduce(
    (res, s, i) => [...res, <span key={i}><a href='mailto:hello@kipthis.com'>hello@kipthis.com</a></span>, s]
  );

export const replaceNewLine = str =>
  str.split('${br}')
  .reduce(
    (res, s, i) => [...res, <br key={i}/>, s]
  );