import { useRef, useEffect } from "react";

const useControls = (controls, handling, setIsSoftDropping, lastLockdownTime, userTryMove, userHardDrop, userTryRotateCW, userTryRotateCCW, userTryRotate180) => {
  const activeDirection = useRef(null); // Track the currently active direction key
  const keyPressTimes = useRef({}); // Track the time each key was pressed
  const keyRepeatTimers = useRef({}); // Store timers for key repeat

  let DAS = handling.DAS;
  let ARR = handling.ARR;

  // ARR only applies to left and right movement
  function startKeyRepeat(key, time) {
    handleKey({ key }, time);
    keyRepeatTimers[key] = setInterval(() => handleKey({ key }, time), ARR);
  }

  function handleKey(event, time) {
    const key = event.key.toLowerCase();
    switch (key) {
      case controls.rotateCW.toLowerCase(): // clockwise rotation
        userTryRotateCW();
        break;
      case controls.rotateCCW.toLowerCase(): // counterclockwise rotation
        userTryRotateCCW();
        break;
      case controls.rotate180.toLowerCase(): // 180° rotation
        userTryRotate180();
        break;
      case controls.moveLeft.toLowerCase(): // Move left
        userTryMove(-1, 0);
        break;
      case controls.moveRight.toLowerCase(): // Move right
        userTryMove(1, 0);
        break;
      case controls.hardDrop.toLowerCase(): // Hard drop, awards points
        if (time - lastLockdownTime < 160) break; // Prevent accidental hard drops 
        userHardDrop()
        break;
      default:
        break; // Exit if no relevant key is pressed
    }
  }

  useEffect(() => {
    let time = performance.now();
    function handleKeyDown(event, time) {
      const key = event.key.toLowerCase();
      if (!keyPressTimes[key]) {
        // Handle left/right switch
        if ((key === controls.moveLeft.toLowerCase() && activeDirection.current === controls.moveRight.toLowerCase()) ||
          (key === controls.moveRight.toLowerCase() && activeDirection.current === controls.moveLeft.toLowerCase())) {
          clearTimeout(keyRepeatTimers[activeDirection.current]);
          clearInterval(keyRepeatTimers[activeDirection.current]);
          delete keyPressTimes[activeDirection.current];
          delete keyRepeatTimers[activeDirection.current];
          activeDirection.current = null;
        }

        keyPressTimes[key] = time;
        handleKey(event); // Initial key press

        // DAS only applies to left and right movement
        if ([controls.moveLeft.toLowerCase(), controls.moveRight.toLowerCase()].includes(key)) {
          keyRepeatTimers[key] = setTimeout(() => startKeyRepeat(key), DAS);
          activeDirection.current = key;
        }
        if (key === controls.softDrop.toLowerCase()) {
          setIsSoftDropping(true);
        }
      }
    }

    function handleKeyUp(event) {
      const key = event.key.toLowerCase();
      clearTimeout(keyRepeatTimers[key]);
      clearInterval(keyRepeatTimers[key]);
      delete keyPressTimes[key];
      delete keyRepeatTimers[key];
      // Handle left/right switch
      if (key === activeDirection) {
        activeDirection.current = null;
      }
      if (key === controls.softDrop.toLowerCase()) {
        setIsSoftDropping(false);
      }
    }
    const onKeyDown = (event) => handleKeyDown(event, time);
    const onKeyUp = (event) => handleKeyUp(event);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  });

}

export default useControls;