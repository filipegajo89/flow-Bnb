// ===============================================
// Arquivo: js/mobile-menu.js
// Funcionalidades do menu mobile
// ===============================================

// Configurar menu mobile
function setupMobileMenu() {
    console.log('📱 Configurando menu mobile...');
    
    // Criar menu mobile se não existir
    if (!document.getElementById('mobileMenu')) {
        createMobileMenu();
    }
    
    // Criar header mobile se não existir
    if (!document.getElementById('mobileHeader')) {
        createMobileHeader();
    }
    
    // Criar FAB (Floating Action Button)
    if (!document.getElementById('mobileFAB')) {
        createMobileFAB();
    }
    
    // Configurar eventos
    setupMobileEvents();
    
    // Marcar item ativo baseado na página atual
    updateActiveMenuItem();
    
    console.log('✅ Menu mobile configurado');
}

// Criar estrutura do menu mobile
function createMobileMenu() {
    const mobileMenu = document.createElement('div');
    mobileMenu.id = 'mobileMenu';
    mobileMenu.className = 'mobile-menu';
    
    mobileMenu.innerHTML = `
        <a href="dashboard.html" class="mobile-menu-item" data-page="dashboard">
            <i class="fas fa-home mobile-menu-icon"></i>
            <span class="mobile-menu-label">Início</span>
        </a>
        <a href="properties.html" class="mobile-menu-item" data-page="properties">
            <i class="fas fa-building mobile-menu-icon"></i>
            <span class="mobile-menu-label">Imóveis</span>
        </a>
        <a href="transactions.html" class="mobile-menu-item" data-page="transactions">
            <i class="fas fa-exchange-alt mobile-menu-icon"></i>
            <span class="mobile-menu-label">Transações</span>
        </a>
        <a href="reports.html" class="mobile-menu-item" data-page="reports">
            <i class="fas fa-chart-bar mobile-menu-icon"></i>
            <span class="mobile-menu-label">Relatórios</span>
        </a>
        <a href="#" class="mobile-menu-item" id="mobileProfileMenuItem">
            <i class="fas fa-user mobile-menu-icon"></i>
            <span class="mobile-menu-label">Perfil</span>
        </a>
    `;
    
    document.body.appendChild(mobileMenu);
}

// Criar header mobile
function createMobileHeader() {
    const mobileHeader = document.createElement('div');
    mobileHeader.id = 'mobileHeader';
    mobileHeader.className = 'mobile-header';
    
    mobileHeader.innerHTML = `
        <div class="mobile-header-title">
            <img src="../assets/images/logo.png" alt="FlowBnb" class="mobile-header-logo">
            <span>FlowBnb</span>
        </div>
        <button id="mobileProfileBtn" class="mobile-profile-btn">
            <i class="fas fa-user"></i>
        </button>
    `;
    
    document.body.insertBefore(mobileHeader, document.body.firstChild);
}

// Criar Floating Action Button
function createMobileFAB() {
    const fab = document.createElement('button');
    fab.id = 'mobileFAB';
    fab.className = 'mobile-fab';
    fab.innerHTML = '<i class="fas fa-plus"></i>';
    
    // Quick actions container
    const quickActions = document.createElement('div');
    quickActions.id = 'mobileQuickActions';
    quickActions.className = 'mobile-quick-actions';
    quickActions.innerHTML = `
        <button class="mobile-quick-action property" title="Novo Imóvel">
            <i class="fas fa-home"></i>
        </button>
        <button class="mobile-quick-action transaction" title="Nova Transação">
            <i class="fas fa-dollar-sign"></i>
        </button>
    `;
    
    // Overlay
    const overlay = document.createElement('div');
    overlay.id = 'mobileOverlay';
    overlay.className = 'mobile-overlay';
    
    document.body.appendChild(fab);
    document.body.appendChild(quickActions);
    document.body.appendChild(overlay);
}

// Configurar eventos mobile
function setupMobileEvents() {
    // FAB click
    const fab = document.getElementById('mobileFAB');
    const quickActions = document.getElementById('mobileQuickActions');
    const overlay = document.getElementById('mobileOverlay');
    
    if (fab && quickActions && overlay) {
        fab.addEventListener('click', function() {
            const isOpen = quickActions.classList.contains('show');
            
            if (isOpen) {
                quickActions.classList.remove('show');
                overlay.classList.remove('show');
                fab.innerHTML = '<i class="fas fa-plus"></i>';
            } else {
                quickActions.classList.add('show');
                overlay.classList.add('show');
                fab.innerHTML = '<i class="fas fa-times"></i>';
            }
        });
        
        // Fechar ao clicar no overlay
        overlay.addEventListener('click', function() {
            quickActions.classList.remove('show');
            overlay.classList.remove('show');
            fab.innerHTML = '<i class="fas fa-plus"></i>';
        });
        
        // Quick actions
        const propertyBtn = quickActions.querySelector('.mobile-quick-action.property');
        const transactionBtn = quickActions.querySelector('.mobile-quick-action.transaction');
        
        if (propertyBtn) {
            propertyBtn.addEventListener('click', function() {
                // Fechar quick actions
                quickActions.classList.remove('show');
                overlay.classList.remove('show');
                fab.innerHTML = '<i class="fas fa-plus"></i>';
                
                // Abrir modal de adicionar imóvel
                const modal = document.getElementById('addPropertyModal');
                if (modal) {
                    modal.classList.remove('hidden');
                    modal.classList.add('flex');
                }
            });
        }
        
        if (transactionBtn) {
            transactionBtn.addEventListener('click', function() {
                // Fechar quick actions
                quickActions.classList.remove('show');
                overlay.classList.remove('show');
                fab.innerHTML = '<i class="fas fa-plus"></i>';
                
                // Abrir modal de transação
                if (window.openQuickTransactionModal) {
                    window.openQuickTransactionModal();
                } else {
                    const modal = document.getElementById('addTransactionModal') || 
                                 document.getElementById('quickTransactionModal');
                    if (modal) {
                        modal.classList.remove('hidden');
                        modal.classList.add('flex');
                    }
                }
            });
        }
    }
    
    // Profile button
    const profileBtn = document.getElementById('mobileProfileBtn');
    const profileMenuItem = document.getElementById('mobileProfileMenuItem');
    
    if (profileBtn) {
        profileBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            showMobileProfileMenu();
        });
    }
    
    if (profileMenuItem) {
        profileMenuItem.addEventListener('click', function(e) {
            e.preventDefault();
            showMobileProfileMenu();
        });
    }
}

// Mostrar menu de perfil mobile
function showMobileProfileMenu() {
    // Criar dropdown se não existir
    let dropdown = document.getElementById('mobileDropdown');
    
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.id = 'mobileDropdown';
        dropdown.className = 'mobile-dropdown';
        
        const user = auth.currentUser;
        const userName = user ? user.email.split('@')[0] : 'Usuário';
        const userEmail = user ? user.email : 'usuario@email.com';
        
        dropdown.innerHTML = `
            <div class="dropdown-header">
                <div class="dropdown-user-name">${userName.charAt(0).toUpperCase() + userName.slice(1)}</div>
                <div class="dropdown-user-email">${userEmail}</div>
            </div>
            <div class="dropdown-items">
                <a href="#" class="dropdown-item" onclick="showNotification('Perfil em desenvolvimento', 'info'); return false;">
                    <i class="fas fa-user-circle"></i>
                    <span>Meu Perfil</span>
                </a>
                <a href="#" class="dropdown-item" onclick="showNotification('Configurações em desenvolvimento', 'info'); return false;">
                    <i class="fas fa-cog"></i>
                    <span>Configurações</span>
                </a>
                <div class="dropdown-divider"></div>
                <a href="#" class="dropdown-item logout-item" onclick="handleLogout(); return false;">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>Sair</span>
                </a>
            </div>
        `;
        
        document.body.appendChild(dropdown);
    }
    
    // Toggle dropdown
    dropdown.classList.toggle('show');
    
    // Fechar ao clicar fora
    setTimeout(() => {
        document.addEventListener('click', closeMobileDropdown);
    }, 100);
}

// Fechar dropdown mobile
function closeMobileDropdown(e) {
    const dropdown = document.getElementById('mobileDropdown');
    const profileBtn = document.getElementById('mobileProfileBtn');
    
    if (dropdown && !dropdown.contains(e.target) && e.target !== profileBtn) {
        dropdown.classList.remove('show');
        document.removeEventListener('click', closeMobileDropdown);
    }
}

// Atualizar item ativo do menu
function updateActiveMenuItem() {
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'dashboard';
    const menuItems = document.querySelectorAll('.mobile-menu-item');
    
    menuItems.forEach(item => {
        const itemPage = item.dataset.page;
        if (itemPage === currentPage || (currentPage === '' && itemPage === 'dashboard')) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Função de logout
function handleLogout() {
    if (confirm('Tem certeza que deseja sair?')) {
        auth.signOut().then(() => {
            window.location.href = '../index.html';
        }).catch(error => {
            console.error('Erro ao fazer logout:', error);
            showNotification('Erro ao fazer logout', 'error');
        });
    }
}

// Ajustar padding do conteúdo principal no mobile
function adjustMainContentPadding() {
    const mainContent = document.querySelector('.main-content');
    if (mainContent && window.innerWidth <= 768) {
        mainContent.style.paddingTop = '70px';
        mainContent.style.paddingBottom = '80px';
    }
}

// Inicializar menu mobile quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos em uma página autenticada
    if (!window.location.pathname.includes('index.html') && !window.location.pathname.endsWith('/')) {
        setupMobileMenu();
        adjustMainContentPadding();
        
        // Ajustar ao redimensionar
        window.addEventListener('resize', adjustMainContentPadding);
    }
});

// Exportar funções globais
window.setupMobileMenu = setupMobileMenu;
window.showMobileProfileMenu = showMobileProfileMenu;
window.handleLogout = handleLogout;
