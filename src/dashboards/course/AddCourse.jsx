import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { addCoursesToDatabase } from "../../components/addCourses";
import { getCurrentUser, getUserInfo } from "../../components/manageUsers";
import { validateCourseLessons } from "../../components/addCourses";
import { getPublishedLessons } from "../../components/getLessons";

import styles from "./AddCourse.module.css";

import InputField from "../../components/typable/InputField";
import TextArea from "../../components/typable/TextArea";
import Button from "../../components/clickable/Button";
import AddFromList from "../../components/selectable_addable/AddFromList";
import SelectOneFromList from "../../components/selectable_addable/SelectOneFromList";
import SelectStatus from "../../components/selectable_addable/SelectStatus";
import InfoBlock from "../../components/display/InfoBlock";
import backIcon from "@images/icons/goback.png";

function AddCourse({ instructorList, prerequisiteOptions }) {
  const [course, setCourse] = useState({
    courseId: "",
    title: "",
    description: "",
    totalCreditPoints: 0,
    supervisor: "",
    status: "",
  });

  const navigate = useNavigate();
  const [isEnabled, setEnabled] = useState(true);
  const [courseLessons, setCourseLessons] = useState([]);
  const [errorMessages, setErrorMessages] = useState([]);
  const [publishedLessons, setPublishedLessons] = useState([]);

  useEffect(() => {
    getCurrentUser()
      .then((user) => getUserInfo(user))
      .then((info) => {
        if (info?.role === "student") {
          navigate("/home");
        }
      });
  }, [navigate]);

  useEffect(() => {
    getCurrentUser()
      .then((user) => getUserInfo(user))
      .then(async (info) => {
        if (info?.role === "student") {
          navigate("/home");
        } else {
          // Fetch published lessons once the user is confirmed
          const lessons = await getPublishedLessons(info);
          setPublishedLessons(lessons);
        }
      });
  }, [navigate]);

  useEffect(() => {
    const totalCreditPoints = courseLessons.reduce((sum, lessonString) => {
      const lessonId = lessonString.split(":")[0].trim();
      const lesson = publishedLessons.find(
        (item) => item.data().lessonID === lessonId
      );
      return lesson ? sum + Number(lesson.data().creditPoint) : sum;
    }, 0);

    setCourse((prev) => ({
      ...prev,
      totalCreditPoints,
    }));
  }, [courseLessons, publishedLessons]);

  async function submitForm() {
    setEnabled(false);

    if (await isValid()) {
      addCoursesToDatabase(
        course.courseId,
        course.title,
        course.description,
        courseLessons,
        course.totalCreditPoints,
        course.supervisor,
        course.status
      )
        .then(() => {
          setErrorMessages(["✅ Successfully created a course!"]);
          navigate("/home/courses");
        })
        .catch((error) => {
          setErrorMessages([error.message || String(error)]);
          setEnabled(true);
        });
    } else {
      setEnabled(true);
    }
  }

  async function isValid() {
    let validation = true;
    // Check for empty course fields
    if (Object.values(course).some((value) => value === "")) {
      validation = false;
      setErrorMessages(["Missing and invalid values! Check the form again."]);
    }

    // Check for missing prerequisites
    const missingDeps = await validateCourseLessons(courseLessons);
    if (Object.keys(missingDeps).length > 0) {
      validation = false;
      setErrorMessages([
        "Missing prerequisites for some lessons: " +
          Object.entries(missingDeps)
            .map(([lesson, deps]) => `${lesson} → [${deps.join(", ")}]`)
            .join("; "),
      ]);
    }

    return validation;
  }

  const handleCourseChange = (e) => {
    const { name, value } = e.target;
    setCourse((prev) => ({ ...prev, [name]: value }));

    if (errorMessages.length > 0) {
      setErrorMessages([]);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.infoHeader}>
        <div className={styles.infoTitle}>Add Course</div>
      </div>

      <div className={styles.infoScroll}>
        <div className={styles.container}>
          <InputField
            label="Course ID"
            type="text"
            id="courseId"
            name="courseId"
            value={course.courseId}
            onChange={handleCourseChange}
            required
            isEnabled={isEnabled}
          />

          <InputField
            label="Title"
            type="text"
            id="title"
            name="title"
            value={course.title}
            onChange={handleCourseChange}
            required
            isEnabled={isEnabled}
          />

          <TextArea
            label="Description"
            type="textarea"
            id="description"
            name="description"
            value={course.description}
            onChange={handleCourseChange}
            isEnabled={isEnabled}
          />

          <AddFromList
            label={"Lessons Included"}
            placeholder={"Please select lessons needed to be included"}
            prerequisites={courseLessons}
            setPrerequisites={setCourseLessons}
            prerequisiteOptions={publishedLessons.map(
              (option) => `${option.data().lessonID}: ${option.data().title}`
            )}
            isEnabled={isEnabled}
          />

          <InfoBlock
            title="Total Credit Point"
            content={course != null ? course.totalCreditPoints : "null"}
          />

          <SelectOneFromList
            name="supervisor"
            label="Supervisor"
            object={course}
            list={[""].concat(
              instructorList.map(
                (instructor) =>
                  `${instructor.title} ${instructor.firstName} ${instructor.lastName}`
              )
            )}
            onChange={handleCourseChange}
            isEnabled={isEnabled}
          />
          <SelectStatus
            name="status"
            label="Status"
            object={course}
            onChange={handleCourseChange}
            isEnabled={isEnabled}
          />
        </div>
      </div>

      <div className={styles.infoFooter}>
        <div className={styles.footerActions}>
          <button
            type="button"
            className={styles.backButton}
            onClick={handleBack}
            isEnabled={isEnabled}
          >
            <img
              src={backIcon}
              alt="Back"
              className={styles.backIcon}
            />
            <span>Back</span>
          </button>
          <Button onClick={submitForm} label="Add" isEnabled={isEnabled}/>
        </div>

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

export default AddCourse;
