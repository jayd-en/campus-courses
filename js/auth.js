// ==================== авторизация(логин) ====================
async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email')?.value;
    const password = document.getElementById('password')?.value;

    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            throw new Error('Неверный email или пароль');
        }

        const data = await response.json();

        setToken(data.token);
        window.location.href = 'index.html';

    } catch (err) {
        alert(err.message);
    }
}

// ==================== регистрация ====================
async function handleRegistration(event) {
    event.preventDefault();

    const fullName = document.getElementById('fullName')?.value.trim();
    const birthDateRaw = document.getElementById('birthDate')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;

    if (!fullName || !birthDateRaw || !email || !password || !confirmPassword) {
        alert("Заполните все поля");
        return;
    }

    if (password !== confirmPassword) {
        alert("Пароли не совпадают");
        return;
    }

    const [day, month, year] = birthDateRaw.split('.');
    if (!day || !month || !year) {
        alert("Дата рождения неверного формата");
        return;
    }

    const birthDateISO = new Date(`${year}-${month}-${day}T00:00:00.000Z`).toISOString();

    try {
        const response = await fetch(`${API_BASE}/registration`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullName,
                birthDate: birthDateISO,
                email,
                password,
                confirmPassword
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Ошибка регистрации");
        }

        const data = await response.json();
        setToken(data.token);

        window.location.href = 'index.html';

    } catch (err) {
        alert(err.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) registrationForm.addEventListener('submit', handleRegistration);
});