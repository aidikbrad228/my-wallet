const PASSWORD_KEY = "wallet_password";
const DEFAULT_PASSWORD = "0000";

function getPassword() {
    const savedPassword = localStorage.getItem(PASSWORD_KEY);
    return savedPassword || DEFAULT_PASSWORD;
}

function shake(element) {
    element.classList.add("shake");
    setTimeout(function () {
        element.classList.remove("shake");
    }, 300);
}

const loginScreen = document.getElementById("login-screen");
const mainScreen = document.getElementById("main-screen");
const loginForm = document.getElementById("login-form");
const passwordInput = document.getElementById("password-input");
const loginError = document.getElementById("login-error");
const logoutBtn = document.getElementById("logout-btn");

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (passwordInput.value === getPassword()) {
        loginScreen.hidden = true;
        mainScreen.hidden = false;
        passwordInput.value = "";
        loginError.textContent = "";
    } else {
        loginError.textContent = "Неверный пароль";
        shake(passwordInput);
    }
});

logoutBtn.addEventListener("click", function () {
    mainScreen.hidden = true;
    loginScreen.hidden = false;
});