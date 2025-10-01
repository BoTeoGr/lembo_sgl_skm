// Sistema de gestión de estadísticas de cultivos
(async function () {
	// Obtener estadísticas de cultivos
	async function fetchStats() {
		try {
			const response = await fetch("http://localhost:5000/api/widgets/crops");
			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(
					`Error al obtener estadísticas de cultivos: ${errorText}`
				);
			}

			const data = await response.json();
			console.log("Datos recibidos de la API:", data);

			// Asegurarse de que los valores sean números
			const enabled = parseInt(data.enabled) || 0;
			const disabled = parseInt(data.disabled) || 0;
			const total = parseInt(data.total) || enabled + disabled;
			const newThisWeek = parseInt(data.new_this_week) || 0;

			// Formatear los datos para la interfaz
			const stats = {
				habilitados: enabled,
				deshabilitados: disabled,
				total: total,
				nuevosEstaSemana: newThisWeek,
			};

			console.log("Estadísticas formateadas:", stats);
			return stats;
		} catch (error) {
			console.error("Error al obtener estadísticas de cultivos:", error);
			// Mostrar mensaje de error en la interfaz
			const cropsCard = Array.from(document.querySelectorAll(".card__title"))
				.find((el) => el.textContent.includes("Cultivos"))
				?.closest(".card");

			if (cropsCard) {
				const errorElement = document.createElement("div");
				errorElement.className = "error-message";
				errorElement.textContent =
					"No se pudieron cargar los datos de cultivos";
				errorElement.style.color = "#dc3545";
				errorElement.style.padding = "10px";
				cropsCard.querySelector(".card__content").prepend(errorElement);
			}

			// Retornar un objeto con valores por defecto en caso de error
			return {
				habilitados: 0,
				deshabilitados: 0,
				total: 0,
				nuevosEstaSemana: 0,
			};
		}
	}

	// Actualizar la tarjeta de cultivos
	function updateCard(stats) {
		console.log("Actualizando card con stats:", stats);

		// Asegurarse de que los valores sean números
		const habilitados = parseInt(stats.habilitados) || 0;
		const deshabilitados = parseInt(stats.deshabilitados) || 0;
		const total = habilitados + deshabilitados;
		const nuevosEstaSemana = parseInt(stats.nuevosEstaSemana) || 0;

		console.log("Actualizando UI con:", {
			habilitados,
			deshabilitados,
			total,
			nuevosEstaSemana,
		});

		// Localizar específicamente la card de "Vista de Cultivos"
		const cropsCard = Array.from(document.querySelectorAll(".card__title"))
			.find((el) => el.textContent && el.textContent.includes("Cultivos"))
			?.closest(".card");

		if (!cropsCard) {
			console.warn("No se pudo localizar la card de Cultivos para actualizar.");
			return;
		}

		// Actualizar el subtítulo SOLO dentro de la card de Cultivos
		const subtitle = cropsCard.querySelector(".card__subtitle");
		if (subtitle) {
			subtitle.textContent = `Total: ${total} cultivos`;
		}

		// Actualizar contadores SOLO dentro de la card de Cultivos
		const enabledCount = cropsCard.querySelector(".enabled-count");
		const disabledCount = cropsCard.querySelector(".disabled-count");
		const newThisWeek = cropsCard.querySelector(".new-this-week");
		const totalCrops = cropsCard.querySelector(".total-crops");

		if (enabledCount) enabledCount.textContent = habilitados;
		if (disabledCount) disabledCount.textContent = deshabilitados;

		if (newThisWeek) {
			newThisWeek.textContent = `+${nuevosEstaSemana} nuevos esta semana`;
			newThisWeek.style.display = nuevosEstaSemana > 0 ? "inline-flex" : "none";
		}

		if (totalCrops) totalCrops.textContent = `${total} cultivos`;
	}

	// Función principal de actualización
	async function updateStats() {
		try {
			console.log("Iniciando actualización de estadísticas...");
			const stats = await fetchStats();
			console.log("Estadísticas obtenidas:", stats);
			updateCard(stats);

			// Actualizar cada 5 minutos
			setTimeout(updateStats, 5 * 60 * 1000);
		} catch (error) {
			console.error("Error en updateStats:", error);
			// Reintentar después de 30 segundos en caso de error
			setTimeout(updateStats, 30000);
		}
	}

	// Inicializar las actualizaciones automáticas
	function initWidget() {
		console.log("Inicializando widget de cultivos");

		// Forzar una actualización inmediata
		updateStats();

		// Configurar actualización periódica cada minuto
		setInterval(updateStats, 60000);

		// Escuchar eventos personalizados para actualizaciones forzadas
		document.addEventListener("cultivoActualizado", updateStats);
	}

	// Iniciar cuando el DOM esté listo
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initWidget);
	} else {
		initWidget();
	}

	// Exportar función para debugging
	window.debugCropsWidget = async () => {
		console.log("Ejecutando actualización manual de stats");
		await updateStats();
	};
})();
