
((arguments) => {
  const heroContainer = document.querySelector(".rs-home .hero-container");
  const heroButton = document.querySelector(".rs-home .hero > button");

  heroButton.addEventListener("click", function (event) {
    heroContainer.classList.toggle("show");
  });
})(document);