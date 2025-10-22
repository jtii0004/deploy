import { setDoc, doc, getDocs, collection, query, where, getDoc} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";
import { db } from "./firebaseConfig";
import { getCurrentUser, getUserInfo } from "./manageUsers";


export async function addCoursesToDatabase(
    courseID,
    courseTitle,
    courseDescription,
    courseLessons,
    courseTotalCreditPoint,
    courseSupervisor,
    courseStatus
  ) {
    let user = await getCurrentUser();
    let userinfo = await getUserInfo(user);
  
    if (user != null && userinfo.role != "student") {
      // --- Step 1: Check if courseID already exists ---
      const q = query(collection(db, "courses"), where("courseID", "==", courseID));
      const snapshot = await getDocs(q);
  
      if (!snapshot.empty) {
        throw `❌ Course with ID "${courseID}" already exists!`;
      }
  
      const courseData = {
        courseID: courseID,
        courseTitle: courseTitle,
        courseDescription: courseDescription,
        courseLessons: courseLessons.map(s => s.trim()).filter(Boolean),
        courseTotalCreditpoint: Number.parseInt(courseTotalCreditPoint),
        courseSupervisor: courseSupervisor,
        courseCreateDate: new Date().toISOString(),
        courseUpdateDate: new Date().toISOString(),
        courseStatus: courseStatus,
      };
  
      const docRef = doc(db, "courses", new Date().getTime().toString()); // timestamp ID
      try {
        await setDoc(docRef, courseData);
        console.log("✅ Course was successfully added:", courseData);
        return;
      } catch (error) {
        console.error("❌ Error creating the course:", error);
        throw "Error creating course";
      }
    } else {
      throw "Unauthorized Access >:(";
    }
  }


export async function validateCourseLessons(courseLessons) {
    // Get all lessons from Firestore once
    const lessonSnapshot = await getDocs(collection(db, "lessons"));
    const lessonsMap = {};
    lessonSnapshot.docs.forEach(doc => {
        const data = doc.data();
        lessonsMap[data.lessonID] = data;
    });

    // Extract IDs from the submitted lessons
    const submittedLessonIds = courseLessons.map(l => l.split(":")[0].trim());

    // Check each lesson
    const missingDeps = {};
    for (const lessonStr of courseLessons) {
        const lessonId = lessonStr.split(":")[0].trim();
        const lesson = lessonsMap[lessonId];

        if (lesson && lesson.prerequisites?.length > 0) {
            const prereqIds = lesson.prerequisites.map(p => p.split(":")[0].trim());
            const missing = prereqIds.filter(p => !submittedLessonIds.includes(p));

            if (missing.length > 0) {
                missingDeps[lessonId] = missing;
            }
        }
    }

    return missingDeps; 
}