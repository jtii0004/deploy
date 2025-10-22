import { collection, query, where, getDocs, deleteDoc, doc, getDoc, addDoc} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";
import { db } from "./firebaseConfig.js";


export async function createRequest(studentSnapshot, classroomId) {
    try {
        const existingQuery = query(
            collection(db, "requests"),
            where("request_student_id", "==", studentSnapshot.id),
            where("request_classroom_id", "==", classroomId)
        );

        const existingSnap = await getDocs(existingQuery);

        if (!existingSnap.empty) {
            // Found an existing request  throw a specific error
            throw new Error("REQUEST_ALREADY_EXISTS");
        }
        const requestObject = {
            request_student_id: studentSnapshot.id,            // Firestore doc ID
            request_student_name: studentSnapshot.firstName + " " + studentSnapshot.lastName, // field in the doc
            request_classroom_id: classroomId,
            created_at: new Date()
        };

        // Add new request to "requests" collection
        await addDoc(collection(db, "requests"), requestObject);
        return;
    } catch (error) {
        console.error("Error creating request:", error);
        throw error;
    }
}

export async function getRequestsByClassroom(classroomId) {
    try {
        const requestsQuery = query(
            collection(db, "requests"),
            where("request_classroom_id", "==", classroomId)
        );

        const requestsSnapshot = await getDocs(requestsQuery);

        // Return the array of DocumentSnapshots
        return requestsSnapshot.docs; // each item is a DocumentSnapshot
    } catch (error) {
        console.error("Error fetching requests:", error);
        throw error;
    }
}


export async function deleteRequestByStudentAndClassroom(studentId, classroomId) {
    try{
        // Query requests where both student_id and classroom_id match
        const requestsQuery = query(
            collection(db, "requests"),
            where("request_student_id", "==", studentId),
            where("request_classroom_id", "==", classroomId)
        );

        const requestsSnapshot = await getDocs(requestsQuery);

        if (requestsSnapshot.empty) {
            console.log("No requests found for this student in this classroom.");
            return;
        }

        // Delete each matching request
        const deletePromises = requestsSnapshot.docs.map((docSnap) =>
            deleteDoc(doc(db, "requests", docSnap.id))
        );

        await Promise.all(deletePromises);
        console.log(`Deleted ${requestsSnapshot.docs.length} request(s) for student ${studentId} in classroom ${classroomId}.`);
    } catch (error) {
        console.error("Error deleting request:", error);
        throw error;
    }
}