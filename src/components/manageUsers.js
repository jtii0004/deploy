import { getAuth, signInWithEmailAndPassword, deleteUser, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";
import {collection, doc, query, where, getDoc, setDoc, getDocs, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";
import { auth, db } from "./firebaseConfig";
import { use } from "react";

export async function logOut()
{
    await cookieStore.delete('user');
}

export async function signInUser(email, password)
{
    let user = null;
    await signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        user = userCredential.user; // This is the authenticated user
        cookieStore.set('user', JSON.stringify(userCredential));
      })
      .catch((error) => {
        throw "Cannot sign in user! " + error;
      });
    
    console.log(user);
    return user;
}

export async function registerUser(firstName, lastName, email, password, title, token, selectedRole)
{
    let user = null;
    let validToken = await useToken(email, token, selectedRole);

    if (validToken)
    {
    // Create user using Firebase Authentication
    await createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
        user = userCredential.user;
        cookieStore.set('user', JSON.stringify(userCredential));
        console.log("User created successfully:", user); // Debugging log

        let userData = {
            id: user.uid,
            firstName: firstName,
            lastName: lastName,
            title: title,
            role: selectedRole
        };

        if (selectedRole == "student")
        {
            userData.courseList = [];
            userData.lessonList = [];
        }

        // Save user data to Firestore
        let docRef = doc(db, "users", user.uid);
        setDoc(docRef, userData)
            .then(() => {
                console.log("Document successfully written!"); // Debugging log
            })
            .catch((error) => {
                throw new ("Error writing document:", error);
            });
        })
        .catch((error) => {
            throw ("Cannot create user! " + error);
        });
    }
    else
    {
        throw ("Token does not exist!");
    }
    console.log(user);
    return user;
}

export async function getCurrentUser()
{
    let userCredential = await cookieStore.get('user');

    if (userCredential != null)
    {
        return JSON.parse(userCredential.value).user;
    }
    else
    {
        return null
    }
}

export async function getUserInfo(user)
{
    //get the user credentials to look for, pass down user

    if (user != null)
    {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        //if they exist, return the credentials
        if (docSnap.exists())
        {
            return docSnap.data();
        }
        else
        {
            return null;
        }
    }
    else
    {
        return null;
    }
}

export async function getAllInstructorsInfo()
{
    let user = await getCurrentUser();

    if (user)
    {
        const lessons = []
        
        const q = query(collection(db, "users"), where("role", "==", "instructor"));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((user) => {
            // doc.data() is never undefined for query doc snapshots
            lessons.push(user.data())
        });

        return lessons;
    }
    else
    {
        throw "You are not logged in, so you cannot access this page!"
    }
}

export async function getAllStudentsInfo()
{
    let user = await getCurrentUser();

    if (user)
    {
        const lessons = []
        
        const q = query(collection(db, "users"), where("role", "==", "student"));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((user) => {
            // doc.data() is never undefined for query doc snapshots
            lessons.push(user.data())
        });

        return lessons;
    }
    else
    {
        throw "You are not logged in, so you cannot access this page!"
    }
}

/*
export async function deleteCurrentUser()
{
    let user = await getCurrentUser();
    
    if (user) 
    {
        // Delete user data from Firestore
        const docRef = doc(db, "users", user.uid);
        deleteDoc(docRef)
        .then(() => {
            console.log("User data successfully deleted from Firestore!");
            
            // Now delete the user account
            deleteUser(user)
            .then(() => {
                console.log("User account successfully deleted!");
            })
            .catch((error) => {
                throw "Error deleting user account: " + error;
            });
        })
        .catch((error) => {
            throw "Error deleting user data from Firestore: " + error;
        });
    } 
    else 
    {
        throw "No user is signed in.";
    }
}
*/

export async function createToken(token, role)
{
    let user = await getCurrentUser();
    let userInfo = await getUserInfo(user);

    if (user != null && userInfo.role != "student")
    {
        let tokenObject = {value: token, owner: user.uid, status:"Available", role: role, users:[]};

        const existingToken = await getDoc(doc(db, "tokens", token));
        console.log(existingToken.data(), token);

        // Save token data to Firestore
        if (existingToken.data() == null)
        {
            await setDoc(doc(db, "tokens", token), tokenObject);
            return;
        }
        else
        {
            throw "TRY_AGAIN"; //try again
        }
    }
    else
    {
        throw "NOT_ALLOWED"; //forbidden
    }
}

export async function useToken(email, token, role)
{
    const tokenRef = doc(db, "tokens", token);
    const existingToken = await getDoc(tokenRef);

    if (existingToken.exists() && existingToken.data()?.role === role)
    {
        await deleteDoc(tokenRef);
        return true;
    }
    else
    {
        return false;
    }
}

export async function getTokens(role=true)
{
    let user = await getCurrentUser();

    if (role !== true && (typeof(role) == String && !(['student', 'instructor'].includes(role))))
    {
        role = true;
    }

    if (user != null)
    {
        let tokens = []
        
        let q = role === true ? query(collection(db, "tokens")) : query(collection(db, "tokens"), where("role", "==", role));
        let querySnapshot = await getDocs(q);

        querySnapshot.forEach((token) => {
            // doc.data() is never undefined for query doc snapshots
            tokens.push(token.data())
        });

        return tokens;
    }
    else
    {
        throw "No user found!";
    }
}

export async function removeToken(tokenValue) {
    let user = await getCurrentUser();
    let userInfo = await getUserInfo(user);

    if (user != null && userInfo.role != "student") {
        const tokenRef = doc(db, "tokens", tokenValue); // use value as doc ID
        const existingToken = await getDoc(tokenRef);

        if (existingToken.exists()) {
            await deleteDoc(tokenRef);
            return;
        } else {
            throw "NOT_FOUND";
        }
    } else {
        throw "NOT_ALLOWED";
    }
}
