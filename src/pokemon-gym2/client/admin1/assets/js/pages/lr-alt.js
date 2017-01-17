$(document).ready(function(){
    var pageHeight = $('body').height();
    $('.login-box').css('height', pageHeight);
    
    $(window).resize(function(){
        var pageHeight = $('body').height();
        $('.login-box').css('height', pageHeight);
    });
    var pageHeight = $('body').height();
    $('.register-box').css('height', pageHeight);
    
    $(window).resize(function(){
        var pageHeight = $('body').height();
        $('.register-box').css('height', pageHeight);
    });
});