$(function () {
    function cyclerSize() {
        var windowWidth = $(window).width();
        if (windowWidth >= 1200) {
            $(".cycler>img[src$='-md.jpg']").each(function () {
                var new_src = $(this).attr("src").replace('-md', '-lg');
                $(this).attr("src", new_src);
            });
            $(".cycler>img[src$='-sm.jpg']").each(function () {
                var new_src = $(this).attr("src").replace('-sm', '-lg');
                $(this).attr("src", new_src);
            });
        }
        else if (windowWidth >= 992) {
            $(".cycler>img[src$='-lg.jpg']").each(function () {
                var new_src = $(this).attr("src").replace('-lg', '-md');
                $(this).attr("src", new_src);
            });
            $(".cycler>img[src$='-sm.jpg']").each(function () {
                var new_src = $(this).attr("src").replace('-sm', '-md');
                $(this).attr("src", new_src);
            });
        }
        else {
            $(".cycler>img[src$='=-lg.jpg']").each(function () {
                var new_src = $(this).attr("src").replace('-lg', '-sm');
                $(this).attr("src", new_src);
            });
            $(".cycler>img[src$='-md.jpg']").each(function () {
                var new_src = $(this).attr("src").replace('-md', '-sm');
                $(this).attr("src", new_src);
            });
        }
    };
    cyclerSize();
    $(window).resize(cyclerSize);
    var fElement = $('.cycler');
    fElement.find('img:gt(0)').hide();
    setInterval(function () {
        if (!fElement.data('paused')) {
            fElement.find(':first-child').stop(true, true).fadeOut(1000);
            fElement.find(':first-child').next('img').fadeIn(1000).end(1000).appendTo('.cycler'); //.stop(true,true) fixes le tabbed/hidden animation queue
        } else {
            console.log('waiting...');
        }
    }, 20000);
});