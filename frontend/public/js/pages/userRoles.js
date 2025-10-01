// Helper para redirigir si el rol no coincide
export function requireRole(allowedRoles = []) {
	try {
		const role = (localStorage.getItem("userRol") || "").toLowerCase().trim();
		if (allowedRoles.length === 0) return true;
		const ok = allowedRoles.some(
			(r) => role === String(r).toLowerCase().trim()
		);
		if (!ok) {
			window.location.href = "../views/acceso-denegado.html?r=role";
			return false;
		}
		return true;
	} catch (_) {
		window.location.href = "../views/acceso-denegado.html?r=route";
		return false;
	}
}
// Código específico para manejar las acciones de los roles
const ROLE_CATEGORIES = {
	"Super administrador": {
		description: "Acceso completo a todas las funcionalidades del sistema",
		icon: "admin_panel_settings",
	},
	Administrador: {
		description: "Gestión general del sistema y usuarios",
		icon: "manage_accounts",
	},
	"Personal de Apoyo": {
		description: "Soporte técnico y gestión de datos",
		icon: "support_agent",
	},
	"Personal de apoyo en campo": {
		description: "Recolección y registro de datos en campo",
		icon: "agriculture",
	},
	Visitante: {
		description: "Acceso limitado a visualización de datos",
		icon: "visibility",
	},
};

function renderRolesContent(userRole) {
	const rolesContent = document.getElementById("rolesContent");
	if (!rolesContent) return;

	let html = "";

	// Iterar sobre cada rol y crear su card
	Object.entries(ROLE_CATEGORIES).forEach(([role, info]) => {
		const isCurrentRole = role === userRole;
		html += `
            <div class="role-card${isCurrentRole ? " role-card--active" : ""}">
                <div class="role-card__header">
                    <span class="material-symbols-outlined role-card__icon">${
											info.icon
										}</span>
                    <h3 class="role-card__title">${role}</h3>
                    ${
											isCurrentRole
												? '<span class="role-card__badge">Rol actual</span>'
												: ""
										}
                </div>
                <p class="role-card__description">${info.description}</p>
            </div>
        `;
	});

	rolesContent.innerHTML = html;
}

// Agregar manejador para los tabs del modal
document.querySelectorAll(".modal__tab").forEach((tab) => {
	tab.addEventListener("click", function () {
		const panelName = this.dataset.tab;

		// Actualizar estados activos
		document
			.querySelectorAll(".modal__tab")
			.forEach((t) => t.classList.remove("modal__tab--active"));
		document
			.querySelectorAll(".modal__panel")
			.forEach((p) => p.classList.remove("modal__panel--active"));

		this.classList.add("modal__tab--active");
		document
			.querySelector(`.modal__panel[data-panel="${panelName}"]`)
			.classList.add("modal__panel--active");

		// Si es el tab de roles, renderizar el contenido
		if (panelName === "roles") {
			const userRole = document.getElementById("modalUsuarioRol").textContent;
			renderRolesContent(userRole);
		}
	});
});
