import { collection, query, where, getDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";
import { db } from "./firebaseConfig.js";

// To get all the classroom

export async function getClassrooms(status, userData) {
    const classrooms = [];

    if (userData != null) {

        if ((status !== true || status !== false) && (typeof (status) == String && !(['Draft', 'Published', 'Archived'].includes(status)))) {
            status = true;
        }

        //if the user is a student, then only allow access to published classroom
        //else, return classroom by the filter selected
        const q = userData.role == "student" ? query(collection(db, "classrooms"), where("classroom_status", "==", "Published")) :
            status === true ? query(collection(db, "classrooms")) : query(collection(db, "classrooms"), where("classroom_status", "==", status));

        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            classrooms.push(doc);
        });
    }

    return classrooms;

}

export async function getClassroom(id, userData) {
    if (userData != null) {
        const docRef = doc(db, "classrooms", id);

        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            if (docSnap.data().classroom_status != 'Published' && userData.role == 'student') {
                return null;
            }

            return docSnap.data();
        }
        else {
            return null;
        }
    }
}


export async function getClassroomByStudent(studentID) {
    const classrooms = [];

    try {
      // 1️⃣ Get mappings from student_classroom
      const scQuery = query(
        collection(db, "student_classroom"),
        where("student_classroom_studentID", "==", studentID)
      );

      const scSnap = await getDocs(scQuery);

      if (scSnap.empty) {
        console.warn("⚠️ No classroom mappings found for student:", studentID);
        return classrooms;
      }

      // 2️⃣ For each mapping, query classrooms by classroom_id field
      const classroomSnaps = await Promise.all(
        scSnap.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const classroomID = data.student_classroom_classroomID;

          // query classrooms where classroom_id == classroomID
          const cQuery = query(
            collection(db, "classrooms"),
            where("classroom_id", "==", classroomID)
          );

          const cSnap = await getDocs(cQuery);

          if (!cSnap.empty) {
            return cSnap.docs[0]; // return the first matching classroom doc
          } else {
            console.warn(`⚠️ Classroom not found for classroom_id: ${classroomID}`);
            return null;
          }
        })
      );

      // 3️⃣ Keep only valid docs
      return classroomSnaps.filter(Boolean);
    } catch (error) {
      console.error("❌ Error in getClassroomByStudent:", error);
      return classrooms;
    }
  }


export async function getClassroomsNonJoin(student) {
    /*
      student - the whole student object, e.g.,
      {id: "student123", firstName: "John", lastName: "Doe", title: "Mr.", role: "student"}
    */
    const classrooms = [];

    if (!student?.id) {
        console.error("Invalid student object:", student);
        return classrooms;
    }

    try {
        // Step 1: Get all courses the student is enrolled in
        const studentCourseQuery = query(
            collection(db, "student_course"),
            where("student_course_studentId", "==", student.id)
        );
        const studentCourseSnap = await getDocs(studentCourseQuery);

        const enrolledCourseIDs = studentCourseSnap.docs.map(docSnap => docSnap.data().student_course_courseId);

        console.log("Enrolled courses:", enrolledCourseIDs);

        if (enrolledCourseIDs.length === 0) {
            // Student is not enrolled in any course
            return classrooms;
        }

        // Step 2: Get all classrooms that are Published AND belong to student's courses
        const allClassroomSnap = await getDocs(
            query(
                collection(db, "classrooms"),
                where("classroom_status", "==", "Published")
            )
        );

        allClassroomSnap.forEach((classroomSnap) => {
            const classroomData = classroomSnap.data();
        })

        // Step 3: Get all classrooms the student has already joined
        const studentClassroomQuery = query(
            collection(db, "student_classroom"),
            where("student_classroom_studentID", "==", student.id)
        );
        const studentClassroomSnap = await getDocs(studentClassroomQuery);


        const joinedClassroomIDs = studentClassroomSnap.docs.map(docSnap => docSnap.data().student_classroom_classroomID);

        joinedClassroomIDs.forEach(classroomID => {
            console.log("Classroom ID:", classroomID);
        });


        // Step 4: Filter classrooms
        allClassroomSnap.forEach((classroomSnap) => {
            const classroomData = classroomSnap.data();
            // Only include if:
            // 1. Classroom belongs to one of the student's courses
            // 2. Student has not already joined
            if (
                enrolledCourseIDs.includes(classroomData.classroom_course) &&
                !joinedClassroomIDs.includes(classroomSnap.data().classroom_id)
            ) {
                console.log("Adding classroom:", classroomSnap.data().classroom_id);
                classrooms.push(classroomSnap);
            }
        });

        return classrooms;
    } catch (error) {
        console.error("Error fetching non-joined classrooms:", error);
        return classrooms;
    }
}

export async function checkClassroomDate(courseID) {
    try {
      const q = query(
        collection(db, "classrooms"),
        where("classroom_course", "==", courseID)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return { hasClassroom: false, allEnded: false };
      }

      console.log(snapshot.empty);

      const now = new Date();
      let allEnded = true;

      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.classroom_endDate) {
          // convert dd/mm/yyyy → yyyy-mm-dd safely
          const [day, month, year] = data.classroom_endDate.split("/").map(s => s.trim());
          const endDate = new Date(`${year}-${month}-${day}`);

          if (endDate >= now) {
            allEnded = false;
          }
        } else {
          // no end date = still ongoing
          allEnded = false;
        }
      });

      return { hasClassroom: true, allEnded };
    } catch (error) {
      console.error("❌ Error checking classroom date:", error);
      throw error;
    }
  }