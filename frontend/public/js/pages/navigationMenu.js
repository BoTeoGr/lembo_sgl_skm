export default function MenuNav() {
    // Selectores principales
    const mobileMenuBtn = document.querySelector('.nav__mobile-menu');
    const mobileMenuContainer = document.querySelector('.nav__mobile-menu-container');
    const overlay = document.querySelector('.nav__overlay');
    const userDropdown = document.querySelector('.nav__user');
    const dropdownBtns = document.querySelectorAll('.nav__dropdown-btn');

    // Toggle menú móvil
    const toggleMobileMenu = () => {
        mobileMenuContainer.classList.toggle('active');
        document.body.style.overflow = mobileMenuContainer.classList.contains('active') ? 'hidden' : '';
        mobileMenuBtn.querySelector('span').textContent = 
            mobileMenuContainer.classList.contains('active') ? 'close' : 'menu';
    };

    // Cerrar menú móvil
    const closeMenu = () => {
        mobileMenuContainer.classList.remove('active');
        document.body.style.overflow = '';
        mobileMenuBtn.querySelector('span').textContent = 'menu';
    };

    // Toggle dropdown del usuario
    const toggleUserDropdown = (e) => {
        e.stopPropagation();
        const dropdown = userDropdown.querySelector('.nav__user-dropdown');
        dropdown.classList.toggle('nav__user-dropdown--active');
    };

    // Cerrar dropdowns al hacer click fuera
    const closeDropdowns = (e) => {
        if (!e.target.closest('.nav__user')) {
            userDropdown.querySelector('.nav__user-dropdown')
                ?.classList.remove('nav__user-dropdown--active');
        }
    };

    // Manejador de resize
    const handleResize = () => {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    };

    // Handle profile link click in mobile menu
    const handleProfileLinkClick = (e) => {
        e.preventDefault();
        closeMenu();
        // Open profile modal
        const profileLink = document.getElementById('openProfileModalLink');
        if (profileLink) {
            profileLink.click();
        }
    };

    // Cerrar menú al hacer click en un enlace
    const handleLinkClick = (e) => {
        if (e.target.closest('.nav__overlay-link')) {
            closeMenu();
        }
    };

    // Event Listeners
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    overlay.addEventListener('click', closeMenu);
    userDropdown.addEventListener('click', toggleUserDropdown);
    document.addEventListener('click', closeDropdowns);
    window.addEventListener('resize', handleResize);
    document.addEventListener('click', handleLinkClick);
    
    // Add click handler for mobile profile link and section
    const mobileProfileLink = document.getElementById('mobileProfileLink');
    const mobileProfileSection = document.getElementById('mobileProfileSection');
    
    if (mobileProfileLink) {
        mobileProfileLink.addEventListener('click', handleProfileLinkClick);
    }
    
    if (mobileProfileSection) {
        mobileProfileSection.addEventListener('click', handleProfileLinkClick);
    }

    // Inicialización
    handleResize();
}
