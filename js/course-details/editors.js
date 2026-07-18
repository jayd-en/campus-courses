export function initSingleEditor(editorId) {
    const editor = document.getElementById(editorId);
    if (!editor) return;

    if (editor.innerText.trim() === '') editor.innerHTML = '';

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
                    if (url) document.execCommand('createLink', false, url);
                } else if (command === 'insertImage') {
                    const url = prompt('Введите URL изображения:', 'https://');
                    if (url) document.execCommand('insertImage', false, url);
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

    const resizeHandle = container?.querySelector('.editor-resize');
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
                if (newHeight > 80) editor.style.height = newHeight + 'px';
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
}

export function initEditEditors() {
    ['editRequirementsEditor', 'editAnnotationsEditor'].forEach(initSingleEditor);
}

export function initAdminEditEditors() {
    ['adminRequirementsEditor', 'adminAnnotationsEditor'].forEach(initSingleEditor);
}