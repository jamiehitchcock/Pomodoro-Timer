import { useContext, useState, useEffect, useRef } from "react";
import SettingsContext from "./SettingsContext";

// import react-circular progressbar from - https://www.npmjs.com/package/react-circular-progressbar
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

import classes from './styles/Timer.module.scss'

function Timer() {

    // context
    const settingsInfo = useContext(SettingsContext);

    // state declarations
    const [isRunning, setIsRunning] = useState(false);
    const [mode, setMode] = useState("session");
    const [secondsRemaining, setSecondsRemaining] = useState(0);

    // references
    const isRunningRef = useRef(isRunning);
    const modeRef = useRef(mode);
    const secondsRemainingRef = useRef(secondsRemaining);

    // progressbar calculations
    const totalSeconds = (mode === 'session' ? settingsInfo.sessionMins : settingsInfo.breakMins) * 60;
    const percentage = Math.round(secondsRemaining / totalSeconds * 100);

    // timer display
    const minutes = Math.floor(secondsRemaining / 60);
    let seconds = secondsRemaining % 60;

    function formatTimer() {
        function addZero(unit) {
            if (unit < 10) {
                return `0${unit}`
            } else {
                return unit
            }
        };
        return `${addZero(minutes)}:${addZero(seconds)}`;
    }

    function initTimer() {
        secondsRemainingRef.current = settingsInfo.sessionMins * 60;
        setSecondsRemaining(secondsRemainingRef.current);
    }

    function tickTimer() {
        secondsRemainingRef.current = secondsRemainingRef.current - 1;
        setSecondsRemaining(secondsRemainingRef.current);
    }

    // run everytime settingsInfo changes
    useEffect(() => {
        function changeMode() {
            const nextMode = modeRef.current === 'session' ? 'break' : 'session';
            const nextSeconds = (nextMode === 'session' ? settingsInfo.sessionMins : settingsInfo.breakMins) * 60;

            setMode(nextMode);
            modeRef.current = nextMode;

            setSecondsRemaining(nextSeconds);
            secondsRemainingRef.current = nextSeconds;
        }

        initTimer();

        const timerInterval = setInterval(() => {
            // if timer is not currently running do nothing
            if (!isRunningRef.current) {
                return;
            }
            // change timer mode if timer runs out
            if (secondsRemainingRef.current == 0) {
                playBeep();
                return changeMode();
            }

            tickTimer();
        }, 1000);

        // clear interval when unmounts
        return () => { clearInterval(timerInterval) };
    }, [settingsInfo]);

    function handleSessionIncrement() {
        if (settingsInfo.sessionMins < 60) {
            settingsInfo.setSessionMins(prevSessionMins => prevSessionMins + 1);
        }
    }

    function handleSessionDecrement() {
        if (settingsInfo.sessionMins > 1) {
            settingsInfo.setSessionMins(prevSessionMins => prevSessionMins - 1);
        }
    }

    function handleBreakIncrement() {
        if (settingsInfo.breakMins < 60) {
            settingsInfo.setBreakMins(prevBreakMins => prevBreakMins + 1);
        }
    }

    function handleBreakDecrement() {
        if (settingsInfo.breakMins > 1) {
            settingsInfo.setBreakMins(prevBreakMins => prevBreakMins - 1);
        }
    }

    function handleStopStart() {
        setIsRunning(!isRunning);
        isRunningRef.current = !isRunningRef.current;
    }

    function handleRestart() {
        // set to not running
        setIsRunning(false);
        isRunningRef.current = false;

        // change mode back to default
        modeRef.current = 'session';
        setMode(modeRef.current);
        initTimer();
        stopAudio();
    }

    function formatLabel() {
        if (modeRef.current === 'session') {
            return (<h1 id="timer-label" className={classes.session}>Focus Time Remaining</h1>)
        }
        else {
            return (<h1 id="timer-label" className={classes.break}>Break Time Remaining</h1>)
        }
    }

    function playBeep() {
        const beepAudio = document.getElementById('beep');
        beepAudio.play();
    }

    function stopAudio() {
        const beepAudio = document.getElementById('beep');
        beepAudio.pause();
        beepAudio.currentTime = 0;
    }

    console.log(settingsInfo);
    console.log(mode);
    console.log(secondsRemaining);

    return (
        <>
            {formatLabel()}

            <div className={classes.progressContainer} id="time-left">
                <CircularProgressbar value={percentage} text={formatTimer()} styles={buildStyles({
                    textColor: mode === 'session' ? 'rgb(107, 22, 187)' : 'rgb(223 130 34)',
                    pathColor: mode === 'session' ? 'rgb(107, 22, 187)' : 'rgb(223 130 34)'
                })} />
            </div>

            <div className={classes.controls}>
                <button id="start_stop" onClick={handleStopStart}>{isRunning ? "Stop" : "Start"}</button>
                <button id="reset" onClick={handleRestart}>Reset</button>
            </div>


            <div className={classes.settings}>

                <div className={classes.settings__session}>
                    <div id="session-label" className={classes.settings__session__label}>Session Length</div>
                    <div id="session-length" className={classes.settings__session__length}>{settingsInfo.sessionMins}</div>
                    <div className={classes.settings__session__buttons}>
                        <button id="session-decrement" onClick={handleSessionDecrement}>-</button>
                        <button id="session-increment" onClick={handleSessionIncrement}>+</button>
                    </div>
                </div>

                <div className={classes.settings__break}>
                    <div id="break-label" className={classes.settings__break__label}>Break Length</div>
                    <div id="break-length" className={classes.settings__break__length}>{settingsInfo.breakMins}</div>
                    <div className={classes.settings__break__buttons}>
                        <button id="break-decrement" onClick={handleBreakDecrement}>-</button>
                        <button id="break-increment" onClick={handleBreakIncrement}>+</button>
                    </div>
                </div>

            </div>

            <audio src="https://cdn.freecodecamp.org/testable-projects-fcc/audio/BeepSound.wav" id='beep'></audio>
        </>
    )
} export default Timer;