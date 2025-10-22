import React, { useEffect, useMemo, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getCurrentUser,
  getUserInfo,
  getAllInstructorsInfo,
  logOut,
  getAllStudentsInfo,
} from "../components/manageUsers";
import { getLessons } from "../components/getLessons";
import { getCourses } from "../components/getCourses";
import { autoArchiveEndedClassrooms } from "../components/updateClassrooms";

import styles from "./DashboardPage.module.css";
import courseIcon from "@images/icons/course.png";
import lessonIcon from "@images/icons/lesson.png";
import classroomIcon from "@images/icons/classroom.png";
import focusIcon from "@images/icons/focus.png";
import reportIcon from "@images/icons/view_report.png";
import controlIcon from "@images/icons/control_panel.png";
import logoutIcon from "@images/icons/logout.png";

import DashbaordHeader from "../layout/DashboardHeader";

import LessonDashboard from "../dashboards/lesson/LessonDashboard";
import AddLesson from "../dashboards/lesson/AddLesson";
import EditLesson from "../dashboards/lesson/EditLesson";
import ViewLesson from "../dashboards/lesson/ViewLesson";

import CourseDashboard from "../dashboards/course/CourseDashboard";
import AddCourse from "../dashboards/course/AddCourse";
import EditCourse from "../dashboards/course/EditCourse";
import ViewCourse from "../dashboards/course/ViewCourse";
import JoinCourse from "../dashboards/course/JoinCourse";

import ClassroomDashboard from "../dashboards/classroom/ClassroomDashboard";
import EditClassroom from "../dashboards/classroom/EditClassroom";
import ViewClassroom from "../dashboards/classroom/ViewClassroom";
import AddClassroom from "../dashboards/classroom/AddClassroom";
import JoinClassroom from "../dashboards/classroom/JoinClassroom";

import ReportDashboard from "../dashboards/ReportDashboard";
import ControlPanel from "../dashboards/admin/ControlPanel";

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [students, setStudents] = useState([]);
  const [currentUnits, setCurrentUnits] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [showFocusPrompt, setShowFocusPrompt] = useState(false);
  const [focusMinutesInput, setFocusMinutesInput] = useState("25");
  const [focusMinutesError, setFocusMinutesError] = useState("");

  // User
  useEffect(() => {
    let cancelled = false;

    async function resolveCurrentUser() {
      try {
        const currentUser = await getCurrentUser();

        if (cancelled) {
          return;
        }

        if (currentUser?.uid !== user?.uid) {
          if (!currentUser) {
            navigate("/reg");
          } else {
            setUser(currentUser);
          }
        } else if (currentUser == None && user == None) {
          navigate("/reg");
        }
      } catch (error) {
        console.error("Failed to get current user:", error);
        if (!cancelled) {
          navigate("/reg");
        }
      }
    }

    resolveCurrentUser();

    return () => {
      cancelled = true;
    };
  }, []);

  // User Data
  useEffect(() => {
    if (!user) {
      setUserData(null);
      return;
    }

    let cancelled = false;

    async function fetchUserData() {
      try {
        const info = await getUserInfo(user);

        if (!cancelled) {
          setUserData(info || null);
        }
      } catch (error) {
        console.error("Failed to get user info:", error);
      }
    }

    fetchUserData();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Get ALL Instructors
  useEffect(() => {
    console.log("Getting instructors");
    if (!userData) {
      setInstructors([]);
      return;
    }

    let cancelled = false;

    getAllStudentsInfo()
      .then((list) => {
        if (!cancelled) {
          setStudents(list || []);
        }
      })
      .catch((error) => {
        console.error("Failed to load instructors:", error);
      });

    if (userData.role !== "student") {
      getAllInstructorsInfo()
        .then((list) => {
          if (!cancelled) {
            setInstructors(list || []);
          }
        })
        .catch((error) => {
          console.error("Failed to load instructors:", error);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [userData]);

  // Get ALL Units
  useEffect(() => {
    console.log("Getting units");
    if (!userData || userData.role === "student") {
      setCurrentUnits([]);
      return;
    }

    let cancelled = false;

    getLessons(true, userData)
      .then((lessons) => {
        if (!cancelled) {
          setCurrentUnits(lessons || []);
        }
      })
      .catch((error) => {
        console.error("Failed to load lessons:", error);
      });

    getCourses(true, userData)
      .then((courses) => {
        if (!cancelled) {
          setCourses(courses);
        }
      })
      .catch((error) => {
        console.error("Failed to load courses:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [userData]);

  useEffect(() => {
    if (!userData || userData.role === "student") return;

    console.log("🧹 Checking for ended classrooms to archive...");
    autoArchiveEndedClassrooms();
  }, [userData]);

  const logOutUser = async () => {
    console.log("Logging out");
    setUser(null); // reset user
    await logOut(); // clear session
    navigate("/reg"); // THEN redirect
    console.log("Tried to go out");
  };

  const openFocusPrompt = (event) => {
    event.preventDefault();
    setFocusMinutesInput("25");
    setFocusMinutesError("");
    setShowFocusPrompt(true);
  };

  const closeFocusPrompt = () => {
    setShowFocusPrompt(false);
    setFocusMinutesError("");
  };

  const confirmFocusSession = () => {
    const trimmed = focusMinutesInput.trim();
    if (!trimmed) {
      setFocusMinutesError("Please enter how many minutes you want to focus.");
      return;
    }

    if (!/^\d+$/.test(trimmed)) {
      setFocusMinutesError("Use whole numbers only (minutes).");
      return;
    }

    const minutes = Number.parseInt(trimmed, 10);
    if (minutes <= 0) {
      setFocusMinutesError("Enter at least 1 minute to begin focusing.");
      return;
    }

    setShowFocusPrompt(false);
    navigate(`/focus?duration=${minutes}`);
  };

  return (
    <div className={styles.mainContent}>
      <DashbaordHeader
        username={
          userData != null
            ? `${userData.title} ${userData.firstName} ${userData.lastName}`
            : "user"
        }
      />

      <div className={styles.pageContent}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarMenu}>
            <Link to="/home/lessons">
              <h3 className={styles.menuItem}>
                <img
                  src={courseIcon}
                  className={styles.menuIcon}
                  alt="Courses icon"
                />
                Lesson
              </h3>
            </Link>

            <Link to="/home/courses">
              <h3 className={styles.menuItem}>
                <img
                  src={lessonIcon}
                  className={styles.menuIcon}
                  alt="Lessons icon"
                />
                Course
              </h3>
            </Link>

            <Link to="/home/classrooms">
              <h3 className={styles.menuItem}>
                <img
                  src={classroomIcon}
                  className={styles.menuIcon}
                  alt="Classrooms icon"
                />
                Classroom
              </h3>
            </Link>

            {userData != null && userData.role === "student" && (
              <Link to="/focus" onClick={openFocusPrompt}>
                <h3 className={styles.menuItem}>
                  <img
                    src={focusIcon}
                    className={styles.menuIcon}
                    alt="Focus icon"
                  />
                  Focus Mode
                </h3>
              </Link>
            )}

            {userData != null && userData.role != "student" && (
              <Link to="/home/report">
                <h3 className={styles.menuItem}>
                  <img
                    src={reportIcon}
                    className={styles.menuIcon}
                    alt="Reports icon"
                  />
                  Report
                </h3>
              </Link>
            )}

            {userData != null && userData.role === "admin" && (
              <Link to="/home/control">
                <h3 className={styles.menuItem}>
                  <img
                    src={controlIcon}
                    className={styles.menuIcon}
                    alt="Control panel icon"
                  />
                  Control Panel
                </h3>
              </Link>
            )}
          </div>

          <div className={styles.sidebarBottom}>
            <Link onClick={logOutUser}>
              <h3 className={styles.menuItem}>
                <img
                  src={logoutIcon}
                  className={styles.menuIcon}
                  alt="Logout icon"
                />
                Log Out
              </h3>
            </Link>
          </div>
        </div>

        <div className={styles.contentArea}>
          <div className={styles.infoSection}>
            {userData != null && (
              <Routes>
                <Route path="/" element={<Navigate to="lessons" />} />

                <Route
                  path="/lessons/*"
                  element={<LessonDashboard userData={userData} />}
                />
                <Route
                  path="/lessons/:id"
                  element={<ViewLesson userData={userData} />}
                />
                {userData.role !== "student" && (
                  <Route
                    path="/newlesson"
                    element={
                      <AddLesson
                        instructorList={instructors}
                        prerequisiteOptions={currentUnits}
                      />
                    }
                  />
                )}

                {userData.role !== "student" && (
                  <Route
                    path="/lessons/:id/edit"
                    element={
                      <EditLesson
                        instructorList={instructors}
                        prerequisiteOptions={currentUnits}
                      />
                    }
                  />
                )}

                <Route
                  path="/courses/*"
                  element={<CourseDashboard userData={userData} />}
                />
                <Route
                  path="/courses/:id"
                  element={<ViewCourse userData={userData} />}
                />
                {userData.role !== "student" && (
                  <Route
                    path="/courses/:id/edit"
                    element={
                      <EditCourse
                        instructorList={instructors}
                        prerequisiteOptions={currentUnits}
                      />
                    }
                  />
                )}
                {userData.role !== "student" && (
                  <Route
                    path="/newcourse"
                    element={
                      <AddCourse
                        instructorList={instructors}
                        prerequisiteOptions={currentUnits}
                      />
                    }
                  />
                )}
                {userData.role === "student" && (
                  <Route
                    path="/joincourse"
                    element={<JoinCourse userData={userData} />}
                  />
                )}

                <Route
                  path="/classrooms"
                  element={<ClassroomDashboard userData={userData} />}
                />
                <Route
                  path="/classrooms/:id"
                  element={<ViewClassroom userData={userData} />}
                />
                {userData.role !== "student" && (
                  <Route
                    path="/classrooms/:id/edit"
                    element={
                      <EditClassroom
                        userData={userData}
                        studentList={students}
                        instructorList={instructors}
                        currentUnits={currentUnits}
                      />
                    }
                  />
                )}
                {userData.role !== "student" && (
                  <Route
                    path="/newclassroom"
                    element={
                      <AddClassroom
                        courseOptions={courses}
                        lessonOptions={currentUnits}
                        instructorList={instructors}
                        studentOptions={students}
                      />
                    }
                  />
                )}
                {userData.role === "student" && (
                  <Route
                    path="/joinclassroom"
                    element={<JoinClassroom userData={userData} />}
                  />
                )}

                {userData.role !== "student" && (
                  <Route
                    path="/report"
                    element={<ReportDashboard userData={userData} />}
                  />
                )}

                {userData.role === "admin" && (
                  <Route
                    path="/control"
                    element={
                      <ControlPanel
                        students={students}
                        instructors={instructors}
                      />
                    }
                  />
                )}
              </Routes>
            )}
          </div>
        </div>
      </div>
      {showFocusPrompt && (
        <div
          className={styles.focusPromptOverlay}
          role="dialog"
          aria-modal="true"
          onClick={closeFocusPrompt}
        >
          <div
            className={styles.focusPrompt}
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className={styles.focusPromptTitle}>Set focus duration</h3>
            <p className={styles.focusPromptMessage}>
              Enter how many minutes you want to focus.
            </p>
            <form
              className={styles.focusPromptForm}
              onSubmit={(event) => {
                event.preventDefault();
                confirmFocusSession();
              }}
            >
              <input
                type="number"
                min="1"
                step="1"
                className={styles.focusPromptInput}
                value={focusMinutesInput}
                onChange={(event) => setFocusMinutesInput(event.target.value)}
                aria-label="Focus duration in minutes"
              />
              {focusMinutesError && (
                <p className={styles.focusPromptError}>
                  {focusMinutesError}
                </p>
              )}
              <div className={styles.focusPromptActions}>
                <button
                  type="button"
                  className={styles.focusPromptCancel}
                  onClick={closeFocusPrompt}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.focusPromptPrimary}>
                  Start Focus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;
