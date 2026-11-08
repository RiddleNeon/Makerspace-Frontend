import { authClient } from "../../auth/client";
import { bindGearInput } from "../../gears/bind-input";
import { navigate } from "../../router";
import { applySessionChrome } from "../../session";

export { authClient };

export async function initAuthPage() {
  const loginButton = document.querySelector<HTMLAnchorElement>("#auth-submit-button");
  const emailInputField = document.querySelector<HTMLInputElement>(
    "#auth-input-section>#login-form>.auth-field>#email",
  );
  const passwordInputField = document.querySelector<HTMLInputElement>(
    "#auth-input-section>#login-form>.auth-field>#password",
  );

  loginButton?.addEventListener("click", async (event) => {
    event.preventDefault();

    const email = emailInputField?.value.trim();
    const password = passwordInputField?.value;

    if (!email || !password) {
      return;
    }

    try {
      await login(email, password);
      await applySessionChrome();
      await navigate("/");
    } catch (error: any) {
      let errorSection = document.querySelector<HTMLDivElement>("#error-section")!;
      errorSection.innerHTML = error.message;
    }
  });

  emailInputField?.addEventListener("keyup", (event) => {
    if (event.key !== "Enter") return;

    passwordInputField?.focus();
  });

  passwordInputField?.addEventListener("keydown", async (event) => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    loginButton?.click();
  });

  bindGearInput(emailInputField, -2);
  bindGearInput(passwordInputField, -2);
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
