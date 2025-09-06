import jwt from 'jsonwebtoken';

// Middleware generador para verificar roles permitidos
// Middleware to allow either admin or the user themselves to access the route
export function verificarUsuarioPropioOAdmin(rolesAdmin = []) {
    return (req, res, next) => {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta');
            const userId = req.params.id;
            const userRole = decoded.rol?.toLowerCase();
            const isAdmin = rolesAdmin.map(r => r.toLowerCase()).includes(userRole);
            
            // Allow if user is admin or if they're accessing their own profile
            if (isAdmin || decoded.id.toString() === userId) {
                return next();
            }
            
            console.warn('Acceso denegado. No tienes permisos para acceder a este recurso');
            return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
        } catch (error) {
            console.error('Error al verificar token:', error);
            return res.status(401).json({ error: 'Token inválido' });
        }
    };
}

export function verificarRol(rolesPermitidos = []) {
	return (req, res, next) => {
		const authHeader = req.headers['authorization'];
		if (!authHeader) {
			console.warn('Token no proporcionado');
			return res.status(401).json({ error: 'Token no proporcionado' });
		}
		const token = authHeader.split(' ')[1];
		if (!token) {
			console.warn('Token no proporcionado (header presente pero sin token)');
			return res.status(401).json({ error: 'Token no proporcionado' });
		}
		try {
			console.log('Token recibido:', token);
			const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta');
			console.log('Payload decodificado:', decoded);
			const rol = decoded.rol?.toLowerCase();
			console.log('Rol extraído del token:', rol);
			// Si no se especifican rolesPermitidos, deja pasar a cualquiera
			if (rolesPermitidos.length === 0) {
				return next();
			}
			// Permite si el rol está en la lista de permitidos
			if (rolesPermitidos.map(r => r.toLowerCase()).includes(rol)) {
				return next();
			}
			console.warn('Acceso denegado. Rol no permitido:', rol, 'Permitidos:', rolesPermitidos);
			return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
		} catch (err) {
			console.error('Error al verificar token:', err);
			return res.status(401).json({ error: 'Token inválido' });
		}
	};
}
