import { collection, query, where, getDocs, deleteDoc, doc , getDoc} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";
import { db } from "./firebaseConfig.js";


export async function deleteStudentCourse(studentID, courseID) {
  /*
      param: 
          studentID = The "id" field of the user 
          courseID = The "courseID" field of the document. Example "BOSE"
  */
  try {
    // Step 1: Query for the document(s)
    const scQuery = query(
      collection(db, "student_course"),
      where("student_course_studentId", "==", studentID),
      where("student_course_courseId", "==", courseID)
    );

    const scSnapshot = await getDocs(scQuery);

    if (scSnapshot.empty) {
      console.warn("No matching student_course found to delete.");
      return false;
    }

    // Step 2: Delete each matching doc
    const deletions = scSnapshot.docs.map((d) =>
      deleteDoc(doc(db, "student_course", d.id))
    );

    await Promise.all(deletions);

    console.log("✅ Successfully deleted student_course mapping.");
    return true;

  } catch (error) {
    console.error("Error deleting student_course:", error);
    throw error;
  }
}

export async function deleteStudentCourseByCourseID(courseID) {

  /* param
    courseID - the course 'courseID:' field in the 'courses' database. Example "BOSE"
  */

  try {
    // Search for the course 

    const scQuery = query(
      collection(db, "student_course"),
      where("student_course_courseId", "==", courseID)
    );

    const studentCourseSnapshot = await getDocs(scQuery);

    if (studentCourseSnapshot.empty) {
      console.warn("No matching course found to delete.");
      return false;
    }

    const deletions = studentCourseSnapshot.docs.map((d) =>
      deleteDoc(doc(db, "student_course", d.id))
    );

    await Promise.all(deletions);

    console.log("✅ Successfully deleted student_course mapping.");
    return true;



  } catch (error) {
    console.error("Error deleting student_course:", error);
    throw error;
  }

}

export async function deleteStudentCourseByStudentID(studentID) {

  /* param
    studentID - the student 'id:' field in the 'users' database. Example "0LFC6foIENRL34Twvy67sLG46zj1"
  */

  try {
    // Search for the lesson_classroom 

    const scQuery = query(
      collection(db, "student_course"),
      where("student_course_studentId", "==", studentID)
    );

    const studentCourseSnapshot = await getDocs(scQuery);

    if (studentCourseSnapshot.empty) {
      console.warn("No matching student_course found to delete.");
      return false;
    }

    const deletions = studentCourseSnapshot.docs.map((d) =>
      deleteDoc(doc(db, "student_course", d.id))
    );

    await Promise.all(deletions);

    console.log("✅ Successfully deleted student_course mapping.");
    return true;

  } catch (error) {
    console.error("Error deleting student_course:", error);
    throw error;
  }
}