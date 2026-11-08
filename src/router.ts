import { initGears } from "./gears/gears";
import { initAuthPage as initLoginPage } from "./pages/auth/login";
import { initAuthPage as initRegisterPage } from "./pages/auth/register";
import { initProfilePage } from "./pages/auth/profile";
import { loadSession } from "./session";

import loginPage from "./pages/auth/login.html?raw";
import registerPage from "./pages/auth/register.html?raw";
import profilePage from "./pages/auth/profile.html?raw";
import homePage from "./pages/home/home.html?raw";
import setupPage from "./pages/setup/setup.html?raw";
import projectsPage from "./pages/projects/projects.html?raw";
import aboutUsPage from "./pages/about-us/about-us.html?raw";

import aboutThisSitePage from "./pages/about-us/about-this-site.html?raw";

import cookiesPage from "./pages/privacy/cookies.html?raw";
import privacyPage from "./pages/privacy/privacy-notice.html?raw";


const pages: Record<string, string> = {
  "/": homePage,
  "/login": loginPage,
  "/register": registerPage,
  "/profile": profilePage,
  "/our-setup": setupPage,
  "/projects": projectsPage,
  "/about-us": aboutUsPage,
  "/about-this-site": aboutThisSitePage,
  "/cookies": cookiesPage,
  "/privacy": privacyPage
};

export async function renderPage() {
  const path = window.location.pathname;


  if (path === "/discord") {
    const linkA = "https://disc";
    const linkB = "ord.com/users/123"; // split link into 3 part to protect against basic malicious web scrapers
    const linkC = "927949065302458478";
    navigate(linkA + linkB + linkC);
    return;
  }

  const center = document.querySelector("#center");
  if (!center) return;

  center.innerHTML =
    pages[path] ??
    `<div class="page"><h2>Page Not Found</h2></div>`;

  if (path === "/login") {
    initLoginPage();
    initGears(center);
  } else if (path === "/register") {
    initRegisterPage();
    initGears(center);
  } else if (path === "/profile") {
    let session = await loadSession();
    console.log("SESSION: " + session);
    if (!session) {
      navigate("/login");
      return renderPage();
    }
    initProfilePage();
  } else {
    initGears();
  }
}


export function navigate(path: string) {
  const url = new URL(path, window.location.origin);

  if (url.origin !== window.location.origin) {
    window.location.assign(url.href);
    return;
  }

  history.pushState({}, "", url.pathname + url.search + url.hash);
  renderPage();
}


export function startRouter() {
  document.addEventListener("click", async (event) => {
    const target = event.target as HTMLElement;
    const link = target.closest("a");

    if (!link || link.target === "_blank" || link.origin !== location.origin) return;

    const path = link.pathname;

    if (path === "/" && link.getAttribute("href") === "#") return;

    if (pages[path]) {
      event.preventDefault();
      navigate(path);
    }
  });

  window.addEventListener("popstate", () => {
    void renderPage();
  });

  return renderPage();
}
