const sportButtons = document.querySelectorAll(".sport-link");

sportButtons.forEach((button) => {
  button.addEventListener("click", () => {
    sportButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
  });
});
