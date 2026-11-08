import { authClient, BACKEND_URL } from "../../../auth/client";

export function initDecidePage() {
  console.log("running!");
  const ideaInputField = document.querySelector<HTMLInputElement>(
    "#filament-decide-page>#idea-input-for-filament-type",
  );

  const ideaSubmitButton = document.querySelector<HTMLInputElement>(
    "#filament-decide-page>#idea-submit-button",
  );

  console.log(ideaInputField);
  console.log(ideaSubmitButton);


  ideaInputField?.addEventListener("keydown", async (event) => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    ideaSubmitButton?.click();
  });

  ideaSubmitButton?.addEventListener("click", async (event) => {
    event.preventDefault();
    console.log(ideaInputField?.value);
    ideaSubmitButton.disabled = true;
    if (ideaInputField) {
      let response = await askFilamentType(ideaInputField.value);
      ideaSubmitButton.disabled = false;
      console.log(response);
    }
  });
}

function showResults(filamentType: string, safety: number) {
  console.log("showing");
  let filamentResultElement = document.querySelector<HTMLSpanElement>(
    "#filament-result",
  );
  let safetyResultElement = document.querySelector<HTMLSpanElement>(
    "#safety-box",
  );
  let boxElement = document.querySelector<HTMLDivElement>(
    "#result-box",
  );

  if (boxElement) {
    boxElement.style.display = "flex";
  }

  if (filamentResultElement) {
    filamentResultElement.textContent = filamentType;
  }

  if (safetyResultElement) {
    let safetyDescription = "";
    if (safety < 0.15) {
      safetyDescription = "Nicht drucken! Bei diesem Druck können sehr hohe schäden entstehen!";
    } else if (safety < 0.3) {
      safetyDescription = "Bitte nicht drucken! Bei diesem Druck können schäden und Sicherheitsprobleme entstehen!";
    } else if (safety < 0.45) {
      safetyDescription = "Bitte drucken vermeiden! Der Druck könnte zu schäden führen!"
    } else if (safety <= 0.6) {
      safetyDescription = "Achtung! Dieser Druck könnte gefährlich sein!";
    }
    safetyResultElement.textContent = safetyDescription;
  }
}

let taskPending = false;
taskPending;

async function askFilamentType(idea: string) {
  let body = JSON.stringify({ idea });
  let errorBox = document.querySelector<HTMLSpanElement>(
    "#error-box",
  );

  if (!(await authClient.getSession()).data?.session.token) {
    if (errorBox) errorBox.textContent = "Du musst dich anmelden um diese Funktion zu nutzen!";
    console.log(errorBox);
    return;

  } else if (errorBox) {
    errorBox.textContent = "";
  }

  const request = new Request(`${BACKEND_URL}/api/wiki/filament/decide`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    credentials: "include"
  });

  taskPending = true;
  const response = await fetch(request);
  const data = await response.json();
  taskPending = false;
  showResults(data.filamentType, data.safety)
  return data;
}

