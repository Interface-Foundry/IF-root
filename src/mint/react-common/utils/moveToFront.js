// react-common/utils/moveToFront.js

// should probably make this a bit more generic later, it only really works for carts right now
export default (list, id) => list.reduce((acc, item) => (item.id === id) ? [item, ...acc] : [...acc, item], []);
