console.log('SQUAD 🔥')

Array.prototype.slice.call(document.querySelectorAll('.group')).map(function(el) {
  el.addEventListener('click', function() {
    console.log('😸👌');
    var group_id = el.getAttribute('group-id');
    nanoajax.ajax({url: '/join?id=' + group_id + '&access_token=' + window.localStorage.access_token}, function(code, res) {
      console.log(code);
      if (code === 200) {
        console.log('joined group', el.innerHTML)
        el.classList.add('joined');
      }
    })
  })
})
