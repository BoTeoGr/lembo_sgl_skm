document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get("id");

    if (!userId) {
        alert("ID del usuario no encontrado en la URL");
        window.location.href = "listar-usuarios.html";
        return;
    }

    const form = document.querySelector(".form__container");
    const tipoDocumentoInput = form.querySelector("#tipo-documento");
    const nombreInput = form.querySelector("#nombre");
    const numeroDocumentoInput = form.querySelector("#numero-documento");
    const telefonoInput = form.querySelector("#telefono");
    const correoInput = form.querySelector("#correo");
    const confirmarCorreoInput = form.querySelector("#confirmar-correo");
    const passwordInput = form.querySelector("#password");
    const rolInput = form.querySelector("#rol");
    const estadoRadios = form.querySelectorAll("[name='estado-habilitado']");
    const submitButton = form.querySelector("button[type='submit']");

    // Objeto para almacenar datos del usuario
    const userData = {
        userTypeId: "",
        userName: "",
        userId: "",
        userTel: "",
        userEmail: "",
        userConfirmEmail: "",
        userRol: "",
        estado: "habilitado",
        password: ""
    };

    // Agregar eventos para capturar cambios
    nombreInput.addEventListener("input", readText);
    telefonoInput.addEventListener("input", readText);
    correoInput.addEventListener("input", readText);
    confirmarCorreoInput.addEventListener("input", readText);
    passwordInput.addEventListener("input", readText);
    rolInput.addEventListener("change", readText);

    // Validaciones de teclado
    nombreInput.addEventListener("keydown", function (e) {
        if (e.key >= "0" && e.key <= "9") {
            e.preventDefault();
            console.log("Número bloqueado");
        }
    });

    telefonoInput.addEventListener("keydown", function (e) {
        if (
            e.key === "Backspace" ||
            e.key === "Tab" ||
            e.key === "Enter" ||
            e.key === "ArrowLeft" ||
            e.key === "ArrowRight"
        ) {
            return;
        }
        if (e.key < "0" || e.key > "9") {
            e.preventDefault();
            console.log("Solo se permite números");
        }
    });

    let usuarioActual = null;

    try {
        const response = await fetch(`http://localhost:5000/usuarios/${userId}`);
        if (!response.ok) throw new Error("No se pudo obtener el usuario");

        usuarioActual = await response.json();

        // Asignación de valores a los campos del formulario
        tipoDocumentoInput.value = usuarioActual.tipo_documento || usuarioActual.tipoDocumento || '';
        nombreInput.value = usuarioActual.nombre || usuarioActual.nombre_completo || '';
        numeroDocumentoInput.value = usuarioActual.numero_documento || usuarioActual.numeroDocumento || '';
        telefonoInput.value = usuarioActual.telefono || '';
        correoInput.value = usuarioActual.correo || '';
        confirmarCorreoInput.value = usuarioActual.correo || '';
        rolInput.value = usuarioActual.rol || '';

        // Selección del estado
        for (const radio of estadoRadios) {
            radio.checked = radio.value === (usuarioActual.estado || '').toLowerCase();
        }
    } catch (error) {
        console.error("Error cargando datos del usuario:", error);
        alert("No se pudo cargar la información del usuario.");
    }

    function readText(e) {
        if (e.target.id === "nombre") {
            userData.userName = e.target.value;
        } else if (e.target.id === "telefono") {
            userData.userTel = e.target.value;
        } else if (e.target.id === "correo") {
            userData.userEmail = e.target.value;
        } else if (e.target.id === "confirmar-correo") {
            userData.userConfirmEmail = e.target.value;
        } else if (e.target.id === "password") {
            userData.password = e.target.value;
        } else if (e.target.id === "rol") {
            userData.userRol = e.target.value;
        }
        console.log(userData);
    }

    function validateUserData() {
        const { userName, userTel, userEmail, userConfirmEmail, userRol, password } = userData;

        // // Validaciones generales
        // if (userName === "" || userTel === "" || userEmail === "" || userConfirmEmail === "" || userRol === "") {
        //     showToast("Campos requeridos", "Todos los campos son obligatorios", "error");
        //     return false;
        // }

        // Validación de correo
        if (userEmail !== userConfirmEmail) {
            showToast("Correos no coinciden", "Los correos electrónicos no coinciden", "error");
            return false;
        }

        // Validación de contraseña si se proporciona una nueva
        if (password) {
            if (password.length < 8 || password.length > 18) {
                showToast("Longitud de contraseña", "La contraseña debe tener entre 8 y 18 caracteres", "error");
                return false;
            }
        }

        return true;
    }

    // Función general para mostrar toasts
    function showToast(title, message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastTitle = document.getElementById('toastTitle');
        const toastDescription = document.getElementById('toastDescription');
        const toastIcon = document.getElementById('toastIcon');
        const toastProgress = document.querySelector('.toast-progress');

        // Establecer el contenido del toast
        toastTitle.textContent = title;
        toastDescription.textContent = message;

        // Establecer el icono según el tipo
        switch (type) {
            case 'success':
                toastIcon.className = 'fas fa-check-circle';
                break;
            case 'error':
                toastIcon.className = 'fas fa-exclamation-circle';
                break;
            case 'warning':
                toastIcon.className = 'fas fa-exclamation-triangle';
                break;
            case 'info':
                toastIcon.className = 'fas fa-info-circle';
                break;
        }

        // Mostrar el toast
        toast.classList.remove('hidden');

        // Animación de la barra de progreso
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 2;
            toastProgress.style.width = `${progress}%`;
            if (progress >= 100) {
                clearInterval(progressInterval);
                // Ocultar el toast después de 5 segundos
                setTimeout(() => {
                    toast.classList.add('hidden');
                    toastProgress.style.width = '0%';
                }, 3400);
            }
        }, 30);
    }


    // Funcion para mostrar u ocultar la contraseña
    const togglePasswordBtnUpdate = document.querySelector('.toggle-password');
    const passwordInputUpdate = document.getElementById('password');

    togglePasswordBtnUpdate.addEventListener('click', function () {
        const type = passwordInputUpdate.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInputUpdate.setAttribute('type', type);
        // Cambiar el icono (ocultar/mostrar contraseña)
        this.querySelector('i').classList.toggle('fa-eye');
        this.querySelector('i').classList.toggle('fa-eye-slash');
    });


    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!usuarioActual) {
            alert("No se puede actualizar sin datos del usuario cargados.");
            return;
        }

        if (!validateUserData()) {
            return;
        }

        let estadoSeleccionado = null;
        for (const radio of estadoRadios) {
            if (radio.checked) {
                estadoSeleccionado = radio.value;
                break;
            }
        }

        // Construcción de objeto para PUT
        const datosActualizados = {
            nombre: nombreInput.value.trim(),
            correo: correoInput.value.trim(),
            rol: rolInput.value,
            estado: estadoSeleccionado
        };

        // Agregar contraseña solo si se proporcionó una nueva
        if (userData.password) {
            datosActualizados.password = userData.password;
        }

        submitButton.disabled = true;

        try {
            const response = await fetch(`http://localhost:5000/usuarios/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datosActualizados)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "No se pudo actualizar el usuario");
            }

            showToast("Actualización exitosa", "Usuario actualizado correctamente", "success");
            setTimeout(() => {
                window.location.href = "listar-usuarios.html";
            }, 2000);
        } catch (error) {
            console.error("Error actualizando usuario:", error);
            showToast("Error", "Hubo un error al actualizar el usuario", "error");
        } finally {
            submitButton.disabled = false;
        }
    });
});
