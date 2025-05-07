// Funções específicas para a página de imóveis

// Variáveis de controle para filtros e ordenação
let currentFilters = {
    status: 'all',
    search: '',
    period: 'month'
};

let currentSort = 'name_asc';

// Inicializar a página de imóveis
const initPropertiesPage = async () => {
    console.log('Inicializando página de imóveis...');
    
    try {
        // Configurar listeners de eventos
        setupEventListeners();
        
        // Carregar imóveis iniciais
        await loadAndDisplayProperties();
    } catch (error) {
        console.error('Erro ao inicializar página de imóveis:', error);
        showErrorMessage('Ocorreu um erro ao carregar a página. Por favor, atualize e tente novamente.');
    }
};

// Configurar todos os listeners de eventos da página
const setupEventListeners = () => {
    // Filtro de status
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', () => {
            currentFilters.status = statusFilter.value;
            loadAndDisplayProperties();
        });
    }
    
    // Filtro de período
    const periodFilter = document.getElementById('periodFilter');
    if (periodFilter) {
        periodFilter.addEventListener('change', () => {
            currentFilters.period = periodFilter.value;
            loadAndDisplayProperties();
        });
    }
    
    // Ordenação
    const sortOrder = document.getElementById('sortOrder');
    if (sortOrder) {
        sortOrder.addEventListener('change', () => {
            currentSort = sortOrder.value;
            loadAndDisplayProperties();
        });
    }
    
    // Campo de busca (com debounce)
    const searchInput = document.getElementById('searchProperty');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            clearTimeout(searchInput.timer);
            searchInput.timer = setTimeout(() => {
                currentFilters.search = searchInput.value.trim();
                loadAndDisplayProperties();
            }, 300);
        });
    }
    
    // Botão de adicionar imóvel
    const addPropertyBtn = document.getElementById('addPropertyBtn');
    if (addPropertyBtn) {
        addPropertyBtn.addEventListener('click', () => {
            openAddPropertyModal();
        });
    }
    
    // Modal de adicionar imóvel - eventos
    setupAddPropertyModalListeners();
    
    // Modal de editar imóvel - eventos
    setupEditPropertyModalListeners();
    
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

// Função principal para carregar e exibir imóveis
const loadAndDisplayProperties = async () => {
    try {
        // Obter referência à lista
        const propertiesList = document.getElementById('propertiesList');
        
        // Mostrar loading
        if (propertiesList) {
            propertiesList.innerHTML = `
                <div class="col-span-full loading-state">
                    <div class="spinner"></div>
                    <p class="text-gray-500 mt-2">Carregando seus imóveis...</p>
                </div>
            `;
        }
        
        // Obter imóveis do usuário
        let properties = await getFilteredProperties();
        
        // Verificar se há imóveis
        if (properties.length === 0) {
            propertiesList.innerHTML = `
                <div class="col-span-full empty-state">
                    <i class="fas fa-home empty-icon"></i>
                    <h3 class="empty-title">Nenhum imóvel encontrado</h3>
                    <p class="empty-text">Não encontramos nenhum imóvel com os filtros selecionados. Tente ajustar os filtros ou adicione um novo imóvel.</p>
                    <button id="addFirstPropertyBtn" class="btn-primary">
                        <i class="fas fa-plus btn-icon"></i>Adicionar Novo Imóvel
                    </button>
                </div>
            `;
            
            // Adicionar listener ao botão
            const addFirstPropertyBtn = document.getElementById('addFirstPropertyBtn');
            if (addFirstPropertyBtn) {
                addFirstPropertyBtn.addEventListener('click', openAddPropertyModal);
            }
            
            // Atualizar contadores
            updatePropertiesCount(0);
            
            // Zerar resumo financeiro
            updateFinancialSummary(0, 0);
            
            return;
        }
        
        // Aplicar ordenação
        properties = sortProperties(properties, currentSort);
        
        // Limpar lista
        propertiesList.innerHTML = '';
        
        // Valores para o resumo financeiro
        let totalIncome = 0;
        let totalExpense = 0;
        
        // Renderizar cada imóvel
        for (const property of properties) {
            // Calcular resumo financeiro baseado no período selecionado
            const financialSummary = await getPropertyFinancialSummaryByPeriod(
                property.id, 
                currentFilters.period
            );
            
            // Atualizar totais
            totalIncome += financialSummary.income;
            totalExpense += financialSummary.expense;
            
            // Renderizar card do imóvel
            const propertyCard = createPropertyCard(property, financialSummary);
            propertiesList.appendChild(propertyCard);
        }
        
        // Atualizar contagem de imóveis
        updatePropertiesCount(properties.length);
        
        // Atualizar resumo financeiro
        updateFinancialSummary(totalIncome, totalExpense);
        
    } catch (error) {
        console.error('Erro ao carregar imóveis:', error);
        const propertiesList = document.getElementById('propertiesList');
        
        if (propertiesList) {
            propertiesList.innerHTML = `
                <div class="col-span-full empty-state">
                    <i class="fas fa-exclamation-circle empty-icon text-red-500"></i>
                    <h3 class="empty-title">Erro ao carregar imóveis</h3>
                    <p class="empty-text">Ocorreu um erro ao carregar seus imóveis. Por favor, tente novamente.</p>
                    <button id="retryLoadBtn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                        <i class="fas fa-redo mr-2"></i>Tentar novamente
                    </button>
                </div>
            `;
            
            const retryLoadBtn = document.getElementById('retryLoadBtn');
            if (retryLoadBtn) {
                retryLoadBtn.addEventListener('click', loadAndDisplayProperties);
            }
        }
    }
};

// Obter imóveis filtrados com base nos critérios atuais
const getFilteredProperties = async () => {
    try {
        // Obter todos os imóveis
        const properties = await getProperties();
        
        // Aplicar filtro de status
        let filteredProperties = properties;
        if (currentFilters.status !== 'all') {
            filteredProperties = filteredProperties.filter(property => 
                property.status === currentFilters.status
            );
        }
        
        // Aplicar filtro de busca (case insensitive)
        if (currentFilters.search) {
            const searchTerm = currentFilters.search.toLowerCase();
            filteredProperties = filteredProperties.filter(property => 
                property.name.toLowerCase().includes(searchTerm) ||
                property.address.toLowerCase().includes(searchTerm) ||
                property.city.toLowerCase().includes(searchTerm) ||
                property.state.toLowerCase().includes(searchTerm)
            );
        }
        
        return filteredProperties;
    } catch (error) {
        console.error('Erro ao filtrar imóveis:', error);
        throw error;
    }
};

// Obter resumo financeiro do imóvel com base no período selecionado
const getPropertyFinancialSummaryByPeriod = async (propertyId, periodType) => {
    try {
        let month = null;
        let year = null;
        let startDate = null;
        let endDate = null;
        
        const today = new Date();
        
        switch (periodType) {
            case 'month':
                // Mês atual
                month = today.getMonth() + 1;
                year = today.getFullYear();
                break;
                
            case 'last_month':
                // Mês anterior
                if (today.getMonth() === 0) {
                    month = 12;
                    year = today.getFullYear() - 1;
                } else {
                    month = today.getMonth();
                    year = today.getFullYear();
                }
                break;
                
            case 'year':
                // Ano atual
                year = today.getFullYear();
                break;
                
            case 'all':
                // Todo o período (sem filtros de data)
                break;
        }
        
        // Obter o resumo financeiro com base nos parâmetros
        if (startDate && endDate) {
            return await getPropertyFinancialSummaryCustomPeriod(propertyId, startDate, endDate);
        } else {
            return await getPropertyFinancialSummary(propertyId, month, year);
        }
    } catch (error) {
        console.error('Erro ao obter resumo financeiro por período:', error);
        throw error;
    }
};

// Ordenar imóveis com base no critério selecionado
const sortProperties = (properties, sortCriteria) => {
    switch (sortCriteria) {
        case 'name_asc':
            return properties.sort((a, b) => a.name.localeCompare(b.name));
            
        case 'name_desc':
            return properties.sort((a, b) => b.name.localeCompare(a.name));
            
        case 'date_desc':
            return properties.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(0);
                const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(0);
                return dateB - dateA;
            });
            
        case 'date_asc':
            return properties.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt.seconds * 1000) : new Date(0);
                const dateB = b.createdAt ? new Date(b.createdAt.seconds * 1000) : new Date(0);
                return dateA - dateB;
            });
            
        case 'profit_desc':
        case 'profit_asc':
            // Nota: Esta ordenação será aplicada após o cálculo dos resumos financeiros
            return properties;
            
        default:
            return properties;
    }
};

// Ordenar imóveis por lucro (requer dados financeiros)
const sortPropertiesByProfit = (properties, financialData, ascending = false) => {
    return properties.sort((a, b) => {
        const profitA = financialData[a.id] ? financialData[a.id].profit : 0;
        const profitB = financialData[b.id] ? financialData[b.id].profit : 0;
        
        return ascending ? profitA - profitB : profitB - profitA;
    });
};

// Criar card para exibir imóvel
const createPropertyCard = (property, financialSummary) => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1';
    card.dataset.id = property.id;
    
    const statusClass = property.status === 'active' ? 'bg-green-500' : 'bg-gray-500';
    const statusText = property.status === 'active' ? 'Ativo' : 'Inativo';
    const imageUrl = property.image || 'https://via.placeholder.com/800x400?text=Imóvel';
    
    // Formatação de moedas
    const formattedIncome = formatCurrency(financialSummary.income);
    const formattedExpense = formatCurrency(financialSummary.expense);
    const formattedProfit = formatCurrency(financialSummary.profit);
    
    // Classe para o lucro (positivo ou negativo)
    const profitClass = financialSummary.profit >= 0 ? 'text-blue-600' : 'text-red-600';
    
    card.innerHTML = `
        <div class="relative h-44 overflow-hidden bg-gray-200">
            <img src="${imageUrl}" alt="${property.name}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105">
            <div class="absolute top-3 right-3 ${statusClass} text-white text-xs font-bold px-2 py-1 rounded-full">
                ${statusText}
            </div>
        </div>
        <div class="p-5">
            <h3 class="text-lg font-bold text-gray-800 mb-2 line-clamp-1">${property.name}</h3>
            <p class="text-gray-600 text-sm mb-4 flex items-center">
                <i class="fas fa-map-marker-alt text-blue-500 mr-2"></i>
                ${property.city}, ${property.state}
            </p>
            <p class="text-gray-500 text-xs mb-3">${property.address}</p>
            
            <div class="grid grid-cols-2 gap-3 mb-4">
                <div class="text-center p-2 bg-green-50 rounded-lg">
                    <p class="text-xs text-gray-500 mb-1">Receitas</p>
                    <p class="text-green-600 font-semibold">${formattedIncome}</p>
                </div>
                <div class="text-center p-2 bg-red-50 rounded-lg">
                    <p class="text-xs text-gray-500 mb-1">Despesas</p>
                    <p class="text-red-600 font-semibold">${formattedExpense}</p>
                </div>
            </div>
            
            <div class="border-t pt-4">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-xs text-gray-500">Lucro</p>
                        <p class="${profitClass} font-bold">${formattedProfit}</p>
                    </div>
                    <div class="flex space-x-2">
                        <button class="viewPropertyBtn p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="Ver detalhes">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="editPropertyBtn p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors" title="Editar imóvel">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="addTransactionBtn p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors" title="Adicionar transação">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Adicionar listeners aos botões
    const viewBtn = card.querySelector('.viewPropertyBtn');
    const editBtn = card.querySelector('.editPropertyBtn');
    const addTransactionBtn = card.querySelector('.addTransactionBtn');
    
    if (viewBtn) {
        viewBtn.addEventListener('click', () => {
            window.location.href = `property-details.html?id=${property.id}`;
        });
    }
    
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            openEditPropertyModal(property.id);
        });
    }
    
    if (addTransactionBtn) {
        addTransactionBtn.addEventListener('click', () => {
            openAddTransactionModal(property.id);
        });
    }
    
    return card;
};

// Atualizar contagem de imóveis
const updatePropertiesCount = (count) => {
    const totalPropertiesEl = document.getElementById('totalProperties');
    if (totalPropertiesEl) {
        totalPropertiesEl.textContent = count;
    }
};

// Atualizar resumo financeiro
const updateFinancialSummary = (income, expense) => {
    const revenueEl = document.getElementById('totalPropertiesRevenue');
    const expensesEl = document.getElementById('totalPropertiesExpenses');
    const profitEl = document.getElementById('totalPropertiesProfit');
    
    const profit = income - expense;
    
    if (revenueEl) revenueEl.textContent = formatCurrency(income);
    if (expensesEl) expensesEl.textContent = formatCurrency(expense);
    if (profitEl) {
        profitEl.textContent = formatCurrency(profit);
        
        // Alterar cor com base no valor
        if (profit > 0) {
            profitEl.classList.remove('text-red-600');
            profitEl.classList.add('text-blue-600');
        } else if (profit < 0) {
            profitEl.classList.remove('text-blue-600');
            profitEl.classList.add('text-red-600');
        }
    }
};

// Abrir modal de adicionar imóvel
const openAddPropertyModal = () => {
    const modal = document.getElementById('addPropertyModal');
    
    if (modal) {
        // Limpar formulário se necessário
        const form = document.getElementById('addPropertyForm');
        if (form) form.reset();
        
        // Exibir o modal
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
};

// Configurar listeners para o modal de adicionar imóvel
const setupAddPropertyModalListeners = () => {
    const modal = document.getElementById('addPropertyModal');
    const closeBtn = document.getElementById('closeAddPropertyModal');
    const cancelBtn = document.getElementById('cancelAddProperty');
    const form = document.getElementById('addPropertyForm');
    
    // Fechar o modal
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('flex');
            modal.classList.add('hidden');
        });
    }
    
    // Cancelar
    if (cancelBtn && modal) {
        cancelBtn.addEventListener('click', () => {
            modal.classList.remove('flex');
            modal.classList.add('hidden');
        });
    }
    
    // Submeter formulário
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const propertyData = {
                name: form.propertyName.value,
                address: form.propertyAddress.value,
                city: form.propertyCity.value,
                state: form.propertyState.value,
                image: form.propertyImage.value || null,
                status: form.propertyStatus.value
            };
            
            try {
                await addProperty(propertyData);
                
                // Fechar modal e limpar formulário
                modal.classList.remove('flex');
                modal.classList.add('hidden');
                form.reset();
                
                // Recarregar imóveis
                loadAndDisplayProperties();
                
                showSuccessMessage('Imóvel adicionado com sucesso!');
            } catch (error) {
                console.error('Erro ao adicionar imóvel:', error);
                showErrorMessage('Erro ao adicionar imóvel. Tente novamente.');
            }
        });
    }
};

// Abrir modal de editar imóvel
const openEditPropertyModal = async (propertyId) => {
    try {
        const modal = document.getElementById('editPropertyModal');
        
        if (!modal) return;
        
        // Obter dados do imóvel
        const property = await getProperty(propertyId);
        
        if (!property) {
            showErrorMessage('Imóvel não encontrado.');
            return;
        }
        
        // Preencher campos do formulário
        document.getElementById('editPropertyId').value = property.id;
        document.getElementById('editPropertyName').value = property.name;
        document.getElementById('editPropertyAddress').value = property.address;
        document.getElementById('editPropertyCity').value = property.city;
        document.getElementById('editPropertyState').value = property.state;
        document.getElementById('editPropertyImage').value = property.image || '';
        document.getElementById('editPropertyStatus').value = property.status || 'active';
        
        // Exibir o modal
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    } catch (error) {
        console.error('Erro ao abrir modal de edição:', error);
        showErrorMessage('Erro ao carregar dados do imóvel.');
    }
};

// Configurar listeners para o modal de editar imóvel
const setupEditPropertyModalListeners = () => {
    const modal = document.getElementById('editPropertyModal');
    const closeBtn = document.getElementById('closeEditPropertyModal');
    const cancelBtn = document.getElementById('cancelEditProperty');
    const form = document.getElementById('editPropertyForm');
    const deleteBtn = document.getElementById('deleteProperty');
    
    // Fechar o modal
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('flex');
            modal.classList.add('hidden');
        });
    }
    
    // Cancelar
    if (cancelBtn && modal) {
        cancelBtn.addEventListener('click', () => {
            modal.classList.remove('flex');
            modal.classList.add('hidden');
        });
    }
    
    // Excluir imóvel
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            const propertyId = document.getElementById('editPropertyId').value;
            confirmDeleteProperty(propertyId);
        });
    }
    
    // Submeter formulário
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const propertyId = document.getElementById('editPropertyId').value;
            
            const propertyData = {
                name: form.editPropertyName.value,
                address: form.editPropertyAddress.value,
                city: form.editPropertyCity.value,
                state: form.editPropertyState.value,
                image: form.editPropertyImage.value || null,
                status: form.editPropertyStatus.value
            };
            
            try {
                await updateProperty(propertyId, propertyData);
                
                // Fechar modal
                modal.classList.remove('flex');
                modal.classList.add('hidden');
                
                // Recarregar imóveis
                loadAndDisplayProperties();
                
                showSuccessMessage('Imóvel atualizado com sucesso!');
            } catch (error) {
                console.error('Erro ao atualizar imóvel:', error);
                showErrorMessage('Erro ao atualizar imóvel. Tente novamente.');
            }
        });
    }
};

// Abrir modal para adicionar transação para um imóvel específico
const openAddTransactionModal = (propertyId) => {
    const modal = document.getElementById('addTransactionModal');
    
    if (!modal) {
        showErrorMessage('Modal de transação não encontrado. Tente na página de transações.');
        return;
    }
    
    // Preencher o ID do imóvel no modal
    const propertyIdField = document.getElementById('transactionPropertyId');
    if (propertyIdField) {
        propertyIdField.value = propertyId;
    }
    
    const propertySelectField = document.getElementById('transactionPropertySelect');
    if (propertySelectField) {
        propertySelectField.value = propertyId;
    }
    
    // Preencher a data atual no campo de data
    const dateInput = document.getElementById('transactionDate');
    if (dateInput) {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0]; // formato yyyy-mm-dd
        dateInput.value = formattedDate;
    }
    
    // Exibir o modal
    modal.classList.remove('hidden');
    modal.classList.add('flex');
};

// Confirmar exclusão de imóvel
const confirmDeleteProperty = (propertyId) => {
    if (confirm('Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita.')) {
        deletePropertyHandler(propertyId);
    }
};

// Manipulador de exclusão de imóvel
const deletePropertyHandler = async (propertyId) => {
    try {
        await deleteProperty(propertyId);
        
        // Fechar modal se estiver aberto
        const modal = document.getElementById('editPropertyModal');
        if (modal) {
            modal.classList.remove('flex');
            modal.classList.add('hidden');
        }
        
        // Recarregar imóveis
        loadAndDisplayProperties();
        
        showSuccessMessage('Imóvel excluído com sucesso!');
    } catch (error) {
        console.error('Erro ao excluir imóvel:', error);
        
        // Verificar se o erro foi devido a transações vinculadas
        if (error.message && error.message.includes('transações associadas')) {
            showErrorMessage('Não é possível excluir o imóvel pois existem transações associadas.');
        } else {
            showErrorMessage('Erro ao excluir imóvel. Tente novamente.');
        }
    }
};

// Exibir mensagem de sucesso
const showSuccessMessage = (message) => {
    // Verificar se já existe um elemento de notificação
    let notificationEl = document.querySelector('.notification');
    
    if (!notificationEl) {
        // Criar elemento de notificação
        notificationEl = document.createElement('div');
        notificationEl.className = 'notification';
        document.body.appendChild(notificationEl);
    }
    
    // Configurar notificação
    notificationEl.textContent = message;
    notificationEl.className = 'notification bg-green-500 text-white py-2 px-4 rounded-lg shadow-md fixed top-4 right-4 z-50 opacity-0 transition-opacity duration-300';
    
    // Exibir
    setTimeout(() => {
        notificationEl.classList.add('opacity-100');
    }, 10);
    
    // Ocultar após 3 segundos
    setTimeout(() => {
        notificationEl.classList.remove('opacity-100');
        notificationEl.classList.add('opacity-0');
        
        setTimeout(() => {
            notificationEl.remove();
        }, 300);
    }, 3000);
};

// Exibir mensagem de erro
const showErrorMessage = (message) => {
    // Verificar se já existe um elemento de notificação
    let notificationEl = document.querySelector('.notification');
    
    if (!notificationEl) {
        // Criar elemento de notificação
        notificationEl = document.createElement('div');
        notificationEl.className = 'notification';
        document.body.appendChild(notificationEl);
    }
    
    // Configurar notificação
    notificationEl.textContent = message;
    notificationEl.className = 'notification bg-red-500 text-white py-2 px-4 rounded-lg shadow-md fixed top-4 right-4 z-50 opacity-0 transition-opacity duration-300';
    
    // Exibir
    setTimeout(() => {
        notificationEl.classList.add('opacity-100');
    }, 10);
    
    // Ocultar após 3 segundos
    setTimeout(() => {
        notificationEl.classList.remove('opacity-100');
        notificationEl.classList.add('opacity-0');
        
        setTimeout(() => {
            notificationEl.remove();
        }, 300);
    }, 3000);
};

// Inicializar a página ao carregar
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('properties.html')) {
        // Verificar autenticação
        auth.onAuthStateChanged(user => {
            if (user) {
                // Inicializar página
                initPropertiesPage();
            } else {
                // Redirecionar para login
                window.location.href = '../index.html';
            }
        });
    }
});
