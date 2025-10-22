import React, { useState, useEffect } from "react";

import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { getClassroom } from "../../components/getClassroom";
import { getCurrentUser, getUserInfo } from "../../components/manageUsers";
import { getLessonByIDAndName } from "../../components/getLessons";
import { deleteClassroom } from "../../components/deleteClassroom";
import {
  getRequestsByClassroom,
  deleteRequestByStudentAndClassroom,
} from "../../components/requestClassroom";
import { updateClassroomStudents } from "../../components/updateClassrooms";
import { getClassroomByStudent } from "../../components/getClassroom";

import {
  handleStudentLessonMarking,
  updateStudentLessonCompletion, updateStudentLessonPassFail
} from "../../components/studentLesson";
import { addStudentClassroom, deleteStudentClassroom, deleteStudentClassroomByStudentID } from "../../components/studentClassroom";
import styles from "./ViewClassroom.module.css";
import backIcon from "@images/icons/goback.png";

import InfoBlock from "../../components/display/InfoBlock";
import MessageBox from "../../components/display/MessageBox";
import LessonCard from "../../components/clickable/LessonCard";
import SingleButtonMessageBox from "../../components/display/SingleButtonMessageBox";
import MarkStudentModal from "../../components/display/MarkStudentModal";

function ViewClassroom({ userData }) {
  let navigate = useNavigate();

  const { id } = useParams();
  const [classroom, setClassroom] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [request, setRequest] = useState([]);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [activeMarkStudent, setActiveMarkStudent] = useState(null);
  const [markConfirmation, setMarkConfirmation] = useState(null);
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [message, setMessage] = useState("");

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

  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    if (userData?.role === "student" && classroom) {
      getClassroomByStudent(userData.id).then((courses) => {
        const joined = courses.some(
          (c) => c.data().classroom_id === classroom.classroom_id
        );
        setIsJoined(joined);
      });
    }
  }, [userData, classroom]);

  const handleCancelJoin = async () => {
    try {
      if (!userData?.id || !classroom?.classroom_id) return;

      // Step 1: Remove student from classroom_students array
      const updatedStudents = classroom.classroom_students.filter(
        (s) => !s.startsWith(userData.id + ":")
      );
      await updateClassroomStudents(classroom.classroom_id, updatedStudents);

      // Step 2: Remove mapping in student_classroom
      await deleteStudentClassroom(userData.id, classroom.classroom_id);

      // Step 3: Update local state
      setClassroom((prev) => ({
        ...prev,
        classroom_students: updatedStudents,
      }));

      console.log(
        `✅ Student ${userData.id} left classroom ${classroom.classroom_id}`
      );

      // Close the confirmation box
      setShowCancelConfirm(false);
      navigate("/home/classrooms");
    } catch (err) {
      console.error("Error cancelling join:", err);
    }
  };

  const handleOpenMarkModal = (studentEntry) => {
    if (!studentEntry) return;
    const parts = studentEntry.split(":");
    const studentId = parts[0] ?? "";
    const studentName = parts[1] ?? parts[0] ?? "";
    setActiveMarkStudent({
      id: studentId,
      name: studentName,
      entry: studentEntry,
    });
  };

  const handleCloseMarkModal = () => {
    setActiveMarkStudent(null);
  };

  const handleRequestMarkAction = (lessonDoc, action) => {
    if (!lessonDoc || !activeMarkStudent) return;
    const data = typeof lessonDoc.data === "function" ? lessonDoc.data() : {};
    const lessonTitle = data?.title ?? lessonDoc?.id ?? "Lesson";
    setMarkConfirmation({
      action,
      lessonTitle,
      lessonDoc,
      student: activeMarkStudent,
    });
  };

  const handleConfirmMark = () => {
    if (markConfirmation) {
      console.log(markConfirmation.lessonDoc.data().lessonID);
      console.log(
        `Marking ${markConfirmation.student?.name} (${markConfirmation.student?.id}) in ${markConfirmation.lessonTitle} (${markConfirmation.lessonDoc.data().lessonID}) as ${markConfirmation.action}`
      );

      handleStudentLessonMarking(markConfirmation.student?.id, classroom, markConfirmation.lessonDoc?.data().lessonID, markConfirmation.action)
    }
    setMarkConfirmation(null);
  };

  const handleCancelConfirmMark = () => {
    setMarkConfirmation(null);
  };

  useEffect(() => {
    if (userData != null) {
      getClassroom(id, userData).then((classroom) => {
        setClassroom(classroom);
        if (classroom == null) {
          navigate("/home");
        }
      });
    }
  }, [userData]);

  useEffect(() => {
    if (userData != null && classroom != null) {
      getRequestsByClassroom(classroom.classroom_id).then((request) => {
        setRequest(request);
      });
    }
  }, [userData, classroom]);
  if (userData != null && classroom != null) {
    console.log(classroom.classroom_id);
  }

  useEffect(() => {
    if (userData != null && classroom != null) {
      Promise.all(
        classroom.classroom_lessons.map((lessonString) =>
          getLessonByIDAndName(lessonString, userData)
        )
      ).then((results) => {
        setLessons(results.filter(Boolean)); // remove nulls
      });
    }
  }, [userData, classroom]);

  const handleDelete = () => {
    if (classroom.classroom_status === "Published") {
      setMessage("This classroom is already published. Deleting is not allowed.");
      setShowMessageBox(true);
      return;
    }

    deleteClassroom(classroom.classroom_id)
      .then(() => setShowDelete(false))
      .then(() => navigate("/home/classrooms"))
      .catch((error) => console.error("Error deleting classroom:", error));
  };

  const handleEdit = () => {
    if (!classroom) return;

    if (classroom.classroom_status === "Archived") {
      setMessage("This classroom is archived. Editing is not allowed.");
      setShowMessageBox(true);
      return;
    }

    if (classroom.classroom_status === "Published") {
      const parseDate = (str) => {
        if (!str) return null;
        const [day, month, year] = str.split("/").map((s) => s.trim());
        return new Date(`${year}-${month}-${day}`);
      };

      const now = new Date();
      const endDate = parseDate(classroom.classroom_endDate);

      console.log("now:", now, "endDate:", endDate);
      if (now < endDate) {
        setMessage("This classroom has already ended. Editing is not allowed.");
        setShowMessageBox(true);
        return;
      }
    }
    console.log("Editing classroom with id: " + id);
    navigate(`/home/classrooms/${id}/edit`, { state: { classroom } });
  };

  // const handleCancelJoin = async () => {
  // }

  const handleBack = () => {
    navigate(-1);
  };

  const handleRemove = async (student_string) => {
    try {
      // Step 1: split into ID and name
      const [studentID, studentName] = student_string
        .split(":")
        .map((s) => s.trim());

      if (!studentID) {
        console.error("Invalid student string:", student_string);
        return;
      }

      // Step 2: filter out this student from classroom_students
      const updatedStudents = classroom.classroom_students.filter(
        (s) => s !== student_string
      );

      // Step 3: update classroom
      await updateClassroomStudents(classroom.classroom_id, updatedStudents);

      // Step 4: delete from student_classroom collection
      await deleteStudentClassroom(studentID, classroom.classroom_id);

      console.log(
        `✅ Removed ${studentName} (${studentID}) from classroom ${classroom.classroom_id}`
      );

      // Step 5: update local state so UI refreshes
      setClassroom({
        ...classroom,
        classroom_students: updatedStudents,
      });
    } catch (err) {
      console.error("Error removing student:", err);
    }
  };

  const handleApprove = (student_request) => {
    const { request_student_id, request_student_name } = student_request;

    // Format "id: name"
    const newStudentEntry = `${request_student_id}: ${request_student_name}`;

    // Merge into existing classroom_students
    const updatedStudents = [
      ...(classroom.classroom_students || []),
      newStudentEntry,
    ];

    // Update Firestore first (classroom doc)
    updateClassroomStudents(classroom.classroom_id, updatedStudents)
      .then(() => {
        // Create mapping in student_classroom
        return addStudentClassroom(classroom.classroom_id, request_student_id);
      })
      .then(() => {
        // Then delete the request
        return deleteRequestByStudentAndClassroom(
          request_student_id,
          classroom.classroom_id
        );
      })
      .then(() => {
        // Update local state so UI shows instantly
        setClassroom((prev) => ({
          ...prev,
          classroom_students: updatedStudents,
        }));
        setRequest((prev) =>
          prev.filter(
            (reqSnap) =>
              reqSnap.data().request_student_id !== request_student_id
          )
        );

        console.log("✅ Student Approved:", newStudentEntry);
      })
      .catch((err) => console.error("❌ Error approving student:", err));
  };

  const handleReject = (student_request) => {
    const { request_student_id, request_classroom_id } = student_request;

    deleteRequestByStudentAndClassroom(request_student_id, request_classroom_id)
      .then(() => {
        // Update local state so UI refreshes
        setRequest((prev) =>
          prev.filter(
            (reqSnap) =>
              reqSnap.data().request_student_id !== request_student_id
          )
        );

        console.log(`❌ Rejected request from student ${request_student_id}`);
      })
      .catch((err) => console.error("Error rejecting student request:", err));
  };

  const durationDisplay =
    classroom != null
      ? classroom.durationWeeks ??
        classroom.classroom_durationWeeks ??
        classroom.classroomDurationWeeks ??
        "No Duration"
      : "No Duration";

  return (
    <div className={styles.wrapper}>
      <div className={styles.infoHeader}>
        <div className={styles.smallRow}>
          {classroom != null ? classroom.classroom_id : "null"}
        </div>
        <div className={styles.bigRow}>
          <div className={styles.courseTitle}>
            {classroom != null ? classroom.classroom_name : "null"}
          </div>
          <div className={styles.courseStatus}>
            {classroom != null ? classroom.classroom_status : "null"}
          </div>
          {userData != null &&
            userData.role != "student" &&
            classroom?.classroom_status !== "Archived" && (
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
          {userData != null && userData.role == "student" && isJoined && (
            <button
              className={styles.cancelEnrollButton}
              type="button"
              onClick={() => setShowCancelConfirm(true)}
            >
              Cancel Join
            </button>
          )}
          {showCancelConfirm && (
            <MessageBox
              label="Leave Classroom"
              message={`Are you sure you want to leave ${
                classroom?.classroom_name ?? "this classroom"
              }?`}
              button_1="Stay"
              button_2="Confirm"
              onCancel={() => setShowCancelConfirm(false)}
              onConfirm={handleCancelJoin}
            />
          )}
        </div>
      </div>

      <div className={styles.infoScroll}>
        <div className={styles.container}>
          <InfoBlock
            title="Course"
            content={classroom != null ? classroom.classroom_course : "null"}
          />
          <InfoBlock
            title="Supervisor"
            content={
              classroom != null ? classroom.classroom_instructor : "null"
            }
          />
          <InfoBlock
            title="Date Created"
            content={
              classroom != null
                ? `${new Date(
                    classroom.classroom_createdDate
                  ).toDateString()} ${new Date(
                    classroom.classroom_createdDate
                  ).toTimeString()}`
                : "null"
            }
          />
          <InfoBlock
            title="Last Updated"
            content={
              classroom != null
                ? `${new Date(
                    classroom.classroom_updatedDate
                  ).toDateString()} ${new Date(
                    classroom.classroom_updatedDate
                  ).toTimeString()}`
                : "null"
            }
          />
          <InfoBlock
            title="Starting Date"
            content={
              classroom != null
                ? `${new Date(
                    classroom.classroom_startDate
                  ).toDateString()} ${new Date(
                    classroom.classroom_startDate
                  ).toTimeString()}`
                : "null"
            }
          />
          <InfoBlock title="Duration (weeks)" content={durationDisplay} />
          <InfoBlock
            title="Ending Date"
            content={
              classroom != null
                ? `${new Date(
                    classroom.classroom_endDate
                  ).toDateString()} ${new Date(
                    classroom.classroom_endDate
                  ).toTimeString()}`
                : "null"
            }
          />
          <InfoBlock
            title="Description"
            content={
              classroom != null ? classroom.classroom_description : "null"
            }
          />

          {userData?.role != "student" && (
            <div>
              <p className={styles.justTitle}>Students Included:</p>
              {classroom != null ? (
                classroom.classroom_students?.length > 0 ? (
                  <div className={styles.tableWrapper}>
                    <table className={styles.studentTable}>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classroom.classroom_students.map((entry) => {
                          const [, rawName = ""] = entry.split(":");
                          const studentName = rawName.trim() || entry.trim();
                          return (
                            <tr key={entry}>
                              <td>{studentName || "—"}</td>
                              <td className={styles.tableActions}>
                                <button
                                  className={styles.markButton}
                                  onClick={() => handleOpenMarkModal(entry)}
                                  type="button"
                                >
                                  Mark
                                </button>
                                <button
                                  className={styles.removeButton}
                                  onClick={() => handleRemove(entry)}
                                  type="button"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  "No Student"
                )
              ) : (
                "No Student"
              )}
            </div>
          )}
          <br />
          {userData?.role != "student" && (
            <div>
              <p className={styles.justTitle}>Students Waiting For Approval:</p>
              {request != null ? (
                request?.length > 0 ? (
                  <div className={styles.tableWrapper}>
                    <table className={styles.studentTable}>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {request.map((reqSnap) => {
                          const data = reqSnap.data();
                          const studentName = data.request_student_name.trim() || "—";
                          return (
                            <tr key={reqSnap.id}>
                              <td>{studentName || "—"}</td>
                              <td className={styles.tableActions}>
                                <button
                                  className={styles.approveButton}
                                  onClick={() => handleApprove(data)}
                                  type="button"
                                >
                                  Approve
                                </button>
                                <button
                                  className={styles.rejectButton}
                                  onClick={() => handleReject(data)}
                                  type="button"
                                >
                                  Reject
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  "No Student"
                )
              ) : (
                "No Student"
              )}
            </div>
          )}
          <br />

          <p className={styles.justTitle}>Lesson included:</p>
          <div className={styles.cardContainer}>
            {lessons?.map((lesson) => (
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
          label = "Delete Classroom"
          message = "Are you sure you want to delete this classroom?"
          onCancel={() => setShowDelete(false)}
          onConfirm={handleDelete}
        />
      )}
      {activeMarkStudent && (
        <MarkStudentModal
          student={activeMarkStudent}
          lessons={lessons}
          onClose={handleCloseMarkModal}
          onSelectAction={handleRequestMarkAction}
        />
      )}
      {markConfirmation && (
        <MessageBox
          label="Confirm Mark"
          message={`Are you sure you want to mark ${
            markConfirmation.student?.name ?? "this student"
          } in ${markConfirmation.lessonTitle} as ${markConfirmation.action}?`}
          button_1="Cancel"
          button_2="Yes"
          onCancel={handleCancelConfirmMark}
          onConfirm={handleConfirmMark}
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

export default ViewClassroom;
