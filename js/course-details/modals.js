import { state } from './state.js';
import { loadTeachersForSelect, createNotification, saveRequirementsAndAnnotations, saveAdminCourseChanges, changeCourseStatus, enrollCourse, addTeacher, saveGrade, updateStudentStatus } from './api.js';
import { loadCourseDetails } from './api.js';
import { renderCourseDetails, renderNotifications, renderTeachers, renderStudents } from './render.js';
import { escapeHtml } from './utils.js';

async function refreshPage() {
    await loadCourseDetails();
    renderCourseDetails();
    renderNotifications(state.currentCourseData.notifications);
    renderTeachers(state.currentCourseData.teachers);
    renderStudents(state.currentCourseData.students);
}

export function openNotificationModal() {
    const modal = document.getElementById('notificationModal');
    const textarea = document.getElementById('notificationText');
    const checkbox = document.getElementById('isImportant');
    if (modal) {
        if (textarea) textarea.value = '';
        if (checkbox) checkbox.checked = false;
        modal.style.display = 'flex';
    }
}

export function closeNotificationModal() {
    const modal = document.getElementById('notificationModal');
    if (modal) modal.style.display = 'none';
}

export async function handleCreateNotification() {
    const textarea = document.getElementById('notificationText');
    const text = textarea?.value?.trim();
    const isImportant = document.getElementById('isImportant')?.checked || false;
    
    if (!text) {
        showToast('Введите текст уведомления', 'error');
        return;
    }
    
    try {
        const response = await createNotification(text, isImportant);
        if (response.ok) {
            showToast('Уведомление создано', 'success');
            closeNotificationModal();
            await refreshPage();
        } else {
            const error = await response.json().catch(() => ({}));
            showToast(error.message || 'Ошибка при создании уведомления', 'error');
        }
    } catch (err) {
        showToast('Ошибка соединения с сервером', 'error');
    }
}

export function openEditModal() {
    state.isCourseAdmin ? openAdminEditModal() : openTeacherEditModal();
}

export function openTeacherEditModal() {
    const modal = document.getElementById('editCourseModal');
    if (!modal) return;
    document.getElementById('editRequirementsEditor').innerHTML = state.currentCourseData.requirements || '';
    document.getElementById('editAnnotationsEditor').innerHTML = state.currentCourseData.annotations || '';
    modal.style.display = 'flex';
}

export async function openAdminEditModal() {
    const modal = document.getElementById('adminEditCourseModal');
    if (!modal) return;
    
    document.getElementById('adminCourseName').value = state.currentCourseData.name || '';
    document.getElementById('adminCourseYear').value = state.currentCourseData.startYear || '';
    document.getElementById('adminCourseSeats').value = state.currentCourseData.maximumStudentsCount || '';
    
    document.querySelectorAll('input[name="adminSemester"]').forEach(radio => {
        radio.checked = radio.value === state.currentCourseData.semester;
    });
    
    document.getElementById('adminRequirementsEditor').innerHTML = state.currentCourseData.requirements || '';
    document.getElementById('adminAnnotationsEditor').innerHTML = state.currentCourseData.annotations || '';
    
    await loadTeachersForSelect('adminMainTeacher', false);
    
    const mainTeacher = state.currentCourseData.teachers?.find(t => t.isMain);
    if (mainTeacher) document.getElementById('adminMainTeacher').value = mainTeacher.id;
    
    modal.style.display = 'flex';
}

export function closeEditModal() {
    document.getElementById('editCourseModal').style.display = 'none';
}

export function closeAdminEditModal() {
    document.getElementById('adminEditCourseModal').style.display = 'none';
}

export async function handleSaveCourseChanges() {
    const requirements = document.getElementById('editRequirementsEditor')?.innerHTML || '';
    const annotations = document.getElementById('editAnnotationsEditor')?.innerHTML || '';
    
    try {
        const response = await saveRequirementsAndAnnotations(requirements, annotations);
        if (response.ok) {
            showToast('Изменения сохранены', 'success');
            closeEditModal();
            await refreshPage();
        } else {
            const error = await response.json().catch(() => ({}));
            showToast(error.message || 'Ошибка при сохранении', 'error');
        }
    } catch (err) {
        showToast('Ошибка соединения с сервером', 'error');
    }
}

export async function handleSaveAdminCourseChanges() {
    const name = document.getElementById('adminCourseName')?.value.trim();
    const startYear = parseInt(document.getElementById('adminCourseYear')?.value);
    const maximumStudentsCount = parseInt(document.getElementById('adminCourseSeats')?.value);
    const semesterRadio = document.querySelector('input[name="adminSemester"]:checked');
    const semester = semesterRadio ? semesterRadio.value : null;
    const requirements = document.getElementById('adminRequirementsEditor')?.innerHTML || '';
    const annotations = document.getElementById('adminAnnotationsEditor')?.innerHTML || '';
    const mainTeacherId = document.getElementById('adminMainTeacher')?.value;
    
    if (!name || !startYear || !maximumStudentsCount || !semester) {
        showToast('Заполните все обязательные поля', 'error');
        return;
    }
    
    const requestBody = { name, startYear, maximumStudentsCount, semester, requirements, annotations };
    if (mainTeacherId) requestBody.mainTeacherId = mainTeacherId;
    
    try {
        const response = await saveAdminCourseChanges(requestBody);
        if (response.ok) {
            showToast('Изменения сохранены', 'success');
            closeAdminEditModal();
            await refreshPage();
        } else {
            const error = await response.json().catch(() => ({}));
            showToast(error.message || 'Ошибка при сохранении', 'error');
        }
    } catch (err) {
        showToast('Ошибка соединения с сервером', 'error');
    }
}

export function openStatusModal() {
    const modal = document.getElementById('statusModal');
    if (!modal) return;
    document.querySelectorAll('input[name="courseStatus"]').forEach(radio => {
        radio.checked = (radio.value === state.currentCourseData.status);
    });
    modal.style.display = 'flex';
}

export function closeStatusModal() {
    document.getElementById('statusModal').style.display = 'none';
}

export async function handleSaveNewStatus() {
    const selectedRadio = document.querySelector('input[name="courseStatus"]:checked');
    if (!selectedRadio) {
        showToast('Выберите статус', 'error');
        return;
    }
    
    try {
        const response = await changeCourseStatus(selectedRadio.value);
        if (response.ok) {
            showToast('Статус изменён', 'success');
            closeStatusModal();
            await refreshPage();
        } else {
            showToast('Ошибка при изменении статуса', 'error');
        }
    } catch (err) {
        showToast('Ошибка соединения', 'error');
    }
}

export async function handleEnrollCourse() {
    try {
        const response = await enrollCourse();
        if (response.ok) {
            showToast('Заявка на курс отправлена', 'success');
            await refreshPage();
        } else {
            const error = await response.json().catch(() => ({}));
            showToast(error.message || 'Ошибка при записи на курс', 'error');
        }
    } catch (err) {
        showToast('Ошибка соединения с сервером', 'error');
    }
}

export async function openAddTeacherModal() {
    const modal = document.getElementById('addTeacherModal');
    if (!modal) return;
    await loadTeachersForSelect('teacherSelect', true);
    modal.style.display = 'flex';
}

export function closeAddTeacherModal() {
    document.getElementById('addTeacherModal').style.display = 'none';
}

export async function handleSaveTeacher() {
    const teacherId = document.getElementById('teacherSelect')?.value;
    if (!teacherId) {
        showToast('Выберите преподавателя', 'error');
        return;
    }
    
    try {
        const response = await addTeacher(teacherId);
        if (response.ok) {
            showToast('Преподаватель добавлен', 'success');
            closeAddTeacherModal();
            await refreshPage();
        } else {
            const error = await response.json().catch(() => ({}));
            showToast(error.message || 'Ошибка при добавлении преподавателя', 'error');
        }
    } catch (err) {
        showToast('Ошибка соединения с сервером', 'error');
    }
}

export function openEditGradeModal(studentId, studentName, gradeType, currentResult) {
    state.currentEditStudentId = studentId;
    state.currentEditGradeType = gradeType;
    
    const modal = document.getElementById('editGradeModal');
    const title = document.getElementById('editGradeTitle');
    const studentNameEl = document.getElementById('editGradeStudentName');
    
    if (modal && title && studentNameEl) {
        const gradeTypeText = gradeType === 'Midterm' ? 'Промежуточная аттестация' : 'Финальная аттестация';
        title.textContent = `Изменение отметки для "${gradeTypeText}"`;
        studentNameEl.textContent = studentName;
        
        document.querySelectorAll('input[name="gradeResult"]').forEach(radio => {
            radio.checked = (currentResult === 'Passed' && radio.value === 'Passed') || 
                           (currentResult === 'Failed' && radio.value === 'Failed');
        });
        
        modal.style.display = 'flex';
    }
}

export function closeEditGradeModal() {
    document.getElementById('editGradeModal').style.display = 'none';
    state.currentEditStudentId = null;
    state.currentEditGradeType = null;
}

export async function handleSaveGrade() {
    const selectedRadio = document.querySelector('input[name="gradeResult"]:checked');
    if (!selectedRadio) {
        showToast('Выберите результат', 'error');
        return;
    }
    
    try {
        const response = await saveGrade(state.currentEditGradeType, selectedRadio.value);
        if (response.ok) {
            showToast('Отметка изменена', 'success');
            closeEditGradeModal();
            await refreshPage();
        } else {
            showToast('Ошибка при изменении отметки', 'error');
        }
    } catch (err) {
        showToast('Ошибка соединения', 'error');
    }
}

export async function handleAcceptStudent(studentId) {
    try {
        const response = await updateStudentStatus(studentId, 'Accepted');
        if (response.ok) {
            showToast('Студент принят', 'success');
            await refreshPage();
        } else {
            showToast('Ошибка при принятии студента', 'error');
        }
    } catch (err) {
        showToast('Ошибка соединения', 'error');
    }
}

export async function handleRejectStudent(studentId) {
    try {
        const response = await updateStudentStatus(studentId, 'Declined');
        if (response.ok) {
            showToast('Заявка отклонена', 'success');
            await refreshPage();
        } else {
            showToast('Ошибка при отклонении заявки', 'error');
        }
    } catch (err) {
        showToast('Ошибка соединения', 'error');
    }
}