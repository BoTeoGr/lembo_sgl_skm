import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Configuración del transporte de correo
console.log('Configurando transporte de correo con usuario:', process.env.EMAIL_USER);
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Verificar la conexión del transporte
transporter.verify(function(error, success) {
    if (error) {
        console.error('Error al verificar el transporte de correo:', error);
    } else {
        console.log('Servidor de correo listo para enviar mensajes');
    }
});

// Generar código de recuperación
function generateRecoveryCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Almacenamiento temporal de códigos de recuperación (en producción, usa una base de datos)
const recoveryCodes = new Map();

// Solicitar recuperación de contraseña
export function solicitarRecuperacionContrasena(req, res) {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ error: 'El correo electrónico es requerido' });
    }

    // Verificar si el correo existe
    db.query('SELECT id, nombre FROM usuarios WHERE correo = ?', [email], (err, results) => {
        if (err) {
            console.error('Error al buscar usuario:', err);
            return res.status(500).json({ error: 'Error al procesar la solicitud' });
        }

        if (results.length === 0) {
            // Por seguridad, no revelamos si el correo existe o no
            return res.status(200).json({ message: 'Si el correo existe, se ha enviado un código de recuperación' });
        }

        const usuario = results[0];
        const codigo = generateRecoveryCode();
        const expiracion = Date.now() + 15 * 60 * 1000; // 15 minutos de expiración

        // Guardar el código de recuperación
        recoveryCodes.set(email, { codigo, expiracion, usuarioId: usuario.id });

        // Configurar el correo
        const mailOptions = {
            from: process.env.EMAIL_USER || 'tu_correo@gmail.com',
            to: email,
            subject: 'Código de recuperación de contraseña',
            text: `Hola ${usuario.nombre},\n\nTu código de recuperación es: ${codigo}\n\nEste código expirará en 15 minutos.`,
            html: `
                <h2>Recuperación de contraseña</h2>
                <p>Hola ${usuario.nombre},</p>
                <p>Hemos recibido una solicitud para restablecer tu contraseña. Utiliza el siguiente código para continuar:</p>
                <h3 style="background: #f0f0f0; padding: 10px; display: inline-block; border-radius: 5px;">${codigo}</h3>
                <p>Este código expirará en 15 minutos.</p>
                <p>Si no has solicitado este cambio, por favor ignora este mensaje.</p>
            `
        };

        // Enviar el correo
        console.log('Enviando correo a:', email);
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error detallado al enviar correo:', {
                    message: error.message,
                    code: error.code,
                    response: error.response,
                    stack: error.stack
                });
                return res.status(500).json({ 
                    error: 'Error al enviar el correo de recuperación',
                    details: error.message
                });
            }
            console.log('Correo enviado:', info.messageId);
            res.status(200).json({ message: 'Si el correo existe, se ha enviado un código de recuperación' });
        });
    });
}

// Verificar código de recuperación
export function verificarCodigoRecuperacion(req, res) {
    const { email, codigo } = req.body;

    if (!email || !codigo) {
        return res.status(400).json({ error: 'Correo y código son requeridos' });
    }

    const datosRecuperacion = recoveryCodes.get(email);
    
    if (!datosRecuperacion) {
        return res.status(400).json({ error: 'Código inválido o expirado' });
    }

    if (datosRecuperacion.expiracion < Date.now()) {
        recoveryCodes.delete(email);
        return res.status(400).json({ error: 'El código ha expirado' });
    }

    if (datosRecuperacion.codigo !== codigo) {
        return res.status(400).json({ error: 'Código incorrecto' });
    }

    // Generar token para restablecer contraseña (válido por 15 minutos)
    const token = jwt.sign(
        { email, usuarioId: datosRecuperacion.usuarioId },
        process.env.JWT_SECRET || 'tu_clave_secreta',
        { expiresIn: '15m' }
    );

    // Eliminar el código de recuperación ya que ya fue usado
    recoveryCodes.delete(email);

    res.status(200).json({ 
        message: 'Código verificado correctamente',
        token 
    });
}

// Restablecer contraseña
export function restablecerContrasena(req, res) {
    const { token, nuevaContrasena } = req.body;

    if (!token || !nuevaContrasena) {
        return res.status(400).json({ error: 'Token y nueva contraseña son requeridos' });
    }

    try {
        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta');
        
        // Hashear la nueva contraseña
        bcrypt.hash(nuevaContrasena, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Error al hashear la contraseña:', err);
                return res.status(500).json({ error: 'Error al procesar la contraseña' });
            }

            // Actualizar la contraseña en la base de datos
            db.query(
                'UPDATE usuarios SET password = ? WHERE id = ?',
                [hashedPassword, decoded.usuarioId],
                (err, result) => {
                    if (err) {
                        console.error('Error al actualizar la contraseña:', err);
                        return res.status(500).json({ error: 'Error al actualizar la contraseña' });
                    }
                    
                    if (result.affectedRows === 0) {
                        return res.status(404).json({ error: 'Usuario no encontrado' });
                    }

                    res.status(200).json({ message: 'Contraseña actualizada exitosamente' });
                }
            );
        });
    } catch (error) {
        console.error('Error al verificar el token:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ error: 'El enlace ha expirado, por favor solicita otro' });
        }
        res.status(400).json({ error: 'Token inválido' });
    }
}

// Login de usuario con JWT
export function loginUsuario(req, res) {
    const { userEmail, password } = req.body;
    if (!userEmail || !password) {
        return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
    }
    // Buscar usuario por correo
    db.query('SELECT * FROM usuarios WHERE correo = ?', [userEmail], (err, results) => {
        if (err) {
            console.error('Error al buscar usuario:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        if (results.length === 0) {
            return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }
        
        const usuario = results[0];
        
        // Verificar si el usuario está habilitado
        if (usuario.estado && usuario.estado.toLowerCase() !== 'habilitado') {
            return res.status(403).json({ 
                error: 'Este usuario está deshabilitado. Por favor contacte al administrador.' 
            });
        }
        
        // Verificar contraseña
        bcrypt.compare(password, usuario.password, (err, isMatch) => {
            if (err) {
                console.error('Error al comparar contraseña:', err);
                return res.status(500).json({ error: 'Error interno del servidor' });
            }
            if (!isMatch) {
                return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
            }
            // Generar Access Token (corto) y Refresh Token (largo)
            const accessToken = jwt.sign(
                { id: usuario.id, correo: usuario.correo, rol: usuario.rol },
                process.env.JWT_SECRET || 'tu_clave_secreta',
                { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
            );

            const refreshToken = jwt.sign(
                { id: usuario.id },
                process.env.REFRESH_TOKEN_SECRET || (process.env.JWT_SECRET || 'tu_clave_secreta') + '_refresh',
                { expiresIn: process.env.JWT_REFRESH_EXPIRES || '30d' }
            );

            // Configurar cookie httpOnly para refresh token
            const isProd = (process.env.NODE_ENV === 'production');
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: isProd,
                sameSite: isProd ? 'strict' : 'lax',
                path: '/',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 días
            });

            res.status(200).json({
                token: accessToken,
                usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol }
            });
        });
    });
}
import db from './../db/config.db.js'
import bcrypt from 'bcryptjs';

// Función para obtener usuarios con paginación
export function VerUsuarios(req, res) {
    try {
        // Obtener los parámetros de paginación desde la solicitud
        const { page = 1, limit = 6 } = req.query;

        // Convertir los parámetros a números
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);

        // Validar los parámetros
        if (isNaN(pageNumber) || pageNumber < 1) {
            return res.status(400).json({ error: 'El parámetro "page" debe ser un número mayor o igual a 1' });
        }
        if (isNaN(limitNumber) || limitNumber < 1) {
            return res.status(400).json({ error: 'El parámetro "limit" debe ser un número mayor o igual a 1' });
        }

        // Calcular el índice inicial para la consulta
        const offset = (pageNumber - 1) * limitNumber;

        // Consulta para obtener los usuarios con paginación
        const query = 'SELECT * FROM usuarios LIMIT ? OFFSET ?';
        const countQuery = 'SELECT COUNT(*) AS total FROM usuarios';

        // Obtener el total de usuarios
        db.query(countQuery, (err, countResults) => {
            if (err) {
                console.error('Error al contar usuarios:', err);
                return res.status(500).json({ error: 'Error al contar usuarios' });
            }

            const totalUsuarios = countResults[0].total;
            const totalPages = Math.ceil(totalUsuarios / limitNumber);

            // Obtener los usuarios con paginación
            db.query(query, [limitNumber, offset], (err, results) => {
                if (err) {
                    console.error('Error al obtener usuarios:', err);
                    return res.status(500).json({ error: 'Error al obtener usuarios' });
                }

                // Responder con los datos paginados
                res.status(200).json({
                    usuarios: results,
                    totalUsuarios,
                    totalPages,
                    currentPage: pageNumber,
                });
            });
        });
    } catch (error) {
        console.error('Error en VerUsuarios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}


export function crearUsuario(req, res){
    try{
        const { userTypeId, userName, userId, userTel, userEmail, userRol, estado, password } = req.body;
        console.log(req.body);

        // Validar que el estado sea válido
        if (estado !== "habilitado" && estado !== "deshabilitado") {
            return res.status(400).json({ error: "Estado no válido" });
        }

        // Bloquear el envío si el estado es "deshabilitado"
        if (estado === "deshabilitado") {
            return res.status(400).json({ error: "No se puede crear un usuario con el estado 'deshabilitado'" });
        }

        // Validar que el correo no exista
        db.query('SELECT id FROM usuarios WHERE correo = ?', [userEmail], (err, results) => {
            if (err) {
                console.error('Error al buscar correo:', err);
                return res.status(500).json({ error: 'Error al validar el correo' });
            }
            if (results.length > 0) {
                return res.status(409).json({ error: 'El usuario ya existe con ese correo electrónico' });
            }
            // Hashear la contraseña
            bcrypt.hash(password, 10, (err, hashedPassword) => {
                if (err) {
                    console.error('Error al hashear la contraseña:', err);
                    return res.status(500).json({ error: 'Error al procesar la contraseña' });
                }
                db.query(`INSERT INTO usuarios (tipo_documento, numero_documento, nombre, telefono, correo, rol, estado, fecha_creacion, password)  
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [userTypeId, userId, userName, userTel, userEmail, userRol, estado, new Date(), hashedPassword],
                    (err, results) => {
                        if (err) {
                            console.error('Error al insertar usuario:', err.message);
                            return res.status(500).json({ error: 'Error desconocido al crear el usuario' });
                        }
                        res.status(201).json({ message: 'Usuario creado correctamente', userId: results.insertId });
                    }
                );
            });
        });
        console.log('Intento de creación de usuario');
    }catch(err){
        console.error(err);
        res.status(500).json({error: 'error desconocido'});
    }
}

export function obtenerUsuarioActual(req, res) {
    try {
        // Aquí deberías obtener el ID del usuario de la sesión o token
        // Por ahora, vamos a asumir que tienes una sesión activa
        const userId = req.session.userId; // Esto dependerá de tu implementación de autenticación

        if (!userId) {
            return res.status(401).json({ error: 'No hay usuario autenticado' });
        }

        db.query('SELECT id FROM usuarios WHERE id = ?', [userId], (err, results) => {
            if (err) {
                console.error('Error al obtener usuario:', err);
                return res.status(500).json({ error: 'Error al obtener usuario' });
            }
            
            if (results.length === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.status(200).json({ userId });
        });
    } catch (error) {
        console.error('Error en obtenerUsuarioActual:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// Obtener usuario por id
export function obtenerUsuarioPorId(req, res) {
    const { id } = req.params;
    db.query('SELECT * FROM usuarios WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error al obtener usuario por id:', err);
            return res.status(500).json({ error: 'Error al obtener usuario' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        res.status(200).json(results[0]);
    });
}

// Cambia el estado de un usuario (habilitado/deshabilitado)
// Solo Super Administradores pueden modificar estados
export function actualizarEstadoUsuario(req, res) {
    try {
        console.log('User object from token:', req.user);
        const userRole = req.user?.rol;
        console.log('User role from token (raw):', userRole);
        
        // Verificar si el usuario que hace la petición es Super Administrador
        const normalizedRole = userRole?.toLowerCase().trim();
        console.log('Normalized role:', normalizedRole);
        
        if (!req.user || (normalizedRole !== 'superadmin' && normalizedRole !== 'super administrador')) {
            console.log('Access denied - User role does not have permission');
            return res.status(403).json({ 
                error: 'No tiene permisos para modificar el estado de los usuarios',
                debug: {
                    userRole: userRole,
                    normalizedRole: normalizedRole,
                    hasPermission: false
                }
            });
        }

        const { id } = req.params;
        let { estado } = req.body;
        
        if (!id || !estado) {
            return res.status(400).json({ error: 'ID y estado son requeridos' });
        }

        // Verificar que el usuario existe
        db.query('SELECT rol FROM usuarios WHERE id = ?', [id], (err, results) => {
            if (err) {
                console.error('Error al verificar usuario:', err);
                return res.status(500).json({ error: 'Error al verificar usuario' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            const usuario = results[0];
            const targetUserRole = usuario.rol?.toLowerCase().trim();
            const isTargetSuperAdmin = targetUserRole === 'superadmin' || targetUserRole === 'super administrador';
            
            // Verificar si el usuario actual es Super Administrador (manejar diferentes formatos)
            const currentUserRole = req.user.rol?.toLowerCase().trim();
            const isCurrentUserSuperAdmin = currentUserRole === 'superadmin' || currentUserRole === 'super administrador';
            
            // Si el usuario actual no es Super Administrador, no puede modificar a nadie
            if (!isCurrentUserSuperAdmin) {
                return res.status(403).json({ 
                    error: 'Solo un Super Administrador puede modificar el estado de los usuarios' 
                });
            }
            
            // Un Super Administrador no puede deshabilitar a otro Super Administrador
            if (isTargetSuperAdmin && estado === 'deshabilitado') {
                return res.status(403).json({ 
                    error: 'No puedes deshabilitar a otro Super Administrador' 
                });
            }

            estado = (estado === 'habilitado') ? 'habilitado' : 'deshabilitado';
            const query = 'UPDATE usuarios SET estado = ? WHERE id = ?';
            
            db.query(query, [estado, id], (err, result) => {
                if (err) {
                    console.error('Error al actualizar estado de usuario:', err);
                    return res.status(500).json({ error: 'Error al actualizar estado de usuario' });
                }
                res.status(200).json({ message: 'Estado actualizado correctamente' });
            });
        });
    } catch (error) {
        console.error('Error en actualizarEstadoUsuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

// Actualizar usuario por id
export function actualizarUsuario(req, res) {
    const { id } = req.params;
    const { tipo_documento, nombre, numero_documento, telefono, correo, rol, estado, password } = req.body;

    if (!id || !tipo_documento || !nombre || !numero_documento || !telefono || !correo || !rol) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    
    // Normalizar el rol del usuario (case-insensitive y manejo de espacios)
    const normalizeRole = (role) => {
        if (!role) return '';
        return role.toString().toLowerCase().replace(/\s+/g, ' ').trim();
    };
    
    const userRole = normalizeRole(req.user?.rol);
    const isSuperAdmin = ['superadmin', 'super administrador', 'superadministrador'].includes(userRole);
    
    console.log('Rol normalizado:', userRole, 'Es super admin:', isSuperAdmin);
    
    console.log('User role in update:', userRole, 'Is super admin:', isSuperAdmin);
    
    // Si se está intentando modificar el estado, verificar permisos de Super Administrador
    if (estado) {
        if (!isSuperAdmin) {
            console.warn('Intento de modificar estado sin permisos de Super Administrador');
            return res.status(403).json({ 
                error: 'Solo los Super Administradores pueden modificar el estado de los usuarios' 
            });
        }
        // Si es Super Admin, asegurarse de que el rol no sea modificado a uno superior
        if (rol && rol.toLowerCase() !== 'super administrador' && rol.toLowerCase() !== 'superadmin') {
            return res.status(403).json({
                error: 'No se puede cambiar el rol de un Super Administrador a un rol inferior'
            });
        }
    }

    // Construir la consulta base
    let query = 'UPDATE usuarios SET tipo_documento = ?, nombre = ?, numero_documento = ?, telefono = ?, correo = ?, rol = ?';
    const values = [tipo_documento, nombre, numero_documento, telefono, correo, rol];
    
    // Si es superadmin y se proporcionó un estado, incluirlo en la actualización
    if (isSuperAdmin && estado) {
        query += ', estado = ?';
        values.push(estado);
    }

    // Si se proporciona una nueva contraseña, agregarla a la actualización
    if (password) {
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Error al hashear contraseña:', err);
                return res.status(500).json({ error: 'Error al procesar la contraseña' });
            }

            query += ', password = ?';
            values.push(hashedPassword);
            
            // Agregar el ID al final
            query += ' WHERE id = ?';
            values.push(id);

            db.query(query, values, (err, result) => {
                if (err) {
                    console.error('Error al actualizar usuario:', err);
                    return res.status(500).json({ error: 'Error al actualizar usuario' });
                }
                res.status(200).json({ message: 'Usuario actualizado correctamente' });
            });
        });
    } else {
        // Si no se proporciona contraseña, solo actualizar los otros campos
        query += ' WHERE id = ?';
        values.push(id);

        db.query(query, values, (err, result) => {
            if (err) {
                console.error('Error al actualizar usuario:', err);
                return res.status(500).json({ error: 'Error al actualizar usuario' });
            }
            res.status(200).json({ message: 'Usuario actualizado correctamente' });
        });
    }
}

// =====================
//  Refresh & Logout
// =====================

export function refreshAccessToken(req, res) {
    try {
        const tokenFromCookie = req.cookies?.refreshToken;
        if (!tokenFromCookie) {
            return res.status(401).json({ error: 'Refresh token no proporcionado' });
        }

        const payload = jwt.verify(
            tokenFromCookie,
            process.env.REFRESH_TOKEN_SECRET || (process.env.JWT_SECRET || 'tu_clave_secreta') + '_refresh'
        );

        const newAccessToken = jwt.sign(
            { id: payload.id, correo: payload.correo, rol: payload.rol },
            process.env.JWT_SECRET || 'tu_clave_secreta',
            { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15s' }
        );

        const newRefreshToken = jwt.sign(
            { id: payload.id },
            process.env.REFRESH_TOKEN_SECRET || (process.env.JWT_SECRET || 'tu_clave_secreta') + '_refresh',
            { expiresIn: process.env.JWT_REFRESH_EXPIRES || '30d' }
        );

        const isProd = (process.env.NODE_ENV === 'production');
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'strict' : 'lax',
            path: '/',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({ token: newAccessToken });
    } catch (error) {
        if (error?.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Refresh token expirado' });
        }
        return res.status(401).json({ error: 'Refresh token inválido' });
    }
}

export function logoutUsuario(req, res) {
    const isProd = (process.env.NODE_ENV === 'production');
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'strict' : 'lax',
        path: '/'
    });
    return res.status(200).json({ message: 'Sesión cerrada' });
}
