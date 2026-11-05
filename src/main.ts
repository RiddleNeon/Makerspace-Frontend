import "./gears/gears.ts"
import { authClient, initAuthPage as initLoginPage } from "./pages/auth/login.ts";
import { initAuthPage as initRegisterPage } from "./pages/auth/register.ts";


import loginPage from "./pages/auth/login.html?raw";
import registerPage from "./pages/auth/register.html?raw";
import profilePage from "./pages/auth/profile.html?raw";
import homePage from "./pages/home/home.html?raw";
import setupPage from "./pages/setup/setup.html?raw";
import projectsPage from "./pages/projects/projects.html?raw";
import aboutUsPage from "./pages/about-us/about-us.html?raw";
import { initGears } from "./gears/gears.ts";
import { initProfilePage } from "./pages/auth/profile.ts";

async function loadSession() {
  const { data: session, error } = await authClient.getSession();

  if (error) {
    console.error("Session konnte nicht geladen werden:", error.message);
  } else if (session) {
    console.log("Angemeldet als:", session.user.email);
  } else {
    console.log("Nicht angemeldet.");
  }

  return session;
}




const pages: Record<string, string> = {
  "/": homePage,
  "/login": loginPage,
  "/register": registerPage,
  "/profile": profilePage,
  "/our-setup": setupPage,
  "/projects": projectsPage,
  "/about-us": aboutUsPage,
};

initGears()


async function renderPage() {
  const center = document.querySelector("#center");
  if (!center) return;


  const path = window.location.pathname;
  center.innerHTML =
    pages[path] ??
    `<div class="page"><h2>Page Not Found</h2></div>`; //TODO: better 404 page

  if (path === "/login") {
    initLoginPage();
    initGears(center);
  } else if (path === "/register") {
    initRegisterPage();
    initGears(center);
  } else if (path === "/profile") {
    let session = loadSession();
    if (!session) {
      await navigate("/login");
      return renderPage();
    }
    initProfilePage();
  } else {
    initGears()
  }
}

export async function navigate(path: string) {
  history.pushState({}, "", path);
  renderPage();
}

document.addEventListener("click", async (event) => {
  const target = event.target as HTMLElement;
  const link = target.closest("a");

  if (!link || link.target === "_blank" || link.origin !== location.origin) return;

  const path = link.pathname;

  if (path === "/" && link.getAttribute("href") === "#") return;

  if (pages[path]) {
    event.preventDefault();
    await navigate(path);
  }
});

window.addEventListener("popstate", renderPage);

await renderPage();

export function hide(elements: any) {
  elements = elements.length ? elements : [elements];
  for (var index = 0; index < elements.length; index++) {
    elements[index].style.display = 'none';
  }
}
export function show(elements: any) {
  elements = elements.length ? elements : [elements];
  for (var index = 0; index < elements.length; index++) {
    elements[index].style.display = 'flex';
  }
}


if (await loadSession()) {
  hide(document.querySelectorAll('.not-logged-in'));
} else {
  hide(document.querySelectorAll('.logged-in'))
}
