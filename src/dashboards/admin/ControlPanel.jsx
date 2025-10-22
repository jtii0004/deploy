import React, { useState, useEffect } from "react";

import { getCurrentUser, getUserInfo } from "../../components/manageUsers";
import {
  getAllStudentsInfo,
  getAllInstructorsInfo,
} from "../../components/manageUsers";
import { deleteStudent } from "../../components/deleteStudent";
import { deleteInstructorFromDatabase } from "../../components/deleteInstructor";

import styles from "./ControlPanel.module.css";

import TokenGenerator from "../../components/functional/TokenGenerator";
import SearchBar from "../../components/functional/SearchBar";

function ControlPanel({ students, instructors }) {
  useEffect(() => {
    //Runs only at first render to kick out students
    getCurrentUser()
      .then((user) => {
        return getUserInfo(user);
      })
      .then((info) => {
        if (info.role !== "admin") {
          navigate("/home");
        }
      });
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.infoHeader}>
        <div className={styles.infoTitle}>Control Panel</div>
      </div>

      <div className={styles.container}>
        <div className={styles.tokenArea}>
          <div className={styles.tokenTitle}>Private Token</div>
          <div className={styles.generatorArea}>
            <div className={styles.studentGenerator}>
              <TokenGenerator
                label="Generate Student Token"
                role="student"
                prefix="STUDENT"
              />
            </div>

            <div className={styles.instructorGenerator}>
              <TokenGenerator
                label="Generate Instructor Token"
                role="instructor"
                prefix="INSTRUCT"
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.tokenArea}>
          <div className={styles.tokenTitle}>Student Management</div>
          <div className={styles.searchArea}>
            <SearchBar
              usersFunction={getAllStudentsInfo}
              deleteHandler={deleteStudent}
            />
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.tokenArea}>
          <div className={styles.tokenTitle}>Instructor Management</div>
          <div className={styles.searchArea}>
            <SearchBar
              usersFunction={getAllInstructorsInfo}
              deleteHandler={deleteInstructorFromDatabase}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ControlPanel;
