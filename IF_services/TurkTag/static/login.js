hello.init({
    facebook: 1401271990193674
    //google: GOOGLE_CLIENT_ID
});
var kipBaseUrl = '';
hello.on('auth.login', function(auth) {

    // Call user information, for the given network
    hello(auth.network).api('/me').then(function(r) {
        $.ajax({
            url: kipBaseUrl + '/api/auth/verify-facebook',
            type: 'POST',
            headers: {'Content-Type': 'application/json'},
            data: JSON.stringify({
                user: r,
                auth: {authResponse: {accessToken: auth.authResponse.access_token}}
            }),
            success: location.reload.bind(location)
        });
    });
});

function kipLogin() {
    $.ajax({
        url: kipBaseUrl + '/api/auth/login',
        type: 'POST',
        headers: {'Content-Type': 'application/json'},
        data: JSON.stringify({
            email: $('#email').val(),
            password: $('#password').val()
        }),
        success: location.reload.bind(location)
    });

    return false;
}