// react/styles/RouteAnimations.js

import spring from 'react-motion/lib/spring';

const fadeConfig = { stiffness: 200, damping: 22 };
const popConfig = { stiffness: 360, damping: 25 };
const slideConfig = { stiffness: 120, damping: 20 };

const fade = {
  atEnter: {
    opacity: 0,
  },
  atLeave: {
    opacity: spring(0, fadeConfig),
  },
  atActive: {
    opacity: spring(1, fadeConfig),
  },
};

const pop = {
  atEnter: {
    scale: 0.8,
    opacity: 0,
  },
  atLeave: {
    scale: spring(0.8, popConfig),
    opacity: spring(0, popConfig),
  },
  atActive: {
    scale: spring(1, popConfig),
    opacity: 1,
  },
  mapStyles(styles) {
    return {
      opacity: styles.opacity,
      transform: `scale(${styles.scale})`,
    };
  },
};

const slideLeft = {
  atEnter: {
    opacity: 0,
    offset: 100,
  },
  atLeave: {
    opacity: spring(0, fadeConfig),
    offset: spring(-100, slideConfig),
  },
  atActive: {
    opacity: spring(1, slideConfig),
    offset: spring(0, slideConfig),
  },
  mapStyles(styles) {
    return {
      opacity: styles.opacity,
      transform: `translate3d(${styles.offset}%, 0, 0)`,
    };
  },
};

const slideRight = {
  atEnter: {
    opacity: 0,
    offset: -100,
  },
  atLeave: {
    opacity: spring(0, fadeConfig),
    offset: spring(100, slideConfig),
  },
  atActive: {
    opacity: spring(1, slideConfig),
    offset: spring(0, slideConfig),
  },
  mapStyles(styles) {
    return {
      opacity: styles.opacity,
      transform: `translate3d(${styles.offset}%, 0, 0)`,
    };
  },
};

export default { fade, pop, slideLeft, slideRight };
