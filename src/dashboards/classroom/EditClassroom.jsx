import React, { useState, useEffect } from "react";
import { useMemo } from "react";

import { useNavigate, useParams, useLocation } from "react-router-dom";

import {
  getListOfCoursesFromStudent,
  getListOfStudentsFromCourse,
} from "../../components/getStudentCourse";
import { getCurrentUser, getUserInfo } from "../../components/manageUsers";
import { updateClassroomInDatabase } from "../../components/updateClassrooms";
import { addStudentClassroom } from "../../components/studentClassroom";
import { getCourses } from "../../components/getCourses";
import { getLessonsbyCourseID } from "../../components/getLessons";

import styles from "./EditClassroom.module.css";

import InputField from "../../components/typable/InputField";
import TextArea from "../../components/typable/TextArea";
import AddFromList from "../../components/selectable_addable/AddFromList";
import SelectOneFromList from "../../components/selectable_addable/SelectOneFromList";
import SelectStatus from "../../components/selectable_addable/SelectStatus";
import Button from "../../components/clickable/Button";

function EditClassroom({
  userData,
  studentList,
  instructorList,
  currentUnits,
}) {
  let navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const classroomData = location.state.classroom;
  const [isEnabled, setEnabled] = useState(true);
  const [errorMessages, setErrorMessages] = useState([]);
  const [classroom, setClassroom] = useState({
    classroom_id: classroomData?.classroom_id || "",
    classroom_name: classroomData?.classroom_name || "",
    classroom_description: classroomData?.classroom_description || "",
    classroom_course: classroomData?.classroom_course || "",
    classroom_instructor: classroomData?.classroom_instructor || "",
    classroom_status: classroomData?.classroom_status || "",
    classroom_startDate: classroomData?.classroom_startDate || "",
    classroom_durationWeeks: classroomData?.classroom_durationWeeks || 6,
    classroom_endDate: classroomData?.classroom_endDate || "",
  });
  const [showEditConfirm, setShowEditConfirm] = useState(false);

  useEffect(() => {
    console.log(
      "useEffect triggered with:",
      classroomData?.classroom_course,
      userData
    );

    getLessonsbyCourseID(classroomData?.classroom_course, userData)
      .then((courseLessons) => {
        setLessons(courseLessons || []);
        console.log("Fetched lessons:", courseLessons);
      })
      .catch((err) => {
        console.error("Failed to load lessons for course:", err);
      });

    getListOfStudentsFromCourse(classroomData?.classroom_course).then(
      (students) => {
        setValidStudentOptions(students);
      }
    );
  }, [classroom, userData]);

  const [filter, setFilter] = useState(true);
  const instructorDisplayName = useMemo(() => {
    if (!userData || userData.role === "student") {
      return "";
    }

    const parts = [
      userData.title,
      userData.firstName,
      userData.lastName,
    ].filter(Boolean);
    return parts.join(" ").replace(/\s+/g, " ").trim();
  }, [userData]);

  const [lessons, setLessons] = useState([]);
  const [validStudentOptions, setValidStudentOptions] = useState([]);

  const [classroomLessons, setClassroomLessons] = useState(
    classroomData?.classroom_lessons || []
  );
  const [classroomStudents, setClassroomStudents] = useState(
    classroomData?.classroom_students || []
  );

  useEffect(() => {
    //Runs only at first render to kick out classroom_students
    getCurrentUser()
      .then((user) => {
        return getUserInfo(user);
      })
      .then((info) => {
        if (info.role == "student") {
          navigate("/home");
        }
      });
  }, []);

  useEffect(() => {
    if (classroom.classroom_startDate && classroom.classroom_durationWeeks) {
      const start = new Date(classroom.classroom_startDate);
      const durationWeeks = Number(classroom.classroom_durationWeeks);

      const end = new Date(start);
      end.setDate(start.getDate() + durationWeeks * 7);
      
      setClassroom((prev) => ({ ...prev, classroom_endDate: end.toISOString() }));
    }
  }, [classroom.classroom_startDate, classroom.classroom_durationWeeks]);

  // Some Functions
  const handleSubmit = (formData) => {
    setEnabled(false);
    console.log("Submitting form with data:", formData);
  };

  const handleCancel = () => {
    navigate(`/home/classrooms/${id}`);
  };

  function isValid() {
    for (const [key, value] of Object.entries(classroom)) {
      if (value == "") {
        return false;
      }
    }

    return true;
  }

  function extractIdentifier(value) {
    if (!value) {
      return "";
    }

    if (!value.includes(":")) {
      return value.trim();
    }

    const [identifier] = value.split(":");
    return identifier.trim();
  }

  function submitForm(e) {
    setEnabled(false);
    if (isValid()) {
      const updates = {
        classroom_id: classroom.classroom_id,
        classroom_name: classroom.classroom_name,
        classroom_description: classroom.classroom_description,
        classroom_course: classroom.classroom_course,
        classroom_instructor: classroom.classroom_instructor,
        classroom_status: classroom.classroom_status,
        classroom_startDate: new Date(classroom.classroom_startDate).toISOString(),
        classroom_durationWeeks: classroom.classroom_durationWeeks,
        classroom_lessons: classroomLessons,
        classroom_students: classroomStudents,
        classroom_endDate: classroom.classroom_endDate,
      };

      console.log(updates);
      updateClassroomInDatabase(id, updates)
        .then(() => {
          setErrorMessages(["Successfully updated a course!"]);
        })
        .then(async () => {
          const classroomID = classroom.classroom_id;

          const oldStudents = classroomData?.classroom_students || [];
          const newStudents = classroomStudents;

          const addedStudents = newStudents.filter(
            (s) => !oldStudents.includes(s)
          );

          for (const student of addedStudents) {
            const studentID = extractIdentifier(student);
            await addStudentClassroom(classroomID, studentID);
          }
        })
        .then(() => navigate(`/home/classrooms/${id}`))
        .catch((error) => setErrorMessages([error.message] || String(error)));
    } else {
      setErrorMessages(["Missing and invalid values! Check the form again."]);
      setEnabled(true);
    }
  }

  const handleClassroomChange = (e) => {
    const { name, value } = e.target;
    setClassroom((prev) => ({ ...prev, [name]: value }));

    if (errorMessages.length > 0) {
      setErrorMessages([]);
    }
  };

  const classroomStudentOptions = useMemo(() => {
    return validStudentOptions
      .map((option) => {
        if (typeof option === "string") {
          return option;
        }

        if (typeof option === "object" && option !== null) {
          if (typeof option.data === "function") {
            const data = option.data();
            const id = data.id || option.id || "";
            const name = [data.firstName, data.lastName]
              .filter(Boolean)
              .join(" ")
              .trim();
            return [id, name].filter(Boolean).join(": ").trim();
          }

          const id = option.id || option.id || "";
          const name = [option.firstName, option.lastName]
            .filter(Boolean)
            .join(" ")
            .trim();
          return [id, name].filter(Boolean).join(": ").trim();
        }

        return "";
      })
      .filter(Boolean);
  }, [validStudentOptions]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.infoHeader}>
        <div className={styles.infoTitle}>Edit Classroom</div>
      </div>

      <div className={styles.infoScroll}>
        <div className={styles.container}>
          <InputField
            label="Classroom ID"
            id="classroom_id"
            name="classroom_id"
            value={classroom.classroom_id}
            onChange={handleClassroomChange}
            isEnabled={isEnabled}
          />

          <InputField
            label="Classroom Name"
            id="classroom_name"
            name="classroom_name"
            value={classroom.classroom_name}
            onChange={handleClassroomChange}
            isEnabled={isEnabled}
          />

          <TextArea
            label="Classroom Description"
            type="textarea"
            id="classroom_description"
            name="classroom_description"
            value={classroom.classroom_description}
            onChange={handleClassroomChange}
            isEnabled={isEnabled}
          />

          <SelectOneFromList
            label="Supervisor"
            name="classroom_instructor"
            object={classroom}
            list={instructorList.map(
              (instructor) =>
                `${instructor.title} ${instructor.firstName} ${instructor.lastName}`
            )}
            onChange={handleClassroomChange}
            isEnabled={isEnabled}
          />

          <InputField
            label="Start Date"
            id="classroom_startDate"
            name="classroom_startDate"
            type="date"
            value={classroom.classroom_startDate}
            onChange={handleClassroomChange}
            isEnabled={isEnabled}
          />

          <InputField
            label="Duration (weeks)"
            id="classroom_durationWeeks"
            name="classroom_durationWeeks"
            type="number"
            value={classroom.classroom_durationWeeks}
            onChange={handleClassroomChange}
            min={1}
            isEnabled={isEnabled}
          />

          <p className={styles.justTitle}>
            Classroom End Date: {classroom.classroom_endDate.split("T")[0] || "N/A"}
          </p>

          <AddFromList
            label="Add Lesson"
            placeholder="Select lesson to include"
            prerequisites={classroomLessons}
            setPrerequisites={setClassroomLessons}
            prerequisiteOptions={lessons.map(
              (lesson) => `${lesson.data().lessonID}: ${lesson.data().title}`
            )}
            isEnabled={isEnabled}
          />

          <AddFromList
            label="Add Student"
            placeholder="Assign students to lesson"
            prerequisites={classroomStudents}
            setPrerequisites={setClassroomStudents}
            prerequisiteOptions={classroomStudentOptions}
            isEnabled={isEnabled}
          />

          <SelectStatus
            name="classroom_status"
            label="Status"
            object={classroom}
            onChange={handleClassroomChange}
            isEnabled={isEnabled}
          />
        </div>
      </div>
      <div className={styles.infoFooter}>
        <button
          onClick={handleCancel}
          className={styles.smallButton}
          style={{ background: "#beb2a4", marginLeft: "auto" }}
          isEnabled={isEnabled}
        >
          Cancel
        </button>
        <button onClick={submitForm} className={styles.smallButton} isEnabled={isEnabled}>
          Save Change
        </button>
        {errorMessages.length > 0 && (
          <div>
            {errorMessages.map((msg, idx) => (
              <p key={idx} style={{ color: "red" }}>
                {msg}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EditClassroom;
