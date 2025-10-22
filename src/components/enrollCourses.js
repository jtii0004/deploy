import { updateDoc, doc, arrayUnion, arrayRemove, getDoc, getDocs, query, collection, where } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";
import { db } from "./firebaseConfig";
import { getCurrentUser, getUserInfo } from "./manageUsers";
import { deleteStudentCourse } from "./deleteStudentCourse";
import { addStudentCourse } from "./addStudentCourse";
import { addStudentLesson } from "./studentLesson";
import { getListOfLessonsFromStudent } from "./studentLesson";
import { getLessonByIDAndName } from "./getLessons";

async function getValidatedStudentContext(student) {
    const user = await getCurrentUser();
    const userInfo = await getUserInfo(user);

    if (!user || userInfo.role !== "student") {
        throw "Unauthorized access";
    }

    if (!student?.id) {
        throw "Invalid student reference";
    }

    return { docRef: doc(db, "users", student.id) };
}

async function getCourseLessons(courseID) {
    const courseRef = doc(db, "courses", courseID);
    const courseSnap = await getDoc(courseRef);

    if (!courseSnap.exists()) {
        console.warn("Course not found while syncing lessons:", courseID);
        return [];
    }

    const data = courseSnap.data();
    const lessons = Array.isArray(data.courseLessons) ? data.courseLessons.filter(Boolean) : [];
    return lessons;
}

export async function unEnrollCourseInDatabase(student, courseID) {
    /*
        Remove the student_course
    */

    deleteStudentCourse(student.id, courseID);

}

export async function enrollCourseInDatabase(student, courseID) {
  try {

    // Step 1: Add an entry to student_course
    await addStudentCourse(student.id, courseID);

    // Now need to get the list of lessons to be added to student_lesson

    // Step 2: Get the course document by courseID
    const courseRefQuery = query(
      collection(db, "courses"),
      where("courseID", "==", courseID)
    );

    const snapshot = await getDocs(courseRefQuery);

    if (snapshot.empty) {
      console.log(`❌ No course found with ID: ${courseID}`);
      return;
    }

    const courseDoc = snapshot.docs[0].data();
    const lessons = courseDoc.courseLessons || [];

    console.log("📚 Lessons found in course:", lessons);

    // Step 3: Get lessons student is already enrolled in
    const studentLessons = await getListOfLessonsFromStudent(student.id);
    const enrolledLessonIDs = studentLessons.map(lesson => lesson.data().lessonID);

    console.log("✅ Already enrolled lessons:", enrolledLessonIDs);

    // Step 4: For each lesson in the course, add to student_lesson if not already enrolled
    for (const lessonName of lessons) {
        const lessonDoc = await getLessonByIDAndName(lessonName, student);
      
        if (!lessonDoc) {
          console.warn(`⚠️ No lesson found for ${lessonName}`);
          continue;
        }
      
        const lessonID = lessonDoc.data().lessonID;
      
        if (!enrolledLessonIDs.includes(lessonID)) {
          await addStudentLesson(lessonID, student.id);
          console.log(`✅ Added lesson ${lessonID} for student ${student.id}`);
        } else {
          console.log(`⚠️ Skipped duplicate: ${lessonID} already enrolled`);
        }
      }

    console.log(`🎉 Successfully enrolled student ${student.id} into course ${courseID}`);
  } catch (error) {
    console.error("❌ Error enrolling student in course:", error);
    throw error;
  }
}