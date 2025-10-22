import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import styles from "./FocusPage.module.css";

import Button from "../components/clickable/Button";
import GrowthSection from "../components/functional/GrowthSection";
import {
  clearFocusSession,
  readFocusSession,
  writeFocusSession,
} from "../utils/focusSessionStorage";

const confirmationPhrase = "I really really really want to give up my focus";

function FocusPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const rawDuration = searchParams.get("duration");
  const parsed = Number(rawDuration);
  const focusMinutes =
    Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 25;
  const initialSeconds = focusMinutes * 60;

  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [remainingTime, setRemainingTime] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [sessionDeadline, setSessionDeadline] = useState(null);
  const [showGiveUpPrompt, setShowGiveUpPrompt] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState("");
  const [confirmationError, setConfirmationError] = useState("");
  const [showCompletionPrompt, setShowCompletionPrompt] = useState(false);
  const [newDurationInput, setNewDurationInput] = useState(
    String(Math.max(focusMinutes, 1))
  );
  const [durationError, setDurationError] = useState("");
  const hasInitializedRef = useRef(false);

  const startSession = useCallback((seconds, tasksToLoad = []) => {
    const safeSeconds = Math.max(0, Math.floor(seconds));
    const fallbackMinutes = Math.max(
      1,
      Math.floor(safeSeconds / 60) || 0
    );
    const sanitizedTasks = Array.isArray(tasksToLoad) ? tasksToLoad : [];
    const now = Date.now();
    const deadline = now + safeSeconds * 1000;

    setTotalSeconds(safeSeconds);
    setRemainingTime(safeSeconds);
    setIsRunning(true);
    setTasks(sanitizedTasks);
    setTaskInput("");
    setShowGiveUpPrompt(false);
    setConfirmationInput("");
    setConfirmationError("");
    setShowCompletionPrompt(false);
    setDurationError("");
    setNewDurationInput(String(fallbackMinutes));
    setSessionDeadline(deadline);

    writeFocusSession({
      status: "active",
      totalSeconds: safeSeconds,
      deadline,
      tasks: sanitizedTasks,
    });
  }, []);

  const resumeSession = useCallback(
    (totalSecondsValue, remainingSecondsValue, deadline, storedTasks = []) => {
      const safeTotal = Math.max(0, Math.floor(totalSecondsValue));
      const safeRemaining = Math.max(
        0,
        Math.min(safeTotal, Math.floor(remainingSecondsValue))
      );
      const sanitizedTasks = Array.isArray(storedTasks) ? storedTasks : [];

      setTotalSeconds(safeTotal);
      setRemainingTime(safeRemaining);
      setIsRunning(safeRemaining > 0);
      setTasks(sanitizedTasks);
      setTaskInput("");
      setShowGiveUpPrompt(false);
      setConfirmationInput("");
      setConfirmationError("");
      setShowCompletionPrompt(false);
      setDurationError("");
      setNewDurationInput(
        String(Math.max(1, Math.floor(safeTotal / 60) || 1))
      );
      setSessionDeadline(safeRemaining > 0 ? deadline : null);
    },
    []
  );

  const progress =
    totalSeconds > 0
      ? ((totalSeconds - remainingTime) / totalSeconds) * 100
      : 0;

  const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (isRunning && remainingTime > 0) {
      const timer = setInterval(() => {
        setRemainingTime((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isRunning, remainingTime]);

  useEffect(() => {
    if (hasInitializedRef.current) {
      return;
    }
    hasInitializedRef.current = true;

    if (typeof window === "undefined") {
      startSession(initialSeconds);
      return;
    }

    const stored = readFocusSession();

    if (stored) {
      const sanitizedTasks = Array.isArray(stored.tasks) ? stored.tasks : [];

      if (
        stored.status === "active" &&
        typeof stored.totalSeconds === "number" &&
        Number.isFinite(stored.totalSeconds) &&
        typeof stored.deadline === "number" &&
        Number.isFinite(stored.deadline)
      ) {
        const now = Date.now();
        const safeTotal = Math.max(0, Math.floor(stored.totalSeconds));
        const remaining = Math.max(
          0,
          Math.floor((stored.deadline - now) / 1000)
        );

        if (remaining > 0) {
          resumeSession(safeTotal, remaining, stored.deadline, sanitizedTasks);
          return;
        }

        const completedPayload = {
          status: "completed",
          totalSeconds: safeTotal,
          deadline: stored.deadline,
          tasks: sanitizedTasks,
        };
        writeFocusSession(completedPayload);

        setTotalSeconds(safeTotal);
        setRemainingTime(0);
        setIsRunning(false);
        setTasks(sanitizedTasks);
        setTaskInput("");
        setShowGiveUpPrompt(false);
        setConfirmationInput("");
        setConfirmationError("");
        setShowCompletionPrompt(true);
        setDurationError("");
        setNewDurationInput(
          String(Math.max(1, Math.floor(safeTotal / 60) || 1))
        );
        setSessionDeadline(null);
        return;
      }

      if (stored.status === "completed") {
        const storedTotalSeconds = Number.isFinite(stored.totalSeconds)
          ? Math.floor(stored.totalSeconds)
          : initialSeconds;
        const safeTotal = Math.max(0, storedTotalSeconds);

        setTotalSeconds(safeTotal);
        setRemainingTime(0);
        setIsRunning(false);
        setTasks(sanitizedTasks);
        setTaskInput("");
        setShowGiveUpPrompt(false);
        setConfirmationInput("");
        setConfirmationError("");
        setShowCompletionPrompt(true);
        setDurationError("");
        setNewDurationInput(
          String(Math.max(1, Math.floor(safeTotal / 60) || 1))
        );
        setSessionDeadline(null);
        return;
      }
    }

    startSession(initialSeconds);
  }, [initialSeconds, resumeSession, startSession]);

  useEffect(() => {
    if (
      sessionDeadline === null ||
      !Number.isFinite(sessionDeadline) ||
      totalSeconds <= 0
    ) {
      return;
    }

    writeFocusSession({
      status: "active",
      totalSeconds,
      deadline: sessionDeadline,
      tasks,
    });
  }, [sessionDeadline, tasks, totalSeconds]);

  useEffect(() => {
    if (remainingTime === 0 && totalSeconds > 0) {
      setIsRunning(false);
      setShowGiveUpPrompt(false);
      setDurationError("");
      setNewDurationInput(
        String(Math.max(1, Math.floor(totalSeconds / 60)))
      );
      setShowCompletionPrompt(true);
      setSessionDeadline(null);

      const completedDeadline = Number.isFinite(sessionDeadline)
        ? sessionDeadline
        : Date.now();

      writeFocusSession({
        status: "completed",
        totalSeconds,
        deadline: completedDeadline,
        tasks,
      });
    }
  }, [remainingTime, sessionDeadline, tasks, totalSeconds]);

  const handleTaskSubmit = (event) => {
    event.preventDefault();
    const trimmed = taskInput.trim();
    if (!trimmed) {
      return;
    }
    setTasks((prev) => [...prev, { id: Date.now(), text: trimmed }]);
    setTaskInput("");
  };

  const handleRemoveTask = (taskId) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  const openGiveUpPrompt = () => {
    setShowGiveUpPrompt(true);
    setConfirmationInput("");
    setConfirmationError("");
  };

  const closeGiveUpPrompt = () => {
    setShowGiveUpPrompt(false);
    setConfirmationInput("");
    setConfirmationError("");
  };

  const handleGiveUpConfirm = () => {
    if (confirmationInput.trim() === confirmationPhrase) {
      setShowGiveUpPrompt(false);
      setIsRunning(false);
      setSessionDeadline(null);
      clearFocusSession();
      navigate("/home");
      return;
    }

    setConfirmationError(
      "That phrase does not match. Please type it exactly or stay focused."
    );
  };

  const handleCompletionHome = () => {
    setShowCompletionPrompt(false);
    setSessionDeadline(null);
    clearFocusSession();
    navigate("/home");
  };

  const handleCompletionRestart = () => {
    const parsedDuration = Number(newDurationInput);

    if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) {
      setDurationError("Enter a positive number of minutes.");
      return;
    }

    if (!Number.isInteger(parsedDuration)) {
      setDurationError("Please enter a whole number of minutes.");
      return;
    }

    if (parsedDuration > 240) {
      setDurationError("Let's keep focus sessions under 240 minutes.");
      return;
    }

    const minutes = parsedDuration;
    const nextSeconds = minutes * 60;

    setShowCompletionPrompt(false);
    startSession(nextSeconds);

    if (minutes !== focusMinutes) {
      navigate(`/focus?duration=${minutes}`, { replace: true });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <aside className={styles.tasksPanel}>
          <h2 className={styles.tasksTitle}>Focus tasks</h2>
          <form className={styles.taskForm} onSubmit={handleTaskSubmit}>
            <input
              type="text"
              className={styles.taskInput}
              value={taskInput}
              onChange={(event) => setTaskInput(event.target.value)}
              placeholder="Add a task you want to tackle"
              aria-label="Task to focus on"
            />
            <button type="submit" className={styles.addButton} aria-label="Add task">
              +
            </button>
          </form>
          <ul className={styles.taskList}>
            {tasks.length === 0 && (
              <li className={styles.emptyState}>
                No tasks yet. Add something to stay on track.
              </li>
            )}
            {tasks.map((task) => (
              <li key={task.id} className={styles.taskItem}>
                <span className={styles.taskText}>{task.text}</span>
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => handleRemoveTask(task.id)}
                  aria-label={`Remove task ${task.text}`}
                >
                  -
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <div className={styles.focusPanel}>
          <div className={styles.timeQuoteContainer}>
            <p className={styles.time}>{formatTime(remainingTime)}</p>
            <p className={styles.quote}>Live a life you will remember.</p>
          </div>
          <div className={styles.growthSectionContainer}>
            <GrowthSection progress={progress} />
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <Button label="Give Up" type="button" onClick={openGiveUpPrompt} />
      </div>
      {showGiveUpPrompt && (
        <div className={styles.overlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Ready to step away?</h3>
            <p className={styles.modalMessage}>
              Type{" "}
              <span className={styles.modalPhrase}>
                "{confirmationPhrase}"
              </span>{" "}
              to confirm you want to leave focus mode.
            </p>
            <input
              type="text"
              value={confirmationInput}
              onChange={(event) => setConfirmationInput(event.target.value)}
              className={styles.modalInput}
              placeholder={confirmationPhrase}
              aria-label="Confirmation phrase"
            />
            {confirmationError && (
              <p className={styles.modalError}>{confirmationError}</p>
            )}
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={closeGiveUpPrompt}
              >
                Stay Focused
              </button>
              <button
                type="button"
                className={styles.confirmButton}
                onClick={handleGiveUpConfirm}
              >
                Give Up Focus
              </button>
            </div>
          </div>
        </div>
      )}
      {showCompletionPrompt && (
        <div className={styles.overlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <h3 className={styles.completionTitle}>Focus session complete!</h3>
            <p className={styles.completionMessage}>
              Nice work staying on task. What would you like to do next?
            </p>
            <div className={styles.completionForm}>
              <label
                htmlFor="next-session-duration"
                className={styles.completionLabel}
              >
                Start another session (minutes)
              </label>
              <div className={styles.durationInputRow}>
                <input
                  id="next-session-duration"
                  type="number"
                  min={1}
                  max={240}
                  step={1}
                  className={styles.durationInput}
                  value={newDurationInput}
                  onChange={(event) => {
                    setNewDurationInput(event.target.value);
                    setDurationError("");
                  }}
                  aria-describedby={
                    durationError ? "next-session-duration-error" : undefined
                  }
                />
                <span className={styles.durationSuffix}>min</span>
              </div>
            </div>
            {durationError && (
              <p
                id="next-session-duration-error"
                className={styles.completionError}
              >
                {durationError}
              </p>
            )}
            <div className={styles.completionActions}>
              <button
                type="button"
                className={styles.homeButton}
                onClick={handleCompletionHome}
              >
                Go to Home
              </button>
              <button
                type="button"
                className={styles.restartButton}
                onClick={handleCompletionRestart}
              >
                Start New Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FocusPage;
