let articleParagraphs = document.querySelectorAll(".article > div > div > *");

window.addEventListener("scroll", event => {
  let fromTop = window.scrollY;
  articleParagraphs.forEach(para => {
    let paragraphHeight = para.offsetHeight;
    let middleOfWindow = window.innerHeight / 2;
    let viewportTopOffset = para.getBoundingClientRect().top;
    let topBoundary = middleOfWindow - paragraphHeight;
    let bottomBoundary = middleOfWindow;
    if (
      viewportTopOffset <= bottomBoundary &&
      viewportTopOffset >= topBoundary
    ) {
      para.classList.add("selected");
    } else {
      para.classList.remove("selected");
    }
  });
});
