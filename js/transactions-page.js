// Funções específicas para a página de transações

// Variáveis de controle
let lastDoc = null; // Referência para paginação do Firestore
let transactionsPerPage = 20; // Número de transações por página
let allTransactionsCount = 0; // Total de transações (para contagem)
let currentFilters = { // Filtros atuais
    property: 'all',
    startDate: null,
    endDate: null,
    type: 'all',
    search: ''
};

// Inicializar a página de transações
const initTransactionsPage = async () => {
    console.log('Inicializando página de transações...');
    
    try {
        // Carregar as opções de imóveis para os filtros e modal
        await loadPropertyOptions();
        
        // Configurar listeners de eventos
        setupEventListeners();
        
        // Carregar transações iniciais
        await loadAndDisplayTransactions(true);
        
        // Inicializar datas
        setDefaultDates();
    } catch (error) {
        console.error('Erro ao inicializar página de transações:', error);
        showErrorMessage('Ocorreu um erro ao carregar a página. Por favor, atualize e tente novamente.');
    }
};

// Configurar todos os listeners de eventos da página
const setupEventListeners = () => {
    // Botão de adicionar transação
    const addTransactionBtn = document.getElementById('addTransactionBtn');
    if (addTransactionBtn) {
        addTransactionBtn.addEventListener('click', () => {
            openAddTransactionModal();
        });
    }
    
    // Botão de aplicar filtros
    const applyFiltersBtn = document.getElementById('applyFilters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            applyFilters();
        });
    }
    
    // Botão de limpar filtros
    const clearFiltersBtn = document.getElementById('clearFilters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            clearFilters();
        });
    }
    
    // Campo de busca (com evento de digitação)
    const searchInput = document.getElementById('searchTransaction');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            // Pesquisa ao digitar com debounce (300ms)
            clearTimeout(searchInput.timer);
            searchInput.timer = setTimeout(() => {
                currentFilters.search = searchInput.value.trim();
                loadAndDisplayTransactions(true);
            }, 300);
        });
    }
    
    // Botão de carregar mais transações
    const loadMoreBtn = document.getElementById('loadMoreTransactions');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            loadAndDisplayTransactions(false);
        });
    }
    
    // Botão de exportar transações
    const exportBtn = document.getElementById('exportTransactions');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            exportTransactionsToCSV();
        });
    }
    
    // Modal de adicionar transação - eventos
    setupAddTransactionModalListeners();
    
    // Modal de editar transação - eventos
    setupEditTransactionModalListeners();
    
    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
    
    // Eventos do dropdown do usuário
    setupUserDropdownListeners();
};

// Configurar listeners do dropdown do usuário
const setupUserDropdownListeners = () => {
    const userAvatarBtn = document.getElementById('userAvatarBtn');
    const userDropdownMenu = document.getElementById('userDropdownMenu');
    
    if (userAvatarBtn && userDropdownMenu) {
        userAvatarBtn.addEventListener('click', () => {
            userDropdownMenu.classList.toggle('show');
        });
        
        // Fechar ao clicar fora
        document.addEventListener('click', (event) => {
            if (!userAvatarBtn.contains(event.target) && !userDropdownMenu.contains(event.target)) {
                userDropdownMenu.classList.remove('show');
            }
        });
    }
};

// Carregar opções de imóveis para os filtros e modal
const loadPropertyOptions = async () => {
    try {
        const properties = await getProperties();
        
        if (properties.length === 0) {
            return;
        }
        
        // Preencher dropdown de filtro de imóveis
        const propertyFilterSelect = document.getElementById('propertyFilter');
        if (propertyFilterSelect) {
            // Manter a opção "Todos os imóveis"
            let optionsHtml = '<option value="all">Todos os imóveis</option>';
            
            properties.forEach(property => {
                optionsHtml += `<option value="${property.id}">${property.name}</option>`;
            });
            
            propertyFilterSelect.innerHTML = optionsHtml;
        }
        
        // Preencher dropdown do modal de adicionar transação
        const transactionPropertySelect = document.getElementById('transactionPropertySelect');
        if (transactionPropertySelect) {
            let optionsHtml = '<option value="">Selecione um imóvel</option>';
            
            properties.forEach(property => {
                optionsHtml += `<option value="${property.id}">${property.name}</option>`;
            });
            
            transactionPropertySelect.innerHTML = optionsHtml;
        }
        
        // Preencher dropdown do modal de editar transação
        const editTransactionPropertySelect = document.getElementById('editTransactionPropertySelect');
        if (editTransactionPropertySelect) {
            let optionsHtml = '<option value="">Selecione um imóvel</option>';
            
            properties.forEach(property => {
                optionsHtml += `<option value="${property.id}">${property.name}</option>`;
            });
            
            editTransactionPropertySelect.innerHTML = optionsHtml;
        }
