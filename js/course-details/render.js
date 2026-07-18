import { state } from './state.js';
import { escapeHtml, getStatus, translateSemester, updateButtonsVisibility } from './utils.js';

export function renderCourseDetails() {
    if (!state.currentCourseData) return;
    
    document.getElementById('courseTitle').textContent = state.currentCourseData.name || 'Без названия';
    
    const status = getStatus(state.currentCourseData.status);
    const statusElement = document.getElementById('courseStatus');
    statusElement.textContent = status.text;
    statusElement.className = `info-card__value ${status.class}`;
    
    document.getElementById('academicYear').textContent = 
        `${state.currentCourseData.startYear}-${state.currentCourseData.startYear + 1}`;
    
    document.getElementById('semester').textContent = translateSemester(state.currentCourseData.semester);
    document.getElementById('totalSeats').textContent = state.currentCourseData.maximumStudentsCount || 0;
    document.getElementById('enrolledStudents').textContent = state.currentCourseData.studentsEnrolledCount || 0;
    document.getElementById('pendingRequests').textContent = state.currentCourseData.studentsInQueueCount || 0;
    
    document.getElementById('requirementsText').innerHTML = state.currentCourseData.requirements || 'Требования не указаны';
    document.getElementById('summaryText').innerHTML = state.currentCourseData.annotations || 'Аннотация не указана';
    
    updateButtonsVisibility();
}

export function renderNotifications(notifications) {
    const container = document.getElementById('notificationsList');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!notifications || notifications.length === 0) {
        container.innerHTML = '<div class="notification-item">Нет уведомлений</div>';
        return;
    }
    
    notifications.forEach(notification => {
        const item = document.createElement('div');
        item.className = 'notification-item';
        if (notification.isImportant) item.classList.add('high-importance');
        item.innerHTML = `<div class="notification-text">${escapeHtml(notification.text)}</div>`;
        container.appendChild(item);
    });
}

export function renderTeachers(teachers) {
    const container = document.getElementById('teachersList');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!teachers || teachers.length === 0) {
        container.innerHTML = '<div class="teacher-item">Нет преподавателей</div>';
        return;
    }
    
    teachers.forEach(teacher => {
        const item = document.createElement('div');
        item.className = 'teacher-item';
        
        const badgeHTML = teacher.isMain ? '<span class="teacher-item__badge">основной</span>' : '';
        
        item.innerHTML = `
            <div class="teacher-item__info">
                <div class="teacher-item__name">
                    ${escapeHtml(teacher.name)}
                    ${badgeHTML}
                </div>
                <div class="teacher-item__email">${escapeHtml(teacher.email)}</div>
            </div>
        `;
        container.appendChild(item);
    });
}

export function renderStudents(students) {
    const container = document.getElementById('studentsList');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!students || students.length === 0) {
        container.innerHTML = '<div class="student-item">Нет студентов</div>';
        return;
    }
    
    const acceptedStudents = students.filter(s => s.status === 'Accepted');
    const queuedStudents = students.filter(s => s.status === 'InQueue');
    const rejectedStudents = students.filter(s => s.status === 'Declined');
    
    let sortedStudents = [...acceptedStudents, ...queuedStudents, ...rejectedStudents];
    
    if (state.isCourseStudent) {
        const currentStudent = acceptedStudents.find(s => s.email === state.currentUserEmail);
        sortedStudents = currentStudent ? [currentStudent] : [];
    }
    
    sortedStudents.forEach(student => {
        const item = document.createElement('div');
        item.className = 'student-item';
        
        let statusClass = '';
        let statusText = '';
        if (student.status === 'Accepted') {
            statusClass = 'accepted';
            statusText = 'принят в группу';
        } else if (student.status === 'InQueue') {
            statusClass = 'queued';
            statusText = 'в очереди';
        } else if (student.status === 'Declined') {
            statusClass = 'rejected';
            statusText = 'отклонен';
        }
        
        let centerHTML = '';
        let rightHTML = '';
        
        if (student.status === 'Accepted') {
            const showGrades = (state.isCourseAdmin || state.isMainTeacher) || (state.isCourseStudent && student.email === state.currentUserEmail);
            
            if (showGrades) {
                const midtermResult = student.midtermResult;
                const finalResult = student.finalResult;
                
                let midtermBadgeClass = 'badge-secondary';
                let midtermDisplayText = 'Нет оценки';
                if (midtermResult === 'Passed') { midtermBadgeClass = 'badge-success'; midtermDisplayText = 'Пройдено'; }
                else if (midtermResult === 'Failed') { midtermBadgeClass = 'badge-danger'; midtermDisplayText = 'Зафейлено'; }
                
                let finalBadgeClass = 'badge-secondary';
                let finalDisplayText = 'Нет оценки';
                if (finalResult === 'Passed') { finalBadgeClass = 'badge-success'; finalDisplayText = 'Пройдено'; }
                else if (finalResult === 'Failed') { finalBadgeClass = 'badge-danger'; finalDisplayText = 'Зафейлено'; }
                
                const midtermClickable = (state.isCourseAdmin || state.isMainTeacher) ? 
                    `onclick="window.openEditGradeModal('${student.id}', '${escapeHtml(student.name)}', 'Midterm', '${midtermResult || 'NotDefined'}')"` : '';
                const finalClickable = (state.isCourseAdmin || state.isMainTeacher) ? 
                    `onclick="window.openEditGradeModal('${student.id}', '${escapeHtml(student.name)}', 'Final', '${finalResult || 'NotDefined'}')"` : '';
                
                centerHTML = `
                    <div class="student-item__center">
                        <div class="student-item__midterm">
                            <span class="student-item__midterm-link" ${midtermClickable}>Промежуточная аттестация -</span>
                            <span class="badge ${midtermBadgeClass}">${midtermDisplayText}</span>
                        </div>
                    </div>
                `;
                
                rightHTML = `
                    <div class="student-item__right">
                        <div class="student-item__final">
                            <span class="student-item__final-link" ${finalClickable}>Финальная аттестация -</span>
                            <span class="badge ${finalBadgeClass}">${finalDisplayText}</span>
                        </div>
                    </div>
                `;
            }
        } else if (student.status === 'InQueue') {
            if (state.isCourseAdmin || state.isMainTeacher) {
                rightHTML = `
                    <div class="student-item__right">
                        <div class="student-item__actions">
                            <button class="btn-primary student-action-btn" onclick="window.acceptStudent('${student.id}')">принять</button>
                            <button class="btn-danger student-action-btn" onclick="window.rejectStudent('${student.id}')">отклонить<br>заявку</button>
                        </div>
                    </div>
                `;
            }
        }
        
        item.innerHTML = `
            <div class="student-item__left">
                <div class="student-item__name">${escapeHtml(student.name)}</div>
                <div class="student-item__status">
                    Статус - <span class="student-item__status-value ${statusClass}">${statusText}</span>
                </div>
                <div class="student-item__email">${escapeHtml(student.email)}</div>
            </div>
            ${centerHTML}
            ${rightHTML}
        `;
        
        container.appendChild(item);
    });
}