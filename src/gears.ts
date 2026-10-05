
const gears = document.querySelectorAll<SVGSVGElement>(".gear");

const startTime = performance.now();
const resumeDuration = 700;

type CircuitState = {
  offset: number;
  paused: boolean;
  frozenPhase: number;

  resumeStartTime?: number;
  resumeFromPhase?: number;
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
  currentTime: number
): number {
  if (state.paused) {
    return state.frozenPhase;
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

      return currentTime + state.offset;
    }

    const smoothPhase =
      2 * Math.pow(progress, 3) -
      Math.pow(progress, 4);

    return state.resumeFromPhase + resumeDuration * smoothPhase;
  }

  return currentTime + state.offset;
}

function animate(currentTime: number) {
  const d = currentTime - startTime;

  gears.forEach((gear) => {
    const size = Number(gear.dataset.size ?? 256);
    const x = getCssLength(gear.dataset.x);
    const y = getCssLength(gear.dataset.y);

    const speed = getSpeed(gear);
    const circuitId = getCircuitId(gear);
    const circuitState = getCircuitState(circuitId);

    const phase = getCircuitPhase(circuitState, d);

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

gears.forEach((gear) => {
  gear.addEventListener("pointerdown", (event: PointerEvent) => {
    event.preventDefault();

    draggedGear = gear;

    const circuitId = getCircuitId(gear);
    const circuitState = getCircuitState(circuitId);

    const currentTime = performance.now() - startTime;

    circuitState.frozenPhase = getCircuitPhase(
      circuitState,
      currentTime
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
