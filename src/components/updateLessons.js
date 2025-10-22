import { updateDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";
import { db } from "./firebaseConfig";
import { getCurrentUser, getUserInfo } from "./manageUsers";

export async function updateLessonInDatabase(lessonDocId, updates) {
    let user = await getCurrentUser();
    let userInfo = await getUserInfo(user);

    if (user != null && userInfo.role != "student") {
        try {
            const docRef = doc(db, "lessons", lessonDocId);

            // Ensure updatedAt is refreshed automatically
            updates.updatedAt = new Date().toISOString();

            await updateDoc(docRef, updates);

            console.log("Lesson updated successfully:", lessonDocId);
            return;
        } catch (error) {
            console.error("Error updating lesson:", error);
            throw "Error updating lesson";
        }
    } else {
        throw "Unauthorized access!";
    }
}


export async function updateInstructorInLessons(oldInstructor, newInstructor) {

    // TODO: Check what is the input given for owner when adding the lesson
    try {

        // Find all the lessons with the instructor in the lessons
        const lessonQuesry = query(
            collection(db, "lessons"),
            where("owner", "==", oldInstructor)
        );

        const lessonSnapshot = await getDocs(lessonQuesry);

        if (lessonSnapshot.empty) {
            console.log("No lessons found");
            return;
        }

        const updates = lessonSnapshot.docs.map((d) =>
            updateDoc(doc(db, "lessons", d.id), {
                owner: newInstructor,
            })
        );

        await Promise.all(updates);

        console.log(`✅ Updated ${lessonSnapshot.size} lessons`);

    } catch (error) {
        console.error("Error updating instructor:", error);
        throw error;
    }
}