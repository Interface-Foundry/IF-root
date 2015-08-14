console.log('thanks for helping kip (◕‿◕)♡');
var kipBaseUrl = '';

new Konami(function() {
    $('.konami').removeClass('u-hidden');
});

function save() {

    $.ajax({
        url: kipBaseUrl + '/kiptag',
        type: 'POST',
        headers: {'Content-Type': 'application/json'},
        data: JSON.stringify({
            id: $('#id').val(),
            itemType: $('#item-type').val(),
            itemStyle: $('#item-style').val(),
            itemEvent: $('#item-event').val(),
            itemDetail: $('#item-detail').val(),
            itemFabric: $('#item-style').val(),
            colors: $('.color>button').map(function() { return $(this).attr('data-hsl')}).toArray()
        }),
        success: function() {
            console.log('funky animation part 2');
            location.reload();
        }
    });

    console.log('funky animation part 1');
}

// Color options
(function() {
    var colors = [];
    var $colors = $('.colors');
    document.addEventListener('DOMContentLoaded', function() {
        Array.prototype.slice.call($('img')).map(function(i) {
            i.crossOrigin = "Anonymous";
            var $i = $(i);
            $i.attr('src', $i.attr('data-src'));
            $i.on('load', function(e) {
                var v = new Vibrant(this);
                var swatches = ['VibrantSwatch', 'MutedSwatch', 'DarkVibrantSwatch', 'LightVibrantSwatch'];
                swatches.map(function(s) {
                    var $b = $('<button></button>');
                    if (typeof v[s] === 'undefined') {
                        v[s] = new Swatch([0, 0, 0], 1);
                    }
                    if (colors.indexOf(v[s].getHex()) >= 0){
                        return; //already found color
                    }
                    colors.push(v[s].getHex());
                    $b.css('background-color', v[s].getHex());
                    $b.attr('data-hsl', v[s].getHsl());
                    $colors.append($b);
                });
            })
        });
    });
    $(document).on('click', '.colors>button', function(e) {
        $(this).toggleClass('selected');
    })
})();
