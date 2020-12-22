var pageModule = (function(window, document) {
  "use strict";

  var videoID = "1HtygP3JCnU",
    module = {},
    player,
    sectionsModel = {},
    progressID,
    sectionID,
    playerTotalTime, // Cannot get this from video API before video is started so need to extract from DOM elements data attribute.
    cachedCurrentSection = 0;

  // Extract data from elements so we don't have to continually reference the DOM, which can be slow.
  var buildSectionsModel = function() {
    var sections = document.querySelectorAll(".dp-sections li");
    for (var i = 0; i < sections.length; i++) {
      var section = sections[i];
      sectionsModel[i] = {
        time: section.getAttribute("data-section-end-time"),
        isGood: section.getAttribute("data-is-good"),
        element: section
      };
      if (i === sections.length - 1) {
        playerTotalTime = sectionsModel[i].time;
      }
    }
  };

  //
  // PROGRESS BAR
  //

  var updateProgress = function() {
    playerTotalTime = player.getDuration();
    var playerCurrentTime = player.getCurrentTime();
    var playerTimePercent = (playerCurrentTime / playerTotalTime) * 100;
    document.querySelector(".dp-progress-bar").style.width =
      playerTimePercent + "%";
    progressID = requestAnimationFrame(updateProgress);
  };

  var progress = function(event) {
    if (event.data === YT.PlayerState.PLAYING) {
      progressID = requestAnimationFrame(updateProgress);
    } else {
      cancelAnimationFrame(progressID);
    }
  };

  //
  // SECTIONS
  //

  function sectionListener() {
    var previousSectionTime = this.previousElementSibling
      ? this.previousElementSibling.getAttribute("data-section-end-time")
      : 0;
    player.seekTo(previousSectionTime, true);
    player.playVideo();
  }

  var initSections = function() {
    var sections = document.querySelectorAll(".dp-sections li");
    var currentPercent = 0;
    for (var i = 0; i < sections.length; i++) {
      var section = sections[i];
      // Calculate end of section - start of section time and convert to percent.
      var timeToPercentCurrent =
        (sectionsModel[i].time / playerTotalTime) * 100;
      var previousTime = sectionsModel[i - 1] ? sectionsModel[i - 1].time : 0;
      var timeToPercentPrevious = (previousTime / playerTotalTime) * 100;
      var timeToPercent = timeToPercentCurrent - timeToPercentPrevious;

      section.style.width = timeToPercent + "%";

      // Enable click on section to jump to it.
      section.addEventListener("click", sectionListener);
    }
  };

  var resetSections = function() {
    for (var id in sectionsModel) {
      if (sectionsModel.hasOwnProperty(id)) {
        var element = sectionsModel[id].element;
        element.style.opacity = 0.3;
      }
    }
  };

  // Returns the start and end time of each section.
  var getSectionRange = function(sectionID) {
    var previousSectionTime = sectionsModel[sectionID - 1]
      ? sectionsModel[sectionID - 1].time
      : 0;
    return [previousSectionTime, sectionsModel[sectionID].time];
  };

  // Find which section the current time is within and return its ID.
  var findCurrentSection = function(playerCurrentTime) {
    for (var id in sectionsModel) {
      if (sectionsModel.hasOwnProperty(id)) {
        var range = getSectionRange(id);
        if (playerCurrentTime > range[0] && playerCurrentTime <= range[1]) {
          return id;
        }
      }
    }
  };

  // Check for a change in section at current time and change highlight if there is a change.
  var currentSectionCheck = function() {
    var playerCurrentTime = player.getCurrentTime();
    var range = getSectionRange(cachedCurrentSection);
    // Only update highlight if there has been a change in section
    if (playerCurrentTime <= range[0] || playerCurrentTime > range[1]) {
      cachedCurrentSection = findCurrentSection(playerCurrentTime);
      resetSections();
      sectionsModel[cachedCurrentSection].element.style.opacity = 1;
    }

    sectionID = requestAnimationFrame(currentSectionCheck);
  };

  // requestAnimationFrame recursive call most efficient way of animating.
  var currentSectionCheckCall = function(event) {
    if (event.data === YT.PlayerState.PLAYING) {
      sectionID = requestAnimationFrame(currentSectionCheck);
    } else {
      cancelAnimationFrame(sectionID);
    }
  };

  //
  // FEEDBACK
  //

  var showFeedback = function() {
    var actionRow = document.querySelector(".dp-buttons-action");
    var feedbackRow = document.querySelector(".dp-buttons-feedback");
    actionRow.classList.add("dp-hide");
    feedbackRow.classList.remove("dp-hide");
    feedbackRow.classList.add("dp-fadein");
  };

  var checkAnswers = function() {
    var allAnswered = true;
    for (var id in sectionsModel) {
      if (sectionsModel.hasOwnProperty(id)) {
        var element = sectionsModel[id].element;
        if (
          !element.classList.contains("dp-section-good") &&
          !element.classList.contains("dp-section-bad")
        ) {
          allAnswered = false;
        }
      }
    }
    if (allAnswered) {
      validate();
    }
  };

  var validate = function() {
    for (var id in sectionsModel) {
      if (sectionsModel.hasOwnProperty(id)) {
        var element = sectionsModel[id].element;
        element.style.opacity = 1;
        // element.removeEventListener("click", sectionListener, true);
        var isGood = element.getAttribute("data-is-good");
        if (
          (isGood === "true" &&
            element.classList.contains("dp-section-good")) ||
          (isGood === "false" && element.classList.contains("dp-section-bad"))
        ) {
          element.innerHTML =
            "<img src='images/dp-tick-opt.svg' class='icon-tick' />";
        } else {
          element.innerHTML =
            "<img src='images/dp-cross-opt.svg' class='icon-cross' />";
        }
      }
    }
    player.pauseVideo();
    showFeedback();
  };

  //
  // BUTTON CONTROLS
  //
  var setGood = function(_sectionID) {
    var section = sectionsModel[_sectionID || cachedCurrentSection];
    section.element.classList.remove("dp-section-bad");
    section.element.classList.add("dp-section-good");
  };

  var setBad = function(_sectionID) {
    var section = sectionsModel[_sectionID || cachedCurrentSection];
    section.element.classList.remove("dp-section-good");
    section.element.classList.add("dp-section-bad");
  };

  var initButtons = function() {
    document.querySelector("#dp-good").addEventListener("click", function() {
      setGood();
      checkAnswers();
      // validate();
    });

    document.querySelector("#dp-bad").addEventListener("click", function() {
      setBad();
      checkAnswers();
      // validate();
    });

    document
      .querySelector("#dp-feedback")
      .addEventListener("click", function() {
        this.style.display = "none";
        var feedbackText = document.querySelector(".dp-feedback-text");
        feedbackText.classList.remove("dp-hide");
        feedbackText.classList.add("dp-fadein");
      });

    //
  };

  module.init = function() {
    player.addEventListener("onStateChange", function(event) {
      progress(event);
      currentSectionCheckCall(event);
    });
    buildSectionsModel();
    initSections();
    initButtons();
  };

  // Init the player and quiz controls on ready
  module.initPlayer = function() {
    player = new YT.Player("player", {
      height: "390",
      width: "640",
      playerVars: {
        rel: 0,
        showinfo: 0,
        controls: 0
      },
      videoId: videoID,
      events: {
        onReady: module.init
      }
    });
  };

  // Add API script to head.
  var tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName("script")[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  return module;
})(window, document, undefined);

// API will call this function so it has to be on the global scope.
function onYouTubeIframeAPIReady() {
  pageModule.initPlayer();
}
