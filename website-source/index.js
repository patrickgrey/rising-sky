(function () {

    /*
    ##     ## #### ########  ########  #######
    ##     ##  ##  ##     ## ##       ##     ##
    ##     ##  ##  ##     ## ##       ##     ##
    ##     ##  ##  ##     ## ######   ##     ##
     ##   ##   ##  ##     ## ##       ##     ##
      ## ##    ##  ##     ## ##       ##     ##
       ###    #### ########  ########  #######
    */

    // https://adrianroselli.com/2024/06/youtube-and-vimeo-web-component.html
    // https://github.com/luwes/lite-vimeo-embed/blob/main/lite-vimeo-embed.js
    // https://scottjehl.com/posts/even-responsiver-video/

    // Get picture element or just img element if not surrounded by picture
    const rsHeroImage = document.querySelector(`#rsHeroKPIPanel`)?.closest("picture") || document.querySelector(`#rsHeroKPIPanel`)
    const button = document.createElement("button")

    button.classList.add("rs-image-hero")
    button.classList.add("rs-button-unset")
    // Match the max width of the image
    button.style.maxWidth = rsHeroImage.querySelector(`img`)?.style.maxWidth || rsHeroImage.style.maxWidth || "100%";

    // Pop the image inside the button
    rsHeroImage.parentElement.append(button)
    button.append(rsHeroImage)

    // Create the vimeo web compontent to load video and play
    // Need to wait for component to be ready before clicking?
    // Seems OK even on slow connection.
    button.addEventListener("click", function (event) {
        const vimeo = document.createElement("lite-vimeo")
        vimeo.setAttribute("videoid", "988437576")
        button.replaceWith(vimeo)
        vimeo.click()
    })

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
    let cloudSlowness = 3000;


    // let cloudFrequency = 30 * screenwidth

    // Utilities
    function randomNumber(min, max) {
        return Math.random() * (max - min) + min;
    }

    function cloneCloud() {
        // console.log("cloudFrequency: ", cloudFrequency);
        console.log("Cloud!");
        const cloudTemplate = document.querySelector(`svg[data-id="rs-template-cloud"]`);
        const logoContainer = document.querySelector(".rs-logo-container");

        const cloud = cloudTemplate.cloneNode(true);
        cloud.addEventListener("animationend", () => {
            cloud.remove();
        }, false);
        const left = Math.floor(randomNumber(1, window.innerWidth))
        cloud.style.left = `${left}px`
        const scale = Math.floor(randomNumber(1, 4))
        cloud.style.transform = `scale(${scale}) translateY(100%)`
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
            if (window.innerWidth >= 3200) {
                cloudFrequency = 10
            } else {
                cloudFrequency = Math.floor((3400 - window.innerWidth) / 150);
            }
            const random = Math.floor(randomNumber(1, cloudFrequency))
            if (random === 1) cloneCloud();
        }, 100)
    }

    // Only start random time trigger of cloning if prefers motion.
    if (!prefersReduced.matches) {
        startClone();
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