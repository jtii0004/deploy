import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import { getCurrentUser, getUserInfo } from "../../components/manageUsers";
import { updateLessonInDatabase } from "../../components/updateLessons";
import { canChangeLessonStatus } from "../../components/getLessons";

import styles from "./EditLesson.module.css";

import InputField from "../../components/typable/InputField";
import TextArea from "../../components/typable/TextArea";
import AddToList from "../../components/selectable_addable/AddToList";
import AddFromList from "../../components/selectable_addable/AddFromList";
import SelectOneFromList from "../../components/selectable_addable/SelectOneFromList";
import SelectStatus from "../../components/selectable_addable/SelectStatus";

function EditLesson({ instructorList, prerequisiteOptions }) {
  const { id } = useParams();
  prerequisiteOptions = prerequisiteOptions.filter((unit) => unit.id != id);
  const location = useLocation();
  const lessonData = location.state.lesson;

  const [lesson, setLesson] = useState({
    lessonId: lessonData?.lessonID || "",
    title: lessonData?.title || "",
    description: lessonData?.description || "",
    creditPoints: lessonData?.creditPoint || 0,
    instructor: lessonData?.owner || "",
    status: lessonData?.status || "",
  });

  const [isEnabled, setEnabled] = useState(true);
  const [readingList, setReadingList] = useState(lessonData?.readingList || []);
  const [objectives, setObjectives] = useState(lessonData?.objectives || []);
  const [assignmentList, setAssignmentList] = useState(
    lessonData?.assignments || []
  );
  const [prerequisites, setPrerequisites] = useState(
    lessonData?.prerequisites || []
  );

  let navigate = useNavigate();
  const [currentBook, setCurrentBook] = useState("");
  const [currentObjectives, setCurrentObjectives] = useState("");
  const [currentAssignment, setCurrentAssignment] = useState("");
  const [errorMessages, setErrorMessages] = useState([]);

  const handleCancel = () => {
    navigate(`/home/lessons/${id}`);
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

  async function submitForm(e) {
    e.preventDefault();
    setEnabled(false);

    if (!isValid()) {
      setErrorMessages(["Missing and invalid values! Check the form again."]);
      setEnabled(true);
      return;
    }

    try {
      const originalStatus = lessonData.status;
      const newStatus = lesson.status;
      if (originalStatus === "Published" && newStatus !== "Published") {
        const lessonIdentifier = `${lesson.lessonId}: ${lesson.title}`;
        const check = await canChangeLessonStatus(lessonIdentifier);
        console.log("Lesson cannot be changed to status:", check.canChange);
        if (!check.canChange) {
          setErrorMessages([check.reason]);
          setEnabled(true);
          setLesson((prev) => ({ ...prev, status: "Published" }));
          return;
        }
      }

      const updates = {
        title: lesson.title,
        description: lesson.description,
        objectives,
        readingList,
        prerequisites,
        assignments: assignmentList,
        creditPoint: lesson.creditPoints,
        owner: lesson.instructor,
        status: lesson.status,
      };

      await updateLessonInDatabase(id, updates);
      setErrorMessages(["Successfully updated a lesson!"]);
      navigate(`/home/lessons/${id}`);
    } catch (error) {
      console.error("Failed to update lesson:", error);
      setErrorMessages(["An error occurred while saving the lesson."]);
    } finally {
      setEnabled(true);
    }
  }

  function isValid() {
    for (const [key, value] of Object.entries(lesson)) {
      if (value == "") {
        return false;
      }
    }

    return true;
  }

  const handleLessonChange = (e) => {
    const { name, value } = e.target;
    setLesson((prev) => ({ ...prev, [name]: value }));

    if (errorMessages.length > 0) {
      setErrorMessages([]);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.infoHeader}>
        <div className={styles.infoTitle}>Edit Lesson</div>
      </div>

      <div className={styles.infoScroll}>
        <div className={styles.container}>
          <InputField
            label="Lesson ID"
            type="text"
            id="lessonId"
            name="lessonId"
            value={lesson.lessonId}
            onChange={handleLessonChange}
            required
            isEnabled={isEnabled}
          />

          <InputField
            label="Title"
            type="text"
            id="title"
            name="title"
            value={lesson.title}
            onChange={handleLessonChange}
            required
            isEnabled={isEnabled}
          />

          <TextArea
            label="Description"
            type="textarea"
            id="description"
            name="description"
            value={lesson.description}
            onChange={handleLessonChange}
            isEnabled={isEnabled}
          />

          <AddToList
            label="Lesson Objectives"
            placeholder="Enter objective"
            currentItem={currentObjectives}
            setCurrentItem={setCurrentObjectives}
            itemList={objectives}
            setItemList={setObjectives}
            isEnabled={isEnabled}
          />

          <AddToList
            label="Reading List"
            placeholder="Enter book name"
            currentItem={currentBook}
            setCurrentItem={setCurrentBook}
            itemList={readingList}
            setItemList={setReadingList}
            isEnabled={isEnabled}
          />

          <AddToList
            label="Assignment"
            placeholder="Enter assignment"
            currentItem={currentAssignment}
            setCurrentItem={setCurrentAssignment}
            itemList={assignmentList}
            setItemList={setAssignmentList}
            multiline
            isEnabled={isEnabled}
          />

          <AddFromList
            label={"Prerequisite Lessons"}
            placeholder={"Please select prerequisite lessons"}
            prerequisites={prerequisites}
            setPrerequisites={setPrerequisites}
            prerequisiteOptions={prerequisiteOptions.map(
              (option) => `${option.data().lessonID}: ${option.data().title}`
            )}
            isEnabled={isEnabled}
          />

          <InputField
            label="Credit Points"
            type="number"
            id="creditPoints"
            name="creditPoints"
            value={lesson.creditPoints}
            onChange={handleLessonChange}
            min="0"
            required
            isEnabled={isEnabled}
          />

          <SelectOneFromList
            name="instructor"
            label="Instructor"
            object={lesson}
            list={[""].concat(
              instructorList.map(
                (instructor) =>
                  `${instructor.title} ${instructor.firstName} ${instructor.lastName}`
              )
            )}
            onChange={handleLessonChange}
            isEnabled={isEnabled}
          />
          <SelectStatus
            name="status"
            label="Status"
            object={lesson}
            onChange={handleLessonChange}
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

export default EditLesson;
