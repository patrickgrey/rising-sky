
((arguments) => {
  const button = document.querySelector(".rs-home-hero > button");
  const para = document.querySelector(".rs-hero-data-container > p");

  button.addEventListener("click", function (event) {
    para.classList.toggle("show");
  });
})(document);