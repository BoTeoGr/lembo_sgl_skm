(() => {
    async function fetchStats() {
        try {
            const response = await fetch('http://localhost:5000/usuarios?limit=1000');
            if (!response.ok) throw new Error('Error al obtener usuarios');
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
                    const rol = user.rol;
                    if (stats.hasOwnProperty(rol)) {
                        stats[rol]++;
                    }
                    stats.total++;

                    const fechaCreacion = new Date(user.fecha_creacion);
                    if (fechaCreacion >= oneWeekAgo) {
                        stats.nuevosEstaSemana++;
                    }
                }
            });

            return stats;
        } catch (error) {
            return null;
        }
    }

    function updateCard(stats) {
        if (!stats) return;
        
        const titles = document.querySelectorAll('.card__title');
        let userCard = null;
        
        titles.forEach(title => {
            if (title.textContent.includes('Usuarios')) {
                userCard = title.closest('.card');
            }
        });

        if (userCard) {
            const items = userCard.querySelectorAll('.stats-list__item');

            items.forEach(item => {
                const labelEl = item.querySelector('.stats-list__label');
                const numberEl = item.querySelector('.stats-list__number');

                if (labelEl && numberEl) {
                    const rol = labelEl.textContent;
                    if (stats.hasOwnProperty(rol)) {
                        numberEl.textContent = stats[rol];
                    }
                }
            });

            const badges = userCard.querySelectorAll('.badge');
            if (badges.length >= 2) {
                badges[0].textContent = `+${stats.nuevosEstaSemana} nuevos esta semana`;
                badges[1].textContent = `${stats.total} usuarios`;
            }
        }
    }

    async function updateStats() {
        const stats = await fetchStats();
        updateCard(stats);
    }

    function init() {
        updateStats();
        setInterval(updateStats, 5 * 60 * 1000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
