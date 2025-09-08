(() => {
    // Función para verificar si el usuario actual tiene permisos de administrador
    function isAdminUser() {
        try {
            const userRole = localStorage.getItem('userRol');
            if (!userRole) {
                return false;
            }
    
            const isAdmin = [
                'Administrador', 
                'Super administrador', 
                'admin', 
                'superadmin',
                'administrador'
            ].includes(String(userRole).trim().toLowerCase());
    
            return isAdmin;
        } catch (e) {
            console.error('Error verificando rol de administrador');
            return false;
        }
    }
    async function fetchStats() {
        const isAdmin = isAdminUser();
        
        // Si el usuario no es administrador, no intentar cargar datos
        if (!isAdmin) {
            console.log('Usuario sin permisos para ver estadísticas de usuarios');
            return null;
        }

        try {
            // Primero intentar obtener el token de autenticación si existe
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json'
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('http://localhost:5000/usuarios?limit=1000', {
                method: 'GET',
                headers: headers,
                credentials: 'include'
            });

            // Si la respuesta no es exitosa, lanzar un error para manejarlo en el catch
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();
            const usuarios = Array.isArray(data) ? data : (data.usuarios || []);

            const stats = {
                'Super administrador': 0,
                'Administrador': 0,
                'Personal de Apoyo': 0,
                'Visitante': 0,
                total: 0,
                nuevosEstaSemana: 0
            };

            const now = new Date();
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            usuarios.forEach(user => {
                if (user.estado === 'habilitado') {
                    const rol = user.rol || 'Visitante';
                    if (stats.hasOwnProperty(rol)) {
                        stats[rol]++;
                    }
                    stats.total++;

                    const fechaCreacion = new Date(user.fecha_creacion || now);
                    if (fechaCreacion >= oneWeekAgo) {
                        stats.nuevosEstaSemana++;
                    }
                }
            });

            return stats;
        } catch (error) {
            console.warn('No se pudo obtener datos de usuarios:', error.message);
            return null;
        }
    }

    function findUserCard() {
        // Try different selectors to find the user card
        const selectors = [
            '.card',  // Try all cards first
            '.dashboard .card',
            'section .card',
            'main .card'
        ];

        for (const selector of selectors) {
            const cards = document.querySelectorAll(selector);
            for (const card of cards) {
                // Check if this card contains a title with 'Usuarios' text
                const title = card.querySelector('.card__title, .card-header h2, h2');
                if (title && title.textContent.includes('Usuarios')) {
                    return card;
                }
            }
        }
        return null;
    }

    function updateCard(stats) {
        console.log('Updating card with stats:', stats);
        const userCard = findUserCard();
        if (!userCard) {
            console.error('No se encontró el widget de usuarios en la página');
            return;
        }

        // Mostrar el bloque primero (por si estaba oculto)
        userCard.style.display = '';
        
        // Si no hay estadísticas (usuario no autorizado o error)
        if (!stats) {
            const isAdmin = isAdminUser();
            console.log('No stats available. Is admin:', isAdmin);
            
            // Ocultar el bloque de usuarios para usuarios no administradores
            if (!isAdmin) {
                console.log('Ocultando bloque de usuarios para usuario no administrador');
                userCard.style.display = 'none';
            } else {
                console.log('Mostrando bloque de usuarios para administrador');
                // Mostrar mensaje de error para admin
                const errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                errorMsg.textContent = 'No se pudieron cargar las estadísticas de usuarios';
                userCard.querySelector('.card__content').appendChild(errorMsg);
            }
            return;
        }
        

        // Actualizar estadísticas por rol
        const roleElements = userCard.querySelectorAll('.stats-list__item');
        roleElements.forEach(item => {
            const labelEl = item.querySelector('.stats-list__label');
            const numberEl = item.querySelector('.stats-list__number');

            if (labelEl && numberEl) {
                const rol = labelEl.textContent.trim();
                if (stats.hasOwnProperty(rol)) {
                    numberEl.textContent = stats[rol];
                }
            }
        });

        // Actualizar badges con información resumida
        const badges = userCard.querySelectorAll('.badge');
        if (badges.length > 0) {
            badges[0].textContent = `${stats.total} usuarios`;
            if (badges.length > 1) {
                badges[1].textContent = `+${stats.nuevosEstaSemana} nuevos esta semana`;
            }
        }

        // Mostrar mensaje informativo
        const existingMessages = userCard.querySelectorAll('.info-message');
        existingMessages.forEach(msg => msg.remove());
        
        const message = document.createElement('div');
        message.className = 'info-message';
        message.textContent = 'Estadísticas en tiempo real';
        userCard.querySelector('.card__content').appendChild(message);
    }

    async function updateStats() {
        const stats = await fetchStats();
        updateCard(stats);
    }

    function init() {
        // Asegurarse de que el DOM esté completamente cargado
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => initializeWidget());
        } else {
            // Pequeño retraso para asegurar que todos los elementos estén renderizados
            setTimeout(initializeWidget, 100);
        }
    }

    function initializeWidget() {
        // Pequeño retraso para asegurar que el DOM esté listo
        setTimeout(() => {
            // Actualizar inmediatamente
            updateStats();
            
            // Actualizar cada 5 minutos
            setInterval(updateStats, 5 * 60 * 1000);
            
            // Añadir estilos para el mensaje informativo solo si no existen
            if (!document.getElementById('user-widget-styles')) {
                const style = document.createElement('style');
                style.id = 'user-widget-styles';
                style.textContent = `
                    .info-message {
                        padding: 8px 12px;
                        background-color: #f8f9fa;
                        border-radius: 4px;
                        font-size: 0.85rem;
                        color: #6c757d;
                        margin-top: 10px;
                        border-left: 3px solid #ffc107;
                    }
                    .auth-message {
                        padding: 8px 12px;
                        background-color: #e9ecef;
                        border-radius: 4px;
                        font-size: 0.85rem;
                        color: #495057;
                        margin-top: 10px;
                        border-left: 3px solid #6c757d;
                    }
                    @media (max-width: 768px) {
                        .info-message, .auth-message {
                            font-size: 0.75rem;
                        }
                    }
                `;
                document.head.appendChild(style);
            }
        }, 300); // Pequeño retraso para asegurar que todo esté cargado
    }

    // Inicializar el widget
    init();
})();
