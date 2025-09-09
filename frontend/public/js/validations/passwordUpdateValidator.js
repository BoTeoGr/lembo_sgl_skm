const API_URL = 'http://localhost:5000';
const contraseñaRecuperar = {
	contraseña: "",
	contraseñaConfirm: "",
};

const form = document.querySelector(".form--password");
const password = document.querySelector("#password");
const password2 = document.querySelector("#password2");

// Toast notification function with enhanced features
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Add ripple effect container
    const rippleContainer = document.createElement('div');
    rippleContainer.className = 'ripple-container';
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = 'toast-message';
    messageElement.textContent = message;
    
    // Create close button with icon
    const closeButton = document.createElement('button');
    closeButton.className = 'toast-close';
    closeButton.innerHTML = '&times;';
    closeButton.setAttribute('aria-label', 'Cerrar notificación');
    
    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'toast-progress';
    
    // Add click event to close button with ripple effect
    closeButton.addEventListener('click', (e) => {
        // Create ripple effect
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        const rect = e.target.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - rect.left - size/2}px`;
        ripple.style.top = `${e.clientY - rect.top - size/2}px`;
        
        e.target.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            ripple.remove();
        }, 600);
        
        // Close toast
        closeToast();
    });
    
    // Function to close toast
    const closeToast = () => {
        toast.classList.add('slide-out');
        setTimeout(() => {
            toast.remove();
            if (toastContainer && toastContainer.children.length === 0) {
                toastContainer.remove();
            }
        }, 300);
    };
    
    // Assemble toast
    toast.appendChild(rippleContainer);
    toast.appendChild(messageElement);
    toast.appendChild(closeButton);
    toast.appendChild(progressBar);
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Trigger animation
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.classList.add('show');
            
            // Animate progress bar
            progressBar.style.transition = `transform 5s linear`;
            progressBar.style.transform = 'scaleX(0)';
        });
    });
    
    // Auto remove after 5 seconds
    let autoRemove;
    const startAutoRemove = () => {
        autoRemove = setTimeout(() => {
            closeToast();
        }, 5000);
    };
    
    // Start the auto-remove timer
    startAutoRemove();
    
    // Pause on hover
    toast.addEventListener('mouseenter', () => {
        clearTimeout(autoRemove);
        progressBar.style.transition = 'none';
        progressBar.style.transform = `scaleX(${progressBar.offsetWidth / progressBar.parentElement.offsetWidth})`;
    });
    
    // Resume on mouse leave
    toast.addEventListener('mouseleave', () => {
        const remainingWidth = progressBar.offsetWidth / progressBar.parentElement.offsetWidth;
        const remainingTime = remainingWidth * 5000;
        
        progressBar.style.transition = `transform ${remainingTime}ms linear`;
        progressBar.style.transform = 'scaleX(0)';
        
        startAutoRemove();
    });
    
    // Add click to dismiss
    toast.addEventListener('click', (e) => {
        // Only trigger if not clicking the close button
        if (!e.target.classList.contains('toast-close')) {
            closeToast();
        }
    });
    
    return toast;
}

// Verificar si hay un token de recuperación
const recoveryToken = localStorage.getItem('recoveryToken');
if (!recoveryToken) {
	showAlert("Sesión de recuperación inválida. Por favor, inténtalo de nuevo.", true);
	setTimeout(() => {
		window.location.href = "login-olvide-contraseña.html";
	}, 3000);
}

// Leer texto en inputs
form.addEventListener("input", readText);
password.addEventListener("input", readText);
password2.addEventListener("input", readText);

// Evento submit
form.addEventListener("submit", async function (e) {
	e.preventDefault();
	const { contraseña, contraseñaConfirm } = contraseñaRecuperar;

	if (contraseña === "" || contraseñaConfirm === "") {
		showAlert("Todos los campos son obligatorios", true);
		return;
	}

	if (contraseña.length < 8) {
		showAlert("La contraseña debe tener al menos 8 caracteres", true);
		return;
	}

	if (contraseña !== contraseñaConfirm) {
		showAlert("Las contraseñas no coinciden", true);
		return;
	}

	try {
		showAlert("Actualizando contraseña...");

		const response = await fetch(`${API_URL}/restablecer-contrasena`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				token: recoveryToken,
				nuevaContrasena: contraseña
			})
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.error || 'Error al actualizar la contraseña');
		}

		showAlert("¡Contraseña actualizada correctamente! Redirigiendo...");

		// Limpiar el almacenamiento local
		localStorage.removeItem('recoveryToken');
		localStorage.removeItem('recoveryEmail');

		setTimeout(() => {
			window.location.href = "index.html";
		}, 1500);

	} catch (error) {
		console.error('Error:', error);
		showAlert(error.message || 'Error al actualizar la contraseña', true);
	}
});

function showAlert(message, error = false) {
    // Use the toast system
    const type = error ? 'error' : 'success';
    showToast(message, type);
}

function readText(e) {
	if (e.target.id === "password") {
		contraseñaRecuperar.contraseña = e.target.value;
	} else if (e.target.id === "password2") {
		contraseñaRecuperar.contraseñaConfirm = e.target.value;
	}
}
