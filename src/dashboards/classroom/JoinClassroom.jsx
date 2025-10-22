import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createRequest } from "../../components/requestClassroom";

import styles from "./JoinClassroom.module.css";
import JoinClassroomCard from "../../components/clickable/JoinClassroomCard";
import { getClassroomsNonJoin } from "../../components/getClassroom";
import MessageBox from "../../components/display/MessageBox";
import SingleButtonMessageBox from "../../components/display/SingleButtonMessageBox";
import backIcon from "@images/icons/goback.png";

function JoinClassroom({ userData }) {
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState([]);
  const [pendingClassroom, setPendingClassroom] = useState(null);
  const [singleMessage, setSingleMessage] = useState({
    visible: false,
    message: "",
  });

  useEffect(() => {
    getClassroomsNonJoin(userData).then((classroomSnapshots) => {
      setClassrooms(classroomSnapshots);
    });
  }, [userData]);

  const requestClassroom = async (classroomID) => {
    try {
      await createRequest(userData, classroomID);

      // Show success message instead of navigating immediately
      setSingleMessage({
        visible: true,
        message: "Your request has been submitted successfully.",
      });
    } catch (err) {
      console.error("Failed to join:", err);

      if (err.message === "REQUEST_ALREADY_EXISTS") {
        setSingleMessage({
          visible: true,
          message: "You have already requested this classroom.",
        });
      } else {
        setSingleMessage({
          visible: true,
          message: "Failed to join classroom. Please try again.",
        });
      }
    }
  };

  const handleConfirmJoin = async () => {
    if (!pendingClassroom) return;

    const classroomID = pendingClassroom.classroom_id;
    setPendingClassroom(null);
    await requestClassroom(classroomID);
  };

  const handleCancelJoin = () => {
    setPendingClassroom(null);
  };

  const handleRequestJoin = (classroom) => {
    setPendingClassroom({
      classroom_id: classroom.data().classroom_id,
      classroom_name: classroom.data().classroom_name,
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleCloseSingleMessage = () => {
    if (singleMessage.message.includes("successfully")) {
      navigate("/home/classrooms");
    }
    setSingleMessage({ visible: false, message: "" });
  };

  return (
    <div className={styles.joinCoursePage}>
      <div className={styles.infoHeader}>
        <div className={styles.infoTitle}>Join Classroom</div>
      </div>

      <div className={styles.infoScroll}>
        <div className={styles.cardContainer}>
          {classrooms.map((classroom) => (
            <JoinClassroomCard
              key={classroom.id}
              classroomId={classroom.data().classroom_id}
              classroomName={classroom.data().classroom_name}
              courseTitle={classroom.data().classroom_course}
              classroomSupervisor={classroom.data().classroom_instructor}
              href={`/home/classrooms/${classroom.id}`}
              onJoin={() => handleRequestJoin(classroom)}
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

      {pendingClassroom && (
        <MessageBox
          label="Join Lesson"
          message={`Are you sure you want to join ${pendingClassroom.classroom_name}?`}
          button_1="Cancel"
          button_2="Confirm"
          onCancel={handleCancelJoin}
          onConfirm={handleConfirmJoin}
        />
      )}

      {singleMessage.visible && (
        <SingleButtonMessageBox
          label="Notice"
          message={singleMessage.message}
          button_1="OK"
          onConfirm={handleCloseSingleMessage}
        />
      )}
    </div>
  );
}

export default JoinClassroom;
