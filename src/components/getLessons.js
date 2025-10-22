import { collection, query, where, getDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";
import { db } from "./firebaseConfig.js";

export async function getLessons(filter, userData, options = {}) {
    const lessons = [];

    if (!userData) {
        return lessons;
    }

    const { ownerName, lessonStrings } = options;

    if (userData.role === "student") {
        if (Array.isArray(lessonStrings) && lessonStrings.length > 0) {
            const results = await Promise.all(
                lessonStrings.map((lessonString) => getLessonByIDAndName(lessonString, userData))
            );

            return results.filter(Boolean);
        }

        const publishedQuery = query(collection(db, "lessons"), where("status", "==", "Published"));
        const querySnapshot = await getDocs(publishedQuery);

        querySnapshot.forEach((docSnap) => {
            lessons.push(docSnap);
        });

        return lessons;
    }

    if (ownerName) {
        const constraints = [where("owner", "==", ownerName)];

        if (typeof filter === "string" && ["Draft", "Published", "Archived"].includes(filter)) {
            constraints.push(where("status", "==", filter));
        }

        const ownerQuery = query(collection(db, "lessons"), ...constraints);
        const querySnapshot = await getDocs(ownerQuery);

        querySnapshot.forEach((docSnap) => lessons.push(docSnap));
        return lessons;
    }

    let resolvedFilter = filter;
    if (
        resolvedFilter !== true &&
        resolvedFilter !== false &&
        !(typeof resolvedFilter === "string" && ["Draft", "Published", "Archived"].includes(resolvedFilter))
    ) {
        resolvedFilter = true;
    }

    const baseQuery = resolvedFilter === true
        ? query(collection(db, "lessons"))
        : query(collection(db, "lessons"), where("status", "==", resolvedFilter));

    const querySnapshot = await getDocs(baseQuery);

    querySnapshot.forEach((docSnap) => {
        lessons.push(docSnap);
    });

    return lessons;
}

export async function getLesson(id, userData)
{
    if (userData != null)
    {
        const docRef = doc(db, "lessons", id);
        //const q = query(collection(db(), "lessons"), where("title", "==", title));
        const docSnap = await getDoc(docRef);
        if (docSnap.exists())
        {
            if (docSnap.data().status != 'Published' && userData.role == 'student')
            {
                return null;
            }
            return docSnap.data();
        }
        else
        {
            return null;
        }
    }

    return null;
}

async function fetchLessonByField(field, value) {
    const lessonQuery = query(collection(db, "lessons"), where(field, "==", value));
    const querySnapshot = await getDocs(lessonQuery);

    if (querySnapshot.empty) {
        return null;
    }

    return querySnapshot.docs[0];
}

function normaliseLessonString(lessonString) {
    if (typeof lessonString !== "string") {
        return { lessonId: null, lessonTitle: null, raw: "" };
    }

    const raw = lessonString.trim();

    if (!raw) {
        return { lessonId: null, lessonTitle: null, raw: "" };
    }

    const colonIndex = raw.indexOf(":");

    if (colonIndex === -1) {
        return { lessonId: null, lessonTitle: raw, raw };
    }

    const lessonId = raw.slice(0, colonIndex).trim();
    const lessonTitle = raw.slice(colonIndex + 1).trim();

    return {
        lessonId: lessonId || null,
        lessonTitle: lessonTitle || null,
        raw
    };
}

export async function getLessonByIDAndName(lessonString, userData)
{
    if (!userData || !lessonString) {
        return null;
    }

    const { lessonId, lessonTitle, raw } = normaliseLessonString(lessonString);

    const candidateQueries = [];

    if (lessonId) {
        candidateQueries.push({ field: "lessonID", value: lessonId });
    }

    if (lessonTitle) {
        candidateQueries.push({ field: "title", value: lessonTitle });
    }

    if (!lessonId && !lessonTitle && raw) {
        candidateQueries.push({ field: "title", value: raw });
    }

    for (const candidate of candidateQueries) {
        const docSnap = await fetchLessonByField(candidate.field, candidate.value);

        if (!docSnap) {
            continue;
        }

        const data = docSnap.data();

        if (userData.role === "student" && data.status !== "Published") {
            continue;
        }

        return docSnap;
    }

    return null;
}

export async function getLessonsbyCourseID(courseID, userData) {
    if (!courseID || !userData) {
      return [];
    }

    // find course by its courseID field
    const q = query(
      collection(db, "courses"),
      where("courseID", "==", courseID)
    );

    const querySnap = await getDocs(q);

    if (querySnap.empty) {
      console.warn("Course not found while requesting lessons:", courseID);
      return [];
    }

    const courseData = querySnap.docs[0].data();
    const lessonStrings = Array.isArray(courseData.courseLessons)
      ? courseData.courseLessons.filter(Boolean)
      : [];

    if (lessonStrings.length === 0) {
      return [];
    }

    // fetch all lessons user can access (doc snapshots)
    const allLessons = await getLessons(true, userData);

    // filter down to matching ones, but keep full doc snapshots
    return allLessons.filter((lessonDoc) => {
      const lessonID = lessonDoc.data().lessonID;
      const lessonTitle = lessonDoc.data().title;
      const combined = `${lessonID}: ${lessonTitle}`;
      return lessonStrings.includes(combined);
    });
  }

  export async function getPublishedLessons(userData)
{
    const lessons = [];

    if (!userData)
    {
        return lessons;
    }

    const publishedQuery = query(collection(db, "lessons"), where("status", "==", "Published"));
    const querySnapshot = await getDocs(publishedQuery);

    querySnapshot.forEach((docSnap) =>
    {
        lessons.push(docSnap);
    });

    return lessons;
}


export async function canChangeLessonStatus(lessonID) {
    try {
      // Get all courses that include this lesson
      const q = query(collection(db, "courses"), where("courseLessons", "array-contains", lessonID));
      const snap = await getDocs(q);

      if (snap.empty) {
        return { canChange: true };
      }

      // Check if any related course is still Published
      let hasActive = false;
      snap.forEach((doc) => {
        const course = doc.data();
        if (course.courseStatus === "Published") {
          hasActive = true;
        }
      });

      if (hasActive) {
        return {
          canChange: false,
          reason: "This lesson is used in at least one published course. Unpublish or archive those courses first."
        };
      }

      // All related courses are Draft or Archived → allowed
      return { canChange: true };
    } catch (err) {
      console.error("Error checking related courses:", err);
      return {
        canChange: false,
        reason: "An error occurred while checking related courses."
      };
    }
  }