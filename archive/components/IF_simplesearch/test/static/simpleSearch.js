$(function() {
    function search() {
        //$('form *').attr('disabled', true);
        $.ajax({
            url: 'https://kipapp.co/styles/api/items/search',
            type: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                text: $('#query').val(), //search query val
                loc: {lat: 40.7127, lon: -74.0059} //temp coords
            }),
            success: function(xhr) {
                $('p').remove();
                if (xhr.err) {
                    $('form *').removeAttr('disabled');
                    $('form').parent().append('<p class="red">' + xhr.err.niceMessage + '</p>');
                } else {
                    $('form').parent().append('<p class="green">success</p>');
                }

                console.log(xhr);
            },
            error: function(xhr, errorType, error) {
                $('p').remove();
                $('form *').removeAttr('disabled');
                $('form').parent().append('<p class="red">' + xhr.response + '</p>');
            }
        })
        return false;
    }
    // $('#email').val(location.hash.split('/')[1])
    $('form').submit(search);
})