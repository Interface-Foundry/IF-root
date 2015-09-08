$(function() {
    function submit() {
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
            })
        })
        return false;
    }
    $('#email').val(location.hash.split('/')[1])
    $('form').submit(submit);
})