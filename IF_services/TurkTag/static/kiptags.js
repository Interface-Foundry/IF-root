console.log('thanks for helping kip (◕‿◕)♡');

new Konami(function() {
    $('.konami').removeClass('u-hidden');
});

function save() {

    $.ajax({
        url: '/kiptag',
        type: 'POST',
        headers: {'Content-Type': 'application/json'},
        data: JSON.stringify({
            id: $('#id').val(),
            itemType: $('#item-type').val(),
            genre: $('#item-genre').val(),
            description: $('item-description').val()
        }),
        success: function() {
            console.log('funky animation part 2');
            location.reload();
        }
    });

    console.log('funky animation part 1');
}