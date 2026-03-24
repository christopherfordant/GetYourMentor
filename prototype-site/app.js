const sportButtons = document.querySelectorAll(".sport-link");

sportButtons.forEach((button) => {
  button.addEventListener("click", () => {
    button.blur();
  });
});
