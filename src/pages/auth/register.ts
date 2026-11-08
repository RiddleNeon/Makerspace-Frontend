import { BACKEND_URL, authClient } from "../../auth/client";
import { bindGearInput } from "../../gears/bind-input";
import { navigate } from "../../router";
import { applySessionChrome } from "../../session";

console.log("RUNNING");

let currentStep = 1;

export async function initAuthPage() {
  const submitButton = document.querySelector<HTMLButtonElement>("#auth-submit-button");
  const backButton = document.querySelector<HTMLButtonElement>("#back-button");
  const authTitle = document.querySelector<HTMLHeadingElement>("#auth-title");
  const errorSection = document.querySelector<HTMLDivElement>("#error-section")!;

  const step1Container = document.querySelector<HTMLDivElement>(".step-1");
  const step2Container = document.querySelector<HTMLDivElement>(".step-2");

  const emailInputField = document.querySelector<HTMLInputElement>("#email");
  const passwordInputField = document.querySelector<HTMLInputElement>("#password");
  const passwordConfirmationInputField = document.querySelector<HTMLInputElement>("#password-confirmation");
  const nameInputField = document.querySelector<HTMLInputElement>("#name");

  function showError(msg: string) {
    if (errorSection) errorSection.innerText = msg;
  }

  function clearError() {
    if (errorSection) errorSection.innerText = "";
  }

  submitButton?.addEventListener("click", async (event) => {
    event.preventDefault();
    clearError();

    if (currentStep === 1) {
      const email = emailInputField?.value.trim() || "";
      const password = passwordInputField?.value || "";
      const passwordConfirm = passwordConfirmationInputField?.value || "";

      if (!email || !password || !passwordConfirm) {
        showError("Bitte fülle alle Felder aus.");
        return;
      }

      if (password !== passwordConfirm) {
        showError("Die Passwörter stimmen nicht überein.");
        return;
      }

      if (password.length < 8) {
        showError("Das Passwort muss mindestens 8 Zeichen lang sein.");
        return;
      }

      try {
        submitButton.disabled = true;
        submitButton.innerText = "Prüfe E-Mail...";

        const isValid = validateEmail(email);
        if (!isValid) {
          showError("Diese Email ist keine valide Email-Adresse.");
          submitButton.disabled = false;
          submitButton.innerText = "Weiter";
          return;
        }

        const isAvailable = await checkEmailAvailability(email);
        if (!isAvailable) {
          showError("Diese E-Mail-Adresse ist bereits vergeben.");
          submitButton.disabled = false;
          submitButton.innerText = "Weiter";
          return;
        }

        currentStep = 2;
        if (step1Container) step1Container.hidden = true;
        if (step2Container) step2Container.hidden = false;
        if (authTitle) authTitle.innerText = "Profil ausfüllen (2/2)";
        submitButton.innerText = "Registrierung abschließen";
        submitButton.disabled = false;
        nameInputField?.focus();
      } catch (err: any) {
        showError("Fehler beim Prüfen der E-Mail: " + err.message);
        submitButton.disabled = false;
        submitButton.innerText = "Weiter";
      }
    } else if (currentStep === 2) {
      const email = emailInputField?.value.trim() || "";
      const password = passwordInputField?.value || "";
      const name = nameInputField?.value.trim() || "";

      if (!name) {
        showError("Bitte gib deinen Namen ein.");
        return;
      }

      submitButton.innerText = "Prüfe Name...";

      const isAvailable = await checkNameAvailability(name);
      if (!isAvailable) {
        showError("Dieser Name ist bereits vergeben.");
        submitButton.disabled = false;
        submitButton.innerText = "Weiter";
        return;
      }

      try {
        submitButton.disabled = true;
        submitButton.innerText = "Registriere...";

        await register(email, password, name);
        await applySessionChrome();
        navigate("/");
      } catch (error: any) {
        showError(error.message || "Registrierung fehlgeschlagen.");
        submitButton.disabled = false;
        submitButton.innerText = "Registrierung abschließen";
      }
    }
  });

  backButton?.addEventListener("click", () => {
    currentStep = 1;
    clearError();
    if (step1Container) step1Container.hidden = false;
    if (step2Container) step2Container.hidden = true;
    if (authTitle) authTitle.innerText = "Registrieren (1/2)";
    if (submitButton) submitButton.innerText = "Weiter";
    emailInputField?.focus();
  });

  emailInputField?.addEventListener("keyup", (e) => {
    if (e.key === "Enter") passwordInputField?.focus();
  });

  passwordInputField?.addEventListener("keyup", (e) => {
    if (e.key === "Enter") passwordConfirmationInputField?.focus();
  });

  passwordConfirmationInputField?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitButton?.click();
    }
  });

  nameInputField?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitButton?.click();
    }
  });

  bindGearInput(emailInputField, -4);
  bindGearInput(passwordInputField, -3);
  bindGearInput(passwordConfirmationInputField, -3);
  bindGearInput(nameInputField, -4);
}

async function checkEmailAvailability(email: string): Promise<boolean> {
  let body = JSON.stringify({ emailToCheck: email });
  const request = new Request(`${BACKEND_URL}/api/auth/check/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  console.log(`body: ${body}`);

  const response = await fetch(request);
  const data = await response.json();
  return data.available;
}

async function checkNameAvailability(email: string): Promise<boolean> {
  let body = JSON.stringify({ nameToCheck: email });
  const request = new Request(`${BACKEND_URL}/api/auth/check/name`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  console.log(`body: ${body}`);

  const response = await fetch(request);
  const data = await response.json();
  return data.available;
}

async function register(email: string, password: string, name: string) {
  const { data, error } = await authClient.signUp.email({
    email,
    password,
    name,
  } as any);

  if (error) {
    console.error("Registration failed:", error.message);
    throw new Error(error.message);
  }

  console.log("Registration successful!", data);
  return data;
}


const emailRegex: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]{3,}\.[a-zA-Z]{2,}$/;

function validateEmail(email: string): boolean {
  return emailRegex.test(email);
}
