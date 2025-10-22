
const functionURL = "https://us-central1-weshowagile.cloudfunctions.net/deleteUser";

export async function deleteFirebaseAuthUser(uid){

    if (!uid) {
        throw new Error("UID is required to delete a user");
    }

    try {
        const response = await fetch(`${functionURL}?uid=${uid}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to delete user");
        }

        console.log("✅", data.message);
        return data.message;
    }
    catch (error) {
        console.error("Error deleting Firebase user:", error);
        throw error;
    }
}