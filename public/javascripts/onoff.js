$(document).ready(function(){
///
    $(".money-pay-ticket").hide();

    $(".row > .classlatlng").hide();
    $(".money-pay").click(function(){
        $(".money-pay-ticket").show();
    });

    $(".money-free").click(function(){
        $(".money-pay-ticket").hide();
    });
///
    $(".all-review").hide();
    $(".show-review").click(function(){
        $(".all-answer").hide();
        $(".all-review").show();
    });
    $(".show-answer").click(function(){
        $(".all-answer").show();
        $(".all-review").hide();
    });
///
    $(".answer-authoranswer").hide();
    $(".badge-secondary").click(function(){
        $(this).next().show();
    });
    $(".review-authorreview").hide();
    $(".badge-secondary").click(function(){
        $(this).next().show();
    });
///
    for(var i=1;i<4;i++){
        $(".survey"+i).hide();
    }
    var num=1;
    $(".addsurvey").click(function(){
        $(".survey"+num).show();
        num++;
    });
//
    $("#kCalendar").hide();
    $(".showcalender").click(function(){
        $("#kCalendar").show();
    });

    $('.dropdown-toggle').dropdown(); 
    //$().dropdown('update')
});