function isValidEmail(email) {
    // Regex for email validation (common standard)
    // Allows letters, numbers, dots, underscores, hyphens in the local part.
    // Requires an @ symbol, followed by a domain name with at least one dot.
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}


function isValidUsername(username) {
    // Regex for username validation:
    // - Must be 3 to 20 characters long.
    // - Can contain alphanumeric characters, underscores, and hyphens.
    // - Must start and end with an alphanumeric character.
    const usernameRegex = /^[a-zA-Z0-9]([._-](?![._-])|[a-zA-Z0-9]){1,18}[a-zA-Z0-9]$/;
    return usernameRegex.test(username);
}

function isValidPassword(password) {
    // Regex for password validation:
    // - At least 8 characters long.
    // - Contains at least one uppercase letter.
    // - Contains at least one lowercase letter.
    // - Contains at least one digit.
    // - Contains at least one special character (e.g., !@#$%^&*).
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    return passwordRegex.test(password);
}