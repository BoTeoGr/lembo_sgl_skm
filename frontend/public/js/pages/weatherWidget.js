const API_KEY = 'fb91164b0ca1421eb01182202252307';
const CITY = 'Pereira';
const COUNTRY = 'Colombia';

async function fetchWeather() {
    const url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(CITY + ',' + COUNTRY)}&lang=es&aqi=yes`;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('No se pudo obtener el clima');
        return await res.json();
    } catch (e) {
        return null;
    }
}

function showWeatherError() {
    const weatherCard = document.querySelector('.card--weather .card__content');
    if (weatherCard) {
        weatherCard.innerHTML = '<div style="color: #c00; text-align: center; padding: 1em;">No se pudo obtener el clima actual.<br>Verifica tu conexión o intenta más tarde.</div>';
    }
}

function getAirQualityColor(level) {
    const colors = {
        'good': '#4CAF50',           // Green
        'moderate': '#FFC107',       // Yellow
        'unhealthy-sensitive': '#FF9800', // Orange
        'unhealthy': '#F44336',      // Red
        'very-unhealthy': '#9C27B0', // Purple
        'hazardous': '#673AB7',      // Deep Purple
        'unknown': '#9E9E9E'         // Grey
    };
    return colors[level] || colors['unknown'];
}

function updateWeatherCard(data) {
    if (!data || !data.current) {
        showWeatherError();
        return;
    }
    // Icono
    const iconMap = {
        'Soleado': 'fa-sun',
        'Despejado': 'fa-sun',
        'Parcialmente nublado': 'fa-cloud-sun',
        'Nublado': 'fa-cloud',
        'Lluvia moderada': 'fa-cloud-showers-heavy',
        'Lluvia': 'fa-cloud-showers-heavy',
        'Llovizna': 'fa-cloud-rain',
        'Tormenta': 'fa-bolt',
        'Niebla': 'fa-smog',
        'Nieve': 'fa-snowflake',
        'Trueno': 'fa-bolt',
        'Viento': 'fa-wind',
        // fallback
        'default': 'fa-cloud'
    };
    const conditionText = data.current.condition.text;
    let iconClass = iconMap[conditionText] || 'fa-cloud';
    // Ajuste para algunos textos comunes
    if (conditionText.toLowerCase().includes('lluvia')) iconClass = 'fa-cloud-showers-heavy';
    if (conditionText.toLowerCase().includes('nublado')) iconClass = 'fa-cloud';
    if (conditionText.toLowerCase().includes('soleado') || conditionText.toLowerCase().includes('despejado')) iconClass = 'fa-sun';
    if (conditionText.toLowerCase().includes('nieve')) iconClass = 'fa-snowflake';
    if (conditionText.toLowerCase().includes('tormenta') || conditionText.toLowerCase().includes('trueno')) iconClass = 'fa-bolt';
    if (conditionText.toLowerCase().includes('niebla')) iconClass = 'fa-smog';
    const weatherIcon = document.querySelector('.weather__icon');
    if (weatherIcon) weatherIcon.className = `fas ${iconClass} weather__icon`;
    const condition = document.querySelector('.weather__condition');
    if (condition) condition.textContent = conditionText;
    // Actualizar ciudad dinámicamente
    const cityElem = document.querySelector('.weather__city');
    if (cityElem && data.location) {
        cityElem.textContent = `${data.location.name}, ${data.location.region}`;
    }
    const subtitleElem = document.querySelector('.card--weather .card__subtitle');
    if (subtitleElem && data.location) {
        subtitleElem.textContent = `${data.location.name}, ${data.location.region}`;
    }
    const temp = document.querySelector('.weather__temp');
    if (temp) temp.textContent = `${Math.round(data.current.temp_c)}°`;
    // Precipitación con descripción amigable
    const extraValues = document.querySelectorAll('.weather__extra-value');
    const precipValue = data.current.precip_mm || 0;
    let precipText = 'Ninguna';
    let precipIcon = 'fa-cloud';
    
    if (precipValue > 0) {
        if (precipValue < 2.5) {
            precipText = 'Ligera lluvia';
            precipIcon = 'fa-cloud-rain';
        } else if (precipValue < 7.6) {
            precipText = 'Lluvia moderada';
            precipIcon = 'fa-cloud-showers-heavy';
        } else {
            precipText = 'Lluvia fuerte';
            precipIcon = 'fa-cloud-showers-water';
        }
    }
    
    if (extraValues[0]) {
        extraValues[0].innerHTML = `<span style="font-size: 0.8em;">${precipText} (${precipValue} mm)</span>`;
    }
    
    // Calidad del aire con descripción y colores
    let airQuality = { text: 'No disponible', level: 'unknown', description: 'Datos no disponibles' };
    if (data.current.air_quality && typeof data.current.air_quality['pm2_5'] !== 'undefined') {
        const pm25 = Math.round(data.current.air_quality['pm2_5']);
        
        if (pm25 <= 12) {
            airQuality = {
                text: 'Buena',
                level: 'good',
                description: 'Calidad del aire satisfactoria, sin riesgos para la salud.'
            };
        } else if (pm25 <= 35) {
            airQuality = {
                text: 'Moderada',
                level: 'moderate',
                description: 'Calidad del aire aceptable. Puede afectar a personas sensibles.'
            };
        } else if (pm25 <= 55) {
            airQuality = {
                text: 'Dañina para grupos sensibles',
                level: 'unhealthy-sensitive',
                description: 'Grupos sensibles pueden experimentar efectos en la salud.'
            };
        } else if (pm25 <= 150) {
            airQuality = {
                text: 'Dañina',
                level: 'unhealthy',
                description: 'Todos pueden comenzar a experimentar efectos en la salud.'
            };
        } else {
            airQuality = {
                text: 'Muy dañina',
                level: 'very-unhealthy',
                description: 'Advertencia de condiciones de emergencia.'
            };
        }
        
        airQuality.text = `${airQuality.text} (${pm25} PM2.5)`;
    }
    
    if (extraValues[1]) {
        extraValues[1].innerHTML = `<span title="${airQuality.description}" style="font-size: 0.8em;">${airQuality.text}</span>`;
    }
    // Estadísticas
    const stats = document.querySelectorAll('.weather__stat span');
    if (stats[0]) stats[0].textContent = `${data.current.wind_kph} km/h`;
    if (stats[1]) stats[1].textContent = `${data.current.humidity}%`;
    if (stats[2]) stats[2].textContent = `${Math.round(data.current.feelslike_c)}°`;
}

window.addEventListener('DOMContentLoaded', async () => {
    const data = await fetchWeather();
    updateWeatherCard(data);
}); 