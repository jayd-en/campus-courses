const API_BASE = 'https://camp-courses.api.kreosoft.space';

function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    localStorage.setItem('token', token);
}

function removeToken() {
    localStorage.removeItem('token');
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatDate(date) {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}.${m}.${y}`;
}

function getStatus(status) {
    switch (status) {
        case "Created":
            return { text: "Создан", class: "status-created" };
        case "OpenForAssigning":
            return { text: "Открыт для записи", class: "status-open" };
        case "Started":
            return { text: "В процессе обучения", class: "status-progress" };
        case "Finished":
            return { text: "Завершен", class: "status-closed" };
        default:
            return { text: status || "Неизвестно", class: "status-created" };
    }
}

function translateSemester(semester) {
    return semester === "Autumn" ? "Осенний" : "Весенний";
}

function logout() {
    if (confirm('Выйти из аккаунта?')) {
        removeToken();
        window.location.href = 'index.html';
    }
}

function renderCourses(courses) {
    const container = document.getElementById('coursesList');
    if (!container) return;
    
    container.innerHTML = '';

    courses.forEach(course => {
        const item = document.createElement('div');
        item.className = 'course-item';
        item.style.cursor = 'pointer';
        item.onclick = () => window.location.href = `course-details.html?id=${course.id}`;

        const status = getStatus(course.status);

        item.innerHTML = `
            <div class="course-item__left">
                <div class="course-item__title">${escapeHtml(course.name)}</div>
                <div class="course-item__text">Учебный год - ${course.startYear}-${course.startYear + 1}</div>
                <div class="course-item__text">Семестр - ${translateSemester(course.semester)}</div>
                <div class="course-item__sub">Мест всего - ${course.maximumStudentsCount}</div>
                <div class="course-item__sub">Мест свободно - ${course.remainingSlotsCount}</div>
            </div>
            <div class="course-item__status ${status.class}">${status.text}</div>
        `;

        container.appendChild(item);
    });
}

// ==================== хедер ====================
async function renderHeader() {
    const header = document.getElementById('header');
    if (!header) return;

    const token = getToken();

    if (!token) {
        header.innerHTML = `
            <div class="header__container">
                <div class="header__left">
                    <a href="index.html" class="header__logo-link">Кампусные курсы</a>
                </div>
                <div class="header__right">
                    <a href="registration.html" class="header__nav-link">Регистрация</a>
                    <a href="login.html" class="header__nav-link">Вход</a>
                </div>
            </div>
        `;
        return;
    }

    let email = 'Пользователь';
    let showMyCourses = false;
    let showTeachingCourses = false;

    try {
        const userRes = await fetch(`${API_BASE}/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (userRes.ok) {
            const user = await userRes.json();
            email = user.email || email;
        }

        const myRes = await fetch(`${API_BASE}/courses/my`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (myRes.ok) {
            const data = await myRes.json();
            showMyCourses = Array.isArray(data) && data.length > 0;
        }

        const teachRes = await fetch(`${API_BASE}/courses/teaching`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (teachRes.ok) {
            const data = await teachRes.json();
            showTeachingCourses = Array.isArray(data) && data.length > 0;
        }

    } catch (err) {
        console.error("Ошибка загрузки данных для хедера:", err);
    }

    let leftHTML = `
        <a href="index.html" class="header__logo-link">Кампусные курсы</a>
        <a href="groups.html" class="header__nav-link">Группы курсов</a>
    `;
    if (showMyCourses) leftHTML += `<a href="my-courses.html" class="header__nav-link">Мои курсы</a>`;
    if (showTeachingCourses) leftHTML += `<a href="teaching-courses.html" class="header__nav-link">Преподаваемые курсы</a>`;

    let rightHTML = `
        <span class="header__email" onclick="window.location.href='profile.html'" style="cursor:pointer;">
            ${escapeHtml(email)}
        </span>
        <a href="#" onclick="logout(); return false;" class="header__nav-link">Выход</a>
    `;

    header.innerHTML = `
        <div class="header__container">
            <div class="header__left">
                ${leftHTML}
            </div>
            <div class="header__right">
                ${rightHTML}
            </div>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    renderHeader();
});