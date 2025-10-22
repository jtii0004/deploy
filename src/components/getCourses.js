import { collection, query, where, getDoc, getDocs, deleteDoc, doc} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";
import { db } from "./firebaseConfig.js";
import {getListOfCoursesFromStudent} from "./getStudentCourse";

// To get all the courses

export async function getCourses(status, userData) {
    const courses = [];

    if (userData != null) {

        if ((status !== true || status !== false) && (typeof (status) == String && !(['Draft', 'Published', 'Archived'].includes(status)))) {
            status = true;
        }

        //if the user is a student, then only allow access to published courses
        //else, return courses by the filter selected (true indicates all lessons, false indicates no lessons)
        const q = userData.role == "student" ? query(collection(db, "courses"), where("courseStatus", "==", "Published")) :
            status === true ? query(collection(db, "courses")) : query(collection(db, "courses"), where("courseStatus", "==", status));

        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            courses.push(doc);
        });
    }

    return courses;

}


export async function getCourse(id, userData) {
    if (userData != null) {
        const docRef = doc(db, "courses", id);

        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            if (docSnap.data().courseStatus != 'Published' && userData.role == 'student') {
                return null;
            }

            return docSnap.data();
        }
        else {
            return null;
        }
    }
}

export async function getCoursesByStudent(studentID) {

    /* param
        studentID - the'id:' field in the 'users' database. Example "0LFC6foIENRL34Twvy67sLG46zj1"
    */
    const courses = [];

    const studentRef = doc(db, "users", studentID);
    const studentSnap = await getDoc(studentRef);

    if (!studentSnap.exists()) {
        console.error("Student not found:", studentID);
        return courses;
    }

    const studentData = studentSnap.data();
    const enrolledCourseIDs = studentData.courseList || [];

    if (enrolledCourseIDs.length === 0) {
        return courses;
    }

    const courseSnapshots = await Promise.all(
        enrolledCourseIDs.map(async (courseDocId) => {
            try {
                const courseRef = doc(db, "courses", courseDocId);
                const courseSnap = await getDoc(courseRef);
                if (courseSnap.exists()) {
                    return courseSnap;
                }
                console.warn(`Course not found for ID: ${courseDocId}`);
                return null;
            } catch (error) {
                console.error(`Failed to fetch course ${courseDocId}:`, error);
                return null;
            }
        })
    );

    return courseSnapshots.filter(Boolean);
}

export async function getCoursesNonEnroll(student) {
    try {
        const allCourses = [];

        // 1. Get all courses
        const allCourseRef = collection(db, "courses");
        const snapshot = await getDocs(allCourseRef);

        snapshot.forEach((doc) => {
            const data = doc.data();
            // keep only Published courses
            if (data.courseStatus === "Published") {
                allCourses.push({ ...data, id: doc.id });
            }
        });

        // 2. Get courses the student is already enrolled in
        const enrolledCourses = await getListOfCoursesFromStudent(student.id);

        // enrolledCourses is array of course objects with Firestore doc ids
        const enrolledIds = new Set(enrolledCourses.map((c) => c.id));

        // 3. Filter out enrolled ones
        const nonEnrolledCourses = allCourses.filter(
            (course) => !enrolledIds.has(course.id)
        );

        return nonEnrolledCourses;
    } catch (err) {
        console.error(
            "❌ Error when trying to get all courses in getCoursesNonEnroll:",
            err
        );
        throw err;
    }
}

export async function getPublishedCourses() {
    const courses = [];

    try {
        // Query courses where courseStatus is "Published"
        const publishedQuery = query(
            collection(db, "courses"),
            where("courseStatus", "==", "Published")
        );

        const querySnapshot = await getDocs(publishedQuery);

        querySnapshot.forEach((docSnap) => {
            courses.push(docSnap); // keep as document snapshots
        });

        return courses;
    } catch (error) {
        console.error("❌ Error fetching published courses:", error);
        return [];
    }
}