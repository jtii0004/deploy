import { doc, deleteDoc, getDocs, updateDoc, collection, getDoc, query, where } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";
import { db } from "./firebaseConfig";
import { getCurrentUser, getUserInfo } from "./manageUsers";
import { updateInstructorInLessons } from "./updateLessons";
import {updateInstructorInClassroom} from "./updateClassrooms";
import {updateSupervisorInCourse} from "./updateCourses";
import { deleteFirebaseAuthUser } from "./deleteFirebaseAuthUser";


export async function deleteInstructorFromDatabase(instructorDocId) {

    try {
        // Step 1: Query for the document of the instructor
        const instructorQuery = query
            (
                collection(db, "users"),
                where("id", "==", instructorDocId),
                where("role", "==", "instructor")
            );

        const instructorSnapshot = await getDocs(instructorQuery);

        if (instructorSnapshot.empty) {
            console.log("Instructor not found");
            return;
        }

        // Step 2: Delete the instructor document
        const deletions = instructorSnapshot.docs.map((d) =>
        {
            deleteDoc(doc(db, "users", d.id));
            deleteFirebaseAuthUser(d.data().id);
        }
        );

        await Promise.all(deletions);

        console.log(`✅ Deleted ${instructorSnapshot.docs[0].data().firstName} instructor documents`);

    } catch (error) {
        console.error("Error deleting instructor:", error);
        throw error;
    }

    // Change the instructor of the lessons to be "admin"

    // TO-DO: The input for the instructor to delete in other functions will be its title, first name and last name

    /*
    instructorList.map(
        (instructor) => `${instructor.title} ${instructor.firstName} ${instructor.lastName}`
    )
    */

    const instructorString = instructorSnapshot.docs[0].data().title + " " + instructorSnapshot.docs[0].data().firstName + " " + instructorSnapshot.docs[0].data().lastName;
    const admin = "admin";

    try {

        updateInstructorInLessons(instructorString, admin);

        console.log(`✅ Updated ${instructorSnapshot.docs[0].data().firstName} lessons`);

    } catch (error) {
        console.error("Error updating the instructions in lessons", error);
        throw error;
    }

    try {
        updateInstructorInClassroom(instructorString, admin);
        console.log(`✅ Updated ${instructorSnapshot.docs[0].data().firstName} classrooms`);
    } catch (error) {
        console.error("Error updating the instructions in classrooms", error);
        throw error;
    }

    try {
        updateSupervisorInCourse(instructorString, admin);
        console.log(`✅ Updated ${instructorSnapshot.docs[0].data().firstName} courses`);
    } catch (error) {
        console.error("Error updating the instructions in courses", error);
        throw error;
    }

}