$(function() {
    function search() {
        $('.results').html('');
        $.ajax({
            url: $('#server').val() + '/api/items/search',
            type: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Allow-Origin': '*'
            },
            data: JSON.stringify({
                text: $('#q').val(),
                loc: {
                    lat: $('#lat').val(),
                    lon: $('#lon').val()
                }
            }),
            success: function (xhr) {
                var html = xhr.results.reduce(function (html, r) {
                  return html += (r.name + " (" + r._id + ')<br/><img src="' + r.itemImageURL[0] + '"><br/>');
                }, '')
                $(".r1").html(html);
            },
            error: function (xhr, errorType, error) {
                $(".r1").text(JSON.stringify(xhr, null, 2));
            }
        })
        $.ajax({
            url: $('#server2').val() + '/api/items/search',
            type: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Allow-Origin': '*'
            },
            data: JSON.stringify({
                text: $('#q').val(),
                loc: {
                    lat: $('#lat').val(),
                    lon: $('#lon').val()
                }
            }),
            success: function (xhr) {
                var html = xhr.results.reduce(function (html, r) {
                  return html += (r.name + " (" + r._id + ')<br/><img src="' + r.itemImageURL[0] + '"><br/>');
                }, '')
                $(".r2").html(html);
            },
            error: function (xhr, errorType, error) {
                $(".r2").text(JSON.stringify(xhr, null, 2));
            }
        })
    }

    $("#search-go").click(search);
    $("#search-go").click();
})
