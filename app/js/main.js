import { greet } from "./_imports";

const init = () => {
  greet();
};

document.addEventListener("DOMContentLoaded", () => {
  console.log("loaded");
  init();
});
