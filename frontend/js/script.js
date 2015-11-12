$(document).ready(function() {
    $('.navbar li').click(function(e) {
        var $this = $(this);
        var toSlide = $this.data('container');
        $('.navbar li.active').removeClass('active');
        if (!$this.hasClass('active')) {
            $this.addClass('active');
        }
        $('.section').not('#' + toSlide).slideUp(250);
        setTimeout(function() {
            $('#' + toSlide).slideDown(250);
        }, 300);
        e.preventDefault();
    });
});
