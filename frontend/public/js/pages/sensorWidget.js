async function fetchSensorsStats() {
    try {
        // Obtener todos los sensores
        const response = await fetch('http://localhost:5000/sensor?limit=1000');
        if (!response.ok) throw new Error('Error al obtener sensores');
        const data = await response.json();
        const sensores = Array.isArray(data) ? data : (data.sensores || []);

        // Contar sensores por estado
        const stats = {
            habilitados: 0,
            deshabilitados: 0,
            total: sensores.length
        };

        sensores.forEach(sensor => {
            const estado = (sensor.estado || '').toLowerCase().trim();
            if (estado === 'habilitado') {
                stats.habilitados++;
            } else if (estado === 'deshabilitado') {
                stats.deshabilitados++;
            }
            // Si no es ninguno de los dos estados, no se cuenta
        });

        // Actualizar la tarjeta con las estadísticas
        updateSensorCard(stats);
    } catch (error) {
        console.error('Error al cargar estadísticas de sensores:', error);
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
