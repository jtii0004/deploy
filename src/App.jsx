import React, { useEffect } from "react";

import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ByeBye from "./pages/byebye";
import FocusPage from "./pages/FocusPage";

import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  focusSessionStorageKey,
  getActiveFocusSession,
} from "./utils/focusSessionStorage";

function FocusLockWatcher() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let isMounted = true;

    const enforceLock = () => {
      if (!isMounted) {
        return;
      }
      const session = getActiveFocusSession();
      if (!session) {
        return;
      }

      if (!location.pathname.startsWith("/focus")) {
        const minutes = Math.max(
          1,
          Math.floor(session.totalSeconds / 60) || 1
        );

        navigate(`/focus?duration=${minutes}`, { replace: true });
      }
    };

    enforceLock();

    const handleStorage = (event) => {
      if (
        event.key === focusSessionStorageKey ||
        event.key === null
      ) {
        enforceLock();
      }
    };

    window.addEventListener("storage", handleStorage);
    const intervalId = window.setInterval(enforceLock, 1000);

    return () => {
      isMounted = false;
      window.removeEventListener("storage", handleStorage);
      window.clearInterval(intervalId);
    };
  }, [location.pathname, navigate]);

  return null;
}

function App() {
  return (
    <Router>
      <FocusLockWatcher />
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/reg" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home/*" element={<DashboardPage />} />
        <Route path="/byebye" element={<ByeBye />} />
        <Route path="/focus" element={<FocusPage />} />
      </Routes>
    </Router>
  );
}
export default App;
