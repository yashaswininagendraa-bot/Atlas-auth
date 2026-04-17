document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const authBtn = document.getElementById('authBtn');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const terminalId = document.getElementById('username').value;
        const secureKey = document.getElementById('password').value;
        const role = document.getElementById('role').value;

        if (!terminalId || !secureKey || !role) {
            return;
        }

        // Simulate authentication
        authBtn.disabled = true;
        authBtn.textContent = 'AUTHENTICATING...';
        authBtn.style.opacity = '0.7';

        // Add a slight delay for realism
        setTimeout(() => {
            console.log(`Auth successful: ${terminalId} as ${role}`);
            
            // Redirect based on role
            if (role === 'Engineer') {
                window.location.href = 'engineer.html';
            } else if (role === 'Technician') {
                window.location.href = 'technician.html';
            }
        }, 1800);
    });

    // Add focus effects for icons
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        const wrapper = input.closest('.input-wrapper');
        const icon = wrapper ? wrapper.querySelector('.input-icon') : null;

        input.addEventListener('focus', () => {
            if (icon) icon.style.color = 'var(--text-primary)';
            input.style.borderColor = 'var(--text-muted)';
        });

        input.addEventListener('blur', () => {
            if (icon) icon.style.color = 'var(--text-muted)';
            input.style.borderColor = 'var(--border-color)';
        });
    });
});
