import { collection, query, where, getDocs, deleteDoc, doc, getDoc} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";
import { db } from "./firebaseConfig.js";
import { deleteStudentCourseByCourseID } from "./deleteStudentCourse.js";


export async function deleteCourses(courseID){

    /* param
        courseID - the course 'courseID:' field in the 'courses' database
    */

    try {
        // Search for the course

        const courseQuery = query (
            collection(db, 'courses'),
            where("courseID", "==", courseID)
        )

        const courseSnapshot = await getDocs(courseQuery);

        if (courseSnapshot.empty){
            console.warn("No matching course found to delete.");
        return false;
        }

        const deletions = courseSnapshot.docs.map((d) =>
        deleteDoc(doc(db, "courses", d.id))
        );

        await Promise.all(deletions);

        console.log("✅ Successfully deleted course");


        deleteStudentCourseByCourseID(courseID);

        return true;
    } catch (error) {
    console.error("Error deleting Course:", error);
    throw error;
  }

}