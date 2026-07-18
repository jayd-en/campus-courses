import { state } from './state.js';

const API_BASE = 'https://camp-courses.api.kreosoft.space';

function getToken() {
    return localStorage.getItem('token');
}

export async function loadCourseDetails() {
    const token = getToken();
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const response = await fetch(`${API_BASE}/courses/${state.currentCourseId}/details`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Ошибка загрузки курса');
    state.currentCourseData = await response.json();
}

export async function determineUserRoles() {
    const token = getToken();
    
    const adminCheckRes = await fetch(`${API_BASE}/groups`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: "__test__" })
    });
    
    state.isCourseAdmin = adminCheckRes.ok;
    
    if (adminCheckRes.ok) {
        const data = await adminCheckRes.json();
        await fetch(`${API_BASE}/groups/${data.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
    }
    
    const userRes = await fetch(`${API_BASE}/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (userRes.ok) {
        const user = await userRes.json();
        state.currentUserEmail = user.email;
        
        const mainTeacher = state.currentCourseData.teachers?.find(t => t.isMain);
        state.isMainTeacher = mainTeacher?.email === state.currentUserEmail;
        state.isCourseTeacher = state.currentCourseData.teachers?.some(t => t.email === state.currentUserEmail) || false;
        state.isCourseStudent = state.currentCourseData.students?.some(s => 
            s.email === state.currentUserEmail && s.status === 'Accepted'
        ) || false;
    }
}

export async function loadTeachersForSelect(selectId, excludeExisting = true) {
    const token = getToken();
    const select = document.getElementById(selectId);
    if (!select) return;

    select.innerHTML = '<option value="">Загрузка...</option>';

    const response = await fetch(`${API_BASE}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Не удалось загрузить пользователей');

    const users = await response.json();
    const existingTeacherIds = excludeExisting ? (state.currentCourseData.teachers?.map(t => t.id) || []) : [];
    
    const availableUsers = users
        .filter(user => !existingTeacherIds.includes(user.id))
        .filter(user => user.fullName || user.email)
        .sort((a, b) => {
            const nameA = (a.fullName || a.email).toLowerCase();
            const nameB = (b.fullName || b.email).toLowerCase();
            return nameA.localeCompare(nameB);
        });

    select.innerHTML = '<option value="">Выберите преподавателя</option>';
    availableUsers.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.fullName || 'Без имени'} (${user.email})`;
        select.appendChild(option);
    });
    
    return users;
}

export async function createNotification(text, isImportant) {
    const token = getToken();
    return fetch(`${API_BASE}/courses/${state.currentCourseId}/notifications`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text, isImportant })
    });
}

export async function saveRequirementsAndAnnotations(requirements, annotations) {
    const token = getToken();
    return fetch(`${API_BASE}/courses/${state.currentCourseId}/requirements-and-annotations`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ requirements, annotations })
    });
}

export async function saveAdminCourseChanges(requestBody) {
    const token = getToken();
    return fetch(`${API_BASE}/courses/${state.currentCourseId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
    });
}

export async function changeCourseStatus(newStatus) {
    const token = getToken();
    return fetch(`${API_BASE}/courses/${state.currentCourseId}/status`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
    });
}

export async function enrollCourse() {
    const token = getToken();
    return fetch(`${API_BASE}/courses/${state.currentCourseId}/sign-up`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
}

export async function addTeacher(teacherId) {
    const token = getToken();
    return fetch(`${API_BASE}/courses/${state.currentCourseId}/teachers`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: teacherId })
    });
}

export async function saveGrade(markType, mark) {
    const token = getToken();
    return fetch(`${API_BASE}/courses/${state.currentCourseId}/marks/${state.currentEditStudentId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ markType, mark })
    });
}

export async function updateStudentStatus(studentId, status) {
    const token = getToken();
    return fetch(`${API_BASE}/courses/${state.currentCourseId}/student-status/${studentId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
    });
}