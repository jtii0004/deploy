import { setDoc, doc, addDoc, collection } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";
import { db } from "./firebaseConfig";
import { getCurrentUser, getUserInfo } from "./manageUsers";

export async function addClassroomsToDatabase(
    classroomID,
    courseID,
    instructorID,
    classroomName,
    classroomDescription,
    classroomLessons,
    classroomStudents,
    classroomStartDate,
    classroomDurationWeeks,
    classroomStatus,
    classroomEndDate
) {
    const user = await getCurrentUser();
    const userinfo = await getUserInfo(user);

    // Convert the startDate to a Date object
    const start = new Date(classroomStartDate);
    const end = new Date(classroomEndDate);

    if (user != null && userinfo.role !== "student") {
        const classroomData = {
            classroom_id: classroomID,
            classroom_course: courseID, // can be a name only
            classroom_instructor: instructorID, // can be their name only
            classroom_name: classroomName,
            classroom_description: classroomDescription,
            classroom_lessons: classroomLessons.map((s) => s.trim()).filter(Boolean),
            classroom_students: classroomStudents.map((s) => s.trim()).filter(Boolean),
            classroom_startDate: start.toISOString(),
            classroom_durationWeeks: Number.parseInt(classroomDurationWeeks, 10),
            classroom_createdDate: new Date().toISOString(),
            classroom_updatedDate: new Date().toISOString(),
            classroom_status: classroomStatus,
            classroom_endDate: end.toISOString(),
        };

        try {
            const docRef = await addDoc(collection(db, "classrooms"), classroomData);
            console.log("Classroom was successfully added with ID:", docRef.id);

            return docRef.id;
        } catch (error) {
            console.error("Error creating the classroom:", error);
            throw new Error("Error creating classroom");
        }
    }

    throw new Error("Unauthorized Access >:(");
}