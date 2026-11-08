import { navigate } from "../../router";
import { applySessionChrome } from "../../session";
import { authClient } from "./login";


export async function initProfilePage() {

  const logoutButton = document.querySelector<HTMLAnchorElement>("#logout-button");
  logoutButton?.addEventListener("click", async (event) => {
    event.preventDefault();
    await logout();
    await applySessionChrome();
    navigate("/");
  });
}

async function logout() {
  const { data, error } = await authClient.signOut();
  if (error) {
    console.error("Logout failed:", error.message);
    throw new Error(error.message);
  }

  return data;
}
