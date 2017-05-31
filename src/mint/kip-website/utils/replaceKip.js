import React from 'react';
import { Link } from 'react-router-dom';
export const replaceKip = str =>
  str.split('${Kip}')
  .reduce(
    (res, s, i) => [...res, <span key={i}><Link to='/about'>Kip</Link></span>, s]
  );