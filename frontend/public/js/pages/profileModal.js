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
              <ul class="profile-list">
                <li><strong>Nombre:</strong> <span id="profileName"></span></li>
                <li><strong>Correo:</strong> <span id="profileEmail"></span></li>
                <li><strong>Rol:</strong> <span id="profileRol"></span></li>
                <li><strong>Teléfono:</strong> <span id="profileTelefono"></span></li>
                <li><strong>Tipo de documento:</strong> <span id="profileTipoDoc"></span></li>
                <li><strong>Número de documento:</strong> <span id="profileNumDoc"></span></li>
              </ul>
              <div id="adminMessage" class="admin-message" style="display: none; margin-top: 1.5rem; padding: 0.75rem; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                <p style="margin: 0; color: #856404; font-size: 0.9rem;">
                  <span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 8px;">info</span>
                  Para actualizar sus datos, comuníquese con un administrador de la granja.
                </p>
              </div>
            </div>
            <div class="modal__footer">
              <a href="index.html" class="modal__logout-btn">
                <span class="material-symbols-outlined">logout</span>
                <span>Cerrar Sesión</span>
              </a>
            </div>
          </div>
        </div>`;
      document.body.appendChild(wrapper.firstElementChild);
      modal = document.getElementById('profileModal');
    }
  
    const profileModal = modal;
    const closeBtn = document.getElementById('closeProfileModal');
  
    // Helper: fill modal fields
    const fillFields = (src = {}) => {
      const userRole = src.userRol ?? src.rol ?? localStorage.getItem('userRol') ?? '';
      const profileFields = {
        profileName: src.userName ?? src.nombre ?? localStorage.getItem('userName') ?? '',
        profileEmail: src.userEmail ?? src.correo ?? src.email ?? localStorage.getItem('userEmail') ?? '',
        profileRol: userRole,
        profileTelefono: src.userTelefono ?? src.telefono ?? src.phone ?? localStorage.getItem('userTelefono') ?? '',
        profileTipoDoc: src.userTipoDoc ?? src.tipo_documento ?? src.tipoDoc ?? src.tipoDocumento ?? localStorage.getItem('userTipoDoc') ?? '',
        profileNumDoc: src.userNumDoc ?? src.numero_documento ?? src.numDoc ?? src.documento ?? localStorage.getItem('userNumDoc') ?? ''
      };
      
      // Fill all profile fields
      Object.entries(profileFields).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = (value ?? '').toString();
      });
      
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
        
        console.log('=== INICIO DE DEPURACIÓN ===');
        console.log('ID de usuario del localStorage:', userId);
        console.log('Token del localStorage:', token ? 'Token presente' : 'Token no encontrado');
        
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
        
        console.log('Respuesta del servidor - Estado:', res.status, res.statusText);
        
        if (!res.ok) {
          console.error('Error en la respuesta del servidor:', res.status, res.statusText);
          const errorText = await res.text();
          console.error('Detalles del error:', errorText);
          return;
        }
        
        const data = await res.json();
        console.log('Datos recibidos del servidor:', data);
        
        // Verificar diferentes formatos de respuesta
        let userData = data;
        if (data && typeof data === 'object') {
          userData = data.usuario || data.user || data.data || data;
          console.log('Datos del usuario extraídos:', userData);
        }
        
        if (userData && typeof userData === 'object') {
          console.log('Campos disponibles en userData:', Object.keys(userData));
          console.log('Valores completos:', JSON.stringify(userData, null, 2));
          
          // Mostrar datos específicos en la consola
          console.log('=== DATOS DEL USUARIO ===');
          console.log('ID:', userData.id);
          console.log('Nombre:', userData.nombre);
          console.log('Correo:', userData.correo || userData.email);
          console.log('Teléfono:', userData.telefono || userData.celular);
          console.log('Tipo Documento:', userData.tipo_documento);
          console.log('Número Documento:', userData.numero_documento || userData.documento);
          console.log('Rol:', userData.rol);
          console.log('Estado:', userData.estado);
          console.log('==========================');
          
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
      });
    } else {
      console.warn('Close button not found');
    }

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