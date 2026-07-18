import { state } from './state.js';
import { loadCourseDetails, determineUserRoles } from './api.js';
import { renderCourseDetails, renderNotifications, renderTeachers, renderStudents } from './render.js';
import { initEditEditors, initAdminEditEditors } from './editors.js';
import { initAllTabs } from './utils.js';
import {
    openNotificationModal, closeNotificationModal, handleCreateNotification,
    openEditModal, closeEditModal, closeAdminEditModal, handleSaveCourseChanges, handleSaveAdminCourseChanges,
    openStatusModal, closeStatusModal, handleSaveNewStatus,
    handleEnrollCourse,
    openAddTeacherModal, closeAddTeacherModal, handleSaveTeacher,
    openEditGradeModal, closeEditGradeModal, handleSaveGrade,
    handleAcceptStudent, handleRejectStudent
} from './modals.js';

async function initCourseDetails() {
    const params = new URLSearchParams(window.location.search);
    state.currentCourseId = params.get('id');
    
    if (!state.currentCourseId) {
        showToast('ID курса не найден', 'error');
        window.location.href = 'groups.html';
        return;
    }
    
    initEditEditors();
    initAdminEditEditors();
    
    try {
        await loadCourseDetails();
        await determineUserRoles();
        renderCourseDetails();
        renderNotifications(state.currentCourseData.notifications);
        renderTeachers(state.currentCourseData.teachers);
        renderStudents(state.currentCourseData.students);
    } catch (err) {
        showToast('Ошибка загрузки данных курса', 'error');
    }
    
    initAllTabs();
    initEventHandlers();
}

function initEventHandlers() {
    document.getElementById('editCourseBtn')?.addEventListener('click', openEditModal);
    document.querySelectorAll('#editCourseModal [data-modal-close]').forEach(btn => btn.addEventListener('click', closeEditModal));
    document.getElementById('saveEditBtn')?.addEventListener('click', handleSaveCourseChanges);
    
    document.querySelectorAll('#adminEditCourseModal [data-modal-close]').forEach(btn => btn.addEventListener('click', closeAdminEditModal));
    document.getElementById('adminSaveEditBtn')?.addEventListener('click', handleSaveAdminCourseChanges);
    
    document.getElementById('changeStatusBtn')?.addEventListener('click', openStatusModal);
    document.querySelectorAll('#statusModal [data-modal-close]').forEach(btn => btn.addEventListener('click', closeStatusModal));
    document.getElementById('saveStatusBtn')?.addEventListener('click', handleSaveNewStatus);
    
    document.getElementById('enrollCourseBtn')?.addEventListener('click', handleEnrollCourse);
    
    const createNotificationBtn = document.getElementById('createNotificationBtn');
    if (createNotificationBtn) {
        const newBtn = createNotificationBtn.cloneNode(true);
        createNotificationBtn.parentNode.replaceChild(newBtn, createNotificationBtn);
        newBtn.addEventListener('click', openNotificationModal);
    }
    
    document.querySelectorAll('#notificationModal [data-modal-close]').forEach(btn => btn.addEventListener('click', closeNotificationModal));
    
    const saveNotificationBtn = document.getElementById('saveNotificationBtn');
    if (saveNotificationBtn) {
        const newSaveBtn = saveNotificationBtn.cloneNode(true);
        saveNotificationBtn.parentNode.replaceChild(newSaveBtn, saveNotificationBtn);
        newSaveBtn.addEventListener('click', handleCreateNotification);
    }
    
    document.getElementById('addTeacherBtn')?.addEventListener('click', openAddTeacherModal);
    document.querySelectorAll('#addTeacherModal [data-modal-close]').forEach(btn => btn.addEventListener('click', closeAddTeacherModal));
    document.getElementById('saveTeacherBtn')?.addEventListener('click', handleSaveTeacher);
    
    document.querySelectorAll('#editGradeModal [data-modal-close]').forEach(btn => btn.addEventListener('click', closeEditGradeModal));
    document.getElementById('saveGradeBtn')?.addEventListener('click', handleSaveGrade);
    
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) e.target.style.display = 'none';
    });
}

window.openEditGradeModal = openEditGradeModal;
window.acceptStudent = handleAcceptStudent;
window.rejectStudent = handleRejectStudent;

if (window.location.pathname.includes('course-details.html')) {
    document.addEventListener('DOMContentLoaded', initCourseDetails);
}