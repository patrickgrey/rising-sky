(function (factory) {
  typeof define === 'function' && define.amd ? define('mainSrc', factory) :
  factory();
}((function () { 'use strict';

  // import { ScrollToTop } from "@EUROCONTROL-IANS/ians-scroll-to-top";
  var pageModule = function () {
    var module = {};

    module.init = function () {
      // ScrollToTop();
      var circle = document.querySelector('.progress-ring__circle');
      var radius = circle.r.baseVal.value;
      var circumference = radius * 2 * Math.PI;
      circle.style.strokeDasharray = "".concat(circumference, " ").concat(circumference); // circle.style.strokeDashoffset = circumference;

      function setProgress(percent) {
        var offset = circumference - percent / 100 * circumference;
        circle.style.strokeDashoffset = offset;
      }

      var ticking = false;
      window.addEventListener('scroll', function (e) {
        var scrollTop = window.scrollY;
        var docHeight = document.body.offsetHeight;
        var winHeight = window.innerHeight;
        var scrollPercent = scrollTop / (docHeight - winHeight);
        var scrollPercentRounded = Math.round(scrollPercent * 100);

        if (!ticking) {
          window.requestAnimationFrame(function () {
            setProgress(scrollPercentRounded);
            ticking = false;
          });
          ticking = true;
        }
      });
      var link = document.querySelector("#scrollTopLink");
      link.addEventListener("click", function (event) {
        event.preventDefault();
        window.scroll({
          top: 0,
          left: 0,
          behavior: "smooth"
        });
      });
      setProgress(0);
      var temButtonScenarioReveal = document.querySelector("#temButtonScenarioReveal");
      var divScenarioReveal = document.querySelector("#divScenarioReveal");
      temButtonScenarioReveal.addEventListener("click", function () {
        this.style.display = "none";
        divScenarioReveal.style.display = "grid";
        divScenarioReveal.classList.add("ians-scenario-wrapper-show");
      });
      var temButtonAnswerReveal = document.querySelector("#temButtonAnswerReveal");
      var divAnswerReveal = document.querySelector("#divAnswerReveal");
      temButtonAnswerReveal.addEventListener("click", function () {
        this.style.display = "none";
        divAnswerReveal.style.display = "block";
        divAnswerReveal.classList.add("ians-scenario-wrapper-show");
      });
      var playButton = document.querySelector("#tem-animation-play");
      var decision = document.querySelector("#decision");
      var redline = document.querySelector("#redline");
      var uo = document.querySelector("#uo");
      var contextbg = document.querySelector("#contextbg");
      var context = document.querySelector("#context");
      var analysis = document.querySelector("#analysis");
      var arrowcontext = document.querySelector("#arrowcontext");
      var arrowyellow1 = document.querySelector("#arrowyellow1");
      var arrowyellow2 = document.querySelector("#arrowyellow2");
      var error = document.querySelector("#error");
      var temanimationreplay = document.querySelector("#tem-animation-replay");

      var setDelays = function setDelays(hasDelays) {
        var baseDelay = hasDelays ? 0.5 : 0;
        var multiplier = hasDelays ? 1 : 0;
        decision.style.transitionDelay = "".concat(baseDelay * multiplier, "s");
        redline.style.transitionDelay = "".concat(baseDelay + 1 * multiplier, "s");
        uo.style.transitionDelay = "".concat(baseDelay + 2 * multiplier, "s");
        contextbg.style.transitionDelay = "".concat(baseDelay + 3 * multiplier, "s");
        context.style.transitionDelay = "".concat(baseDelay + 3.25 * multiplier, "s");
        analysis.style.transitionDelay = "".concat(baseDelay + 5 * multiplier, "s");
        arrowcontext.style.transitionDelay = "".concat(baseDelay + 6 * multiplier, "s");
        arrowyellow1.style.transitionDelay = "".concat(baseDelay + 7 * multiplier, "s");
        arrowyellow2.style.transitionDelay = "".concat(baseDelay + 7.5 * multiplier, "s");
        error.style.transitionDelay = "".concat(baseDelay + 8 * multiplier, "s");
        temanimationreplay.style.transitionDelay = "".concat(baseDelay + 9 * multiplier, "s");
      };

      playButton.addEventListener("click", function () {
        setDelays(true);
        playButton.style.display = "none"; // temanimationreplay.style.display = "block";

        decision.style.opacity = 1;
        redline.style.opacity = 1;
        uo.style.opacity = 1;
        contextbg.style.opacity = 1;
        context.style.opacity = 1;
        analysis.style.opacity = 1;
        arrowcontext.style.opacity = 1;
        arrowyellow1.style.opacity = 1;
        arrowyellow2.style.opacity = 1;
        error.style.opacity = 1;
        temanimationreplay.style.opacity = 1;
      });
      temanimationreplay.addEventListener("click", function () {
        setDelays(false); // temanimationreplay.style.display = "none";

        playButton.style.display = "block";
        decision.style.opacity = 0;
        redline.style.opacity = 0;
        uo.style.opacity = 0;
        contextbg.style.opacity = 0;
        context.style.opacity = 0;
        analysis.style.opacity = 0;
        arrowcontext.style.opacity = 0;
        arrowyellow1.style.opacity = 0;
        arrowyellow2.style.opacity = 0;
        error.style.opacity = 0;
        temanimationreplay.style.opacity = 0;
        playButton.style.opacity = 1;
      });
    };

    return module;
  }();

  pageModule.init();

})));
