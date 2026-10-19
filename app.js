// ===== БЛОК 1: Константы =====
const PASSWORD_KEY = "wallet_password";
const OPERATIONS_KEY = "wallet_operations";
const DEFAULT_PASSWORD = "0000";

// ===== БЛОК 2: Работа с localStorage =====
function loadList(key, defaultList) {
    const saved = localStorage.getItem(key);
    if (saved === null) {
        return defaultList.slice(); 
        return JSON.parse(saved);
    }
}
function saveList(key, list) {
    localStorage.setItem(key, JSON.stringify(list));
}

function getPassword() {
    const savedPassword = localStorage.getItem(PASSWORD_KEY);
    return savedPassword || DEFAULT_PASSWORD;
}

// ===== БЛОК 3: Вспомогательные функции =====
function shake(element) {
    function formatMoney(number) {
    const text = String(number);
    return text.replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₽";
}
    element.classList.add("shake");
    setTimeout(function () {
        element.classList.remove("shake");
    }, 300);
}

// ===== БЛОК 4: Элементы страницы =====
const loginScreen = document.getElementById("login-screen");
const mainScreen = document.getElementById("main-screen");
const loginForm = document.getElementById("login-form");
const passwordInput = document.getElementById("password-input");
const loginError = document.getElementById("login-error");
const logoutBtn = document.getElementById("logout-btn");
const balanceEl = document.getElementById("balance");
const totalIncomeEl = document.getElementById("total-income");
const totalExpenseEl = document.getElementById("total-expense");

// ===== БЛОК 5: Данные =====
let operations = loadList(OPERATIONS_KEY, []);

// ===== БЛОК 6: Вход и выход =====
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

// ===== БЛОК 9: Баланс =====
function renderBalance() {
    let income = 0;
    let expense = 0;

    operations.forEach(function (operation) {
        if (operation.type === "income") {
            income = income + operation.amount;
        } else {
            expense = expense + operation.amount;
        }
    });

    const balance = income - expense;
    balanceEl.textContent = formatMoney(balance);
    totalIncomeEl.textContent = formatMoney(income);
    totalExpenseEl.textContent = formatMoney(expense);

    if (balance < 0) {
        balanceEl.classList.add("minus");
    } else {
        balanceEl.classList.remove("minus");
    }
}

// ===== БЛОК 14: Запуск =====
// Перерисовать всё, что зависит от списка операций
function renderData() {
    renderBalance();
}

renderData();