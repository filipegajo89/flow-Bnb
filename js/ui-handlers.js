// Arquivo: js/ui-handlers.js
console.log('UI Handlers carregado');

// Função para abrir qualquer modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        console.log(`Modal ${modalId} aberto`);
        return true;
    } else {
        console.error(`Modal ${modalId} não encontrado`);
        return false;
    }
}

// Função para fechar qualquer modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
        console.log(`Modal ${modalId} fechado`);
        return true;
    } else {
        console.error(`Modal ${modalId} não encontrado`);
        return false;
    }
}

// Inicializar todos os handlers de UI quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado para ui-handlers.js');
    
    // Capturar botão de adicionar imóvel
    const addPropertyBtn = document.getElementById('addPropertyBtn');
    if (addPropertyBtn) {
        console.log('Botão "Novo Imóvel" encontrado');
        addPropertyBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Botão "Novo Imóvel" clicado');
            openModal('addPropertyModal');
        });
    } else {
        console.warn('Botão "Novo Imóvel" não encontrado no DOM');
    }
    
    // Capturar botão do menu de usuário
    const userMenuBtn = document.querySelector('.avatar-button') || document.getElementById('userAvatarBtn');
    const userMenuDropdown = document.querySelector('.dropdown-menu') || document.getElementById('userDropdownMenu');
    
    if (userMenuBtn && userMenuDropdown) {
        console.log('Menu de usuário encontrado');
        userMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation(); // Impedir propagação para o documento
            console.log('Botão do menu do usuário clicado');
            userMenuDropdown.classList.toggle('show');
        });
        
        // Fechar o dropdown quando clicar fora dele
        document.addEventListener('click', function(event) {
            if (userMenuDropdown.classList.contains('show') && 
                !userMenuBtn.contains(event.target) && 
                !userMenuDropdown.contains(event.target)) {
                userMenuDropdown.classList.remove('show');
            }
        });
    } else {
        console.warn('Menu de usuário não encontrado completamente');
        console.warn('Botão encontrado:', !!userMenuBtn);
        console.warn('Dropdown encontrado:', !!userMenuDropdown);
    }
    
    // Capturar botões de fechar modais
    const closeButtons = document.querySelectorAll('[id^="close"][id$="Modal"], [id^="cancel"][id$="Property"]');
    closeButtons.forEach(button => {
        const modalId = button.id.replace('close', '').replace('cancel', '').replace('Property', '');
        button.addEventListener('click', function() {
            closeModal(modalId + 'Modal');
        });
    });
});

// Exportar funções para uso global
window.openModal = openModal;
window.closeModal = closeModal;
