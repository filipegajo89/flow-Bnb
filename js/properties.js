// Funções para gerenciamento de imóveis

// Adicionar um novo imóvel
const addProperty = (propertyData) => {
  const userId = auth.currentUser.uid;
  
  // Adicionar campos padrão
  const newProperty = {
    ...propertyData,
    userId: userId,
    status: 'active',
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  return db.collection('properties').add(newProperty)
    .then(docRef => {
      console.log('Imóvel adicionado com ID:', docRef.id);
      return docRef.id;
    })
    .catch(error => {
      console.error('Erro ao adicionar imóvel:', error);
      throw error;
    });
};

// Obter todos os imóveis do usuário
const getProperties = () => {
  const userId = auth.currentUser.uid;
  
  return db.collection('properties')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get()
    .then(snapshot => {
      const properties = [];
      snapshot.forEach(doc => {
        properties.push({
          id: doc.id,
          ...doc.data()
        });
      });
      return properties;
    })
    .catch(error => {
      console.error('Erro ao obter imóveis:', error);
      throw error;
    });
};

// Obter um imóvel específico
const getProperty = (propertyId) => {
  return db.collection('properties').doc(propertyId).get()
    .then(doc => {
      if (doc.exists) {
        return {
          id: doc.id,
          ...doc.data()
        };
      } else {
        console.log('Imóvel não encontrado');
        return null;
      }
    })
    .catch(error => {
      console.error('Erro ao obter imóvel:', error);
      throw error;
    });
};

// Atualizar um imóvel
const updateProperty = (propertyId, propertyData) => {
  // Adicionar timestamp de atualização
  const updatedProperty = {
    ...propertyData,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  return db.collection('properties').doc(propertyId).update(updatedProperty)
    .then(() => {
      console.log('Imóvel atualizado com sucesso');
      return true;
    })
    .catch(error => {
      console.error('Erro ao atualizar imóvel:', error);
      throw error;
    });
};

// Excluir um imóvel
const deleteProperty = (propertyId) => {
  // Verificar se existem transações associadas ao imóvel
  return db.collection('transactions')
    .where('propertyId', '==', propertyId)
    .get()
    .then(snapshot => {
      // Se houver transações, não permitir a exclusão
      if (!snapshot.empty) {
        alert('Não é possível excluir o imóvel pois existem transações associadas.');
        throw new Error('Imóvel possui transações associadas');
      }
      
      // Se não houver transações, excluir o imóvel
      return db.collection('properties').doc(propertyId).delete();
    })
    .then(() => {
      console.log('Imóvel excluído com sucesso');
      return true;
    })
    .catch(error => {
      console.error('Erro ao excluir imóvel:', error);
      throw error;
    });
};

// Calcular resumo financeiro do imóvel
const getPropertyFinancialSummary = async (propertyId, month = null, year = null) => {
  try {
    // Inicializar valores
    let totalIncome = 0;
    let totalExpense = 0;
    
    // Construir query base
    let query = db.collection('transactions')
      .where('propertyId', '==', propertyId);
    
    // Adicionar filtro de data se necessário
    if (month !== null && year !== null) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      query = query.where('date', '>=', startDate)
                  .where('date', '<=', endDate);
    }
    
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

// Renderizar card de imóvel com o novo design
const renderPropertyCard = (property, financialSummary) => {
  const card = document.createElement('div');
  card.className = 'property-card';
  card.dataset.id = property.id;
  
  const statusClass = property.status === 'active' ? 'active' : 'inactive';
  const statusText = property.status === 'active' ? 'Ativo' : 'Inativo';
  const imageUrl = property.image || 'assets/images/property-placeholder.jpg';
  
  card.innerHTML = `
    <div class="property-image-container">
      <img src="${imageUrl}" alt="${property.name}" class="property-image">
      <div class="property-status ${statusClass}">${statusText}</div>
    </div>
    <div class="property-content">
      <h3 class="property-title">${property.name}</h3>
      <p class="property-location">
        <i class="fas fa-map-marker-alt property-location-icon"></i>
        ${property.city}, ${property.state}
      </p>
      <div class="property-stats">
        <div class="property-stat">
          <p class="property-stat-label">Receita</p>
          <p class="property-stat-value income">+ ${financialSummary.formattedIncome}</p>
        </div>
        <div class="property-stat">
          <p class="property-stat-label">Despesa</p>
          <p class="property-stat-value expense">- ${financialSummary.formattedExpense}</p>
        </div>
      </div>
      <div class="property-profit">
        <p class="property-profit-label">Lucro Líquido</p>
        <p class="property-profit-value">${financialSummary.formattedProfit}</p>
      </div>
    </div>
    <div class="property-actions">
      <button class="property-action-button viewPropertyBtn">
        <i class="fas fa-eye property-action-icon"></i>Ver Detalhes
      </button>
      <button class="property-action-button addTransactionBtn">
        <i class="fas fa-plus property-action-icon"></i>Transação
      </button>
    </div>
  `;
  
  return card;
};

// Atualização da função loadAndDisplayProperties
const loadAndDisplayProperties = async (monthFilter = null) => {
  try {
    // Obter o elemento onde os imóveis serão exibidos
    const propertiesList = document.getElementById('propertiesList');
    if (!propertiesList) return;
    
    // Mostrar indicador de carregamento
    showLoadingState();
    
    // Obter imóveis do usuário
    const properties = await getProperties();
    
    // Verificar se há imóveis
    if (properties.length === 0) {
      showEmptyState();
      return;
    }
    
    // Limpar lista
    propertiesList.innerHTML = '';
    
    // Inicializar totais gerais
    let totalIncome = 0;
    let totalExpense = 0;
    let totalProfit = 0;
    
    // Data atual para filtro de mês
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = monthFilter ? parseInt(monthFilter) : null;
    
    // Para cada imóvel, calcular resumo financeiro e exibir
    for (const property of properties) {
      try {
        const financialSummary = await getPropertyFinancialSummary(property.id, currentMonth, currentYear);
      
        // Adicionar aos totais gerais
        totalIncome += financialSummary.income;
        totalExpense += financialSummary.expense;
        totalProfit += financialSummary.profit;
      
        // Renderizar card do imóvel
        const propertyCard = renderPropertyCard(property, financialSummary);
        propertiesList.appendChild(propertyCard);
      
        // Adicionar listeners aos botões
        const viewBtn = propertyCard.querySelector('.viewPropertyBtn');
        const addTransactionBtn = propertyCard.querySelector('.addTransactionBtn');
      
        if (viewBtn) {
          viewBtn.addEventListener('click', () => {
            window.location.href = `property-details.html?id=${property.id}`;
          });
        }
      
        if (addTransactionBtn) {
          addTransactionBtn.addEventListener('click', () => {
            // Abrir modal de adicionar transação
            const modal = document.getElementById('addTransactionModal');
            if (modal) {
              document.getElementById('transactionPropertyId').value = property.id;
              modal.classList.remove('hidden');
              modal.classList.add('flex');
            }
          });
        }
      } catch (propertyError) {
        console.error('Erro ao processar imóvel:', propertyError);
        continue; // Continuar com o próximo imóvel mesmo se este falhar
      }
    }
    
    // Atualizar resumo geral
    updateDashboardSummary(totalIncome, totalExpense, totalProfit);
    
  } catch (error) {
    console.error('Erro ao carregar imóveis:', error);
    showErrorState('Não foi possível carregar seus imóveis. Por favor, tente novamente.');
  }
};

// Atualização continuada para a função renderPropertyCard  
const renderPropertyCard = (property, financialSummary) => {
  const card = document.createElement('div');
  card.className = 'bg-white rounded-xl overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1';
  card.dataset.id = property.id;
  
  const statusClass = property.status === 'active' ? 'bg-green-500' : 'bg-gray-500';
  const statusText = property.status === 'active' ? 'Ativo' : 'Inativo';
  const imageUrl = property.image || 'https://via.placeholder.com/800x400?text=Imóvel';
  
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
      
      <div class="grid grid-cols-2 gap-3 mb-4">
        <div class="text-center p-2 bg-green-50 rounded-lg">
          <p class="text-xs text-gray-500 mb-1">Receitas</p>
          <p class="text-green-600 font-semibold">${financialSummary.formattedIncome}</p>
        </div>
        <div class="text-center p-2 bg-red-50 rounded-lg">
          <p class="text-xs text-gray-500 mb-1">Despesas</p>
          <p class="text-red-600 font-semibold">${financialSummary.formattedExpense}</p>
        </div>
      </div>
      
      <div class="border-t pt-4">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-xs text-gray-500">Lucro</p>
            <p class="text-blue-600 font-bold">${financialSummary.formattedProfit}</p>
          </div>
          <div class="flex space-x-2">
            <button class="viewPropertyBtn p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
              <i class="fas fa-eye"></i>
            </button>
            <button class="addTransactionBtn p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  return card;
};

// Atualizar resumo do dashboard
const updateDashboardSummary = (income, expense, profit) => {
  const totalRevenueEl = document.getElementById('totalRevenue');
  const totalExpensesEl = document.getElementById('totalExpenses');
  const totalProfitEl = document.getElementById('totalProfit');
  
  if (totalRevenueEl) totalRevenueEl.textContent = formatCurrency(income);
  if (totalExpensesEl) totalExpensesEl.textContent = formatCurrency(expense);
  if (totalProfitEl) totalProfitEl.textContent = formatCurrency(profit);
};

// Configurar listeners para modal de adicionar imóvel
const setupPropertyModalListeners = () => {
  const addPropertyBtn = document.getElementById('addPropertyBtn');
  const addPropertyModal = document.getElementById('addPropertyModal');
  const closeAddPropertyModal = document.getElementById('closeAddPropertyModal');
  const cancelAddProperty = document.getElementById('cancelAddProperty');
  const addPropertyForm = document.getElementById('addPropertyForm');
  
  if (addPropertyBtn && addPropertyModal) {
    addPropertyBtn.addEventListener('click', () => {
      addPropertyModal.classList.remove('hidden');
      addPropertyModal.classList.add('flex');
    });
  }
  
  if (closeAddPropertyModal && addPropertyModal) {
    closeAddPropertyModal.addEventListener('click', () => {
      addPropertyModal.classList.remove('flex');
      addPropertyModal.classList.add('hidden');
    });
  }
  
  if (cancelAddProperty && addPropertyModal) {
    cancelAddProperty.addEventListener('click', () => {
      addPropertyModal.classList.remove('flex');
      addPropertyModal.classList.add('hidden');
    });
  }
  
  if (addPropertyForm) {
    addPropertyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const propertyData = {
        name: addPropertyForm.propertyName.value,
        address: addPropertyForm.propertyAddress.value,
        city: addPropertyForm.propertyCity.value,
        state: addPropertyForm.propertyState.value,
        image: addPropertyForm.propertyImage.value || null
      };
      
      try {
        await addProperty(propertyData);
        addPropertyModal.classList.remove('flex');
        addPropertyModal.classList.add('hidden');
        addPropertyForm.reset();
        
        // Recarregar lista de imóveis
        loadAndDisplayProperties();
      } catch (error) {
        alert('Erro ao adicionar imóvel: ' + error.message);
      }
    });
  }
  
  // Configurar filtro de mês
  const monthFilter = document.getElementById('monthFilter');
  if (monthFilter) {
    monthFilter.addEventListener('change', () => {
      loadAndDisplayProperties(monthFilter.value === 'all' ? null : monthFilter.value);
    });
  }
};

// Inicializar ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  auth.onAuthStateChanged(user => {
    if (user && window.location.pathname.includes('dashboard')) {
      setupPropertyModalListeners();
      loadAndDisplayProperties();
    }
  });
});

Você tem razão, preciso ser mais específico nas instruções. Vou explicar exatamente como implementar a solução para o botão "+ Novo Imóvel".
Instruções Detalhadas para Implementar a Solução
Para o arquivo properties.js:

Não substitua o código existente. Mantenha tudo o que já está no arquivo.
Adicione o novo código no final do arquivo, logo após o último bloco de código existente.
O código atual tem um event listener que está restrito a páginas específicas:
javascriptdocument.addEventListener('DOMContentLoaded', () => {
  auth.onAuthStateChanged(user => {
    if (user && window.location.pathname.includes('dashboard')) {
      setupPropertyModalListeners();
      loadAndDisplayProperties();
    }
  });
});

Adicione o seu novo código abaixo desse bloco. Ficará assim:

javascript// Código original existente
document.addEventListener('DOMContentLoaded', () => {
  auth.onAuthStateChanged(user => {
    if (user && window.location.pathname.includes('dashboard')) {
      setupPropertyModalListeners();
      loadAndDisplayProperties();
    }
  });
});

// Adicione este código no final do arquivo properties.js
document.addEventListener('DOMContentLoaded', function() {
    // Seleciona o botão específico no cabeçalho usando o ID
    const addPropertyTopBtn = document.getElementById('addPropertyBtn');
    
    if (addPropertyTopBtn) {
        console.log('Botão de adicionar imóvel do cabeçalho encontrado');
        
        addPropertyTopBtn.addEventListener('click', function() {
            console.log('Botão Novo Imóvel clicado');
            // Buscar o modal pelo ID
            const modal = document.getElementById('addPropertyModal');
            if (modal) {
                // Remover a classe hidden e adicionar a classe flex para exibir o modal
                modal.classList.remove('hidden');
                modal.classList.add('flex');
                console.log('Modal de adicionar imóvel aberto');
            } else {
                console.error('Modal de adicionar imóvel não encontrado');
            }
        });
    } else {
        console.warn('Botão de adicionar imóvel do topo não encontrado');
    }
});
