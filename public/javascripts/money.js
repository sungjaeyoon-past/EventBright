$(document).ready(function(){
    $(".money-pay-ticket").hide();
    $(".row > .classlatlng").hide();
    $(".money-pay").click(function(){
        $(".money-pay-ticket").show();
    });
    $(".money-free").click(function(){
        $(".money-pay-ticket").hide();
    });
});