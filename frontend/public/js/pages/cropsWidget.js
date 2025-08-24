// Sistema de gestión de estadísticas de cultivos
(async function() {
    // Obtener estadísticas de cultivos
    async function fetchStats() {
        try {
            const response = await fetch('http://localhost:5000/cultivos?limit=1000');
            if (!response.ok) throw new Error('Error al obtener cultivos');
            const data = await response.json();
            // Asegurarnos de obtener el array de cultivos de la respuesta
            const cultivos = data.cultivos || [];
            console.log('Cultivos recibidos:', cultivos); // Para depuración

            console.log('Iniciando conteo de stats...'); // Debug inicial
            
            // Inicializar contadores
            const stats = {
                habilitados: 0,
                deshabilitados: 0,
                total: 0,
                nuevosEstaSemana: 0
            };
            
            console.log('Stats inicializados:', stats); // Debug de inicialización

            // Fecha actual y fecha hace una semana
            const now = new Date();
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

            // Contar cultivos por estado de habilitación
            console.log('Procesando cultivos:', cultivos); // Debug completo

            cultivos.forEach(cultivo => {
                const estadoOriginal = cultivo.estado;
                const estado = estadoOriginal?.toLowerCase() || '';
                const fechaCreacion = new Date(cultivo.fecha_creacion || cultivo.fechaCreacion);
                
                console.log('Estado de cultivo:', { 
                    id: cultivo.id || cultivo.cultivoId,
                    nombre: cultivo.nombre,
                    estadoOriginal, 
                    estadoNormalizado: estado 
                });

                // Verificar el estado usando solo los valores del enum
                if (estado === 'habilitado') {
                    stats.habilitados++;
                } else if (estado === 'deshabilitado') {
                    stats.deshabilitados++;
                }

                // Contar nuevos cultivos de esta semana
                if (fechaCreacion >= oneWeekAgo) {
                    stats.nuevosEstaSemana++;
                }

                stats.total++;
            });

            return stats;
        } catch (error) {
            console.error('Error al obtener estadísticas de cultivos:', error);
            return null;
        }
    }

    // Actualizar la tarjeta de cultivos
    function updateCard(stats) {
        console.log('Actualizando card con stats:', stats); // Debug de stats

        // Encontrar la card de cultivos
        const allCards = document.querySelectorAll('.card');
        let cropsCard = null;
        
        console.log('Buscando entre cards:', allCards.length); // Debug cantidad de cards
        
        allCards.forEach(card => {
            const title = card.querySelector('.card__title');
            console.log('Título de card:', title?.textContent); // Debug títulos
            
            if (title && title.textContent.includes('Vista de Cultivos')) {
                cropsCard = card;
                console.log('Card de cultivos encontrada:', {
                    title: title.textContent,
                    statusItems: card.querySelectorAll('.status-list__item').length,
                    html: card.innerHTML
                });
            }
        });

        if (cropsCard) {
            // Actualizar números en la lista de estados
            const statusItems = cropsCard.querySelectorAll('.status-list__item');
            console.log('Status items encontrados:', statusItems.length); // Debug de items

            statusItems.forEach(item => {
                const indicator = item.querySelector('.status-list__indicator');
                const labelSpan = indicator.querySelector('span:not(.status-list__dot)');
                const label = labelSpan ? labelSpan.textContent.trim() : '';
                // Cambio aquí: buscamos el span que está directamente en status-list__item, no dentro del indicator
                const number = item.children[1]; // El segundo elemento directo del item
                
                console.log('Procesando item:', { 
                    label, 
                    currentValue: number ? number.textContent : null,
                    stats: stats
                }); // Debug detallado

                if (label === 'Habilitados') {
                    number.textContent = stats.habilitados;
                } else if (label === 'Deshabilitados') {
                    number.textContent = stats.deshabilitados;
                }
            });

            // Actualizar badges en el footer
            const badges = cropsCard.querySelectorAll('.badge');
            badges[0].textContent = `+${stats.nuevosEstaSemana} agregados esta semana`;
            badges[1].textContent = `${stats.total} cultivos`;
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
        console.log('DOM Cargado - Iniciando actualización de stats');
        setTimeout(() => {
            updateStats(); // Primera actualización con un pequeño retraso para asegurar que todo está cargado
            console.log('Primera actualización completada');
            setInterval(updateStats, 5 * 60 * 1000); // Actualizar cada 5 minutos
        }, 100);
    });

    // Exportar función para debugging
    window.debugCropsWidget = async () => {
        console.log('Ejecutando actualización manual de stats');
        await updateStats();
    };
})();
