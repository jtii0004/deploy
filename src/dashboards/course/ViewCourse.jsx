import React, { useState, useEffect } from "react";

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { getCourse } from "../../components/getCourses";
import {
  getListOfCoursesFromStudent,
  getListOfStudentsFromCourse,
  checkCourseCompletion,
} from "../../components/getStudentCourse";
import { getLessonByIDAndName } from "../../components/getLessons";
import { getCurrentUser, getUserInfo } from "../../components/manageUsers";
// import { deleteLessonFromDatabase, deletePrereq } from "../../components/deleteLessons";
import { unEnrollCourseInDatabase } from "../../components/enrollCourses";
import { checkClassroomDate } from "../../components/getClassroom";

import styles from "./ViewCourse.module.css";

import InfoBlock from "../../components/display/InfoBlock";
import backIcon from "@images/icons/goback.png";
import MessageBox from "../../components/display/MessageBox";
import SingleButtonMessageBox from "../../components/display/SingleButtonMessageBox";
import LessonCard from "../../components/clickable/LessonCard";
import { deleteCourses } from "../../components/deleteCourses";
import { deleteClassroomsByCourse } from "../../components/deleteClassroom";
import { calculateStudentProgress } from "../../components/studentLesson";

function ViewCourse({ userData }) {
  let navigate = useNavigate();

  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [showDelete, setShowDelete] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [message, setMessage] = useState("");
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [courseProgress, setCourseProgress] = useState(0);

  useEffect(() => {
    if (userData?.role === "student" && course) {
      getListOfCoursesFromStudent(userData.id).then((courses) => {
        const enrolled = courses.some(
          (c) => c.data().courseID === course.courseID
        );
        setIsEnrolled(enrolled);
      });
    }
  }, [userData, course]);

  useEffect(() => {
    //Runs on the first render only
    if (userData == null) {
      getCurrentUser()
        .then((user) => {
          return getUserInfo(user);
        })
        .then((info) => {
          userData = info;
        });
    }
  }, []);

  useEffect(() => {
    if (userData != null) {
      getCourse(id, userData).then((course) => {
        setCourse(course);

        if (course == null) {
          console.log("Course not found");
          console.log(id);
          navigate("/home");
        }
      });
    }
  }, [userData]);

  useEffect(() => {
    if (userData != null && course != null) {
      Promise.all(
        course.courseLessons.map((lessonString) =>
          getLessonByIDAndName(lessonString, userData)
        )
      ).then((results) => {
        setLessons(results.filter(Boolean)); // remove nulls
      })
    }
  }, [course, userData]);

  useEffect(() => {
    if (userData != null && lessons != null && lessons.length >= 1) {
      let lessonCodes = lessons.map((lesson) => {return lesson.data().lessonID});
      calculateStudentProgress(userData.id, lessonCodes)
      .then((progress) => {
        console.log(progress);
        setCourseProgress(progress.toFixed(2)); // remove nulls
      })
    }
  }, [course, lessons])

  const handleDelete = () => {
    if (course.courseStatus === "Published"){
        setMessage("This course is already published. Deleting is not allowed.");
        setShowMessageBox(true);
        return;
    }

    console.log(course.courseStatus)


    deleteCourses(course.courseID)
      .then(() => deleteClassroomsByCourse(course.courseID))
      .then(() => setShowDelete(false))
      .then(() => navigate("/home/courses"))
      .catch((error) => console.error("Error deleting lesson:", error));
  };

  const handleEdit = async () => {
    try {
      const [students, classroomCheck] = await Promise.all([
        getListOfStudentsFromCourse(course.courseID),
        checkClassroomDate(course.courseID),
      ]);

      if (students && students.length > 0) {
        const canEdit = await checkCourseCompletion(course.courseID);
        if (!canEdit) {
          setMessage(
            "Some students have not completed the course. Editing is disabled."
          );
          setShowMessageBox(true);
          return;
        }
      }

      const { hasClassroom, allEnded } = classroomCheck;

      if (!allEnded && hasClassroom) {
        setMessage(
          "The classroom for this course is still ongoing. Editing is disabled until the classroom is ended."
        );
        setShowMessageBox(true);
        return;
      }

      console.log("Editing course with id:", id);
      navigate(`/home/courses/${id}/edit`, { state: { course } });
    } catch (error) {
      console.error("❌ Error checking course eligibility for editing:", error);
      setMessage(
        "An error occurred while verifying course details. Please try again later."
      );
      setShowMessageBox(true);
    }
  };

  const handleCancelEnrollment = async () => {
    try {
      await unEnrollCourseInDatabase(userData, course.courseID);
      setShowCancelConfirm(false);
      navigate("/home/courses");
    } catch (error) {
      console.error("Failed to cancel enrollment:", error);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.infoHeader}>
        <div className={styles.smallRow}>
          {course != null ? course.courseID : "null"}
        </div>
        <div className={styles.bigRow}>
          <div className={styles.courseTitle}>
            {course != null ? course.courseTitle : "null"}
          </div>
          <div className={styles.courseStatus}>
            {course != null ? course.courseStatus : "null"}
          </div>
          {userData != null && userData.role != "student" && (
            <button
              className={styles.smallButton}
              style={{ background: "#beb2a4", marginLeft: "auto" }}
              onClick={handleEdit}
            >
              Edit
            </button>
          )}
          {userData != null && userData.role != "student" && (
            <button
              className={styles.smallButton}
              onClick={() => setShowDelete(true)}
            >
              Delete
            </button>
          )}
          {userData != null && userData.role == "student" && isEnrolled && (
            <div className={styles.studentActions}>
              <div className={styles.courseProgress}>
                <div className={styles.courseProgressHeader}>
                  <span className={styles.courseProgressLabel}>Progress</span>
                  <span className={styles.courseProgressValue}>
                    {`${courseProgress}%`}
                  </span>
                </div>
                <div
                  className={styles.courseProgressBar}
                  role="progressbar"
                  aria-label="Course progress"
                  aria-valuenow={courseProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  title={`Course progress ${courseProgress}%`}
                >
                  <div
                    className={styles.courseProgressFill}
                    style={{ width: `${courseProgress}%` }}
                  />
                </div>
              </div>
              <button
                className={styles.cancelEnrollButton}
                type="button"
                onClick={() => setShowCancelConfirm(true)}
              >
                Cancel Enroll
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.infoScroll}>
        <div className={styles.container}>
          <InfoBlock
            title="Supervisor"
            content={course != null ? course.courseSupervisor : "null"}
          />
          <InfoBlock
            title="Total Credit Point"
            content={course != null ? course.courseTotalCreditpoint : "null"}
          />
          <InfoBlock
            title="Date Created"
            content={
              course != null
                ? `${new Date(
                    course.courseCreateDate
                  ).toDateString()} ${new Date(
                    course.courseCreateDate
                  ).toTimeString()}`
                : "null"
            }
          />
          <InfoBlock
            title="Last Updated"
            content={
              course != null
                ? `${new Date(
                    course.courseUpdateDate
                  ).toDateString()} ${new Date(
                    course.courseUpdateDate
                  ).toTimeString()}`
                : "null"
            }
          />
          <InfoBlock
            title="Course Description"
            content={course != null ? course.courseDescription : "null"}
          />

          <p className={styles.justTitle}>Lesson included:</p>
          <div className={styles.cardContainer}>
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lessonID={lesson.data().lessonID}
                lessonTitle={lesson.data().title}
                creditPoint={lesson.data().creditPoint}
                instructorName={lesson.data().owner}
                href={`/home/lessons/${lesson.id}`}
              />
            ))}
          </div>
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

      {showDelete && (
        <MessageBox
          label="Delete Course"
          message="Are you sure you want to delete this course?"
          onCancel={() => setShowDelete(false)}
          onConfirm={handleDelete}
        />
      )}
      {showCancelConfirm && (
        <MessageBox
          label="Cancel Enrollment"
          message={`Are you sure you want to leave ${
            course?.courseTitle ?? "this course"
          }?`}
          button_1="Keep Course"
          button_2="Confirm"
          onCancel={() => setShowCancelConfirm(false)}
          onConfirm={handleCancelEnrollment}
        />
      )}

      {showMessageBox && (
        <SingleButtonMessageBox
          label="Action Not Allowed"
          message={message}
          button="OK"
          onConfirm={() => setShowMessageBox(false)}
        />
      )}
    </div>
  );
}

export default ViewCourse;
