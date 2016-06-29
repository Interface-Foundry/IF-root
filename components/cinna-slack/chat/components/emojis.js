module.exports = function(type) {
  if (type === 'slack') {
    return slack;
  }
  if (type === 'html') {
    return html;
  }
}

var emoji = {
  1: { slack: ':one:', html: '<div class="number">①</div>', email: '1. ' },
  2: { slack: ':two:', html: '<div class="number">②</div>', email: '2. ' },
  3: { slack: ':three:', html: '<div class="number">③</div>', email: '3. ' },
  4: { slack: ':four:', html: '<div class="number">④</div>', email: '4. ' },
  5: { slack: ':five:', html: '<div class="number">⑤</div>', email: '5. ' },
  6: { slack: ':six:', html: '<div class="number">⑥</div>', email: '6. ' },
  7: { slack: ':seven:', html: '<div class="number">⑦</div>', email: '7. ' },
  8: { slack: ':eight:', html: '<div class="number">⑧</div>', email: '8. ' },
  9: { slack: ':nine:', html: '<div class="number">⑨</div>', email: '9. ' },
  10: { slack: '10.', html: '<div class="number">⑩</div>', email: '10. ' },
  11: { slack: '11.', html: '<div class="number">⑪</div>', email: '11. ' },
  12: { slack: '12.', html: '<div class="number">⑫</div>', email: '12. ' },
  13: { slack: '13.', html: '<div class="number">⑬</div>', email: '13. ' },
  14: { slack: '14.', html: '<div class="number">⑭</div>', email: '14. ' },
  15: { slack: '15.', html: '<div class="number">⑮</div>', email: '15. ' },
  16: { slack: '16.', html: '<div class="number">⑯</div>', email: '16. ' },
  17: { slack: '17.', html: '<div class="number">⑰</div>', email: '17. ' },
  18: { slack: '18.', html: '<div class="number">⑱</div>', email: '18. ' },
  19: { slack: '19.', html: '<div class="number">⑲</div>', email: '19. ' },
  20: { slack: '20.', html: '<div class="number">⑳</div>', email: '20. ' },
}

function slack(i) {
  var e = emoji[i].slack;
  if (e) { return e }
  return i + '.';
}

function html(i) {
  var e = emoji[i].html;
  if (e) { return e }
  return `<div class="number">${i}</div>`;
}
