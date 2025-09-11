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
        
        // Verificar si el usuario está habilitado
        const userStatus = data.usuario.estado || data.usuario.status || data.usuario.estado_usuario;
        if (userStatus && userStatus.toString().toLowerCase() !== 'habilitado') {
            throw new Error('Este usuario está deshabilitado. Por favor contacte al administrador.');
        }
        
        // Guardar el token y datos básicos del usuario en localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRol', data.usuario.rol);
        localStorage.setItem('userName', data.usuario.nombre);
        // Intentar guardar el id/código del usuario para consultas posteriores
        try {
            if (data.usuario) {
                const u = data.usuario;
                const possibleId = u.id || u._id || u.usuario_id || u.userId || u.codigo;
                if (possibleId) {
                    localStorage.setItem('userId', possibleId);
                }
            }
        } catch (_) { /* noop */ }
        // Guardar campos adicionales usados por el modal de perfil (si el backend los entrega)
        try {
            if (data.usuario) {
                const u = data.usuario;
                if (u.correo || u.email || u.userEmail) {
                    localStorage.setItem('userEmail', u.correo || u.email || u.userEmail);
                }
                if (u.telefono || u.phone) {
                    localStorage.setItem('userTelefono', u.telefono || u.phone);
                }
                if (u.tipo_documento || u.tipoDoc || u.tipoDocumento) {
                    localStorage.setItem('userTipoDoc', u.tipo_documento || u.tipoDoc || u.tipoDocumento);
                }
                if (u.numero_documento || u.numDoc || u.documento) {
                    localStorage.setItem('userNumDoc', u.numero_documento || u.numDoc || u.documento);
                }
            }
        } catch (_) { /* noop */ }
        return data;
    } catch (error) {
        throw error;
    }
}
