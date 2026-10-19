// ===== БЛОК 1: Константы =====
const PASSWORD_KEY = "wallet_password";
const CATEGORIES_KEY = "wallet_categories";
const OPERATIONS_KEY = "wallet_operations";
const DEFAULT_PASSWORD = "0000";
const DEFAULT_CATEGORIES = ["Еда", "Транспорт", "Развлечения"];


// ===== БЛОК 2: Работа с localStorage =====
function loadList(key, defaultList) {
    const saved = localStorage.getItem(key);
    if (saved === null) {
        return defaultList.slice();
    }
    return JSON.parse(saved);
}

function saveList(key, list) {
    localStorage.setItem(key, JSON.stringify(list));
}

function getPassword() {
    const savedPassword = localStorage.getItem(PASSWORD_KEY);
    return savedPassword || DEFAULT_PASSWORD;
}


// ===== БЛОК 3: Вспомогательные функции =====
function formatMoney(number) {
    const text = String(number);
    return text.replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₽";
}

function pad(number) {
    return number < 10 ? "0" + number : String(number);
}

function dateToKey(date) {
    return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
}

function formatDate(key) {
    const parts = key.split("-");
    return parts[2] + "." + parts[1] + "." + parts[0];
}

function shake(element) {
    element.classList.add("shake");
    setTimeout(function () {
        element.classList.remove("shake");
    }, 300);
}

function showMessage(element, text, isOk) {
    element.textContent = text;
    element.className = isOk ? "error ok" : "error";
}

function addRow(tbody, texts, classes) {
    const tr = document.createElement("tr");
    texts.forEach(function (text, index) {
        const td = document.createElement("td");
        td.textContent = text;
        if (classes && classes[index]) {
            td.className = classes[index];
        }
        tr.appendChild(td);
    });
    tbody.appendChild(tr);
    return tr;
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

const operationForm = document.getElementById("operation-form");
const opType = document.getElementById("op-type");
const opAmount = document.getElementById("op-amount");
const opCategoryBox = document.getElementById("op-category-box");
const opCategory = document.getElementById("op-category");
const opDate = document.getElementById("op-date");
const opError = document.getElementById("op-error");

const categoryForm = document.getElementById("category-form");
const categoryInput = document.getElementById("category-input");
const categoryError = document.getElementById("category-error");
const categoryList = document.getElementById("category-list");

const historyBody = document.getElementById("history-body");


// ===== БЛОК 5: Данные =====
let categories = loadList(CATEGORIES_KEY, DEFAULT_CATEGORIES);
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


// ===== БЛОК 7: Категории =====
function renderCategories() {
    categoryList.innerHTML = "";
    categories.forEach(function (category) {
        const li = document.createElement("li");
        li.textContent = category;
        categoryList.appendChild(li);
    });
}

function renderCategorySelect() {
    opCategory.innerHTML = "";
    categories.forEach(function (category) {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        opCategory.appendChild(option);
    });
}

categoryForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = categoryInput.value.trim();

    if (name === "") {
        showMessage(categoryError, "Название категории не может быть пустым", false);
        shake(categoryInput);
        return;
    }

    if (name.length > 20) {
        showMessage(categoryError, "Название не должно быть длиннее 20 символов", false);
        shake(categoryInput);
        return;
    }

    let isDuplicate = false;
    categories.forEach(function (category) {
        if (category.toLowerCase() === name.toLowerCase()) {
            isDuplicate = true;
        }
    });
    if (isDuplicate) {
        showMessage(categoryError, "Такая категория уже есть", false);
        shake(categoryInput);
        return;
    }

    categories.push(name);
    saveList(CATEGORIES_KEY, categories);
    renderCategories();
    renderCategorySelect();

    categoryInput.value = "";
    showMessage(categoryError, "Категория добавлена", true);
});


// ===== БЛОК 8: Добавление операций =====
opAmount.addEventListener("input", function () {
    const cleaned = opAmount.value.replace(/\D/g, "");
    if (cleaned !== opAmount.value) {
        opAmount.value = cleaned;
        showMessage(opError, "В поле суммы можно вводить только цифры", false);
        shake(opAmount);
    }
});

opType.addEventListener("change", function () {
    opCategoryBox.hidden = opType.value === "income";
});

operationForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (opAmount.value === "") {
        showMessage(opError, "Введите сумму", false);
        shake(opAmount);
        return;
    }

    const amount = Number(opAmount.value);
    if (amount === 0) {
        showMessage(opError, "Сумма должна быть больше нуля", false);
        shake(opAmount);
        return;
    }

    if (opDate.value === "") {
        showMessage(opError, "Выберите дату", false);
        shake(opDate);
        return;
    }

    let category = "";
    if (opType.value === "expense") {
        category = opCategory.value;
        if (category === "") {
            showMessage(opError, "Выберите категорию", false);
            return;
        }
    }

    const operation = {
        id: Date.now(),
        type: opType.value,
        amount: amount,
        category: category,
        date: opDate.value
    };

    operations.push(operation);
    saveList(OPERATIONS_KEY, operations);
    renderData();

    opAmount.value = "";
    showMessage(opError, "Операция добавлена", true);
});

function deleteOperation(id) {
    operations = operations.filter(function (operation) {
        return operation.id !== id;
    });
    saveList(OPERATIONS_KEY, operations);
    renderData();
}


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


// ===== БЛОК 10: История операций =====
function renderHistory() {
    historyBody.innerHTML = "";

    if (operations.length === 0) {
        addRow(historyBody, ["Операций пока нет", "", "", ""]);
        return;
    }

    const sorted = operations.slice().sort(function (a, b) {
        if (a.date !== b.date) {
            return a.date < b.date ? 1 : -1;
        }
        return b.id - a.id;
    });

    sorted.forEach(function (operation) {
        const isIncome = operation.type === "income";
        const sign = isIncome ? "+" : "−";
        const tr = addRow(historyBody, [
            formatDate(operation.date),
            isIncome ? "Доход" : operation.category,
            sign + formatMoney(operation.amount),
            ""
        ], ["", "", (isIncome ? "income" : "expense") + " money", ""]);

        const button = document.createElement("button");
        button.type = "button";
        button.className = "delete-btn";
        button.textContent = "Удалить";
        button.addEventListener("click", function () {
            deleteOperation(operation.id);
        });
        tr.lastChild.appendChild(button);
    });
}


// ===== БЛОК 14: Запуск =====
function renderData() {
    renderBalance();
    renderHistory();
}

opDate.value = dateToKey(new Date());
renderCategories();
renderCategorySelect();
renderData();