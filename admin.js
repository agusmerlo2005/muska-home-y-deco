document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginContainer = document.getElementById('login-container');
    const adminPanel = document.getElementById('admin-panel');
    const logoutBtn = document.getElementById('logout-btn');

    // Maneja el login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Aquí definimos el usuario y la contraseña (por ahora, fijos)
        if (username === 'jazmin' && password === 'muska') {
            loginContainer.style.display = 'none';
            adminPanel.style.display = 'block';
            alert('¡Bienvenida, Jazmín!');
        } else {
            alert('Usuario o contraseña incorrectos');
        }
    });

    // Maneja el cierre de sesión
    logoutBtn.addEventListener('click', () => {
        loginContainer.style.display = 'block';
        adminPanel.style.display = 'none';
        alert('Sesión cerrada');
    });

    // Aún no hemos conectado a Supabase, así que la lógica para
    // agregar productos y cargarlos la dejaremos vacía por ahora.
});