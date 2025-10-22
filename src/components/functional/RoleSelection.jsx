import React, { useState } from "react";

import styles from "./RoleSelection.module.css";
import coverImage from "@images/pictures/cover.png";
import teacherIcon from "@images/icons/teacher.png";
import studentIcon from "@images/icons/student.png";

function RoleSelection({ selectedRole, setSelectedRole }) {
  return (
    <div className={styles.roleSection}>
      <img
        className={styles.coverPic}
        src={coverImage}
        alt="Students studying illustration"
      />

      <button
        className={`${styles.roleCard} ${
          selectedRole === "instructor" ? styles.active : ""
        }`}
        onClick={() => setSelectedRole("instructor")}
      >
        <img
          className={styles.roleIcon}
          src={teacherIcon}
          alt="Teacher icon"
        />
        <p className={styles.roleInfo}>I am an Instructor</p>
      </button>

      <button
        className={`${styles.roleCard} ${
          selectedRole === "student" ? styles.active : ""
        }`}
        onClick={() => setSelectedRole("student")}
      >
        <p className={styles.roleInfo}>I am a Student</p>
        <img
          className={styles.roleIcon}
          src={studentIcon}
          alt="Student icon"
        />
      </button>
    </div>
  );
}

export default RoleSelection;
