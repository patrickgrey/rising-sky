// https://adrianroselli.com/2024/06/youtube-and-vimeo-web-component.html
// https://github.com/luwes/lite-vimeo-embed/blob/main/lite-vimeo-embed.js
// https://scottjehl.com/posts/even-responsiver-video/
const rsHeroImage = document.querySelector(`img[data-id="rsHeroImage"]`).closest("picture")
const button = document.createElement("button")

button.classList.add("rs-img-hero")
button.classList.add("rs-button-unset")

button.style.maxWidth = rsHeroImage.style.maxWidth;

rsHeroImage.parentElement.append(button)
button.append(rsHeroImage)

button.addEventListener("click", function (event) {
    const vimeo = document.createElement("lite-vimeo")
    vimeo.setAttribute("videoid", "988437576")
    button.replaceWith(vimeo)
    vimeo.click()
})