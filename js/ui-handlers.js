// ===============================================
// Arquivo: js/ui-handlers.js - VERSÃO CORRIGIDA
// Manipuladores de interface do usuário
// ===============================================

console.log('🚀 UI Handlers carregado');

// Função para abrir qualquer modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        console.log(`✅ Modal ${modalId} aberto`);
        return true;
    } else {
        console.error(`❌ Modal ${modalId} não encontrado`);
        return false;
    }
}

// Função para fechar qualquer modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
        console.log(`✅ Modal ${modalId} fechado`);
        return true;
    } else {
        console.error(`❌ Modal ${modalId} não encontrado`);
        return false;
    }
}

// Função para exibir notificações
function showNotification(message, type = 'success') {
    // Remover notificação existente se houver
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Criar nova notificação
    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-300 transform translate-x-full`;
    
    // Definir cor baseada no tipo
    switch (type) {
        case 'success':
            notification.classList.add('bg-green-500');
            break;
        case 'error':
            notification.classList.add('bg-red-500');
            break;
        case 'warning':
            notification.classList.add('bg-yellow-500');
            break;
        default:
            notification.classList.add('bg-blue-500');
    }
    
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Remover após 4 segundos
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}

// FUNÇÃO PRINCIPAL - Configurar formulário de adicionar imóvel
function setupAddPropertyForm() {
    const addPropertyForm = document.getElementById('addPropertyForm');
    
    if (!addPropertyForm) {
        console.warn('⚠️ Formulário de adicionar imóvel não encontrado');
        return;
    }
    
    console.log('✅ Formulário de adicionar imóvel encontrado e configurado');
    
    addPropertyForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('📝 Formulário de adicionar imóvel enviado');
        
        // Desabilitar botão de envio para evitar duplo clique
        const submitBtn = addPropertyForm.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Adicionando...';
        }
        
        try {
            // Verificar autenticação
            const user = auth.currentUser;
            if (!user) {
                throw new Error('Usuário não está autenticado');
            }
            console.log('✅ Usuário autenticado:', user.email);
            
            // Coletar dados do formulário
            const propertyData = {
                name: addPropertyForm.querySelector('#propertyName').value.trim(),
                address: addPropertyForm.querySelector('#propertyAddress').value.trim(),
                city: addPropertyForm.querySelector('#propertyCity').value.trim(),
                state: addPropertyForm.querySelector('#propertyState').value.trim(),
                image: addPropertyForm.querySelector('#propertyImage').value.trim() || null,
                status: 'active'
            };
            
            console.log('📋 Dados coletados:', propertyData);
            
            // Validar dados básicos
            if (!propertyData.name || !propertyData.address || !propertyData.city || !propertyData.state) {
                throw new Error('Todos os campos obrigatórios devem ser preenchidos');
            }
            
            // Chamar função de adicionar imóvel
            console.log('💾 Salvando imóvel no Firestore...');
            const propertyId = await addProperty(propertyData);
            console.log('✅ Imóvel salvo com ID:', propertyId);
            
            // Fechar modal
            closeModal('addPropertyModal');
            
            // Limpar formulário
            addPropertyForm.reset();
            
            // Mostrar notificação de sucesso
            showNotification('Imóvel adicionado com sucesso!', 'success');
            
            // IMPORTANTE: Recarregar a lista de imóveis SEM recarregar a página
            console.log('🔄 Recarregando lista de imóveis...');
            await loadAndDisplayProperties();
            console.log('✅ Lista de imóveis atualizada!');
            
        } catch (error) {
            console.error('❌ Erro ao adicionar imóvel:', error);
            showNotification(`Erro ao adicionar imóvel: ${error.message}`, 'error');
        } finally {
            // Reabilitar botão
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        }
    });
}

// Configurar listeners para botões de fechar modal
function setupModalCloseButtons(modalId) {
    // Botão X no header
    const closeBtn = document.getElementById(`close${modalId}`);
    if (closeBtn) {
        console.log(`✅ Botão X para ${modalId} configurado`);
        closeBtn.addEventListener('click', () => closeModal(modalId));
    }
    
    // Botão Cancelar
    const cancelBtn = document.getElementById(`cancel${modalId.replace('Modal', '')}`);
    if (cancelBtn) {
        console.log(`✅ Botão Cancelar para ${modalId} configurado`);
        cancelBtn.addEventListener('click', () => closeModal(modalId));
    }
    
    // Fechar ao clicar fora do modal
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modalId);
            }
        });
    }
}

// Configurar menu do usuário
function setupUserMenu() {
    const userMenuBtn = document.getElementById('userAvatarBtn');
    const userMenuDropdown = document.getElementById('userDropdownMenu');
    
    if (userMenuBtn && userMenuDropdown) {
        console.log('✅ Menu de usuário configurado');
        
        userMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('👤 Menu do usuário clicado');
            userMenuDropdown.classList.toggle('show');
        });
        
        // Fechar ao clicar fora
        document.addEventListener('click', function(event) {
            if (userMenuDropdown.classList.contains('show') && 
                !userMenuBtn.contains(event.target) && 
                !userMenuDropdown.contains(event.target)) {
                userMenuDropdown.classList.remove('show');
            }
        });
        
        // Preencher dados do usuário
        auth.onAuthStateChanged(user => {
            if (user) {
                const dropdownUserName = document.getElementById('dropdownUserName');
                const dropdownUserEmail = document.getElementById('dropdownUserEmail');
                
                if (dropdownUserName && dropdownUserEmail) {
                    // Extrair nome do email
                    const userName = user.email.split('@')[0];
                    dropdownUserName.textContent = userName.charAt(0).toUpperCase() + userName.slice(1);
                    dropdownUserEmail.textContent = user.email;
                }
            }
        });
    } else {
        console.warn('⚠️ Menu de usuário não encontrado completamente');
    }
}

// Configurar filtro de mês
function setupMonthFilter() {
    const monthFilter = document.getElementById('monthFilter');
    if (monthFilter) {
        console.log('✅ Filtro de mês configurado');
        
        // Definir mês atual como padrão
        const currentMonth = new Date().getMonth() + 1;
        monthFilter.value = currentMonth.toString();
        
        monthFilter.addEventListener('change', async () => {
            const value = monthFilter.value;
            console.log(`📅 Filtro alterado para: ${value}`);
            
            try {
                showLoadingState();
                await loadAndDisplayProperties(value === 'all' ? null : value);
            } catch (error) {
                console.error('❌ Erro ao aplicar filtro:', error);
                showNotification('Erro ao aplicar filtro', 'error');
            }
        });
    }
}

// Configurar menu mobile
function setupMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (mobileMenuToggle && sidebar) {
        console.log('✅ Menu mobile configurado');
        
        mobileMenuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('open');
        });
        
        // Fechar ao clicar fora em mobile
        document.addEventListener('click', function(event) {
            if (sidebar.classList.contains('open') && 
                !sidebar.contains(event.target) && 
                !mobileMenuToggle.contains(event.target)) {
                sidebar.classList.remove('open');
            }
        });
    }
}

// INICIALIZAÇÃO PRINCIPAL
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 DOM carregado - Inicializando UI Handlers');
    
    // Aguardar o Firebase Auth estar pronto
    auth.onAuthStateChanged(user => {
        if (user) {
            console.log('🔐 Usuário autenticado, configurando interface');
            
            // Configurar botão de adicionar imóvel
            const addPropertyBtn = document.getElementById('addPropertyBtn');
            if (addPropertyBtn) {
                console.log('✅ Botão "Novo Imóvel" encontrado');
                addPropertyBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('🏠 Botão "Novo Imóvel" clicado');
                    openModal('addPropertyModal');
                });
            } else {
                console.warn('⚠️ Botão "Novo Imóvel" não encontrado');
            }
            
            // Configurar todos os componentes
            setupModalCloseButtons('addPropertyModal');
            setupAddPropertyForm();
            setupUserMenu();
            setupMonthFilter();
            setupMobileMenu();
            
            // Carregar imóveis inicialmente se estivermos no dashboard
            if (window.location.pathname.includes('dashboard')) {
                console.log('📊 Página dashboard detectada - carregando imóveis');
                loadAndDisplayProperties();
            }
            
            console.log('🎉 Interface configurada com sucesso!');
        } else {
            console.log('🚫 Usuário não autenticado');
        }
    });
});

// Tornar funções globais para acesso de outros scripts
window.openModal = openModal;
window.closeModal = closeModal;
window.showNotification = showNotification;
