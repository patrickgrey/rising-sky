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
    };

    return module;
  }();

  pageModule.init();

})));
