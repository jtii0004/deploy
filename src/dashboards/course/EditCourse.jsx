import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import { getCurrentUser, getUserInfo } from "../../components/manageUsers";
import { updateCourseInDatabase } from "../../components/updateCourses";
import { getPublishedLessons } from "../../components/getLessons";

import styles from "./EditCourse.module.css";

import InputField from "../../components/typable/InputField";
import TextArea from "../../components/typable/TextArea";
import AddFromList from "../../components/selectable_addable/AddFromList";
import SelectOneFromList from "../../components/selectable_addable/SelectOneFromList";
import SelectStatus from "../../components/selectable_addable/SelectStatus";

function EditCourse({ instructorList, prerequisiteOptions }) {
  const { id } = useParams();
  const location = useLocation();
  const courseData = location.state.course;

  const [course, setCourse] = useState({
    courseID: courseData?.courseID || "",
    courseTitle: courseData?.courseTitle || "",
    courseDescription: courseData?.courseDescription || "",
    courseTotalCreditpoint: courseData?.courseTotalCreditpoint || 0,
    courseSupervisor: courseData?.courseSupervisor || "",
    courseStatus: courseData?.courseStatus || "",
  });

  const [isEnabled, setEnabled] = useState(true);

  const [courseLessons, setCourseLessons] = useState(
    courseData?.courseLessons || []
  );

  let navigate = useNavigate();

  const [publishedLessons, setPublishedLessons] = useState([]);

  const [errorMessages, setErrorMessages] = useState([]);

  const handleCancel = () => {
    navigate(`/home/courses/${id}`);
  };

  useEffect(() => {
    //Runs only at first render to kick out students
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
    // Only calculate if published lessons are loaded
    if (publishedLessons.length === 0) return;

    const totalCreditPoints = courseLessons.reduce((sum, lessonString) => {
      const lessonid = lessonString.split(":")[0].trim();
      const lesson = publishedLessons.find(
        (lesson) => lesson.data().lessonID == lessonid
      );
      return lesson ? sum + Number(lesson.data().creditPoint || 0) : sum;
    }, 0);

    setCourse((prev) => ({
      ...prev,
      courseTotalCreditpoint: totalCreditPoints,
    }));
  }, [courseLessons, publishedLessons]);

  function submitForm(e) {
    setEnabled(false);
    if (isValid()) {
      const updates = {
        courseID: course.courseID,
        courseTitle: course.courseTitle,
        courseDescription: course.courseDescription,
        courseTotalCreditpoint: course.courseTotalCreditpoint,
        courseSupervisor: course.courseSupervisor,
        courseStatus: course.courseStatus,
        courseLessons: courseLessons,
      };

      console.log(updates);
      updateCourseInDatabase(id, updates)
        .then(() => {
          setErrorMessages(["Successfully updated a course!"]);
          navigate(`/home/courses/${id}`);
        })
        .catch((error) => setErrorMessages([error]));
    } else {
      setErrorMessages(["Missing and invalid values! Check the form again."]);
      setEnabled(true);
    }
  }

  function isValid() {
    for (const [key, value] of Object.entries(course)) {
      if (value == "") {
        return false;
      }
    }

    return true;
  }

  const handleCourseChange = (e) => {
    const { name, value } = e.target;
    setCourse((prev) => ({ ...prev, [name]: value }));

    if (errorMessages.length > 0) {
      setErrorMessages([]);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.infoHeader}>
        <div className={styles.infoTitle}>Edit Course</div>
      </div>

      <div className={styles.infoScroll}>
        <div className={styles.container}>
          <InputField
            label="Course ID"
            type="text"
            id="courseID"
            name="courseID"
            value={course.courseID}
            onChange={handleCourseChange}
            required
            isEnabled={isEnabled}
          />

          <InputField
            label="Title"
            type="text"
            id="courseTitle"
            name="courseTitle"
            value={course.courseTitle}
            onChange={handleCourseChange}
            required
            isEnabled={isEnabled}
          />

          <TextArea
            label="Description"
            type="textarea"
            id="courseDescription"
            name="courseDescription"
            value={course.courseDescription}
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
          <p
            className={styles.justTitle}
          >{`Total credit points: ${course.courseTotalCreditpoint}`}</p>
          <br />

          <SelectOneFromList
            name="courseSupervisor"
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
            name="courseStatus"
            label="Status"
            object={course}
            onChange={handleCourseChange}
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

export default EditCourse;
