$(function() {
    function submit() {
        $('form *').attr('disabled', true);
        $.ajax({
            url: 'reset',
            type: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                email: $('#email').val(),
                password: $('#password').val(),
                token: location.hash.split('/')[2]
            }),
            success: function(xhr) {
                $('p').remove();
                if (xhr.err) {
                    $('form *').removeAttr('disabled');
                    $('form').parent().append('<p class="red">' + xhr.err.niceMessage + '</p>');
                } else {
                    $('form').parent().append('<p class="green">success</p>');
                }
            },
            error: function(xhr, errorType, error) {
                $('p').remove();
                $('form *').removeAttr('disabled');
                $('form').parent().append('<p class="red">' + xhr.response + '</p>');
            }
        })
        return false;
    }
    $('#email').val(location.hash.split('/')[1])
    $('form').submit(submit);
})