import { setDoc, doc, addDoc, collection } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";
import { db } from "./firebaseConfig";
import { getCurrentUser, getUserInfo } from "./manageUsers";



export async function addStudentCourse(studentID, courseID) {


    const studentCourseData = {
        student_course_studentId: studentID,
        student_course_courseId: courseID,
        student_course_courseCompletion: 0,
    };

    // Save the course data to Firestore 

    try {

        const docRef = await addDoc(collection(db, "student_course"), studentCourseData);
        console.log("Student_Course entry was successfully added with ID:", docRef.id);

        return docRef.id;

    } catch (error) {

        console.error("Error creating the studentCourse:", error);
        throw new Error("Error creating studentCourse");

    }


}