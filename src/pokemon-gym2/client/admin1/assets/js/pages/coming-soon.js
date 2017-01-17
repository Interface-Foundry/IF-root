$(document).ready(function() {
      $('#counter').countdown('2017/09/27', function(event) {
          $(this).html(event.strftime('%d:%H:%M:%S'));
      });
});