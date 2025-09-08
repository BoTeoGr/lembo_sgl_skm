async function fetchSensorsStats() {
    try {
        // Obtener estadísticas de sensores desde la API pública
        const response = await fetch('http://localhost:5000/api/widgets/sensors');
        if (!response.ok) throw new Error('Error al obtener estadísticas de sensores');
        
        const stats = await response.json();
        
        // Formatear los datos para la interfaz
        const formattedStats = {
            total: stats.total || 0,
            habilitados: stats.enabled || 0,
            deshabilitados: stats.disabled || 0
        };

        // Actualizar la tarjeta con las estadísticas
        updateSensorCard(formattedStats);
    } catch (error) {
        console.error('Error al cargar estadísticas de sensores:', error);
        // Mostrar mensaje de error en la interfaz
        const sensorCard = Array.from(document.querySelectorAll('.card__title'))
            .find(el => el.textContent.includes('Sensores'))
            ?.closest('.card');
            
        if (sensorCard) {
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.textContent = 'No se pudieron cargar los datos de sensores';
            errorElement.style.color = '#dc3545';
            errorElement.style.padding = '10px';
            sensorCard.querySelector('.card__content').prepend(errorElement);
        }
    }
}

function updateSensorCard(stats) {
    // Actualizar el contador total
    const sensorCard = Array.from(document.querySelectorAll('.card__title')).find(el => el.textContent.includes('Sensores'));
    const subtitleElement = sensorCard?.nextElementSibling;
    if (subtitleElement) {
        subtitleElement.textContent = `${stats.total} items`;
    }

    // Actualizar los contadores por estado
    const statusItems = document.querySelectorAll('.status-list__item');
    statusItems.forEach(item => {
        // Buscar el span de texto (el segundo span dentro de status-list__indicator)
        const spans = item.querySelectorAll('.status-list__indicator span');
        const labelSpan = Array.from(spans).find(span => !span.classList.contains('status-list__dot'));
        const label = labelSpan ? labelSpan.textContent.toLowerCase().trim() : '';
        
        // Buscar el span para el número (fuera del indicator)
        const countElement = item.querySelector(':scope > span'); // Selecciona solo spans directos
        
        console.log('Label encontrado:', label); // Para debugging
        
        if (label === 'habilitados') {
            countElement.textContent = stats.habilitados;
        } else if (label === 'deshabilitados') {
            countElement.textContent = stats.deshabilitados;
        }
    });

    // Actualizar el footer
    const footerBadge = document.querySelector('.footer-actions .badge:last-child');
    if (footerBadge) {
        footerBadge.textContent = `${stats.total} items`;
    }
}

// Cargar estadísticas cuando se carga la página
document.addEventListener('DOMContentLoaded', fetchSensorsStats);
