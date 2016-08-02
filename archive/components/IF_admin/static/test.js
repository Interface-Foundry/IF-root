$(function() {
    function trending() {
        $('#trending').text('');
        $.ajax({
            url: $('#server').val() + 'api/items/trending',
            type: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Allow-Origin': '*'
            },
            data: JSON.stringify({
                loc: {
                    lat: $('#lat').val(),
                    lon: $('#lon').val()
                }
            }),
            success: function (xhr) {
                $("#trending").text(JSON.stringify(xhr, null, 2));
            },
            error: function (xhr, errorType, error) {
                $("#trending").text(JSON.stringify(xhr, null, 2));
            }
        })
    }

    $("#trending-go").click(trending);
    $("#trending-go").click();
})