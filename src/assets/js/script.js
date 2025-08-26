function hideJoinPresentation(){
    var presentationDiv = document.getElementById("joinPresentation");
    presentationDiv.style.display = "none";
}
$(document).ready(function(){
    $(".counter").each(function () {
        var $this = $(this),
        countTo = $this.attr("data-countto");
        countDuration = parseInt($this.attr("data-duration"));
        $({ counter: $this.text() }).animate(
        {
            counter: countTo
        },
        {
            duration: countDuration,
            easing: "linear",
            step: function () {
            $this.text(Math.floor(this.counter));
            },
            complete: function () {
            $this.text(this.counter);
            }
        }
        );
    });
    $(".hover-to-show").mouseover(function(){
        $(".position-absolute-hover").delay("slow").css("display", "block");
      });
      $(".hover-to-show").mouseleave(function(){
        $(".position-absolute-hover").delay("slow").css("display", "none");
    });
});