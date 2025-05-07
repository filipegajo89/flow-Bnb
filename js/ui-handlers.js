// Arquivo: js/ui-handlers.js
console.log('UI Handlers carregado');

// Função para abrir qualquer modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        console.log(`Modal ${modalId} aberto`);
        // Após abrir o modal, verificar sua estrutura para depuração
        setTimeout(function() {
            logModalStructure(modalId);
        }, 100);
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

// Função para adicionar um novo imóvel
function setupAddPropertyForm() {
    const addPropertyForm = document.getElementById('addPropertyForm');
    
    if (addPropertyForm) {
        console.log('Formulário de adicionar imóvel encontrado e configurado');
        
        addPropertyForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Formulário de adicionar imóvel enviado');
            
            // Obter dados do formulário
            const propertyData = {
                name: addPropertyForm.querySelector('#propertyName').value,
                address: addPropertyForm.querySelector('#propertyAddress').value,
                city: addPropertyForm.querySelector('#propertyCity').value,
                state: addPropertyForm.querySelector('#propertyState').value,
                image: addPropertyForm.querySelector('#propertyImage').value || null,
                status: 'active' // Status padrão
            };
            
            console.log('Dados do imóvel:', propertyData);
            
            try {
                // Verificar se a função addProperty existe
                if (typeof window.addProperty === 'function') {
                    // Adicionar o imóvel usando a função global
                    await window.addProperty(propertyData);
                    console.log('Imóvel adicionado com sucesso');
                    
                    // Fechar o modal
                    closeModal('addPropertyModal');
                    
                    // Limpar o formulário
                    addPropertyForm.reset();
                    
                    // Recarregar a lista de imóveis
                    if (typeof window.loadAndDisplayProperties === 'function') {
                        window.loadAndDisplayProperties();
                    } else {
                        console.warn('Função loadAndDisplayProperties não encontrada');
                        // Recarregar a página como alternativa
                        window.location.reload();
                    }
                    
                    // Exibir mensagem de sucesso
                    alert('Imóvel adicionado com sucesso!');
                } else {
                    throw new Error('Função addProperty não encontrada');
                }
            } catch (error) {
                console.error('Erro ao adicionar imóvel:', error);
                alert('Erro ao adicionar imóvel: ' + error.message);
            }
        });
    } else {
        console.warn('Formulário de adicionar imóvel não encontrado');
    }
}

// Função para registrar botões de fechamento do modal
function setupModalCloseButtons(modalId) {
    // Botão X no topo
    const closeBtn = document.getElementById(`close${modalId}`);
    if (closeBtn) {
        console.log(`Botão X para fechar ${modalId} encontrado`);
        closeBtn.addEventListener('click', function() {
            console.log(`Botão X para ${modalId} clicado`);
            closeModal(modalId);
        });
    } else {
        console.warn(`Botão X para fechar ${modalId} não encontrado`);
    }
    
    // Botão Cancelar
    const cancelBtn = document.getElementById(`cancel${modalId.replace('Modal', '')}`);
    if (cancelBtn) {
        console.log(`Botão Cancelar para ${modalId} encontrado`);
        cancelBtn.addEventListener('click', function() {
            console.log(`Botão Cancelar para ${modalId} clicado`);
            closeModal(modalId);
        });
    } else {
        console.warn(`Botão Cancelar para ${modalId} não encontrado`);
    }
}

// Função para depuração da estrutura do modal
function logModalStructure(modalId) {
    console.log(`=== ESTRUTURA DO MODAL ${modalId} ===`);
    const modal = document.getElementById(modalId);
    console.log('Elemento do modal:', modal);
    
    if (modal) {
        // Registrar todos os elementos importantes
        console.log(`Botão fechar: ${modalId.replace('Modal', '')}`, modal.querySelector(`#close${modalId}`));
        console.log(`Botão cancelar: ${modalId.replace('Modal', '')}`, modal.querySelector(`#cancel${modalId.replace('Modal', '')}`));
        console.log('Formulário:', modal.querySelector(`#${modalId.replace('Modal', '')}Form`));
        
        // Se for o modal de adicionar imóvel, registrar campos específicos
        if (modalId === 'addPropertyModal') {
            const form = modal.querySelector('#addPropertyForm');
            if (form) {
                console.log('Campo nome:', form.querySelector('#propertyName'));
                console.log('Campo endereço:', form.querySelector('#propertyAddress'));
                console.log('Campo cidade:', form.querySelector('#propertyCity'));
                console.log('Campo estado:', form.querySelector('#propertyState'));
                console.log('Campo imagem:', form.querySelector('#propertyImage'));
                console.log('Botão submit:', form.querySelector('button[type="submit"]'));
            }
        }
    }
    console.log(`=== FIM DA ESTRUTURA DO MODAL ${modalId} ===`);
}

// Função para configurar botão do menu de usuário
function setupUserMenu() {
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
    
    // Configurar botões específicos para o modal de adicionar imóvel
    setupModalCloseButtons('addPropertyModal');
    
    // Configurar formulário de adicionar imóvel
    setupAddPropertyForm();
    
    // Configurar menu do usuário
    setupUserMenu();
    
    // Capturar todos os botões de fechar modais de forma genérica
    const closeButtons = document.querySelectorAll('[id^="close"][id$="Modal"]');
    closeButtons.forEach(button => {
        const modalId = button.id.replace('close', '');
        button.addEventListener('click', function() {
            closeModal(modalId);
        });
    });
    
    // Capturar todos os botões de cancelar de forma genérica
    const cancelButtons = document.querySelectorAll('[id^="cancel"]');
    cancelButtons.forEach(button => {
        const baseId = button.id.replace('cancel', '');
        button.addEventListener('click', function() {
            closeModal(baseId + 'Modal');
        });
    });
    
    // Adicionar fixadores diretos para elementos problemáticos
    // estes são backups caso os métodos acima falhem
    const directCloseBtn = document.getElementById('closeAddPropertyModal');
    if (directCloseBtn) {
        directCloseBtn.onclick = function() {
            document.getElementById('addPropertyModal').classList.add('hidden');
            document.getElementById('addPropertyModal').classList.remove('flex');
        };
    }
    
    const directCancelBtn = document.getElementById('cancelAddProperty');
    if (directCancelBtn) {
        directCancelBtn.onclick = function() {
            document.getElementById('addPropertyModal').classList.add('hidden');
            document.getElementById('addPropertyModal').classList.remove('flex');
        };
    }
});

// Registrar no objeto window para acesso global
window.openModal = openModal;
window.closeModal = closeModal;
