// loginService.js
// Servicio para manejar el login y guardar el token JWT

export async function loginUser(email, password) {
    try {
        const response = await fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userEmail: email, password })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Error al iniciar sesión');
        }
        // Guardar el token y el rol en localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRol', data.usuario.rol);
        localStorage.setItem('userName', data.usuario.nombre);
        return data;
    } catch (error) {
        throw error;
    }
}
