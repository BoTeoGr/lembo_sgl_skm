// loginService.js
// Servicio para manejar el login y guardar el token JWT

export async function loginUser(email, password) {
    try {
        const response = await fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // importante para recibir la cookie httpOnly
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

// Refrescar access token usando la cookie httpOnly
export async function refreshAccessToken() {
    const resp = await fetch('http://localhost:5000/refresh-token', {
        method: 'POST',
        credentials: 'include'
    });
    const data = await resp.json();
    if (!resp.ok) {
        throw new Error(data.error || 'No se pudo refrescar el token');
    }
    if (data.token) {
        localStorage.setItem('token', data.token);
    }
    return data.token;
}

// Cerrar sesión limpiando cookie httpOnly en el backend y el token local
export async function logoutUser() {
    try {
        await fetch('http://localhost:5000/logout', {
            method: 'POST',
            credentials: 'include'
        });
    } catch (_) {}
    localStorage.removeItem('token');
    localStorage.removeItem('userRol');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userTelefono');
    localStorage.removeItem('userTipoDoc');
    localStorage.removeItem('userNumDoc');
}

// Helper para obtener el header Authorization, intentando refrescar si no hay token
export async function getAuthHeader() {
    let token = localStorage.getItem('token');
    if (!token) {
        try {
            token = await refreshAccessToken();
        } catch (_) {
            return {};
        }
    }
    return { 'Authorization': `Bearer ${token}` };
}

// Wrapper de fetch que agrega Authorization y maneja 401 refrescando una vez
export async function fetchWithAuth(url, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        ...(await getAuthHeader())
    };
    const firstResp = await fetch(url, {
        ...options,
        headers,
        credentials: options.credentials || 'include'
    });
    if (firstResp.status !== 401) return firstResp;

    // Intentar refrescar una vez y reintentar
    try {
        await refreshAccessToken();
        const retryHeaders = {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
            ...(await getAuthHeader())
        };
        return await fetch(url, {
            ...options,
            headers: retryHeaders,
            credentials: options.credentials || 'include'
        });
    } catch (_) {
        return firstResp; // retornar 401 original si falla refresh
    }
}
