// ==================== курсы ====================
let currentGroupId = null;

async function loadGroupCourses() {
    const token = getToken();
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const groupId = params.get('id');

    if (!groupId) {
        alert("Нет ID группы");
        return;
    }

    currentGroupId = groupId;

    try {
        const groupsRes = await fetch(`${API_BASE}/groups`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const groups = await groupsRes.json();

        const currentGroup = groups.find(g => g.id === groupId);

        document.getElementById('groupTitle').textContent =
            `Группа - ${currentGroup?.name || 'Неизвестно'}`;

        const coursesRes = await fetch(`${API_BASE}/groups/${groupId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const courses = await coursesRes.json();

        await checkIsAdminCourses();

        renderCourses(courses);

    } catch (err) {
        alert("Ошибка загрузки курсов");
    }
}

async function checkIsAdminCourses() {
    const token = getToken();

    try {
        const res = await fetch(`${API_BASE}/groups`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name: "__test__" })
        });

        if (res.status === 403) {
            document.getElementById('groupCoursesActions').style.display = 'none';
        } else if (res.ok) {
            const data = await res.json();
            await fetch(`${API_BASE}/groups/${data.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        }

    } catch {
        document.getElementById('groupCoursesActions').style.display = 'none';
    }
}

// ==================== создание курса ====================
function initEditors() {
    const editors = [
        { editorId: 'requirementsEditor', resizeId: 'requirementsResize' },
        { editorId: 'annotationsEditor', resizeId: 'annotationsResize' }
    ];

    editors.forEach(({ editorId, resizeId }) => {
        const editor = document.getElementById(editorId);
        const resizeHandle = document.getElementById(resizeId);
        if (!editor) return;

        if (editor.innerText.trim() === '') {
            editor.innerHTML = '';
        }

        const container = editor.closest('.editor-container');
        const toolbar = container?.querySelector('.editor-toolbar');
        
        if (toolbar) {
            toolbar.querySelectorAll('[data-command]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const command = btn.dataset.command;
                    
                    editor.focus();
                    
                    if (command === 'createLink') {
                        const url = prompt('Введите URL ссылки:', 'https://');
                        if (url) {
                            document.execCommand('createLink', false, url);
                        }
                    } else if (command === 'insertImage') {
                        const url = prompt('Введите URL изображения:', 'https://');
                        if (url) {
                            document.execCommand('insertImage', false, url);
                        }
                    } else if (command === 'selectAll') {
                        document.execCommand('selectAll', false, null);
                    } else if (command === 'delete') {
                        document.execCommand('delete', false, null);
                    } else {
                        document.execCommand(command, false, null);
                    }
                    
                    editor.focus();
                });
            });
            
            toolbar.querySelectorAll('[data-highlight]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    editor.focus();
                    const color = btn.dataset.highlight;
                    
                    if (color === 'transparent') {
                        document.execCommand('backColor', false, '#ffffff');
                        document.execCommand('hiliteColor', false, '#ffffff');
                    } else {
                        document.execCommand('hiliteColor', false, color);
                        document.execCommand('backColor', false, color);
                    }
                    
                    editor.focus();
                });
            });
        }

        if (resizeHandle) {
            let startY, startHeight;
            resizeHandle.addEventListener('mousedown', (e) => {
                startY = e.clientY;
                startHeight = parseInt(window.getComputedStyle(editor).height, 10);
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
                e.preventDefault();

                function onMouseMove(e) {
                    const newHeight = startHeight + (e.clientY - startY);
                    if (newHeight > 80) {
                        editor.style.height = newHeight + 'px';
                    }
                }

                function onMouseUp() {
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                }
            });
        }

        editor.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData('text/plain');
            document.execCommand('insertText', false, text);
        });
    });
}

async function loadTeachersForSelect() {
    const token = getToken();
    const select = document.getElementById('mainTeacher');
    if (!select) return;

    select.innerHTML = '<option value="">Загрузка...</option>';

    try {
        const response = await fetch(`${API_BASE}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Не удалось загрузить пользователей');
        }

        const users = await response.json();

        const sortedUsers = users
            .filter(user => user.fullName || user.email)
            .sort((a, b) => {
                const nameA = (a.fullName || a.email).toLowerCase();
                const nameB = (b.fullName || b.email).toLowerCase();
                return nameA.localeCompare(nameB);
            });

        select.innerHTML = '<option value="">Выберите преподавателя</option>';
        sortedUsers.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = `${user.fullName || 'Без имени'} (${user.email})`;
            select.appendChild(option);
        });

    } catch (err) {
        console.error('Ошибка загрузки преподавателей:', err);
        select.innerHTML = '<option value="">Ошибка загрузки</option>';
    }
}

function getSelectedTeacherId() {
    const select = document.getElementById('mainTeacher');
    const manualInput = document.getElementById('manualTeacherId');
    
    if (select.value === 'manual' && manualInput && manualInput.value.trim()) {
        return manualInput.value.trim();
    }
    return select.value || null;
}

async function createNewCourse() {
    const token = getToken();
    if (!token) {
        showToast('Необходимо авторизоваться', 'error');
        window.location.href = 'login.html';
        return;
    }

    const groupId = currentGroupId;
    if (!groupId) {
        showToast('ID группы не найден', 'error');
        return;
    }

    const name = document.getElementById('courseName')?.value.trim();
    const startYear = parseInt(document.getElementById('courseYear')?.value);
    const maximumStudentsCount = parseInt(document.getElementById('courseSeats')?.value);
    const semesterRadio = document.querySelector('input[name="semester"]:checked');
    const semester = semesterRadio ? semesterRadio.value : null;
    const requirements = document.getElementById('requirementsEditor')?.innerHTML || '';
    const annotations = document.getElementById('annotationsEditor')?.innerHTML || '';
    const mainTeacherId = getSelectedTeacherId();

    if (!name) {
        showToast('Введите название курса', 'error');
        return;
    }
    if (!startYear || startYear < 2000 || startYear > 2100) {
        showToast('Введите корректный год начала курса (2000-2100)', 'error');
        return;
    }
    if (!maximumStudentsCount || maximumStudentsCount < 1) {
        showToast('Введите корректное количество мест (минимум 1)', 'error');
        return;
    }
    if (!semester) {
        showToast('Выберите семестр', 'error');
        return;
    }

    const requestBody = {
        name,
        startYear,
        maximumStudentsCount,
        semester,
        requirements,
        annotations
    };

    if (mainTeacherId) {
        requestBody.mainTeacherId = mainTeacherId;
    }

    try {
        const response = await fetch(`${API_BASE}/groups/${groupId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
        });

        if (response.ok) {
            showToast('Курс успешно создан!', 'success');
            const courseModal = document.getElementById('courseModal');
            if (courseModal) courseModal.style.display = 'none';
            await loadGroupCourses();
        } else {
            const error = await response.json().catch(() => ({}));
            showToast(error.message || 'Ошибка при создании курса', 'error');
        }
    } catch (err) {
        console.error('Ошибка создания курса:', err);
        showToast('Ошибка соединения с сервером', 'error');
    }
}

function openCourseModal() {
    const courseModal = document.getElementById('courseModal');
    if (courseModal) {
        courseModal.style.display = 'flex';
        loadTeachersForSelect(); 
        document.getElementById('courseName').value = '';
        document.getElementById('courseYear').value = '';
        document.getElementById('courseSeats').value = '';
        document.querySelectorAll('input[name="semester"]').forEach(radio => radio.checked = false);
        document.getElementById('requirementsEditor').innerHTML = '';
        document.getElementById('annotationsEditor').innerHTML = '';
    }
}

function closeCourseModal() {
    const courseModal = document.getElementById('courseModal');
    if (courseModal) {
        courseModal.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const coursesList = document.getElementById('coursesList');
    if (coursesList) {
        loadGroupCourses();
    }

    const courseModal = document.getElementById('courseModal');

    const createCourseBtn = document.getElementById('createCourseBtn');
    if (createCourseBtn) {
        const newBtn = createCourseBtn.cloneNode(true);
        createCourseBtn.parentNode.replaceChild(newBtn, createCourseBtn);
        newBtn.addEventListener('click', openCourseModal);
    }

    const closeCourseModalBtn = document.getElementById('closeCourseModal');
    if (closeCourseModalBtn) {
        closeCourseModalBtn.addEventListener('click', closeCourseModal);
    }

    const courseCancelBtn = document.getElementById('cancelCourseBtn');
    if (courseCancelBtn) {
        courseCancelBtn.addEventListener('click', closeCourseModal);
    }

    const saveCourseBtn = document.getElementById('saveCourseBtn');
    if (saveCourseBtn) {
        saveCourseBtn.addEventListener('click', createNewCourse);
    }

    window.addEventListener('click', (e) => {
        if (courseModal && e.target === courseModal) {
            closeCourseModal();
        }
    });

    initEditors();
});