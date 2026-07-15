// ==================== профиль ====================
async function loadProfile() {
    const token = getToken();
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        document.getElementById('fullName').value = data.fullName || '';
        document.getElementById('emailDisplay').textContent = data.email || '';

        if (data.birthDate) {
            document.getElementById('birthDate').value = formatDate(new Date(data.birthDate));
        }

    } catch (err) {
        alert(err.message);
    }
}

async function handleProfileSubmit(event) {
    event.preventDefault();

    const token = getToken();
    const fullName = document.getElementById('fullName').value.trim();
    const birthDateRaw = document.getElementById('birthDate').value.trim();

    let birthDateISO = null;

    if (birthDateRaw) {
        const [day, month, year] = birthDateRaw.split('.');
        birthDateISO = new Date(`${year}-${month}-${day}T00:00:00.000Z`).toISOString();
    }

    try {
        const response = await fetch(`${API_BASE}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ fullName, birthDate: birthDateISO })
        });

        const data = await response.json();

        document.getElementById('fullName').value = data.fullName;

        if (data.birthDate) {
            document.getElementById('birthDate').value = formatDate(new Date(data.birthDate));
        }

        alert("Сохранено");

    } catch (err) {
        alert(err.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        loadProfile();
        profileForm.addEventListener('submit', handleProfileSubmit);
    }
});