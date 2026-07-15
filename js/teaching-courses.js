// ==================== преподаваемые курсы ====================
async function loadTeachingCourses() {
    const token = getToken();
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const container = document.getElementById('coursesList');
    if (!container) return;

    container.innerHTML = '<div class="loading">Загрузка...</div>';

    try {
        const response = await fetch(`${API_BASE}/courses/teaching`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Ошибка загрузки курсов');
        }

        const courses = await response.json();
        renderCourses(courses);

    } catch (err) {
        console.error(err);
        container.innerHTML = '<div class="error">Не удалось загрузить курсы</div>';
    }
}

document.addEventListener('DOMContentLoaded', () => loadTeachingCourses());