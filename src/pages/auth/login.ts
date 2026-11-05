import { createAuthClient } from "better-auth/client";
import { advanceCircuit } from "../../gears/gears";
import { hide, navigate, show } from "../../main";

const BACKEND_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8787"
    : "https://makerspace-backend.arcegamer2022.workers.dev";

export const authClient = createAuthClient({
  baseURL: BACKEND_URL,
});

let lastEmailFieldTextLength = 0;
let lastPasswordFieldTextLength = 0;


export async function initAuthPage() {
  const loginButton = document.querySelector<HTMLAnchorElement>("#auth-submit-button");

  loginButton?.addEventListener("click", async (event) => {
    event.preventDefault();

    const email = emailInputField?.value.trim();
    const password = passwordInputField?.value;

    if (!email || !password) {
      return;
    }


    try {
      await login(email, password);
      hide(document.querySelectorAll('.not-logged-in'));
      show(document.querySelectorAll('.logged-in'));
      await navigate("/profile");

    } catch (error: any) {
      let errorSection = document.querySelector<HTMLDivElement>("#error-section")!;
      errorSection.innerHTML = error.message;
    }
  });

  const emailInputField = document.querySelector<HTMLInputElement>("#auth-input-section>#login-form>.auth-field>#email");
  const passwordInputField = document.querySelector<HTMLInputElement>("#auth-input-section>#login-form>.auth-field>#password");


  emailInputField?.addEventListener("keyup", (event) => {
    if (event.key !== "Enter") return;

    passwordInputField?.focus();
  })

  passwordInputField?.addEventListener("keydown", async (event) => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    loginButton?.click();
  });

  emailInputField?.addEventListener("input", () => {
    let currentCharLen = emailInputField.value.length;
    let diff = lastEmailFieldTextLength - currentCharLen;
    lastEmailFieldTextLength = currentCharLen;
    advanceCircuit(-2, diff * 140, Math.sqrt(Math.abs(diff)) * 85);
  })

  passwordInputField?.addEventListener("input", () => {
    let currentCharLen = passwordInputField.value.length;
    let diff = lastPasswordFieldTextLength - currentCharLen;
    lastPasswordFieldTextLength = currentCharLen;
    advanceCircuit(-2, diff * 140, Math.sqrt(Math.abs(diff)) * 85);
  })
}

async function login(email: string, password: string) {
  const { data, error } = await authClient.signIn.email({
    email,
    password,
  });

  if (error) {
    console.error("Login failed:", error.message);
    throw new Error(error.message);
  }

  return data;
}
