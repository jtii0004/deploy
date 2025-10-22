import {doc, deleteDoc, getDocs, updateDoc, collection, getDoc, query, where} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";
import { db } from "./firebaseConfig";
import { getCurrentUser, getUserInfo } from "./manageUsers";

export async function deleteLessonFromDatabase(lessonDocId)
{
    let user = await getCurrentUser();
    let userInfo = await getUserInfo(user);

    if (user != null && userInfo.role != "student")
    {
        const docRef = doc(db, "lessons", lessonDocId);
        try {
            // Delete lesson data from Firestore
            await deleteDoc(docRef);

            console.log("Lesson deleted successfully:", lessonDocId);
            return;
        } 
        catch (error) {
            console.error("Error deleting lesson:", error);
            throw "Error deleting lesson";
        }
    }
    else
    {
        throw "Unauthorized access!";
    }
}

export async function deletePrereqAndCourse(lessonIdToDelete,lessonIDRaw) {
    try {
        // --- Step 1: Remove from prerequisites ---
        const lessonSnapshot = await getDocs(collection(db, "lessons"));

        for (const lessonDoc of lessonSnapshot.docs) {
            const lesson = lessonDoc.data();

            if (lesson.prerequisites && lesson.prerequisites.length > 0) {
                const updatedPrereqs = lesson.prerequisites.filter(prereq => {
                    const prereqId = prereq.split(":")[0].trim();
                    return prereqId !== lessonIdToDelete;
                });

                if (updatedPrereqs.length !== lesson.prerequisites.length) {
                    console.log(`Removing ${lessonIdToDelete} from prerequisites for lesson: ${lesson.lessonID}`);
                    await updateDoc(doc(db, "lessons", lessonDoc.id), {
                        prerequisites: updatedPrereqs,
                        updatedAt: new Date().toISOString()
                    });
                }
            }
        }

        // --- Step 2: Remove from courses and recalc credits ---
        const courseSnapshot = await getDocs(collection(db, "courses"));

        for (const courseDoc of courseSnapshot.docs) {
            const course = courseDoc.data();

            if (course.courseLessons && course.courseLessons.length > 0) {
                const updatedLessons = course.courseLessons.filter(lessonStr => {
                    const courseLessonId = lessonStr.split(":")[0].trim();
                    return courseLessonId !== lessonIdToDelete; 
                });

                if (updatedLessons.length !== course.courseLessons.length) {
                    // Recalculate total credits
                    let totalCredits = 0;
                    for (const lessonStr of updatedLessons) {
                        const lessonId = lessonStr.split(":")[0].trim();

                        // Find the lesson in the lessons collection
                        const lessonDoc = lessonSnapshot.docs.find(
                            d => d.data().lessonID === lessonId
                        );
                        if (lessonDoc) {
                            const lessonData = lessonDoc.data();
                            totalCredits += lessonData.creditPoint || 0;
                        }
                    }

                    console.log(`Updating course: ${course.courseId || courseDoc.id}, new credits = ${totalCredits}`);
                    await updateDoc(doc(db, "courses", courseDoc.id), {
                        courseLessons: updatedLessons,
                        courseTotalCreditpoint: totalCredits,
                        updatedAt: new Date().toISOString()
                    });
                }
            }
        }

        // --- Step 3: Delete from student_lesson ---
        const studentLessonQuery = query(
            collection(db, "student_lesson"),
            where("student_lesson_lessonID", "==", lessonIDRaw)
        );
        const studentLessonSnapshot = await getDocs(studentLessonQuery);

        if (!studentLessonSnapshot.empty) {
            const deletions = studentLessonSnapshot.docs.map((d) =>
                deleteDoc(doc(db, "student_lesson", d.id))
            );
            await Promise.all(deletions);
            console.log(`✅ Deleted ${studentLessonSnapshot.size} student_lesson mappings for lesson ${lessonIdToDelete}`);
        }

        console.log(`Removed lesson ${lessonIdToDelete} from prerequisites, courses, and student lessons`);
    } catch (error) {
        console.error("Error deleting lesson references:", error);
        throw error;
    }
}