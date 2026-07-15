class ToastSystem {
    constructor() {
        this.toasts = [];
        this.initContainer();
    }

    initContainer() {
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        this.container = container;
    }

    ensureContainer() {
        if (!this.container || !document.body.contains(this.container)) {
            this.initContainer();
        }
    }

    createToast(type, title, message) {
        if (!message || message.trim() === '') {
            return;
        }
        
        this.ensureContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let iconSvg;
        
        if (type === 'success') {
            iconSvg = `
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 25.6667C20.4433 25.6667 25.6666 20.4433 25.6666 14C25.6666 7.55669 20.4433 2.33334 14 2.33334C7.55666 2.33334 2.33331 7.55669 2.33331 14C2.33331 20.4433 7.55666 25.6667 14 25.6667Z" fill="#198754"/>
                    <path d="M19.8333 11.0833L14 18.0833L10.5 14.5833" stroke="white" stroke-width="2.68333" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>`;
        } else if (type === 'error') {
            iconSvg = `
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 25.6667C20.4433 25.6667 25.6666 20.4433 25.6666 14C25.6666 7.55667 20.4433 2.33333 14 2.33333C7.55666 2.33333 2.33331 7.55667 2.33331 14C2.33331 20.4433 7.55666 25.6667 14 25.6667Z" fill="#dc3545"/>
                    <path d="M17.5 10.5L10.5 17.5M10.5 10.5L17.5 17.5" stroke="white" stroke-width="2.56667" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>`;
        } else if (type === 'info') {
            iconSvg = `
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 25.6667C20.4433 25.6667 25.6666 20.4433 25.6666 14C25.6666 7.55669 20.4433 2.33334 14 2.33334C7.55666 2.33334 2.33331 7.55669 2.33331 14C2.33331 20.4433 7.55666 25.6667 14 25.6667Z" fill="#0d6efd"/>
                    <path d="M14 12.8333V17.5M14 9.33333V9.91666" stroke="white" stroke-width="2.56667" stroke-linecap="round"/>
                </svg>`;
        } else {
            iconSvg = `
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 25.6667C20.4433 25.6667 25.6666 20.4433 25.6666 14C25.6666 7.55669 20.4433 2.33334 14 2.33334C7.55666 2.33334 2.33331 7.55669 2.33331 14C2.33331 20.4433 7.55666 25.6667 14 25.6667Z" fill="#ffc107"/>
                    <path d="M14 12.8333V17.5M14 9.33333V9.91666" stroke="white" stroke-width="2.56667" stroke-linecap="round"/>
                </svg>`;
        }

        toast.innerHTML = `
            <div class="toast__icon">
                ${iconSvg}
            </div>
            <div class="toast__content">
                <div class="toast__title">${this.escapeHtml(title)}</div>
                <div class="toast__message">${this.escapeHtml(message)}</div>
            </div>
            <div class="toast__close-container">
                <button class="toast__close"></button>
            </div>
        `;

        this.container.appendChild(toast);
        this.toasts.push(toast);

        const closeBtn = toast.querySelector('.toast__close');
        closeBtn.addEventListener('click', () => this.removeToast(toast));

        const autoRemoveTimeout = setTimeout(() => {
            this.removeToast(toast);
        }, 4000);

        toast.autoRemoveTimeout = autoRemoveTimeout;
        
        return toast;
    }

    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    removeToast(toast) {
        if (!toast || !toast.parentNode) return;

        clearTimeout(toast.autoRemoveTimeout);
        
        const index = this.toasts.indexOf(toast);
        if (index > -1) {
            this.toasts.splice(index, 1);
        }

        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }
}

const toastSystem = new ToastSystem();

function showToast(message, type = 'info') {
    if (!message || message.trim() === '') {
        return;
    }
    
    let title;
    if (type === 'success') {
        title = 'Успешно!';
    } else if (type === 'error') {
        title = 'Ошибка!';
    } else if (type === 'warning') {
        title = 'Внимание!';
    } else {
        title = 'Информация';
    }
    
    toastSystem.createToast(type, title, message);
}