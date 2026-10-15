interface FirebaseLikeError {
    code?: string;
}

export const getFirebaseErrorMessage = (
    error: unknown,
    fallback = "Something went wrong. Please try again."
): string => {
    const code = (error as FirebaseLikeError | null)?.code;

    switch (code) {
        case "auth/network-request-failed":
            return "We couldn't reach Firebase. Check your internet connection and try again.";
        case "auth/invalid-api-key":
        case "auth/api-key-not-valid":
            return "Firebase is not configured for this environment. Add your API key to .env and restart the dev server.";
        case "auth/invalid-credential":
        case "auth/invalid-login-credentials":
        case "auth/user-not-found":
        case "auth/wrong-password":
            return "The email or password is incorrect.";
        case "auth/email-already-in-use":
            return "An account already exists with this email address.";
        case "auth/weak-password":
            return "Choose a stronger password and try again.";
        case "auth/too-many-requests":
            return "Too many attempts. Please wait a moment and try again.";
        case "permission-denied":
        case "storage/unauthorized":
            return "You don't have permission to complete that action.";
        default:
            return fallback;
    }
};
