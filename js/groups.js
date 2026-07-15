// ==================== группы ====================
let isAdmin = false;
let currentEditId = null;

async function loadGroups() {
    const token = getToken();
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/groups`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const groups = await response.json();

        await checkIsAdmin();

        renderGroups(groups);

    } catch (err) {
        showToast("Ошибка загрузки групп");
    }
}

async function checkIsAdmin() {
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
            isAdmin = false;
        } else if (res.ok) {
            isAdmin = true;

            const data = await res.json();
            await fetch(`${API_BASE}/groups/${data.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        }

    } catch {
        isAdmin = false;
    }

    const actions = document.getElementById('groupsActions');
    if (!isAdmin && actions) actions.style.display = 'none';
}

function renderGroups(groups) {
    const container = document.getElementById('groupsList');
    container.innerHTML = '';

    groups.forEach(group => {
        const item = document.createElement('div');
        item.className = 'group-item';

        let actionsHTML = '';

        if (isAdmin) {
            actionsHTML = `
                <button onclick="editGroup('${group.id}', '${escapeHtml(group.name)}')" class="btn btn-secondary">Редактировать</button>
                <button onclick="deleteGroup('${group.id}')" class="btn btn-danger">Удалить</button>
            `;
        }

        const nameClass = isAdmin ? 'group-item__name group-item__name--admin' : 'group-item__name';

        item.innerHTML = `
            <div class="group-item__content">
                <span class="${nameClass}" onclick="openGroup('${group.id}')">
                    ${escapeHtml(group.name)}
                </span>
                <div class="group-item__actions">
                    ${actionsHTML}
                </div>
            </div>
        `;

        container.appendChild(item);
    });
}

function openGroup(id) {
    window.location.href = `group-courses.html?id=${id}`;
}

// ==================== crud групп ====================
function openCreateModal() {
    currentEditId = null;
    document.getElementById('modalTitle').textContent = 'Создание группы';
    document.getElementById('groupNameInput').value = '';
    openModal();
}

function editGroup(id, name) {
    currentEditId = id;
    document.getElementById('modalTitle').textContent = 'Редактирование группы';
    document.getElementById('groupNameInput').value = name;
    openModal();
}

async function saveGroup() {
    const name = document.getElementById('groupNameInput').value.trim();
    const token = getToken();

    if (!name) {
        showToast("Введите название");
        return;
    }

    try {
        let response;

        if (currentEditId) {
            response = await fetch(`${API_BASE}/groups/${currentEditId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name })
            });
        } else {
            response = await fetch(`${API_BASE}/groups`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name })
            });
        }

        if (!response.ok) throw new Error();

        closeModal();
        showToast("Успешно");

        loadGroups();

    } catch {
        showToast("Ошибка");
    }
}

async function deleteGroup(id) {
    if (!confirm("Удалить группу?")) return;

    const token = getToken();

    try {
        const res = await fetch(`${API_BASE}/groups/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error();

        showToast("Удалено");
        loadGroups();

    } catch {
        showToast("Ошибка удаления");
    }
}

function openModal() {
    document.getElementById('groupModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('groupModal').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    const groupsList = document.getElementById('groupsList');
    if (groupsList) {
        loadGroups();

        document.getElementById('createGroupBtn')?.addEventListener('click', openCreateModal);
        document.getElementById('modalSaveBtn')?.addEventListener('click', saveGroup);
        document.getElementById('modalCancelBtn')?.addEventListener('click', closeModal);
        document.querySelector('.modal__close')?.addEventListener('click', closeModal);
    }
});