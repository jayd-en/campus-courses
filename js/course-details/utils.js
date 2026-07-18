import { state } from './state.js';

export function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

export function getStatus(status) {
    switch (status) {
        case "Created": return { text: "Создан", class: "status-created" };
        case "OpenForAssigning": return { text: "Открыт для записи", class: "status-open" };
        case "Started": return { text: "В процессе обучения", class: "status-progress" };
        case "Finished": return { text: "Завершен", class: "status-closed" };
        default: return { text: status || "Неизвестно", class: "status-created" };
    }
}

export function translateSemester(semester) {
    return semester === "Autumn" ? "Осенний" : "Весенний";
}

export function updateButtonsVisibility() {
    const editBtn = document.getElementById('editCourseBtn');
    const changeStatusBtn = document.getElementById('changeStatusBtn');
    const createNotificationBtn = document.getElementById('createNotificationBtn');
    const addTeacherBtn = document.getElementById('addTeacherBtn');
    const enrollBtn = document.getElementById('enrollCourseBtn');
    
    if (state.isCourseAdmin) {
        if (editBtn) editBtn.style.display = 'block';
        if (changeStatusBtn) changeStatusBtn.style.display = 'block';
        if (createNotificationBtn) createNotificationBtn.style.display = 'block';
        if (addTeacherBtn) addTeacherBtn.style.display = 'block';
        if (enrollBtn) enrollBtn.style.display = 'none';
    } else if (state.isCourseTeacher || state.isMainTeacher) {
        if (editBtn) editBtn.style.display = 'block';
        if (changeStatusBtn) changeStatusBtn.style.display = 'block';
        if (createNotificationBtn) createNotificationBtn.style.display = 'block';
        if (addTeacherBtn) addTeacherBtn.style.display = 'block';
        if (enrollBtn) enrollBtn.style.display = 'none';
    } else {
        if (editBtn) editBtn.style.display = 'none';
        if (changeStatusBtn) changeStatusBtn.style.display = 'none';
        if (createNotificationBtn) createNotificationBtn.style.display = 'none';
        if (addTeacherBtn) addTeacherBtn.style.display = 'none';
        
        const isEnrolled = state.currentCourseData?.students?.some(s => 
            s.email === state.currentUserEmail && (s.status === 'Accepted' || s.status === 'InQueue')
        );
        
        if (enrollBtn && state.currentCourseData?.status === 'OpenForAssigning' && !isEnrolled) {
            enrollBtn.style.display = 'block';
        } else if (enrollBtn) {
            enrollBtn.style.display = 'none';
        }
    }
}

export function initAllTabs() {
    const tabGroups = document.querySelectorAll('.content-tabs');
    
    tabGroups.forEach(tabsContainer => {
        const tabBtns = tabsContainer.querySelectorAll('.tab-btn');
        const tabPanes = tabsContainer.querySelectorAll('.tab-pane');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                tabBtns.forEach(b => b.classList.remove('active'));
                tabPanes.forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(tabId).classList.add('active');
            });
        });
    });
}