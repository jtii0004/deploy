import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { getLesson } from "../../components/getLessons";
import { getCurrentUser, getUserInfo } from "../../components/manageUsers";
import {
  deleteLessonFromDatabase,
  deletePrereqAndCourse,
} from "../../components/deleteLessons";

import styles from "./ViewLesson.module.css";

import InfoBlock from "../../components/display/InfoBlock";
import MessageBox from "../../components/display/MessageBox";
import SingleButtonMessageBox from "../../components/display/SingleButtonMessageBox";
import { getStudentLesson } from "../../components/studentLesson";
import backIcon from "@images/icons/goback.png";

function ViewLesson({ userData }) {
  let navigate = useNavigate();

  const { id } = useParams();
  const [lesson, setLesson] = useState(null);

  const [showDelete, setShowDelete] = useState(false);
  const [markingState, setMarkingState] = useState("");
  const [messagebox, setMessageBox] = useState(false);

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
      getLesson(id, userData).then((lesson) => {
        setLesson(lesson);

        if (lesson == null) {
          navigate("/home");
        }
      });
    }
  }, [userData]);

  useEffect(() => {
    if (userData?.role === "student" && lesson != null)
    {
      console.log(userData?.id, lesson?.lessonID);
      getStudentLesson(userData?.id, lesson?.lessonID).then(
        (res) => {
          setMarkingState(res[0].data().student_lesson_passFail);
        }
      );
    }
  }, [userData, lesson]);

  const handleDelete = () => {
    if (lesson.status === "Published"){
        setMessageBox(true);
        return;
    }
    deletePrereqAndCourse(lesson.lessonID, id)
      .then(() => deleteLessonFromDatabase(id))
      .then(() => setShowDelete(false))
      .then(() => navigate("/home"))
      .catch((error) => console.error("Error deleting lesson:", error));
  };

  const handleEdit = () => {
    console.log("Editing lesson with id: " + id);
    navigate(`/home/lessons/${id}/edit`, { state: { lesson } });
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.infoHeader}>
        <div className={styles.smallRow}>
          {lesson != null ? lesson.lessonID : "null"}
        </div>
        <div className={styles.bigRow}>
          <div className={styles.lessonTitle}>
            {lesson != null ? lesson.title : "null"}
          </div>
          <div className={styles.lessonStatus}>
            {lesson != null ? lesson.status : "null"}
          </div>
          {userData?.role === "student" && (
            <div className={styles.lessonMarking}>
              <span className={styles.markingLabel}>{markingState}</span>
            </div>
          )}
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
        </div>
      </div>

      <div className={styles.infoScroll}>
        <div className={styles.container}>
          <InfoBlock
            title="Owner"
            content={lesson != null ? lesson.owner : "null"}
          />
          <InfoBlock
            title="Credit Point"
            content={lesson != null ? lesson.creditPoint : "null"}
          />
          <InfoBlock
            title="Date Created"
            content={
              lesson != null
                ? `${new Date(lesson.createdAt).toDateString()} ${new Date(
                    lesson.createdAt
                  ).toTimeString()}`
                : "null"
            }
          />
          <InfoBlock
            title="Last Updated"
            content={
              lesson != null
                ? `${new Date(lesson.updatedAt).toDateString()} ${new Date(
                    lesson.updatedAt
                  ).toTimeString()}`
                : "null"
            }
          />
          <InfoBlock
            title="Lesson Description"
            content={lesson != null ? lesson.description : "null"}
          />
          <InfoBlock
            title="Objectives"
            content={
              lesson != null
                ? lesson?.objectives && lesson.objectives.length > 0
                  ? lesson.objectives
                  : "No Objectives"
                : "No Objectives"
            }
          />
          <InfoBlock
            title="Reading List"
            content={
              lesson != null
                ? lesson.readingList.length > 0
                  ? lesson.readingList
                  : "No Reading List"
                : "No Reading List"
            }
          />
          <InfoBlock
            title="Assignments"
            content={
              lesson != null
                ? lesson.assignments.length > 0
                  ? lesson.assignments
                  : "No Assignments"
                : "No Assignments"
            }
          />
          <InfoBlock
            title="Prerequisites"
            content={
              lesson != null
                ? lesson.prerequisites.length > 0
                  ? lesson.prerequisites
                  : "No Prerequisites"
                : "No Prerequisites"
            }
          />
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
          label="Delete Lesson"
          message="Are you sure you want to delete this lesson?"
          onCancel={() => setShowDelete(false)}
          onConfirm={handleDelete}
        />
      )}
      { messagebox && <SingleButtonMessageBox label="Action Not Allowed" message="This lesson is already published. Deleting is not allowed." button="OK" onConfirm={() => setMessageBox(false)}/>}
    </div>
  );
}

export default ViewLesson;
