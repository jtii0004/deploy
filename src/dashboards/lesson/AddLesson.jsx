import React, { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { addLessonToDatabase } from "../../components/addLessons";
import { getCurrentUser, getUserInfo } from "../../components/manageUsers";

import styles from "./AddLesson.module.css";

import InputField from "../../components/typable/InputField";
import TextArea from "../../components/typable/TextArea";
import Button from "../../components/clickable/Button";
import AddToList from "../../components/selectable_addable/AddToList";
import AddFromList from "../../components/selectable_addable/AddFromList";
import SelectOneFromList from "../../components/selectable_addable/SelectOneFromList";
import SelectStatus from "../../components/selectable_addable/SelectStatus";
import backIcon from "@images/icons/goback.png";

function AddLesson({ instructorList, prerequisiteOptions }) {
    const [lesson, setLesson] = useState({
        lessonId: "",
        title: "",
        description: "",
        creditPoints: 0,
        instructor: "",
        status: ""
    });

    const navigate = useNavigate();
    const [isEnabled, setEnabled] = useState(true);

    const [readingList, setReadingList] = useState([]);
    const [currentBook, setCurrentBook] = useState("");

    const [objectives, setObjectives] = useState([]);
    const [currentObjectives, setCurrentObjectives] = useState("");

    const [assignmentList, setAssignmentList] = useState([]);
    const [currentAssignment, setCurrentAssignment] = useState("");

    const [prerequisites, setPrerequisites] = useState([]);
    const [errorMessages, setErrorMessages] = useState([]);

    useEffect(() => {
        getCurrentUser()
            .then((user) => getUserInfo(user))
            .then((info) => {
                if (info?.role === "student") {
                    navigate("/home");
                }
            });
    }, [navigate]);

    function submitForm() {
        setEnabled(false);
        if (isValid()) {
            addLessonToDatabase(
                lesson.lessonId,
                lesson.title,
                lesson.description,
                objectives,
                readingList,
                prerequisites,
                assignmentList,
                lesson.creditPoints,
                lesson.instructor,
                lesson.status
            )
                .then(() => setErrorMessages(["Successfully created a lesson!"]))
                .catch((error) => setErrorMessages([error]));
            navigate("/home/lessons");
        } else {
            setEnabled(true);
            setErrorMessages(["Missing and invalid values! Check the form again."]);
        }
    }

    function isValid() {
        return Object.values(lesson).every((value) => value !== "");
    }

    const handleLessonChange = (e) => {
        const { name, value } = e.target;
        setLesson((prev) => ({ ...prev, [name]: value }));

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
                <div className={styles.infoTitle}>Add Lesson</div>
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
                        min={1}
                        required
                        isEnabled={isEnabled}
                    />

                    <SelectOneFromList
                        name="instructor"
                        label="Instructor"
                        object={lesson}
                        list={[""].concat(
                            instructorList.map(
                                (instructor) => `${instructor.title} ${instructor.firstName} ${instructor.lastName}`
                            )
                        )}
                        onChange={handleLessonChange}
                        isEnabled={isEnabled}
                    />
                    <SelectStatus name="status" label="Status" object={lesson} onChange={handleLessonChange} isEnabled={isEnabled}/>
                </div>
            </div>

            <div className={styles.infoFooter}>
                <div className={styles.footerActions}>
                    <button type="button" className={styles.backButton} onClick={handleBack} isEnabled={isEnabled}>
                        <img src={backIcon} alt="Back" className={styles.backIcon} />
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

export default AddLesson;
