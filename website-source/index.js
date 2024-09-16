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