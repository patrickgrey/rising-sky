(function () {

    /*
     ######  ##        #######  ##     ## ########   ######
    ##    ## ##       ##     ## ##     ## ##     ## ##    ##
    ##       ##       ##     ## ##     ## ##     ## ##
    ##       ##       ##     ## ##     ## ##     ##  ######
    ##       ##       ##     ## ##     ## ##     ##       ##
    ##    ## ##       ##     ## ##     ## ##     ## ##    ##
     ######  ########  #######   #######  ########   ######
    */
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let intervalID;
    let cloudFrequency = 10;
    const animationControl = document.querySelector("button.rs-animation-cloud-control");


    // Utilities
    function randomNumber(min, max) {
        return Math.random() * (max - min) + min;
    }

    function handleAnimationEnd(event) {
        event.target.removeEventListener("animationend", handleAnimationEnd)
        event.target.remove();
    }

    function cloneCloud() {
        const cloudTemplate = document.querySelector(`svg[data-id="rs-template-cloud"]`);
        const logoContainer = document.querySelector(".rs-logo-container");

        const cloud = cloudTemplate.cloneNode(true);
        cloud.addEventListener("animationend", handleAnimationEnd, false);
        const left = Math.floor(randomNumber(1, window.innerWidth))
        cloud.style.left = `${left}px`
        const scale = Math.floor(randomNumber(1, 4))
        const animationSpeed = 55 / scale
        cloud.style.transform = `scale(${scale}) translateY(-100%)`
        cloud.style.animationDuration = `${animationSpeed}s`
        cloud.classList.add("rs-cloud-float")
        logoContainer.prepend(cloud)
    }

    function stopClone() {
        clearInterval(intervalID)
        intervalID = null
    }

    // Clone at low frequency for performance
    function startClone() {
        cloneCloud();
        intervalID = setInterval(() => {
            // As the window gets narrower, release clouds less often so the window doesn't fill up
            cloudFrequency = 5
            // if (window.innerWidth >= 3200) {
            //     cloudFrequency = 10
            // } else {
            //     cloudFrequency = Math.floor((3400 - window.innerWidth) / 150);
            // }
            const random = Math.floor(randomNumber(1, cloudFrequency))
            if (random === 1) cloneCloud();
        }, 100)
    }

    function toggleAnimation() {
        const svgPause = document.querySelector(`button.rs-animation-cloud-control > svg[data-pause]`)
        const svgPlay = document.querySelector(`button.rs-animation-cloud-control > svg[data-play]`)
        const isAnimating = animationControl.hasAttribute("data-playing")
        if (isAnimating) {
            svgPause.style.display = "none";
            svgPlay.style.display = "block";
            animationControl.removeAttribute("data-playing")
            stopClone()
            document.querySelectorAll(`svg[data-id="rs-template-cloud"]`).forEach(cloud => {
                cloud.style.animationPlayState = "paused";
            })
            localStorage.setItem("playClouds", "false")
        } else {
            svgPlay.style.display = "none";
            svgPause.style.display = "block";
            animationControl.setAttribute("data-playing", "")
            document.querySelectorAll(`svg[data-id="rs-template-cloud"]`).forEach(cloud => {
                cloud.style.animationPlayState = "running";
            })
            startClone()
            localStorage.setItem("playClouds", "true")
        }
    }

    // Only start random time trigger of cloning if prefers motion.
    if (!prefersReduced.matches) {
        animationControl.addEventListener("click", function (event) {
            toggleAnimation()
        })

        if (localStorage.getItem("playClouds") === "true" || localStorage.getItem("playClouds") === null) {
            startClone();
        } else {
            animationControl.click();
        }
    };

    // Random trigger time - animation frame random from range if true
    // The size of range should reduce with screen size to reduce clouds on mobile
    // Get and clone cloud SVG
    // Random scale in range
    // Add starter class to position at bottom of .rs-logo-container pos abs
    // Random left placement inside client width
    // Random speed - how?
    // Allow play and pause by removing classes

})();
