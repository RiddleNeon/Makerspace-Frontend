import { advanceCircuit } from "./gears";

export function bindGearInput(
  input: HTMLInputElement | null | undefined,
  circuitId: number,
) {
  let lastLength = 0;

  input?.addEventListener("input", () => {
    const currentCharLen = input.value.length;
    const diff = lastLength - currentCharLen;
    lastLength = currentCharLen;
    advanceCircuit(circuitId, diff * 140, Math.sqrt(Math.abs(diff)) * 85);
  });
}
