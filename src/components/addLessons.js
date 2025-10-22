import {setDoc, doc} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";
import { db } from "./firebaseConfig";
import { getCurrentUser, getUserInfo } from "./manageUsers";

export async function addLessonToDatabase(lessonID, title, description, objectives, readingList, prerequisites, assignments, creditPoint, owner, status)
{
    let user = await getCurrentUser();
    let userInfo = await getUserInfo(user);

    if (user != null && userInfo.role != "student")
    {
        const lessonData = {
            lessonID: lessonID,
            title: title,
            description: description,
            objectives: objectives.map(s => s.trim()).filter(Boolean),
            readingList: readingList.map(s => s.trim()).filter(Boolean),
            prerequisites: prerequisites.map(s => s.trim()).filter(Boolean),
            assignments: assignments.map(s => s.trim()).filter(Boolean),
            owner: owner,
            status: status,
            creditPoint: Number.parseInt(creditPoint),
            createdAt: new Date().toISOString().split("T")[0],
            updatedAt: new Date().toISOString().split("T")[0],
        };

        // Save lesson data to Firestore
        const docRef = doc(db, "lessons", new Date().getTime().toString());  // Unique document ID based on timestamp
        console.log(docRef)

        try {
            // Save lesson data to Firestore
            await setDoc(docRef, lessonData);

            console.log("Lesson created successfully:", lessonData);
            return;
        }
        catch (error) {
            console.error("Error creating lesson:", error);
            throw "Error creating lesson";
        }
    }
    else
    {
        throw "Unauthorized access!";
    }
}