import React, { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { enrollCourseInDatabase } from "../../components/enrollCourses";
import { getCoursesNonEnroll } from "../../components/getCourses";

import styles from "./JoinCourse.module.css";

import JoinCourseCard from "../../components/clickable/JoinCourseCard";
import MessageBox from "../../components/display/MessageBox";
import backIcon from "@images/icons/goback.png";

function JoinCourse({ userData }) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [pendingCourse, setPendingCourse] = useState(null);

  useEffect(() => {
    getCoursesNonEnroll(userData).then((courseSnapshots) => {
      setCourses(courseSnapshots);
    });
  }, []);

  const enrollInCourse = async (courseID) => {
    try {
      console.log("Enrolling in course:", courseID);
      console.log("User ID:", userData.id);
      await enrollCourseInDatabase(userData, courseID);
      navigate("/home/courses");
    } catch (err) {
      console.error("Failed to enroll:", err);
    }
  };

  const handleConfirmJoin = async () => {
    if (!pendingCourse) {
      return;
    }

    const courseID = pendingCourse.id;
    setPendingCourse(null);
    await enrollInCourse(courseID);
  };

  const handleCancelJoin = () => {
    setPendingCourse(null);
  };

  const handleRequestJoin = (course) => {
    setPendingCourse({
      id: course.courseID,
      title: course.courseTitle,
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles.joinCoursePage}>
      <div className={styles.infoHeader}>
        <div className={styles.infoTitle}>Join Courses</div>
      </div>
      <div className={styles.infoScroll}>
        <div className={styles.cardContainer}>
          {courses.map((course) => (
            <JoinCourseCard
              key={course.id}
              courseID={course.courseID}
              courseTitle={course.courseTitle}
              creditPoint={course.courseTotalCreditpoint}
              courseSupervisor={course.courseSupervisor}
              href={`/home/courses/${course.id}`}
              onJoin={() => handleRequestJoin(course)}
            />
          ))}
        </div>
      </div>
      <div className={styles.pageFooter}>
        <button
          type="button"
          className={styles.backButton}
          onClick={handleBack}
        >
          <img
            src={backIcon}
            alt="Back"
            className={styles.backIcon}
          />
          <span>Back</span>
        </button>
      </div>

      {pendingCourse && (
        <MessageBox
          label="Join Course"
          message={`Are you sure you want to join ${pendingCourse.title}?`}
          button_1="Cancel"
          button_2="Confirm"
          onCancel={handleCancelJoin}
          onConfirm={handleConfirmJoin}
        />
      )}
    </div>
  );
}

export default JoinCourse;
