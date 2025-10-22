import { collection, query, where, getDocs, deleteDoc, doc, documentId, addDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";
import { db } from "./firebaseConfig.js";
import { getListOfClassroomsFromStudent } from "./studentClassroom.js";
import { getClassroom, getClassroomByStudent } from "./getClassroom.js";

export async function addStudentLesson(lessonID, studentID) {

  /* param
      lessonID - the lesson 'lessonID:' field in the 'lessons' database. Example "FIT1045"
      studentID - the student 'id:' field in the 'users' database. Example "0LFC6foIENRL34Twvy67sLG46zj1"
  */

  const studentLessonData = {
    student_lesson_lessonID: lessonID,
    student_lesson_studentID: studentID,
    student_lesson_completion: "unchecked",
    student_lesson_passFail: "unchecked",
  };

  // Save the course data to Firestore

  try {

    const docRef = await addDoc(collection(db, "student_lesson"), studentLessonData);
    console.log("student_lesson entry was successfully added with ID:", docRef.id);

    return docRef.id;

  } catch (error) {

    console.error("Error creating the studentLesson:", error);
    throw new Error("Error creating studentLesson");

  }

}

export async function getStudentLesson(studentID, lessonID) {

  /* param
    studentID - the student 'id:' field in the 'users' database. Example "0LFC6foIENRL34Twvy67sLG46zj1"
  */

  try {
    // Step 1: get student_lesson docs for this student
    const studentLessonQuery = query(
      collection(db, "student_lesson"),
      where("student_lesson_studentID", "==", studentID),
      where("student_lesson_lessonID", "==", lessonID)
    );

    const studentLessonSnapshot = await getDocs(studentLessonQuery);

    return studentLessonSnapshot.docs;
  } 
  catch (error) {
    console.error("Error fetching studentLesson:", error);
    throw error;
  }
}

/*

**************** UPDATE FUNCTIONS ****************
Data Structure
const studentLessonData = {

        student_lesson_lessonID: lessonID,
        student_lesson_studentID: studentID,
        student_lesson_completion: completion,
        student_lesson_passFail: passFail,
    };

*/

export async function updateStudentLessonCompletion(studentID, lessonID, completion) {

  /* param
      studentID - the student 'id:' field in the 'users' database. Example "0LFC6foIENRL34Twvy67sLG46zj1"
      lessonID - the lesson 'lessonID:' field in the 'lessons' database. Example "FIT1045"
      completion - the completion status of the lesson. Example "completed"
  */

  const studentLessonQuery = query(
    collection(db, "student_lesson"),
    where("student_lesson_studentID", "==", studentID),
    where("student_lesson_lessonID", "==", lessonID)
  );

  const studentLessonSnapshot = await getDocs(studentLessonQuery);
  console.log(studentLessonSnapshot.docs);

  if (studentLessonSnapshot.docs.length <= 0) {
    console.log("No matching student_lesson found to update.");
    return false;
  }

  // Step 2: Update the student_lesson document
  const updates = studentLessonSnapshot.docs.map((d) => {
    updateDoc(doc(db, "student_lesson", d.id), {
      student_lesson_completion: completion,
    })
  }
  );

  await Promise.all(updates);

  console.log("✅ Successfully updated student_lesson completion.");
  return true;

}

export async function updateStudentLessonPassFail(studentID, lessonID, passFail) {

  /* param
      studentID - the student 'id:' field in the 'users' database. Example "0LFC6foIENRL34Twvy67sLG46zj1"
      lessonID - the lesson 'lessonID:' field in the 'lessons' database. Example "FIT1045"
      passFail - the passFail status of the lesson. Example "pass"
  */

  const studentLessonQuery = query(
    collection(db, "student_lesson"),
    where("student_lesson_studentID", "==", studentID),
    where("student_lesson_lessonID", "==", lessonID)
  );

  const studentLessonSnapshot = await getDocs(studentLessonQuery);

  if (studentLessonSnapshot.docs.length <= 0) {
    console.log("No matching student_lesson found to update.");
    return false;
  }

  // Step 2: Update the student_lesson document
  const updates = studentLessonSnapshot.docs.map((d) => {
    updateDoc(doc(db, "student_lesson", d.id), {
      student_lesson_passFail: passFail,
    })
  }
  );

  await Promise.all(updates);

  console.log("✅ Successfully updated student_lesson passFail.");
  return true;

}

export async function updateStudentLessonEndDate(studentID, lessonID, endDate) {

  /* param
      studentID - the student 'id:' field in the 'users' database. Example "0LFC6foIENRL34Twvy67sLG46zj1"
      lessonID - the lesson 'lessonID:' field in the 'lessons' database. Example "FIT1045"
      passFail - the passFail status of the lesson. Example "pass"
  */

  const studentLessonQuery = query(
    collection(db, "student_lesson"),
    where("student_lesson_studentID", "==", studentID),
    where("student_lesson_lessonID", "==", lessonID)
  );

  const studentLessonSnapshot = await getDocs(studentLessonQuery);

  if (studentLessonSnapshot.docs.length <= 0) {
    console.log("No matching student_lesson found to update.");
    return false;
  }

  // Step 2: Update the student_lesson document
  const updates = studentLessonSnapshot.docs.map((d) => {
    updateDoc(doc(db, "student_lesson", d.id), {
      student_lesson_endDate: endDate.toISOString(),
    })
  }
  );

  await Promise.all(updates);

  console.log("✅ Successfully updated student_lesson passFail.");
  return true;

}

/*

**************** GETTER FUNCTIONS ****************
Data Structure
const studentLessonData = {

        student_lesson_lessonID: lessonID,
        student_lesson_studentID: studentID,
        student_lesson_completion: completion,
        student_lesson_passFail: passFail,
    };

*/

export async function getListOfLessonsFromStudent(studentID) {

  /* param
    studentID - the student 'id:' field in the 'users' database. Example "0LFC6foIENRL34Twvy67sLG46zj1"
  */

  try {
    // Step 1: get student_lesson docs for this student
    const scQuery = query(
      collection(db, "student_lesson"),
      where("student_lesson_studentID", "==", studentID)
    );
    const scSnapshot = await getDocs(scQuery);

    // Step 2: extract all the lesson document IDs
    const lessonIds = scSnapshot.docs.map(doc => doc.data().student_lesson_lessonID);

    if (lessonIds.length === 0) {
      return []; // no lessons
    }

    // Step 3: query lessons by document ID (batch if > 10)
    const chunks = [];
    for (let i = 0; i < lessonIds.length; i += 10) {
      const batch = lessonIds.slice(i, i + 10);
      const lessonQuery = query(
        collection(db, "lessons"),
        where("lessonID", "in", batch) // query by Firestore doc IDs
      );
      chunks.push(getDocs(lessonQuery));
    }

    // Step 4: combine results into raw snapshots
    const results = await Promise.all(chunks);
    const lessons = results.flatMap(snapshot => snapshot.docs);

    return lessons; // array of DocumentSnapshots (need .data() later)
  } catch (error) {
    console.error("Error fetching lessons for student:", error);
    throw error;
  }
}

export async function getListOfStudentsFromCourse(lessonID) {

  /* param
    lessonID - the lesson 'lessonID:' field in the 'lessons' database. Example "FIT1045"
  */

  try {
    // Step 1: get student_lesson docs for this lesson
    const scQuery = query(
      collection(db, "student_lesson"),
      where("student_lesson_lessonID", "==", lessonID)
    );
    const scSnapshot = await getDocs(scQuery);

    // Step 2: extract all student ID
    const studentIDs = scSnapshot.docs.map(doc => doc.data().student_lesson_studentID);

    if (studentIDs.length === 0) {
      return []; // no courses
    }

    // Step 3: query student by studentID (batch if > 10)
    const chunks = [];
    for (let i = 0; i < studentIDs.length; i += 10) {
      const batch = studentIDs.slice(i, i + 10);
      const studentQuery = query(
        collection(db, "users"),
        where("id", "in", batch)
      );
      chunks.push(getDocs(studentQuery));
    }

    // Step 4: combine results
    const results = await Promise.all(chunks);
    const students = results.flatMap(snapshot =>
      snapshot.docs
    );

    return students; // array of student documents

  } catch (error) {
    console.error("Error fetching students from courses:", error);
    throw error;
  }
}



/*

**************** DELETE FUNCTIONS ****************

Data Structure
const studentLessonData = {

        student_lesson_lessonID: lessonID,
        student_lesson_studentID: studentID,
        student_lesson_completion: completion,
        student_lesson_passFail: passFail,
    };


*/

export async function deleteStudentLesson(studentID, lessonID) {

  /* param
      studentID - the student 'id:' field in the 'users' database. Example "0LFC6foIENRL34Twvy67sLG46zj1"
      lessonID - the lesson 'lessonID:' field in the 'lessons' database. Example "FIT1045"
  */

  try {
    // Step 1: Query for the document(s)
    const scQuery = query(
      collection(db, "student_lesson"),
      where("student_lesson_studentID", "==", studentID),
      where("student_lesson_lessonID", "==", lessonID)
    );

    const scSnapshot = await getDocs(scQuery);

    if (scSnapshot.empty) {
      console.warn("No matching student_lesson found to delete.");
      return false;
    }

    // Step 2: Delete each matching doc
    const deletions = scSnapshot.docs.map((d) =>
      deleteDoc(doc(db, "student_lesson", d.id))
    );

    await Promise.all(deletions);

    console.log("✅ Successfully deleted student_course mapping.");
    return true;

  } catch (error) {
    console.error("Error deleting student_course:", error);
    throw error;
  }
}

export async function deleteStudentLessonByLessonID(lessonID) {

  /* param
    lessonID - the lesson 'lessonID:' field in the 'lessons' database. Example "FIT1045"
  */

  try {
    // Search for the lesson_classroom

    const scQuery = query(
      collection(db, "student_lesson"),
      where("student_lesson_lessonID", "==", lessonID)
    );

    const studentLessonSnapshot = await getDocs(scQuery);

    if (!studentLessonSnapshot.empty) {
      const deletions = studentLessonSnapshot.docs.map((d) =>
        deleteDoc(doc(db, "student_lesson", d.id))
      );
      await Promise.all(deletions);
      console.log(`✅ Deleted ${studentLessonSnapshot.size} student_lesson mappings for lesson ${lessonID}`);
    }

    console.log(`Removed lesson ${lessonID} from students, classrooms, and student lessons`);
  } catch (error) {
    console.error("Error deleting student_lesson:", error);
    throw error;
  }
}

export async function deleteStudentLessonByStudentID(studentID) {

  /* param
    studentID - the student 'id:' field in the 'users' database. Example "0LFC6foIENRL34Twvy67sLG46zj1"
  */

  try {
    // Search for the lesson_classroom

    const scQuery = query(
      collection(db, "student_lesson"),
      where("student_lesson_studentID", "==", studentID)
    );

    const studentLessonSnapshot = await getDocs(scQuery);

    if (!studentLessonSnapshot.empty) {
      const deletions = studentLessonSnapshot.docs.map((d) =>
        deleteDoc(doc(db, "student_lesson", d.id))
      );
      await Promise.all(deletions);
      console.log(`✅ Deleted ${studentLessonSnapshot.size} student_lesson mappings for student ${studentID}`);
    }

    console.log(`Removed student ${studentID} from students, classrooms, and student lessons`);
  } catch (error) {
    console.error("Error deleting student_lesson:", error);
    throw error;
  }
}

export async function handleStudentLessonMarking(studentID, classroom, lessonID, action)
{
  if (studentID != null && lessonID != null)
  {
  if (action == "Unmark")
  {
      updateStudentLessonCompletion(studentID, lessonID, "unchecked");
      updateStudentLessonPassFail(studentID, lessonID, "unchecked");

      let classes = await getListOfClassroomsFromStudent(studentID)
      let maxDate = new Date(Math.max(...classes.map((c) => {
        return new Date(c.data().classroom_endDate).getTime(); 
      })));

      updateStudentLessonEndDate(studentID, lessonID, maxDate)
  }
  else
  {
    updateStudentLessonCompletion(studentID, lessonID, "complete")
    updateStudentLessonPassFail(studentID, lessonID, action)

    let maxDate

    if (action == "Pass")
    {
      maxDate = classroom.data().classroom_endDate;
    }
    else
    {
      let classes = await getListOfClassroomsFromStudent(studentID);
      console.log(classes);
      maxDate = new Date(Math.max(...classes.map((c) => {
        return new Date(c.data().classroom_endDate).getTime(); 
      })));
      console.log(maxDate);
    }

    updateStudentLessonEndDate(studentID, lessonID, maxDate)
  }
  }
  else
  {
    throw "Invalid studentID or lessonID!";
  }
}

export async function calculateStudentProgress(studentID, lessons)
{
  try
  {
    let studentLessonQuery = query(
      collection(db, "student_lesson"),
      where("student_lesson_studentID", "==", studentID),
      where("student_lesson_lessonID", "in", lessons)
    );

    let studentLessonSnapshot = await getDocs(studentLessonQuery);

    let studentLessons = studentLessonSnapshot.docs;
    let total = studentLessons.length;
    let passed = 0;

    for (let i = 0; i < total; i++)
    {
      if (studentLessons[i].data().student_lesson_passFail == "pass")
      {
        passed += 1;
      }
    }

    return (passed / total * 100);
  }
  catch (error) {
    console.error("Error calculating student progress:", error);
    throw error;
  }
}