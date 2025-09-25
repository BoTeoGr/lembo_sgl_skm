// Load Font Awesome if not already loaded
if (!document.querySelector('link[href*="font-awesome"]')) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
  link.integrity = 'sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==';
  link.crossOrigin = 'anonymous';
  link.referrerPolicy = 'no-referrer';
  document.head.appendChild(link);
}

// Toast notification function
function showToast(title, message, type = 'info') {
  // Create toast container if it doesn't exist
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast hidden';
    
    const toastContent = document.createElement('div');
    toastContent.className = 'toast-content';
    
    const toastIcon = document.createElement('i');
    toastIcon.id = 'toastIcon';
    toastIcon.className = 'fas fa-info-circle';
    
    const toastMessage = document.createElement('div');
    toastMessage.className = 'toast-message';
    
    const toastTitle = document.createElement('span');
    toastTitle.id = 'toastTitle';
    toastTitle.className = 'toast-title';
    
    const toastDescription = document.createElement('span');
    toastDescription.id = 'toastDescription';
    toastDescription.className = 'toast-description';
    
    const toastProgress = document.createElement('div');
    toastProgress.className = 'toast-progress';
    
    toastMessage.appendChild(toastTitle);
    toastMessage.appendChild(toastDescription);
    toastContent.appendChild(toastIcon);
    toastContent.appendChild(toastMessage);
    toast.appendChild(toastContent);
    toast.appendChild(toastProgress);
    
    document.body.appendChild(toast);
  }
  
  const toastTitle = document.getElementById('toastTitle');
  const toastDescription = document.getElementById('toastDescription');
  const toastIcon = document.getElementById('toastIcon');
  const toastProgress = document.querySelector('.toast-progress');
  
  // Set content and type
  toastTitle.textContent = title;
  toastDescription.textContent = message;
  
  // Set icon based on type
  switch(type) {
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
    default:
      toastIcon.className = 'fas fa-info-circle';
  }
  
  // Show the toast
  toast.classList.remove('hidden');
  
  // Reset progress bar
  toastProgress.style.width = '0%';
  
  // Animate progress bar
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += 2;
    toastProgress.style.width = `${progress}%`;
    if (progress >= 100) {
      clearInterval(progressInterval);
      // Hide toast after animation
      setTimeout(() => {
        toast.classList.add('hidden');
        toastProgress.style.width = '0%';
      }, 3400);
    }
  }, 30);
}

// Reusable Profile Modal injector and event wiring
export default function injectProfileModal() {
    console.log('Initializing profile modal...');
    
    // Ensure CSS is loaded
    const cssHref = "../css/components/profile-modal.css";
    const hasLink = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
      .some(l => (l.getAttribute('href') || '').includes('profile-modal.css'));
    if (!hasLink) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssHref;
      document.head.appendChild(link);
      console.log('Added profile modal CSS');
    }
  
    // If modal already exists, skip HTML injection
    let modal = document.getElementById('profileModal');
    if (!modal) {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = `
        <div class="modal" id="profileModal">
          <div class="modal__content">
            <div class="modal__header">
              <h3 class="modal__title">Perfil de Usuario</h3>
              <button class="modal__close" id="closeProfileModal" aria-label="Cerrar">&times;</button>
            </div>
            <div class="modal__body">
              <div id="profileView">
                <ul class="profile-list">
                  <li><strong>Nombre:</strong> <span id="profileName"></span></li>
                  <li><strong>Correo:</strong> <span id="profileEmail"></span></li>
                  <li><strong>Rol:</strong> <span id="profileRol"></span></li>
                  <li><strong>Teléfono:</strong> <span id="profileTelefono"></span></li>
                  <li><strong>Tipo de documento:</strong> <span id="profileTipoDoc"></span></li>
                  <li><strong>Número de documento:</strong> <span id="profileNumDoc"></span></li>
                </ul>
              </div>
              
              <form id="profileEditForm" class="form-edit" style="display: none;">
                <div class="form__group">
                  <label for="editName" class="form__label">Nombre</label>
                  <div class="form__input-container">
                    <input type="text" id="editName" name="nombre" class="form__input" required>
                  </div>
                </div>
                <div class="form__group">
                  <label for="editEmail" class="form__label">Correo</label>
                  <div class="form__input-container">
                    <input type="email" id="editEmail" name="correo" class="form__input" required>
                    <div id="emailHelpText" class="form__helper-text" style="display: none; color: #666; font-size: 0.8rem; margin-top: 0.25rem;">
                      <i class="fas fa-info-circle"></i> Para cambiar el correo, contacte a un administrador
                    </div>
                  </div>
                </div>
                <div class="form__group">
                  <label for="editTelefono" class="form__label">Teléfono</label>
                  <div class="form__input-container">
                    <input type="tel" id="editTelefono" name="telefono" class="form__input">
                  </div>
                </div>
                <div class="form__group">
                  <label for="editTipoDoc" class="form__label">Tipo de documento</label>
                  <div class="form__input-container">
                    <select id="editTipoDoc" name="tipo_documento" class="form__select" required>
                      <option value="">Seleccione un tipo de documento</option>
                      <option value="ti">Tarjeta de identidad</option>
                      <option value="cc">Cédula de ciudadanía</option>
                      <option value="ce">Cédula extranjera</option>
                      <option value="pep">Persona Políticamente Expuesta</option>
                      <option value="ppt">Permiso de protección temporal</option>
                    </select>
                  </div>
                </div>
                <div class="form__group">
                  <label for="editNumDoc" class="form__label">Número de documento</label>
                  <div class="form__input-container">
                    <input type="text" id="editNumDoc" name="numero_documento" class="form__input" required>
                  </div>
                </div>
                <div class="form__group form__group--password">
                  <label for="newPassword" class="form__label">Nueva contraseña</label>
                  <div class="form__input-container--password">
                    <input type="password" id="newPassword" name="new_password" class="form__input" placeholder="Dejar en blanco para no cambiar">
                    <span class="toggle-password" data-target="newPassword">
                      <i class="far fa-eye"></i>
                    </span>
                  </div>
                  <div class="form__helper-text">
                      <i class="fas fa-info-circle"></i> La contraseña debe tener al menos 8 caracteres
                  </div>
                </div>
                <div class="form__group form__group--password">
                  <label for="confirmPassword" class="form__label">Confirmar nueva contraseña</label>
                  <div class="form__input-container--password">
                    <input type="password" id="confirmPassword" name="confirm_password" class="form__input" placeholder="Repita la nueva contraseña">
                    <span class="toggle-password" data-target="confirmPassword">
                      <i class="far fa-eye"></i>
                    </span>
                  </div>
                </div>
              </form>
            </div>
            <div class="modal__footer">
              <div class="modal__footer-actions">
                <button id="editProfileBtn" class="btn btn--primary btn--icon">
                  <span class="material-symbols-outlined">edit</span>
                  <span>Editar Perfil</span>
                </button>
                <div id="editActions" style="display: none; gap: 0.75rem; width: 100%;">
                  <button id="saveProfileBtn" class="btn btn--success btn--icon" type="button">
                    <span class="material-symbols-outlined">save</span>
                    <span>Guardar Cambios</span>
                  </button>
                  <button id="cancelEditBtn" class="btn btn--secondary btn--icon" type="button">
                    <span class="material-symbols-outlined">close</span>
                    <span>Cancelar</span>
                  </button>
                </div>
                <a href="index.html" class="modal__logout-btn" id="logoutBtn">
                  <span class="material-symbols-outlined">logout</span>
                  <span>Cerrar Sesión</span>
                </a>
              </div>
            </div>
          </div>
        </div>`;
      document.body.appendChild(wrapper.firstElementChild);
      modal = document.getElementById('profileModal');
    }
  
    const profileModal = modal;
    const closeBtn = document.getElementById('closeProfileModal');
  
    // Check if user is admin or super admin
    const isAdminUser = (role) => {
      if (!role) return false;
      const normalizedRole = role.toLowerCase().trim();
      return ['administrador', 'super administrador', 'admin', 'super admin'].includes(normalizedRole);
    };

    // Helper: fill modal fields
    const fillFields = (src = {}) => {
      const userRole = src.userRol ?? src.rol ?? localStorage.getItem('userRol') ?? '';
      const isAdmin = isAdminUser(userRole);
      
      const profileFields = {
        profileName: src.userName ?? src.nombre ?? localStorage.getItem('userName') ?? '',
        profileEmail: src.userEmail ?? src.correo ?? src.email ?? localStorage.getItem('userEmail') ?? '',
        profileRol: userRole,
        profileTelefono: src.userTelefono ?? src.telefono ?? src.phone ?? localStorage.getItem('userTelefono') ?? '',
        profileTipoDoc: src.userTipoDoc ?? src.tipo_documento ?? src.tipoDoc ?? src.tipoDocumento ?? localStorage.getItem('userTipoDoc') ?? '',
        profileNumDoc: src.userNumDoc ?? src.numero_documento ?? src.numDoc ?? src.documento ?? localStorage.getItem('userNumDoc') ?? ''
      };
      
      // Disable email field for non-admin users
      const emailInput = document.getElementById('editEmail');
      const emailHelpText = document.getElementById('emailHelpText');
      if (emailInput) {
        emailInput.disabled = !isAdmin;
        if (!isAdmin) {
          emailInput.classList.add('disabled-input');
          emailInput.title = 'Solo los administradores pueden modificar el correo';
          emailInput.placeholder = 'Contacte a un administrador';
          if (emailHelpText) {
            emailHelpText.style.display = 'block';
          }
        } else if (emailHelpText) {
          emailHelpText.style.display = 'none';
        }
      }
      
      // Fill all profile fields
      console.log('=== DEBUG: Filling profile fields ===');
      Object.entries(profileFields).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) {
          const displayValue = (value ?? '').toString();
          console.log(`Setting ${id}:`, displayValue);
          el.textContent = displayValue;
          
          // Store the raw value in a data attribute for form population
          if (id === 'profileTipoDoc') {
            console.log('Setting data-value for profileTipoDoc:', value);
            el.setAttribute('data-value', value || '');
            console.log('Element after setting data-value:', el.outerHTML);
          }
        }
      });
      console.log('====================================');
      
      // Show admin message if user is not admin or super admin
      const adminMessage = document.getElementById('adminMessage');
      if (adminMessage) {
        const normalizedRole = userRole.toLowerCase().trim();
        const isAdmin = normalizedRole === 'administrador' || 
                       normalizedRole === 'super administrador' ||
                       normalizedRole === 'admin' || 
                       normalizedRole === 'super admin';
        adminMessage.style.display = isAdmin ? 'none' : 'block';
      }
    };
  
    // Initial fill from localStorage
    fillFields();
  
    // Fetch user profile from backend (if possible) and update fields
    const fetchAndFillProfile = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        
        if (!userId || !token) {
          console.error('Faltan credenciales: userId o token');
          return;
        }
        
        console.log('Solicitando datos del usuario al servidor...');
        const res = await fetch(`http://localhost:5000/usuarios/${userId}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
                
        if (!res.ok) {
          console.error('Error en la respuesta del servidor:', res.status, res.statusText);
          const errorText = await res.text();
          console.error('Detalles del error:', errorText);
          return;
        }
        
        const data = await res.json();
        
        // Verificar diferentes formatos de respuesta
        let userData = data;
        if (data && typeof data === 'object') {
          userData = data.usuario || data.user || data.data || data;
        }
        
        if (userData && typeof userData === 'object') {
          fillFields(userData);
        } else {
          console.error('Formato de datos de usuario no válido:', userData);
        }
      } catch (error) {
        console.error('Error al obtener el perfil del usuario:', error);
        console.error('Mensaje de error:', error.message);
        console.error('Stack trace:', error.stack);
      }
    };
  
    // Delegate clicks: open from user image or Perfil link
    const delegateClick = (selector) => {
      console.log('Setting up click delegation for:', selector);
      document.addEventListener('click', (e) => {
        const target = e.target.closest(selector);
        if (target) {
          console.log('Profile link clicked, opening modal...');
          e.preventDefault();
          e.stopPropagation();
          profileModal.classList.add('active');
          document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
          fetchAndFillProfile();
        }
      });
    };
  
    delegateClick('.nav__user-image');
    delegateClick('#openProfileModalLink');
  
    // Also bind direct listeners to handle cases where propagation is stopped upstream
    const bindDirect = (selector) => {
      const el = document.querySelector(selector);
      if (el) {
        el.style.cursor = 'pointer';
        el.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          profileModal.classList.add('active');
          fetchAndFillProfile();
        });
      }
    };
  
    bindDirect('.nav__user-image');
    bindDirect('#openProfileModalLink');
  
    // Wire up close button and overlay
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        console.log('Close button clicked');
        profileModal.classList.remove('active');
        document.body.style.overflow = ''; // Re-enable scrolling
        // Reset to view mode when closing
        setViewMode(true);
      });
    } else {
      console.warn('Close button not found');
    }

    // Toggle between view and edit modes
    function setViewMode(isViewMode) {
      const profileView = document.getElementById('profileView');
      const profileForm = document.getElementById('profileEditForm');
      const editBtn = document.getElementById('editProfileBtn');
      const editActions = document.getElementById('editActions');
      const logoutBtn = document.getElementById('logoutBtn');
      
      // Toggle password visibility
      document.addEventListener('click', function(e) {
        if (e.target.closest('.toggle-password')) {
          const targetId = e.target.closest('.toggle-password').getAttribute('data-target');
          const passwordInput = document.getElementById(targetId);
          const icon = e.target.closest('.toggle-password').querySelector('i');
          
          if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
          } else {
            passwordInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
          }
        }
      });

      // Password validation
      function validatePasswords() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // If any password field is filled, all are required
        if (currentPassword || newPassword || confirmPassword) {
          if (!currentPassword) {
            showToast('Error', 'Por favor ingrese su contraseña actual', 'error');
            return false;
          }
          
          if (newPassword.length < 8) {
            showToast('Error', 'La nueva contraseña debe tener al menos 8 caracteres', 'error');
            return false;
          }
          
          if (newPassword !== confirmPassword) {
            showToast('Error', 'Las contraseñas no coinciden', 'error');
            return false;
          }
        }
        
        return true;
      }

      if (isViewMode) {
        // View mode
        profileView.style.display = 'block';
        profileForm.style.display = 'none';
        editBtn.style.display = 'flex';
        editActions.style.display = 'none';
        logoutBtn.style.display = 'flex';
      } else {
        // Edit mode
        profileView.style.display = 'none';
        profileForm.style.display = 'grid';
        editBtn.style.display = 'none';
        editActions.style.display = 'flex';
        logoutBtn.style.display = 'none';
        
        // Fill form with current values
        document.getElementById('editName').value = document.getElementById('profileName').textContent;
        document.getElementById('editEmail').value = document.getElementById('profileEmail').textContent;
        document.getElementById('editTelefono').value = document.getElementById('profileTelefono').textContent || '';
        
        // Mapeo de códigos a nombres completos de documentos
        const docTypeMap = {
          'cc': 'Cédula de ciudadanía',
          'ti': 'Tarjeta de identidad',
          'ce': 'Cédula extranjera',
          'pep': 'Persona Políticamente Expuesta',
          'ppt': 'Permiso de protección temporal'
        };

        const profileTipoDoc = document.getElementById('profileTipoDoc');
        const tipoDocShortValue = (profileTipoDoc?.getAttribute('data-value') || profileTipoDoc?.textContent || '').trim().toLowerCase();
        
        // Map the short code to full name if needed
        const tipoDocFullValue = docTypeMap[tipoDocShortValue] || tipoDocShortValue;
        
        const tipoDocSelect = document.getElementById('editTipoDoc');
        
        // Try to find and select the matching option by value or text
        let found = false;
        for (let i = 0; i < tipoDocSelect.options.length; i++) {
          const option = tipoDocSelect.options[i];
          
          // Check if the option's value or text matches either the short code or full name
          if (option.value.toLowerCase() === tipoDocShortValue ||
              option.text.trim().toLowerCase() === tipoDocShortValue ||
              option.value === tipoDocFullValue ||
              option.text.trim() === tipoDocFullValue) {
            tipoDocSelect.selectedIndex = i;
            found = true;
            break;
          }
        }
        
        // If still not found, select the first non-empty option
        if (!found && tipoDocSelect.options.length > 1) {
          tipoDocSelect.selectedIndex = 1; // Skip the first empty option
        }
        
        document.getElementById('editNumDoc').value = document.getElementById('profileNumDoc').textContent || '';
        
        // Focus on the first field
        setTimeout(() => {
          const firstInput = document.querySelector('#profileEditForm .form__input, #profileEditForm .form__select');
          if (firstInput) firstInput.focus();
        }, 50);
      }
    }

    // Edit profile button
    document.getElementById('editProfileBtn').addEventListener('click', () => {
      setViewMode(false);
    });

    // Cancel edit button
    document.getElementById('cancelEditBtn').addEventListener('click', () => {
      setViewMode(true);
    });

    // Save profile changes
    document.getElementById('saveProfileBtn').addEventListener('click', async () => {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      
      if (!userId || !token) {
        showToast('Error', 'No se pudo verificar su sesión. Por favor, inicie sesión nuevamente.', 'error');
        return;
      }

      // Mapeo de nombres de documentos a códigos
      const reverseDocTypeMap = {
        'cédula de ciudadanía': 'cc',
        'tarjeta de identidad': 'ti',
        'cédula extranjera': 'ce',
        'persona políticamente expuesta': 'pep',
        'permiso de protección temporal': 'ppt'
      };

      const tipoDocFull = document.getElementById('editTipoDoc').value;
      const tipoDocShort = reverseDocTypeMap[tipoDocFull.toLowerCase()] || tipoDocFull;
      
      // Get password values
      const newPassword = document.getElementById('newPassword').value.trim();
      const confirmPassword = document.getElementById('confirmPassword').value.trim();
      
      // Validate passwords if new password is provided
      if (newPassword) {
        if (newPassword.length < 8) {
          showToast('Error', 'La nueva contraseña debe tener al menos 8 caracteres', 'error');
          return;
        }
        
        if (newPassword !== confirmPassword) {
          showToast('Error', 'Las contraseñas no coinciden', 'error');
          return;
        }
      }
      
      // Get the current user data to ensure we have all required fields
      const currentEmail = document.getElementById('profileEmail').textContent.trim();
      const currentRol = document.getElementById('profileRol').textContent.trim();
            
      // Prepare the complete user data with all required fields
      const formData = {
        tipo_documento: tipoDocShort,
        nombre: document.getElementById('editName').value.trim(),
        numero_documento: document.getElementById('editNumDoc').value.trim(),
        telefono: document.getElementById('editTelefono').value.trim(),
        correo: document.getElementById('editEmail').value.trim(),  // Use the value from the form field
        rol: currentRol,      // Keep role from profile view as it's not editable here
      };
            
      try {
        // If there's a new password, we'll let the backend handle the hashing
        if (newPassword) {
          formData.password = newPassword; // Send plain password - backend will hash it
        }

        console.log('Sending update request with data:', formData);
        const response = await fetch(`http://localhost:5000/usuarios/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
        
        const responseData = await response.json().catch(() => ({}));
        console.log('Server response:', {
          status: response.status,
          statusText: response.statusText,
          data: responseData
        });

        if (!response.ok) {
          throw new Error(responseData.error || 'Error al actualizar el perfil');
        }

        // Update the profile view with the user data
        document.getElementById('profileName').textContent = formData.nombre || 'No especificado';
        document.getElementById('profileEmail').textContent = formData.correo || 'No especificado';
        document.getElementById('profileRol').textContent = formData.rol || 'No especificado';
        
        document.getElementById('profileTelefono').textContent = formData.telefono || 'No especificado';
        document.getElementById('profileTipoDoc').textContent = {
          'ti': 'Tarjeta de identidad',
          'cc': 'Cédula de ciudadanía',
          'ce': 'Cédula extranjera',
          'pep': 'Persona Políticamente Expuesta',
          'ppt': 'Permiso de protección temporal'
        }[formData.tipo_documento] || formData.tipo_documento;
        document.getElementById('profileNumDoc').textContent = formData.numero_documento;

        // Get password fields
        const currentPasswordField = document.getElementById('currentPassword');
        const newPasswordField = document.getElementById('newPassword');
        const confirmPasswordField = document.getElementById('confirmPassword');
        
        // Check if password was changed before clearing fields
        const wasPasswordChanged = newPasswordField && newPasswordField.value.trim() !== '';
        
        // Clear password fields
        if (currentPasswordField) currentPasswordField.value = '';
        if (newPasswordField) newPasswordField.value = '';
        if (confirmPasswordField) confirmPasswordField.value = '';

        setViewMode(true);

        if (wasPasswordChanged) {
          // If password was changed, show success message and redirect to login
          showToast('¡Éxito!', 'Contraseña actualizada. Serás redirigido al inicio de sesión...', 'success');
          // Clear any existing session data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Redirect to login after a short delay
          setTimeout(() => {
            window.location.href = '../views/index.html';
          }, 2000);
        } else {
          // If no password was changed, just show success message
          showToast('¡Éxito!', 'Perfil actualizado correctamente', 'success');
        }
      } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        console.error('Error stack:', error.stack);
        showToast('Error', `No se pudo actualizar el perfil: ${error.message || 'Error desconocido'}`, 'error');
      }
    });

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
      e.preventDefault(); // Prevenir la redirección inmediata del enlace

      console.log('Cerrando sesión...');

      // Limpiar todos los datos de la sesión del localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRol');
      localStorage.removeItem('userRole'); // Por si se usa esta otra clave

      showToast('Sesión cerrada', 'Has cerrado sesión exitosamente.', 'info');

      // Redirigir al login después de un breve momento
      setTimeout(() => {
        window.location.href = 'index.html'; // O la ruta a tu página de login
      }, 1500);
    });

    // Close when clicking outside modal content
    profileModal.addEventListener('click', (e) => {
      if (e.target === profileModal) {
        console.log('Clicked outside modal, closing...');
        profileModal.classList.remove('active');
        document.body.style.overflow = ''; // Re-enable scrolling
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && profileModal.classList.contains('active')) {
        console.log('Escape key pressed, closing modal');
        profileModal.classList.remove('active');
        document.body.style.overflow = ''; // Re-enable scrolling
      }
    });

    // Initialize click delegation for profile links
    console.log('Setting up click handlers for profile modal...');
    delegateClick('#openProfileModalLink');
    delegateClick('.nav__user-image');
    
    console.log('Profile modal initialization complete');
  }