import "./gears/gears.ts"

const loginButton = document.querySelector<HTMLAnchorElement>("#login-button");
const authWrapper = document.querySelector<HTMLDivElement>("#auth2");

loginButton?.addEventListener("click", (event) => {
  event.preventDefault();
  authWrapper?.removeAttribute("hidden");
});

authWrapper?.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;

  if (
    target.closest("#auth-popup") ||
    target.closest(".gear")
  ) {
    return;
  }

  authWrapper.setAttribute("hidden", "");
});
