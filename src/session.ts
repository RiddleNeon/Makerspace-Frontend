import { authClient } from "./auth/client";
import { hide, show } from "./dom";

export async function loadSession() {
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

export async function applySessionChrome() {
  if (await loadSession()) {
    hide(document.querySelectorAll(".not-logged-in"));
    show(document.querySelectorAll(".logged-in"));
  } else {
    hide(document.querySelectorAll(".logged-in"));
    show(document.querySelectorAll(".not-logged-in"));
  }
}
