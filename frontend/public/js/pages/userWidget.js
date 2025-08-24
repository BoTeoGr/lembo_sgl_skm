// Sistema de gestión de estadísticas de usuarios
(async function() {
    // Mapeo de roles del sistema a categorías de visualización
    const ROLE_CATEGORIES = {
        'Super administrador': 'Administradores',
        'Administrador': 'Administradores',
        'Personal de Apoyo': 'Técnicos',
        'Personal de apoyo en campo': 'Técnicos',
        'Visitante': 'Usuarios Estándar'
    };

    // Obtener estadísticas de usuarios
    async function fetchStats() {
        try {
            const response = await fetch('http://localhost:5000/usuarios?limit=1000');
            if (!response.ok) throw new Error('Error al obtener usuarios');
            const data = await response.json();
            const usuarios = Array.isArray(data) ? data : (data.usuarios || []);

            // Inicializar contadores
            const stats = {
                administradores: 0,
                estandar: 0,
                tecnicos: 0,
                total: 0
            };

            // Contar solo usuarios habilitados
            usuarios.forEach(user => {
                if (user.estado === 'habilitado') {
                    const mappedRole = ROLE_CATEGORIES[user.rol];
                    if (mappedRole === 'Administradores') {
                        stats.administradores++;
                    } else if (mappedRole === 'Usuarios Estándar') {
                        stats.estandar++;
                    } else if (mappedRole === 'Técnicos') {
                        stats.tecnicos++;
                    }
                    stats.total++;
                }
            });

            return stats;
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            return null;
        }
    }

    // Actualizar la tarjeta de usuarios
    function updateCard(stats) {
        // Encontrar la card de usuarios
        const userCard = document.querySelector('.card__title').textContent.includes('Usuarios')
            ? document.querySelector('.card__title').closest('.card')
            : null;

        if (userCard) {
            // Actualizar números en la lista de estadísticas
            const statsItems = userCard.querySelectorAll('.stats-list__item');
            statsItems.forEach(item => {
                const label = item.querySelector('.stats-list__label').textContent;
                const number = item.querySelector('.stats-list__number');

                if (label === 'Administradores') {
                    number.textContent = stats.administradores;
                } else if (label === 'Usuarios Estándar') {
                    number.textContent = stats.estandar;
                } else if (label === 'Técnicos') {
                    number.textContent = stats.tecnicos;
                }
            });

            // Actualizar badge del total de usuarios
            const totalBadge = userCard.querySelector('.footer-actions .badge:last-child');
            if (totalBadge) {
                totalBadge.textContent = `${stats.total} usuarios`;
            }
        }
    }

    // Función principal de actualización
    async function updateStats() {
        const stats = await fetchStats();
        if (stats) {
            updateCard(stats);
        }
    }

    // Inicializar las actualizaciones automáticas
    document.addEventListener('DOMContentLoaded', () => {
        updateStats(); // Primera actualización
        setInterval(updateStats, 5 * 60 * 1000); // Actualizar cada 5 minutos
    });
})();
