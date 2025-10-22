import { doc, updateDoc, getDoc, query, where, getDocs, collection } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";
import { db } from "./firebaseConfig.js";

import { getCurrentUser, getUserInfo } from "./manageUsers";

// Update classroom status
export async function updateClassroomStatus(classroomId, status) {
  const docRef = doc(db, "classrooms", classroomId);
  await updateDoc(docRef, {
    classroom_status: status,
    classroom_updatedDate: new Date().toISOString(),
  });
  console.log("Updated classroom status:", status);
}

// Update classroom name
export async function updateClassroomName(classroomId, name) {
  const docRef = doc(db, "classrooms", classroomId);
  await updateDoc(docRef, {
    classroom_name: name,
    classroom_updatedDate: new Date().toISOString(),
  });
  console.log("Updated classroom name:", name);
}

// Update classroom description
export async function updateClassroomDescription(classroomId, description) {
  const docRef = doc(db, "classrooms", classroomId);
  await updateDoc(docRef, {
    classroom_description: description,
    classroom_updatedDate: new Date().toISOString(),
  });
  console.log("Updated classroom description:", description);
}

// Update classroom students (replace whole array)
export async function updateClassroomStudents(classroomId, studentsArray) {
  // Query for the classroom with the matching classroom_id field
  const q = query(
    collection(db, "classrooms"),
    where("classroom_id", "==", classroomId)
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    console.warn("No classroom found with classroom_id:", classroomId);
    return;
  }

  // Assuming classroom_id is unique, so we only update the first match
  const docRef = snap.docs[0].ref;

  await updateDoc(docRef, {
    classroom_students: studentsArray.map((s) => s.trim()).filter(Boolean),
    classroom_updatedDate: new Date().toISOString(),
  });

  console.log("Updated classroom students:", studentsArray);
}

// Update classroom lessons (replace whole array)
export async function updateClassroomLessons(classroomId, lessonsArray) {
  const docRef = doc(db, "classrooms", classroomId);
  await updateDoc(docRef, {
    classroom_lessons: lessonsArray.map(s => s.trim()).filter(Boolean),
    classroom_updatedDate: new Date().toISOString(),
  });
  console.log("Updated classroom lessons:", lessonsArray);
}


// Jorden Add this
export async function updateClassroomInDatabase(classroomId, updates) {
  let user = await getCurrentUser();
  let userInfo = await getUserInfo(user);

  if (user != null && userInfo.role !== "student") {
    try {
      const docRef = doc(db, "classrooms", classroomId);

      // Ensure updatedAt is refreshed automatically
      updates.classroom_updatedDate = new Date().toISOString();

      await updateDoc(docRef, updates);

      console.log("Classroom updated successfully:", classroomId);
      return;
    } catch (error) {
      console.error("Error updating classroom:", error);
      throw "Error updating classroom";
    }
  } else {
    throw "Unauthorized access!";
  }
}

export async function updateInstructorInClassroom(oldInstructor, newInstructor) {

  try {

    // Find all the lessons with the instructor in the lessons
    const classroomQuery = query(
      collection(db, "classrooms"),
      where("classroom_instructor", "==", oldInstructor)
    );

    const classroomSnapshot = await getDocs(classroomQuery);

    if (classroomSnapshot.empty) {
      console.log(`No ${oldInstructor}found in any Classroom`);
      return;
    }

    const updates = classroomSnapshot.docs.map((d) =>
      updateDoc(doc(db, "classrooms", d.id), {
        classroom_instructor: newInstructor,
      })

    );

    await Promise.all(updates);

    console.log(`✅ Updated ${classroomSnapshot.size} lessons`);

  } catch (error) {
    console.error("Error updating instructor:", error);
    throw error;
  }

}

export async function updateStartDateInClassroom(classroomId, startDate) {

  /*
  Param:
    classroomId: String - The classroom ID
    startDate: String - The start date in YYYY-MM-DD format

  */

  try {

    // Find all the lessons with the instructor in the lessons
    const classroomQuery = query(
      collection(db, "classrooms"),
      where("classroom_id", "==", classroomId)
    );

    const classroomSnapshot = await getDocs(classroomQuery);

    if (classroomSnapshot.empty) {
      console.log(`No classroom found with classroom_id: ${classroomId}`);
      return;
    }

    const updates = classroomSnapshot.docs.map(async (d) => {
      const classroomData = d.data();
      const durationWeeks = classroomData.classroom_duration;

      // Compute endDate
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + durationWeeks * 7);

      // Save in YYYY-MM-DD format
      const endDateStr = end.toISOString().split("T")[0];

      return updateDoc(doc(db, "classrooms", d.id), {
        classroom_startDate: startDate,
        classroom_endDate: endDateStr,
      });

    });

    await Promise.all(updates);

    console.log(`✅ Updated ${classroomSnapshot.size} classrooms`);

  } catch (error) {
    console.error("Error updating startDate:", error);
    throw error;
  }

}

export async function updateDurationInClassroom(classroomId, durationWeeks) {
  /*
  Param:
    classroomId: String - The classroom ID
    durationWeeks: int - The duration in weeks

  */
  try {

    // Find all the lessons with the instructor in the lessons
    const classroomQuery = query(
      collection(db, "classrooms"),
      where("classroom_id", "==", classroomId)
    );

    const classroomSnapshot = await getDocs(classroomQuery);

    if (classroomSnapshot.empty) {
      console.log(`No classroom found with classroom_id: ${classroomId}`);
      return;
    }

    const updates = classroomSnapshot.docs.map(async (d) => {
      const classroomData = d.data();
      const startDate = classroomData.classroom_startDate;

      // Compute endDate
      const end = new Date(startDate);
      end.setDate(start.getDate() + durationWeeks * 7);

      // Save in YYYY-MM-DD format
      const endDateStr = end.toISOString().split("T")[0];

      return updateDoc(doc(db, "classrooms", d.id), {
        classroom_duration: durationWeeks,
        classroom_endDate: endDateStr,
      });

    });

    await Promise.all(updates);

    console.log(`✅ Updated ${classroomSnapshot.size} classrooms`);

  } catch (error) {
    console.error("Error updating duration:", error);
    throw error;
  }
}

export async function autoArchiveEndedClassrooms() {
  try {
    const now = new Date();
    const snapshot = await getDocs(collection(db, "classrooms"));
    const updates = [];

    snapshot.forEach(async (docSnap) => {
      const data = docSnap.data();

      if (!data.classroom_endDate) return;

      // Convert to Date object safely
      const endDate = new Date(data.classroom_endDate);

      if (endDate < now && data.classroom_status === "Published") {
        const classroomRef = doc(db, "classrooms", docSnap.id);

        await updateDoc(classroomRef, {
          classroom_status: "Archived",
          classroom_updatedDate: new Date().toISOString(),
        });

        console.log(
          `📦 Archived classroom "${data.classroom_name}" (${data.classroom_id}) — Ended on ${endDate.toDateString()}`
        );
        updates.push(data.classroom_id);
      }
    });

    if (updates.length > 0) {
      console.log(`✅ Auto-archived ${updates.length} classrooms.`);
    } else {
      console.log("ℹ️ No classrooms needed archiving.");
    }
  } catch (error) {
    console.error("❌ Error auto-archiving classrooms:", error);
  }
}