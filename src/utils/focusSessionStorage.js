const STORAGE_KEY = "focusSession";

const hasStorage = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const parseSession = (raw) => {
  if (typeof raw !== "string") {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
};

export const focusSessionStorageKey = STORAGE_KEY;

export const readFocusSession = () => {
  if (!hasStorage()) {
    return null;
  }
  return parseSession(window.localStorage.getItem(STORAGE_KEY));
};

export const writeFocusSession = (session) => {
  if (!hasStorage()) {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

export const clearFocusSession = () => {
  if (!hasStorage()) {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
};

export const getActiveFocusSession = () => {
  const session = readFocusSession();
  if (!session || session.status !== "active") {
    return null;
  }
  if (
    typeof session.totalSeconds !== "number" ||
    !Number.isFinite(session.totalSeconds) ||
    typeof session.deadline !== "number" ||
    !Number.isFinite(session.deadline)
  ) {
    return null;
  }
  if (session.deadline <= Date.now()) {
    writeFocusSession({
      ...session,
      status: "completed",
    });
    return null;
  }
  return session;
};
