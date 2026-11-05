export function initGears(root: ParentNode = document) {
  root.querySelectorAll<SVGSVGElement>(".gear").forEach((gear) => {
    gear.addEventListener("pointerdown", (event: PointerEvent) => {
      const circuitIdStr = getCircuitId(gear);
      const circuitIdNum = Number(circuitIdStr);

      if (!isNaN(circuitIdNum) && circuitIdNum < 0) {
        return;
      }

      event.preventDefault();

      draggedGear = gear;

      const circuitState = getCircuitState(circuitIdStr);
      const currentTime = performance.now() - startTime;

      circuitState.frozenPhase = getCircuitPhase(
        circuitState,
        currentTime,
        circuitIdNum
      );

      circuitState.paused = true;

      dragStartPointerAngle = getPointerAngle(
        gear,
        event.pageX,
        event.pageY
      );

      dragStartGearAngle =
        gearAngles.get(gear) ??
        circuitState.frozenPhase * getSpeed(gear);

      draggedGearAngle = dragStartGearAngle;

      gear.setPointerCapture(event.pointerId);
    });
  });
}

const startTime = performance.now();
const resumeDuration = 700;
const targetTransitionDuration = 85;

type CircuitState = {
  offset: number;
  paused: boolean;
  frozenPhase: number;

  resumeStartTime?: number;
  resumeFromPhase?: number;

  targetOffset?: number;
  transitionStartTime?: number;
  transitionStartOffset?: number;
  transitionDuration?: number;
};

const circuitStates = new Map<string, CircuitState>();
const gearAngles = new Map<SVGSVGElement, number>();

let draggedGear: SVGSVGElement | undefined;
let dragStartPointerAngle = 0;
let dragStartGearAngle = 0;
let draggedGearAngle = 0;

function getSpeed(gear: SVGSVGElement): number {
  return Number(gear.dataset.speed_multiplier ?? 0);
}

function getCircuitId(gear: SVGSVGElement): string {
  return (
    gear.dataset.circuitId ??
    gear.getAttribute("data-circuit_id") ??
    "default"
  );
}

function getCircuitState(circuitId: string): CircuitState {
  let state = circuitStates.get(circuitId);

  if (!state) {
    state = {
      offset: 0,
      paused: false,
      frozenPhase: 0,
    };

    circuitStates.set(circuitId, state);
  }

  return state;
}

export function advanceCircuit(circuitId: string | number, delta: number, durationMs: number = 85) {
  const idStr = String(circuitId);
  const state = getCircuitState(idStr);
  const currentTime = performance.now() - startTime;

  const currentCalculatedOffset = getCurrentOffset(state, currentTime);

  state.transitionStartOffset = currentCalculatedOffset;
  state.targetOffset = currentCalculatedOffset + delta;
  state.transitionStartTime = currentTime;
  state.transitionDuration = durationMs;
}

function getCurrentOffset(state: CircuitState, currentTime: number): number {
  if (
    state.transitionStartTime !== undefined &&
    state.targetOffset !== undefined &&
    state.transitionStartOffset !== undefined
  ) {
    const elapsed = currentTime - state.transitionStartTime;
    const progress = Math.min(elapsed / (state.transitionDuration ?? targetTransitionDuration), 1);

    const smoothProgress =
      2 * Math.pow(progress, 3) - Math.pow(progress, 4);

    const current =
      state.transitionStartOffset +
      (state.targetOffset - state.transitionStartOffset) * smoothProgress;

    if (progress >= 1) {
      state.transitionStartTime = undefined;
      state.transitionStartOffset = undefined;
      state.targetOffset = undefined;
      state.offset = current;
    }

    return current;
  }

  return state.offset;
}

function getCssLength(value: string | undefined): string {
  if (!value) {
    return "0px";
  }

  return /^\d+(\.\d+)?$/.test(value)
    ? `${value}px`
    : value;
}

function getPointerAngle(
  gear: SVGSVGElement,
  pageX: number,
  pageY: number
): number {
  const rect = gear.getBoundingClientRect();

  const centerX = rect.left + rect.width / 2 + window.scrollX;
  const centerY = rect.top + rect.height / 2 + window.scrollY;

  return Math.atan2(
    pageY - centerY,
    pageX - centerX
  ) * 180 / Math.PI;
}

function getCircuitPhase(
  state: CircuitState,
  currentTime: number,
  circuitId: number
): number {
  if (state.paused) {
    return state.frozenPhase;
  }

  const effectiveOffset = getCurrentOffset(state, currentTime);
  const negative = circuitId < 0;

  if (negative) {
    return effectiveOffset;
  }

  if (
    state.resumeStartTime !== undefined &&
    state.resumeFromPhase !== undefined
  ) {
    const elapsed = currentTime - state.resumeStartTime;
    const progress = Math.min(elapsed / resumeDuration, 1);

    if (progress >= 1) {
      state.resumeStartTime = undefined;
      state.resumeFromPhase = undefined;

      return currentTime + effectiveOffset;
    }

    const smoothPhase =
      2 * Math.pow(progress, 3) -
      Math.pow(progress, 4);

    return state.resumeFromPhase + resumeDuration * smoothPhase;
  }

  return currentTime + effectiveOffset;
}

function animate(currentTime: number, root: ParentNode = document) {
  const d = currentTime - startTime;

  root.querySelectorAll<SVGSVGElement>(".gear").forEach((gear) => {
    const size = Number(gear.dataset.size ?? 256);
    const x = getCssLength(gear.dataset.x);
    const y = getCssLength(gear.dataset.y);

    const speed = getSpeed(gear);
    const circuitId = getCircuitId(gear);
    const circuitIdNum = Number(circuitId);
    const circuitState = getCircuitState(circuitId);

    const phase = getCircuitPhase(circuitState, d, circuitIdNum);

    let angle: number;

    if (gear === draggedGear) {
      angle = draggedGearAngle;
    } else {
      angle = phase * speed;
    }

    gearAngles.set(gear, angle);

    gear.style.setProperty("--size", `${size}px`);
    gear.style.setProperty("--x", x);
    gear.style.setProperty("--y", y);
    gear.style.setProperty("--angle", `${angle}deg`);
  });

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

addEventListener("pointermove", (event: PointerEvent) => {
  if (!draggedGear) {
    return;
  }

  const pointerAngle = getPointerAngle(
    draggedGear,
    event.pageX,
    event.pageY
  );

  const angleDifference =
    pointerAngle - dragStartPointerAngle;

  draggedGearAngle =
    dragStartGearAngle + angleDifference;

  const circuitId = getCircuitId(draggedGear);
  const circuitState = getCircuitState(circuitId);
  const speed = getSpeed(draggedGear);

  if (speed !== 0) {
    circuitState.frozenPhase =
      draggedGearAngle / speed;
  }
});

function releaseDraggedGear() {
  if (!draggedGear) {
    return;
  }

  const circuitId = getCircuitId(draggedGear);
  const circuitState = getCircuitState(circuitId);

  const currentTime = performance.now() - startTime;

  circuitState.resumeStartTime = currentTime;
  circuitState.resumeFromPhase = circuitState.frozenPhase;

  circuitState.offset =
    circuitState.frozenPhase - currentTime;

  circuitState.paused = false;

  draggedGear = undefined;
}

addEventListener("pointerup", releaseDraggedGear);
addEventListener("pointercancel", releaseDraggedGear);
