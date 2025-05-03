// Funções para a página de detalhes do imóvel

// Obter ID do imóvel da URL
const getPropertyIdFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
};

// Carregar detalhes do imóvel
const loadPropertyDetails = async () => {
  try {
    // Obter ID do imóvel
    const propertyId = getPropertyIdFromUrl();
    
    if (!propertyId) {
      // Redirecionar para o dashboard se não houver ID
      window.location.href = 'dashboard.html';
      return;
    }
    
    // Obter dados do imóvel
    const property = await getProperty(propertyId);
    
    if (!property) {
      alert('Imóvel não encontrado');
      window.location.href = 'dashboard.html';
      return;
    }
    
    // Atualizar interface com os dados do imóvel
    updatePropertyUI(property);
    
    // Carregar transações do imóvel
    await loadPropertyTransactionsUI(propertyId);
    
    // Carregar resumo financeiro
    await loadPropertyFinancialSummary(propertyId);
    
    // Configurar filtros e ações
    setupPropertyDetailsListeners(property);
    
  } catch (error) {
    console.error('Erro ao carregar detalhes do imóvel:', error);
    alert('Erro ao carregar detalhes do imóvel');
  }
};

// Atualizar interface com os dados do imóvel
const updatePropertyUI = (property) => {
  // Atualizar títulos e cabeçalho
  document.title = `FlowBnb - ${property.name}`;
  
  const propertyNameEl = document.getElementById('propertyName');
  const propertyDetailNameEl = document.getElementById('propertyDetailName');
  const propertyAddressEl = document.getElementById('propertyAddress');
  const propertyImageEl = document.getElementById('propertyImage');
  const propertyStatusEl = document.getElementById('propertyStatus');
  const propertyCreatedAtEl = document.getElementById('propertyCreatedAt');
  
  if (propertyNameEl) propertyNameEl.textContent = property.name;
  if (propertyDetailNameEl) propertyDetailNameEl.textContent = property.name;
  
  if (propertyAddressEl) {
    propertyAddressEl.innerHTML = `
      <i class="fas fa-map-marker-alt mr-2"></i> ${property.address}, ${property.city}, ${property.state}
    `;
  }
  
  if (propertyImageEl && property.image) {
    propertyImageEl.src = property.image;
  } else if (propertyImageEl) {
    propertyImageEl.src = 'https://via.placeholder.com/1200x400?text=Imóvel';
  }
  
  if (propertyStatusEl) {
    propertyStatusEl.textContent = property.status === 'active' ? 'Ativo' : 'Inativo';
    propertyStatusEl.className = `absolute top-0 right-0 text-white text-xs font-bold px-2 py-1 m-2 rounded ${property.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`;
  }
  
  if (propertyCreatedAtEl && property.createdAt) {
    const createdDate = formatDate(property.createdAt);
    propertyCreatedAtEl.textContent = `Cadastrado em: ${createdDate}`;
  }
};

// Carregar e exibir transações do imóvel
const loadPropertyTransactionsUI = async (propertyId, limit = 10) => {
  try {
    const transactionsContainer = document.getElementById('propertyTransactions');
    if (!transactionsContainer) return;
    
    // Mostrar indicador de carregamento
    transactionsContainer.innerHTML = `
      <tr>
        <td colspan="5" class="px-6 py-4 text-center">
          <i class="fas fa-spinner fa-spin text-blue-500"></i> Carregando transações...
        </td>
      </tr>
    `;
    
    // Obter transações do imóvel
    const transactions = await getPropertyTransactions(propertyId, limit);
    
    // Verificar se há transações
    if (transactions.length === 0) {
      transactionsContainer.innerHTML = `
        <tr>
          <td colspan="5" class="px-6 py-4 text-center text-gray-500">
            Nenhuma transação registrada para este imóvel.
          </td>
        </tr>
      `;
      return;
    }
    
    // Limpar tabela
    transactionsContainer.innerHTML = '';
    
    // Renderizar cada transação
    for (const transaction of transactions) {
      const row = document.createElement('tr');
      
      // Definir classe e cor com base no tipo de transação
      const valueClass = transaction.type === 'income' ? 'text-green-600' : 'text-red-600';
      const valuePrefix = transaction.type === 'income' ? '+ ' : '- ';
      const badgeClass = transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
      const badgeText = transaction.type === 'income' ? 'Receita' : 'Despesa';
      
      // Obter nome legível da categoria
      const categoryNames = {
        rent: 'Aluguel',
        service: 'Serviços adicionais',
        deposit: 'Depósito/Caução',
        other_income: 'Outras receitas',
        maintenance: 'Manutenção',
        cleaning: 'Limpeza',
        utilities: 'Contas (água, luz, etc)',
        internet: 'Internet/TV',
        tax: 'Impostos',
        insurance: 'Seguro',
        supplies: 'Suprimentos',
        other_expense: 'Outras despesas'
      };
      
      const categoryName = categoryNames[transaction.category] || transaction.category;
      
      row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${formatDate(transaction.date)}</td>
        <td class="px-6 py-4 text-sm text-gray-600">${transaction.description}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}">
            ${categoryName}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium ${valueClass}">${valuePrefix}${formatCurrency(transaction.amount)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <button class="editTransactionBtn text-blue-600 hover:text-blue-800 mr-3" data-id="${transaction.id}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="deleteTransactionBtn text-red-600 hover:text-red-800" data-id="${transaction.id}">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      
      transactionsContainer.appendChild(row);
      
      // Adicionar listeners aos botões
      const editBtn = row.querySelector('.editTransactionBtn');
      const deleteBtn = row.querySelector('.deleteTransactionBtn');
      
      if (editBtn) {
        editBtn.addEventListener('click', () => {
          // Implementar edição de transação (em versão futura)
          alert('Funcionalidade de edição será implementada em breve.');
        });
      }
      
      if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
          if (confirm('Tem certeza que deseja excluir esta transação?')) {
            try {
              await deleteTransaction(transaction.id);
              row.remove();
              
              // Recarregar resumo financeiro
              await loadPropertyFinancialSummary(propertyId);
            } catch (error) {
              alert('Erro ao excluir transação: ' + error.message);
            }
          }
        });
      }
    }
  } catch (error) {
    console.error('Erro ao carregar transações:', error);
    const transactionsContainer = document.getElementById('propertyTransactions');
    if (transactionsContainer) {
      transactionsContainer.innerHTML = `
        <tr>
          <td colspan="5" class="px-6 py-4 text-center text-red-500">
            Erro ao carregar transações. Tente novamente.
          </td>
        </tr>
      `;
    }
  }
};

// Carregar resumo financeiro do imóvel
const loadPropertyFinancialSummary = async (propertyId) => {
  try {
    // Obter período selecionado
    const periodFilter = document.getElementById('periodFilter');
    let month = null;
    let year = null;
    let startDate = null;
    let endDate = null;
    
    if (periodFilter) {
      const period = periodFilter.value;
      const today = new Date();
      
      if (period === 'current_month') {
        month = today.getMonth() + 1;
        year = today.getFullYear();
      } else if (period === 'last_month') {
        month = today.getMonth();
        if (month === 0) {
          month = 12;
          year = today.getFullYear() - 1;
        } else {
          year = today.getFullYear();
        }
      } else if (period === 'current_year') {
        year = today.getFullYear();
      } else if (period === 'custom') {
        const startDateEl = document.getElementById('startDate');
        const endDateEl = document.getElementById('endDate');
        
        if (startDateEl && startDateEl.value && endDateEl && endDateEl.value) {
          startDate = new Date(startDateEl.value);
          endDate = new Date(endDateEl.value);
        }
      }
    }
    
    // Calcular resumo financeiro
    let financialSummary;
    
    if (startDate && endDate) {
      // Período personalizado
      financialSummary = await getPropertyFinancialSummaryCustomPeriod(propertyId, startDate, endDate);
    } else {
      // Período padrão (mês, ano ou todos)
      financialSummary = await getPropertyFinancialSummary(propertyId, month, year);
    }
    
    // Atualizar UI com os valores
    const totalRevenueEl = document.getElementById('propertyTotalRevenue');
    const totalExpensesEl = document.getElementById('propertyTotalExpenses');
    const totalProfitEl = document.getElementById('propertyTotalProfit');
    
    if (totalRevenueEl) totalRevenueEl.textContent = financialSummary.formattedIncome;
    if (totalExpensesEl) totalExpensesEl.textContent = financialSummary.formattedExpense;
    if (totalProfitEl) totalProfitEl.textContent = financialSummary.formattedProfit;
    
  } catch (error) {
    console.error('Erro ao carregar resumo financeiro:', error);
  }
};

// Calcular resumo financeiro para período personalizado
const getPropertyFinancialSummaryCustomPeriod = async (propertyId, startDate, endDate) => {
  try {
    // Inicializar valores
    let totalIncome = 0;
    let totalExpense = 0;
    
    // Construir query
    const query = db.collection('transactions')
      .where('propertyId', '==', propertyId)
      .where('date', '>=', startDate)
      .where('date', '<=', endDate);
    
    // Executar query
    const snapshot = await query.get();
    
    // Calcular totais
    snapshot.forEach(doc => {
      const transaction = doc.data();
      if (transaction.type === 'income') {
        totalIncome += parseFloat(transaction.amount);
      } else if (transaction.type === 'expense') {
        totalExpense += parseFloat(transaction.amount);
      }
    });
    
    // Calcular lucro
    const profit = totalIncome - totalExpense;
    
    return {
      income: totalIncome,
      expense: totalExpense,
      profit: profit,
      formattedIncome: formatCurrency(totalIncome),
      formattedExpense: formatCurrency(totalExpense),
      formattedProfit: formatCurrency(profit)
    };
  } catch (error) {
    console.error('Erro ao calcular resumo financeiro:', error);
    throw error;
  }
};

// Configurar listeners para filtros e botões
const setupPropertyDetailsListeners = (property) => {
  // Filtro de período
  const periodFilter = document.getElementById('periodFilter');
  const customPeriod = document.getElementById('customPeriod');
  
  if (periodFilter) {
    periodFilter.addEventListener('change', () => {
      // Mostrar/ocultar filtro de período personalizado
      if (periodFilter.value === 'custom') {
        customPeriod.classList.remove('hidden');
      } else {
        customPeriod.classList.add('hidden');
        
        // Recarregar resumo financeiro com novo período
        const propertyId = getPropertyIdFromUrl();
        loadPropertyFinancialSummary(propertyId);
      }
    });
  }
  
  // Botão Aplicar filtro personalizado
  const applyFilter = document.getElementById('applyFilter');
  if (applyFilter) {
    applyFilter.addEventListener('click', () => {
      const propertyId = getPropertyIdFromUrl();
      loadPropertyFinancialSummary(propertyId);
    });
  }
  
  // Filtro de tipo de transação
  const transactionTypeFilter = document.getElementById('transactionTypeFilter');
  if (transactionTypeFilter) {
    transactionTypeFilter.addEventListener('change', () => {
      filterTransactions();
    });
  }
  
  // Campo de busca de transações
  const transactionSearch = document.getElementById('transactionSearch');
  if (transactionSearch) {
    transactionSearch.addEventListener('input', () => {
      filterTransactions();
    });
  }
  
  // Botão de adicionar transação
  const addTransactionBtn = document.getElementById('addTransactionPropertyBtn');
  if (addTransactionBtn) {
    addTransactionBtn.addEventListener('click', () => {
      const transactionPropertyId = document.getElementById('transactionPropertyId');
      if (transactionPropertyId) {
        transactionPropertyId.value = property.id;
      }
      
      const modal = document.getElementById('addTransactionModal');
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
    });
  }
  
  // Botão de editar imóvel
  const editPropertyBtn = document.getElementById('editPropertyBtn');
  if (editPropertyBtn) {
    editPropertyBtn.addEventListener('click', () => {
      prepareEditPropertyModal(property);
    });
  }
  
  // Botão de compartilhar
  const sharePropertyBtn = document.getElementById('sharePropertyBtn');
  if (sharePropertyBtn) {
    sharePropertyBtn.addEventListener('click', () => {
      shareProperty(property);
    });
  }
  
  // Botão de exportar dados
  const exportPropertyBtn = document.getElementById('exportPropertyBtn');
  if (exportPropertyBtn) {
    exportPropertyBtn.addEventListener('click', () => {
      exportPropertyData(property.id);
    });
  }
  
  // Modal de editar imóvel
  const closeEditPropertyModal = document.getElementById('closeEditPropertyModal');
  const cancelEditProperty = document.getElementById('cancelEditProperty');
  const editPropertyModal = document.getElementById('editPropertyModal');
  
  if (closeEditPropertyModal && editPropertyModal) {
    closeEditPropertyModal.addEventListener('click', () => {
      editPropertyModal.classList.remove('flex');
      editPropertyModal.classList.add('hidden');
    });
  }
  
  if (cancelEditProperty && editPropertyModal) {
    cancelEditProperty.addEventListener('click', () => {
      editPropertyModal.classList.remove('flex');
      editPropertyModal.classList.add('hidden');
    });
  }
  
  // Form de editar imóvel
  const editPropertyForm = document.getElementById('editPropertyForm');
  if (editPropertyForm) {
    editPropertyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const propertyId = document.getElementById('editPropertyId').value;
      
      const propertyData = {
        name: editPropertyForm.editPropertyName.value,
        address: editPropertyForm.editPropertyAddress.value,
        city: editPropertyForm.editPropertyCity.value,
        state: editPropertyForm.editPropertyState.value,
        image: editPropertyForm.editPropertyImage.value || null,
        status: editPropertyForm.editPropertyStatus.value
      };
      
      try {
        await updateProperty(propertyId, propertyData);
        editPropertyModal.classList.remove('flex');
        editPropertyModal.classList.add('hidden');
        
        // Recarregar dados do imóvel
        const updatedProperty = await getProperty(propertyId);
        updatePropertyUI(updatedProperty);
        
      } catch (error) {
        alert('Erro ao atualizar imóvel: ' + error.message);
      }
    });
  }
  
  // Botão de excluir imóvel
  const deletePropertyBtn = document.getElementById('deleteProperty');
  if (deletePropertyBtn) {
    deletePropertyBtn.addEventListener('click', async () => {
      if (confirm('Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita.')) {
        try {
          const propertyId = document.getElementById('editPropertyId').value;
          await deleteProperty(propertyId);
          
          // Redirecionar para o dashboard
          window.location.href = 'dashboard.html';
        } catch (error) {
          alert('Erro ao excluir imóvel: ' + error.message);
        }
      }
    });
  }
  
  // Modal de adicionar transação
  setupTransactionModalListeners();
  
  // Botão de carregar mais transações
  const loadMoreTransactionsBtn = document.getElementById('loadMoreTransactions');
  if (loadMoreTransactionsBtn) {
    loadMoreTransactionsBtn.addEventListener('click', () => {
      // Implementar carregamento de mais transações
      alert('Funcionalidade em desenvolvimento.');
    });
  }
};

// Filtrar transações na tabela
const filterTransactions = () => {
  const searchTerm = document.getElementById('transactionSearch').value.toLowerCase();
  const typeFilter = document.getElementById('transactionTypeFilter').value;
  
  const rows = document.querySelectorAll('#propertyTransactions tr');
  
  rows.forEach(row => {
    const description = row.cells[1]?.textContent.toLowerCase() || '';
    const type = row.cells[2]?.querySelector('span')?.textContent.toLowerCase() || '';
    
    // Verificar filtro de tipo
    const matchesType = typeFilter === 'all' || 
                        (typeFilter === 'income' && type.includes('receita')) ||
                        (typeFilter === 'expense' && type.includes('despesa'));
    
    // Verificar termo de busca
    const matchesSearch = description.includes(searchTerm);
    
    // Exibir ou ocultar linha
    if (matchesType && matchesSearch) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
};

// Preparar modal de editar imóvel
const prepareEditPropertyModal = (property) => {
  const editPropertyId = document.getElementById('editPropertyId');
  const editPropertyName = document.getElementById('editPropertyName');
  const editPropertyAddress = document.getElementById('editPropertyAddress');
  const editPropertyCity = document.getElementById('editPropertyCity');
  const editPropertyState = document.getElementById('editPropertyState');
  const editPropertyImage = document.getElementById('editPropertyImage');
  const editPropertyStatus = document.getElementById('editPropertyStatus');
  
  if (editPropertyId) editPropertyId.value = property.id;
  if (editPropertyName) editPropertyName.value = property.name;
  if (editPropertyAddress) editPropertyAddress.value = property.address;
  if (editPropertyCity) editPropertyCity.value = property.city;
  if (editPropertyState) editPropertyState.value = property.state;
  if (editPropertyImage) editPropertyImage.value = property.image || '';
  if (editPropertyStatus) editPropertyStatus.value = property.status || 'active';
  
  // Exibir modal
  const editPropertyModal = document.getElementById('editPropertyModal');
  if (editPropertyModal) {
    editPropertyModal.classList.remove('hidden');
    editPropertyModal.classList.add('flex');
  }
};

// Compartilhar imóvel
const shareProperty = (property) => {
  // Implementar compartilhamento (versão futura)
  alert('Funcionalidade de compartilhamento será implementada em breve.');
};

// Exportar dados do imóvel
const exportPropertyData = async (propertyId) => {
  try {
    // Obter dados do imóvel
    const property = await getProperty(propertyId);
    
    // Obter todas as transações do imóvel
    const transactions = await getPropertyTransactions(propertyId, null);
    
    // Formatar transações para CSV
    const transactionRows = transactions.map(t => {
      return {
        data: formatDate(t.date),
        tipo: t.type === 'income' ? 'Receita' : 'Despesa',
        categoria: t.category,
        descricao: t.description,
        valor: t.amount
      };
    });
    
    // Criar dados para CSV
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Adicionar cabeçalho
    csvContent += 'Data,Tipo,Categoria,Descrição,Valor\n';
    
    // Adicionar linhas
    transactionRows.forEach(row => {
      csvContent += `${row.data},${row.tipo},${row.categoria},"${row.descricao}",${row.valor}\n`;
    });
    
    // Criar link de download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `exportacao_${property.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Remover link
    document.body.removeChild(link);
    
  } catch (error) {
    console.error('Erro ao exportar dados:', error);
    alert('Erro ao exportar dados: ' + error.message);
  }
};

// Inicializar ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  auth.onAuthStateChanged(user => {
    if (user && window.location.pathname.includes('property-details')) {
      loadPropertyDetails();
    }
  });
});
