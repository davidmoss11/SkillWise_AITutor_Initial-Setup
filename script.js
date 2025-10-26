// Basic functions for auth validation
function validateEmail(email) {
  // Simple email check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  // Check password requirements
  if (password.length < 8) {
    return false;
  }

  // Need one uppercase, lowercase, number, special char
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);

  return hasUpper && hasLower && hasNumber && hasSpecial;
}

// For checking if user is logged in
function checkAuthToken() {
  const token = localStorage.getItem('token');
  return token != null;
}

module.exports = {
  validateEmail,
  validatePassword,
  checkAuthToken,
};
