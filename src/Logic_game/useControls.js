import { useRef, useEffect } from "react";

const useControls = (controls, handling, setIsSoftDropping, userTryMove, userHardDrop, userTryRotateCW, userTryRotateCCW, userTryRotate180) => {
  useEffect(() => {
    let activeDirection = null; // Track the currently active direction key
    let keyPressTimes = {}; // Track the time each key was pressed
    let keyRepeatTimers = {}; // Store timers for key repeat

    let DAS = handling.DAS;
    let ARR = handling.ARR;
    let time = performance.now();

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
          console.log("Called hard drop from useControls");
          userHardDrop()
          break;
        default:
          return; // Exit if no relevant key is pressed
      }
    }

    function handleKeyDown(event, time) {
      const key = event.key.toLowerCase();
      if (!keyPressTimes[key]) {
        // Handle left/right switch
        if ((key === controls.moveLeft.toLowerCase() && activeDirection === controls.moveRight.toLowerCase()) ||
          (key === controls.moveRight.toLowerCase() && activeDirection === controls.moveLeft.toLowerCase())) {
          clearTimeout(keyRepeatTimers[activeDirection]);
          clearInterval(keyRepeatTimers[activeDirection]);
          delete keyPressTimes[activeDirection];
          delete keyRepeatTimers[activeDirection];
          activeDirection = null;
        }

        keyPressTimes[key] = time;
        handleKey(event); // Initial key press

        // DAS only applies to left and right movement
        if ([controls.moveLeft.toLowerCase(), controls.moveRight.toLowerCase()].includes(key)) {
          keyRepeatTimers[key] = setTimeout(() => startKeyRepeat(key), DAS);
          activeDirection = key;
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
        activeDirection = null;
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