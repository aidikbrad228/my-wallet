
const PASSWORD_KEY = "wallet_password";
const CATEGORIES_KEY = "wallet_categories";
const OPERATIONS_KEY = "wallet_operations";
const DEFAULT_PASSWORD = "0000";
const DEFAULT_CATEGORIES = ["Еда", "Транспорт", "Развлечения"];
const MONTHS = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];



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

function keyToDate(key) {
    const parts = key.split("-");
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

function formatDate(key) {
    const parts = key.split("-");
    return parts[2] + "." + parts[1] + "." + parts[0];
}

function getWeekStart(key) {
    const date = keyToDate(key);
    const shift = (date.getDay() + 6) % 7;
    date.setDate(date.getDate() - shift);
    return dateToKey(date);
}
function getWeekEnd(startKey) {
    const date = keyToDate(startKey);
    date.setDate(date.getDate() + 6);
    return dateToKey(date);
}

function formatMonth(monthKey) {
    const parts = monthKey.split("-");
    return MONTHS[Number(parts[1]) - 1] + " " + parts[0];
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

function setHead(thead, titles) {
    thead.innerHTML = "";
    const tr = document.createElement("tr");
    titles.forEach(function (title) {
        const th = document.createElement("th");
        th.textContent = title;
        tr.appendChild(th);
    });
    thead.appendChild(tr);
}


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

const passwordForm = document.getElementById("password-form");
const newPassword = document.getElementById("new-password");
const repeatPassword = document.getElementById("repeat-password");
const passwordMessage = document.getElementById("password-message");

const statsMode = document.getElementById("stats-mode");
const statsHead = document.getElementById("stats-head");
const statsBody = document.getElementById("stats-body");
const tipsList = document.getElementById("tips-list");
const historyBody = document.getElementById("history-body");



let categories = loadList(CATEGORIES_KEY, DEFAULT_CATEGORIES);
let operations = loadList(OPERATIONS_KEY, []);



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



function renderStats() {
    statsHead.innerHTML = "";
    statsBody.innerHTML = "";

    if (operations.length === 0) {
        setHead(statsHead, ["Данные"]);
        addRow(statsBody, ["Операций пока нет"]);
        return;
    }

    if (statsMode.value === "category") {
        renderCategoryStats();
    } else {
        renderPeriodStats(statsMode.value);
    }
}

function renderPeriodStats(mode) {
    setHead(statsHead, ["Период", "Доходы", "Расходы"]);

    const groups = {};

    operations.forEach(function (operation) {
        let key = operation.date;
        if (mode === "week") {
            key = getWeekStart(operation.date);
        } else if (mode === "month") {
            key = operation.date.slice(0, 7);
        }

        if (!groups[key]) {
            groups[key] = { income: 0, expense: 0 };
        }
        groups[key][operation.type] += operation.amount;
    });

    const keys = Object.keys(groups).sort().reverse();

    keys.forEach(function (key) {
        let label = formatDate(key);
        if (mode === "week") {
            label = formatDate(key) + " – " + formatDate(getWeekEnd(key));
        } else if (mode === "month") {
            label = formatMonth(key);
        }
        addRow(statsBody, [
            label,
            formatMoney(groups[key].income),
            formatMoney(groups[key].expense)
        ], ["", "income money", "expense money"]);
    });
}

function renderCategoryStats() {
    setHead(statsHead, ["Категория", "Расходы", "Доля"]);

    const totals = {};
    let totalExpense = 0;

    operations.forEach(function (operation) {
        if (operation.type === "expense") {
            if (!totals[operation.category]) {
                totals[operation.category] = 0;
            }
            totals[operation.category] += operation.amount;
            totalExpense += operation.amount;
        }
    });

    const names = Object.keys(totals).sort(function (a, b) {
        return totals[b] - totals[a];
    });

    if (names.length === 0) {
        addRow(statsBody, ["Расходов пока нет", "", ""]);
        return;
    }

    names.forEach(function (name) {
        const share = Math.round(totals[name] / totalExpense * 100);
        addRow(statsBody, [name, formatMoney(totals[name]), share + "%"],
            ["", "expense money", ""]);
    });
}

statsMode.addEventListener("change", renderStats);



function renderTips() {
    tipsList.innerHTML = "";
    const tips = [];

    let income = 0;
    let expense = 0;
    const byCategory = {};
    const byMonth = {};

    operations.forEach(function (operation) {
        if (operation.type === "income") {
            income += operation.amount;
        } else {
            expense += operation.amount;
            byCategory[operation.category] = (byCategory[operation.category] || 0) + operation.amount;
            const month = operation.date.slice(0, 7);
            byMonth[month] = (byMonth[month] || 0) + operation.amount;
        }
    });

    if (expense === 0) {
        tips.push("Добавьте свои расходы, и здесь появятся рекомендации.");
    } else {

        if (expense > income) {
            tips.push("Расходы больше доходов на " + formatMoney(expense - income) +
                ". Постарайтесь сократить необязательные траты.");
        }

        let topName = "";
        let topSum = 0;
        Object.keys(byCategory).forEach(function (name) {
            if (byCategory[name] > topSum) {
                topSum = byCategory[name];
                topName = name;
            }
        });
        const share = Math.round(topSum / expense * 100);
        if (share >= 40) {
            tips.push("Больше всего вы тратите на «" + topName + "» — " + share +
                "% всех расходов. Попробуйте сократить эту статью.");
        }

        if (income > 0 && expense <= income && (income - expense) / income < 0.1) {
            tips.push("Вы откладываете меньше 10% дохода. Старайтесь сохранять хотя бы десятую часть.");
        }

        const now = new Date();
        const thisMonth = dateToKey(now).slice(0, 7);
        const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonth = dateToKey(prevDate).slice(0, 7);
        const thisSum = byMonth[thisMonth] || 0;
        const prevSum = byMonth[prevMonth] || 0;
        if (prevSum > 0 && thisSum > prevSum * 1.2) {
            const growth = Math.round((thisSum - prevSum) / prevSum * 100);
            tips.push("В этом месяце расходы выросли на " + growth +
                "% по сравнению с прошлым. Проверьте, на что ушли деньги.");
        }

        if (tips.length === 0) {
            tips.push("Так держать! Расходы под контролем.");
        }
    }

    tips.forEach(function (text) {
        const li = document.createElement("li");
        li.textContent = text;
        tipsList.appendChild(li);
    });
}



passwordForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (newPassword.value === "") {
        showMessage(passwordMessage, "Введите новый пароль", false);
        shake(newPassword);
        return;
    }

    if (newPassword.value.length < 4) {
        showMessage(passwordMessage, "Пароль должен быть не короче 4 символов", false);
        shake(newPassword);
        return;
    }

    if (newPassword.value !== repeatPassword.value) {
        showMessage(passwordMessage, "Пароли не совпадают", false);
        shake(repeatPassword);
        return;
    }

    localStorage.setItem(PASSWORD_KEY, newPassword.value);
    newPassword.value = "";
    repeatPassword.value = "";
    showMessage(passwordMessage, "Пароль изменён. Используйте его при следующем входе", true);
});



function renderData() {
    renderBalance();
    renderHistory();
    renderStats();
    renderTips();
}

opDate.value = dateToKey(new Date());
renderCategories();
renderCategorySelect();
renderData();