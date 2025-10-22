import { doc, deleteDoc, getDocs, updateDoc, collection, getDoc, query, where } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";
import { db } from "./firebaseConfig";
import { getCurrentUser, getUserInfo } from "./manageUsers";
import { deleteStudentLessonByStudentID } from "./studentLesson";
import { deleteStudentCourseByStudentID } from "./deleteStudentCourse";
import {deleteStudentClassroomByStudentID} from "./studentClassroom";
import { deleteFirebaseAuthUser } from "./deleteFirebaseAuthUser";

export async function deleteStudent(studentID) {

    /*
        Param:
            studentID - the student 'id:' field in the 'users' database. Example "0LFC6foIENRL34Twvy67sLG46zj1"

    */

    try {

        // Step 1: Query for the document of the student
        const studentQuery = query(
            collection(db, "users"),
            where("id", "==", studentID)
        );

        const studentSnapshot = await getDocs(studentQuery);

        if (studentSnapshot.empty) {
            console.log("Student not found");
            return;
        }

        // Step 2: Delete the student document
        const deletions = studentSnapshot.docs.map((d) =>
            {
            console.log(d);
            deleteDoc(doc(db, "users", d.id));
            deleteFirebaseAuthUser(d.data().id)
            }
        );

        await Promise.all(deletions);

        console.log(`✅ Deleted ${studentSnapshot.docs[0].data().firstName} student documents`);

    } catch (error) {
        console.error("Error deleting student:", error);
        throw error;
    }

    // Delete any student_lesson related to the student

    try {

        deleteStudentLessonByStudentID(studentID);
        console.log(`✅ Deleted ${studentID} student_lesson mappings`);

    } catch (error) {

        console.error("Error deleting student from student_lesson:", error);
        throw error;

    }

    // Delete any student_course related to the student

    try {

        deleteStudentCourseByStudentID(studentID);
        console.log(`✅ Deleted ${studentID} student_course mappings`);

    } catch (error) {

        console.error("Error deleting student from student_course:", error);

    }

    // Delete any student_classroom related to the student

    try {

        deleteStudentClassroomByStudentID(studentID);
        console.log(`✅ Deleted ${studentID} student_classroom mappings`);

    } catch (error) {

        console.error("Error deleting student from student_classroom:", error);

    }

}