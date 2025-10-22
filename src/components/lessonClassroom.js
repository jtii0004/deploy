import { collection, query, where, getDocs, deleteDoc, doc, getDoc} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";
import { db } from "./firebaseConfig.js";

export async function addLessonClassroom(lessonID, classroomID) {

    /* param
        lessonID - the lesson 'lessonID:' field in the 'lessons' database. Example "FIT1045"
        classroomID - the classroom 'classroom_id:' field in the 'classrooms' database. Example "6003"
    */

    const lessonClassroomData = {
        lesson_classroom_lessonID: lessonID,
        lesson_classroom_classroomID: classroomID,
    };

    // Save the course data to Firestore 

    try {

        const docRef = await addDoc(collection(db, "lesson_classroom"), lessonClassroomData);
        console.log("lesson_classroom entry was successfully added with ID:", docRef.id);

        return docRef.id;

    } catch (error) {

        console.error("Error creating the lessonClassroom:", error);
        throw new Error("Error creating lessonClassroom");

    }

}

/* Data Structure
const lessonClassroomData = {

        lesson_classroom_lessonID: lessonID,
        lesson_classroom_classroomID: classroomID,
    };

*/ 

export async function getListOfLessonsFromClassroom(classroomID) {
  
    /*
  param: 
    classroomID - the classroom 'classroom_id:' field in the 'classrooms' database. Example "6003"
  */ 

  try { 
    // Step 1: get lesson_classroom docs for this classroom 
    const lcQuery = query(
      collection(db, "lesson_classroom"),
      where("lesson_classroom_classroomID", "==", classroomID)
    );
    const lcSnapshot = await getDocs(lcQuery);

    // Step 2: extract all the lesson document IDs 
    const lessonIds = lcSnapshot.docs.map(doc => doc.data().lesson_classroom_lessonID);

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
    console.error("Error fetching lessons for classroom:", error);
    throw error;
  }
}

export async function getListOfClassroomsFromLesson(lessonID) {

    /* param
        lessonID - the lesson 'lessonID:' field in the 'lessons' database. Example "FIT1045"
    */

  try {
    // Step 1: get lesson_classroom docs for this lesson 
    const lcQuery = query(
      collection(db, "lesson_classroom"),
      where("lesson_classroom_lessonID", "==", lessonID)
    );
    const lcSnapshot = await getDocs(lcQuery);

    // Step 2: extract all classroom document IDs 
    const classroomIds = lcSnapshot.docs.map(doc => doc.data().lesson_classroom_classroomID);

    if (classroomIds.length === 0) {
      return []; // no classrooms 
    }

    // Step 3: query classrooms by document ID (batch if > 10) 
    const chunks = [];
    for (let i = 0; i < classroomIds.length; i += 10) {
      const batch = classroomIds.slice(i, i + 10);
      const classroomQuery = query(
        collection(db, "classrooms"),
        where("classroom_id", "in", batch) // query by Firestore doc IDs
      );
      chunks.push(getDocs(classroomQuery));
    }

    // Step 4: combine results into raw snapshots 
    const results = await Promise.all(chunks);
    const classrooms = results.flatMap(snapshot => snapshot.docs);

    return classrooms; // array of DocumentSnapshots (need .data() later) 
  } catch (error) {
    console.error("Error fetching classrooms for lesson:", error);
    throw error;
  }
}

export async function deleteLessonClassroom(lessonID, classroomID) {

    /* param
        lessonID - the lesson 'lessonID:' field in the 'lessons' database. Example "FIT1045"
        classroomID - the classroom 'classroom_id:' field in the 'classrooms' database. Example "6003"  
    */ 

  try {
    // Step 1: Query for the document(s)
    const lcQuery = query(
      collection(db, "lesson_classroom"),
      where("lesson_classroom_lessonID", "==", lessonID),
      where("lesson_classroom_classroomID", "==", classroomID)
    );

    const lcSnapshot = await getDocs(lcQuery);

    if (lcSnapshot.empty) {
      console.warn("No matching lesson_classroom found to delete.");
      return false;
    }

    // Step 2: Delete each matching doc
    const deletions = lcSnapshot.docs.map((d) => 
      deleteDoc(doc(db, "lesson_classroom", d.id))
    );

    await Promise.all(deletions);

    console.log("✅ Successfully deleted lesson_classroom mapping.");
    return true;

  } catch (error) {
    console.error("Error deleting lesson_classroom:", error);
    throw error;
  } 
}

export async function deleteLessonClassroomByLessonID(lessonID) {

    /* param
        lessonID - the lesson 'lessonID:' field in the 'lessons' database. Example "FIT1045"
    */

  try {
    // Search for the lesson_classroom 

    const lcQuery = query(
      collection(db, "lesson_classroom"),
      where("lesson_classroom_lessonID", "==", lessonID)
    );

    const lessonClassroomSnapshot = await getDocs(lcQuery);

    if (!lessonClassroomSnapshot.empty) {
      const deletions = lessonClassroomSnapshot.docs.map((d) =>
        deleteDoc(doc(db, "lesson_classroom", d.id))
      );
      await Promise.all(deletions);
      console.log(`✅ Deleted ${lessonClassroomSnapshot.size} lesson_classroom mappings for lesson ${lessonID}`);
    }

    console.log(`Removed lesson ${lessonID} from classrooms, classrooms, and student lessons`);
  } catch (error) {
    console.error("Error deleting lesson_classroom:", error);
    throw error;
  }
}

export async function deleteLessonClassroomByClassroomID(classroomID) {

    /* param
        classroomID - the classroom 'classroom_id:' field in the 'classrooms' database. Example "6003"
    */

  try {
    // Search for the lesson_classroom 

    const lcQuery = query(
      collection(db, "lesson_classroom"),
      where("lesson_classroom_classroomID", "==", classroomID)
    );

    const lessonClassroomSnapshot = await getDocs(lcQuery);

    if (!lessonClassroomSnapshot.empty) {
      const deletions = lessonClassroomSnapshot.docs.map((d) =>
        deleteDoc(doc(db, "lesson_classroom", d.id))
      );
      await Promise.all(deletions);
      console.log(`✅ Deleted ${lessonClassroomSnapshot.size} lesson_classroom mappings for classroom ${classroomID}`);
    }

    console.log(`Removed classroom ${classroomID} from classrooms, classrooms, and student lessons`);
  } catch (error) {
    console.error("Error deleting lesson_classroom:", error);
    throw error;
  }
}