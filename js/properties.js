// ===============================================
// Arquivo: js/properties.js - VERSÃO CORRIGIDA
// Funções para gerenciamento de imóveis
// ===============================================

// Adicionar um novo imóvel
const addProperty = async (propertyData) => {
  try {
    console.log('Iniciando cadastro de imóvel:', propertyData);
    
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Usuário não está autenticado');
    }
    
    // Adicionar campos padrão
    const newProperty = {
      ...propertyData,
      userId: user.uid,
      status: propertyData.status || 'active',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    console.log('Dados para salvar no Firestore:', newProperty);
    
    const docRef = await db.collection('properties').add(newProperty);
    console.log('Imóvel adicionado com ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Erro ao adicionar imóvel:', error);
    throw error;
  }
};

// Obter todos os imóveis do usuário
const getProperties = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Usuário não está autenticado');
    }
    
    console.log('Buscando imóveis para o usuário:', user.uid);
    
    const snapshot = await db.collection('properties')
      .where('userId', '==', user.uid)
      .orderBy('createdAt', 'desc')
      .get();
    
    const properties = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      properties.push({
        id: doc.id,
        ...data,
        // Garantir que createdAt seja tratado corretamente
        createdAt: data.createdAt ? data.createdAt : null
      });
    });
    
    console.log(`Encontrados ${properties.length} imóveis:`, properties);
    return properties;
  } catch (error) {
    console.error('Erro ao obter imóveis:', error);
    throw error;
  }
};

// Obter um imóvel específico
const getProperty = async (propertyId) => {
  try {
    const doc = await db.collection('properties').doc(propertyId).get();
    
    if (doc.exists) {
      return {
        id: doc.id,
        ...doc.data()
      };
    } else {
      console.log('Imóvel não encontrado');
      return null;
    }
  } catch (error) {
    console.error('Erro ao obter imóvel:', error);
    throw error;
  }
};

// Atualizar um imóvel
const updateProperty = async (propertyId, propertyData) => {
  try {
    const updatedProperty = {
      ...propertyData,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('properties').doc(propertyId).update(updatedProperty);
    console.log('Imóvel atualizado com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao atualizar imóvel:', error);
    throw error;
  }
};

// Excluir um imóvel
const deleteProperty = async (propertyId) => {
  try {
    // Verificar se existem transações associadas ao imóvel
    const snapshot = await db.collection('transactions')
      .where('propertyId', '==', propertyId)
      .get();
    
    if (!snapshot.empty) {
      throw new Error('Imóvel possui transações associadas');
    }
    
    await db.collection('properties').doc(propertyId).delete();
    console.log('Imóvel excluído com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao excluir imóvel:', error);
    throw error;
  }
};

// Calcular resumo financeiro do imóvel
const getPropertyFinancialSummary = async (propertyId, month = null, year = null) => {
  try {
    let totalIncome = 0;
    let totalExpense = 0;
    
    let query = db.collection('transactions')
      .where('propertyId', '==', propertyId);
    
    if (month !== null && year !== null) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      query = query.where('date', '>=', startDate)
                  .where('date', '<=', endDate);
    }
    
    const snapshot = await query.get();
    
    snapshot.forEach(doc => {
      const transaction = doc.data();
      if (transaction.type === 'income') {
        totalIncome += parseFloat(transaction.amount);
      } else if (transaction.type === 'expense') {
        totalExpense += parseFloat(transaction.amount);
      }
    });
    
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
    return {
      income: 0,
      expense: 0,
      profit: 0,
      formattedIncome: formatCurrency(0),
      formattedExpense: formatCurrency(0),
      formattedProfit: formatCurrency(0)
    };
  }
};

// Renderizar card de imóvel
const renderPropertyCard = (property, financialSummary) => {
  const card = document.createElement('div');
  card.className = 'bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1';
  card.dataset.id = property.id;
  
  const statusClass = property.status === 'active' ? 'bg-green-500' : 'bg-gray-500';
  const statusText = property.status === 'active' ? 'Ativo' : 'Inativo';
  const imageUrl = property.image || 'https://via.placeholder.com/800x400?text=Imóvel';
  
  // Classe para o lucro (positivo ou negativo)
  const profitClass = financialSummary.profit >= 0 ? 'text-blue-600' : 'text-red-600';
  
  card.innerHTML = `
    <div class="relative h-44 overflow-hidden bg-gray-200">
      <img src="${imageUrl}" alt="${property.name}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
           onerror="this.src='https://via.placeholder.com/800x400?text=Imóvel'">
      <div class="absolute top-3 right-3 ${statusClass} text-white text-xs font-bold px-2 py-1 rounded-full">
        ${statusText}
      </div>
    </div>
    <div class="p-4">
      <h3 class="text-lg font-bold text-gray-800 mb-2 truncate">${property.name}</h3>
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
            <p class="${profitClass} font-bold">${financialSummary.formattedProfit}</p>
          </div>
          <div class="flex space-x-2">
            <button class="viewPropertyBtn p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="Ver detalhes">
              <i class="fas fa-eye"></i>
            </button>
            <button class="addTransactionBtn p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors" title="Adicionar transação">
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  return card;
};

// Estados da interface
const showLoadingState = () => {
  const propertiesList = document.getElementById('propertiesList');
  if (propertiesList) {
    propertiesList.innerHTML = `
      <div class="col-span-full text-center py-10">
        <div class="inline-block w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-gray-500">Carregando seus imóveis...</p>
      </div>
    `;
  }
};

const showEmptyState = () => {
  const propertiesList = document.getElementById('propertiesList');
  if (propertiesList) {
    propertiesList.innerHTML = `
      <div class="col-span-full text-center py-10">
        <i class="fas fa-home text-gray-300 text-5xl mb-4"></i>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">Nenhum imóvel cadastrado</h3>
        <p class="text-gray-500 mb-4">Você ainda não tem imóveis cadastrados. Comece adicionando seu primeiro imóvel.</p>
        <button id="addFirstPropertyBtn" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
          <i class="fas fa-plus mr-2"></i>Adicionar Primeiro Imóvel
        </button>
      </div>
    `;
    
    const addFirstPropertyBtn = document.getElementById('addFirstPropertyBtn');
    if (addFirstPropertyBtn) {
      addFirstPropertyBtn.addEventListener('click', () => {
        const modal = document.getElementById('addPropertyModal');
        if (modal) {
          modal.classList.remove('hidden');
          modal.classList.add('flex');
        }
      });
    }
  }
};

const showErrorState = (message) => {
  const propertiesList = document.getElementById('propertiesList');
  if (propertiesList) {
    propertiesList.innerHTML = `
      <div class="col-span-full text-center py-10">
        <i class="fas fa-exclamation-circle text-red-500 text-5xl mb-4"></i>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">Erro ao carregar imóveis</h3>
        <p class="text-gray-500 mb-4">${message}</p>
        <button id="retryLoadBtn" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          <i class="fas fa-redo mr-2"></i>Tentar novamente
        </button>
      </div>
    `;
    
    const retryLoadBtn = document.getElementById('retryLoadBtn');
    if (retryLoadBtn) {
      retryLoadBtn.addEventListener('click', () => {
        loadAndDisplayProperties();
      });
    }
  }
};

// Atualizar resumo do dashboard
const updateDashboardSummary = (income, expense, profit) => {
  const totalRevenueEl = document.getElementById('totalRevenue');
  const totalExpensesEl = document.getElementById('totalExpenses');
  const totalProfitEl = document.getElementById('totalProfit');
  
  if (totalRevenueEl) totalRevenueEl.textContent = formatCurrency(income);
  if (totalExpensesEl) totalExpensesEl.textContent = formatCurrency(expense);
  if (totalProfitEl) {
    totalProfitEl.textContent = formatCurrency(profit);
    // Alterar cor com base no valor
    if (profit > 0) {
      totalProfitEl.classList.remove('text-red-600');
      totalProfitEl.classList.add('text-blue-600');
    } else if (profit < 0) {
      totalProfitEl.classList.remove('text-blue-600');
      totalProfitEl.classList.add('text-red-600');
    }
  }
};

// FUNÇÃO PRINCIPAL - Carregar e exibir imóveis
const loadAndDisplayProperties = async (monthFilter = null) => {
  try {
    console.log('🔄 Iniciando carregamento de imóveis...');
    
    const propertiesList = document.getElementById('propertiesList');
    if (!propertiesList) {
      console.error('❌ Elemento #propertiesList não encontrado no DOM');
      return;
    }
    
    // Mostrar loading
    showLoadingState();
    
    // Verificar autenticação
    const user = auth.currentUser;
    if (!user) {
      console.error('❌ Usuário não autenticado');
      showErrorState('Você precisa estar autenticado para visualizar imóveis.');
      return;
    }
    console.log('✅ Usuário autenticado:', user.email);
    
    // Buscar imóveis
    const properties = await getProperties();
    console.log(`📋 Obtidos ${properties.length} imóveis`);
    
    if (properties.length === 0) {
      console.log('📭 Nenhum imóvel encontrado');
      showEmptyState();
      updateDashboardSummary(0, 0, 0);
      return;
    }
    
    // Limpar lista
    propertiesList.innerHTML = '';
    
    // Calcular totais
    let totalIncome = 0;
    let totalExpense = 0;
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = monthFilter ? parseInt(monthFilter) : null;
    
    console.log('💰 Calculando resumos financeiros...');
    
    // Renderizar cada imóvel
    for (const property of properties) {
      try {
        console.log(`🏠 Processando: ${property.name}`);
        
        const financialSummary = await getPropertyFinancialSummary(property.id, currentMonth, currentYear);
        
        totalIncome += financialSummary.income;
        totalExpense += financialSummary.expense;
        
        const propertyCard = renderPropertyCard(property, financialSummary);
        propertiesList.appendChild(propertyCard);
        
        // Adicionar eventos aos botões
        const viewBtn = propertyCard.querySelector('.viewPropertyBtn');
        const addTransactionBtn = propertyCard.querySelector('.addTransactionBtn');
        
        if (viewBtn) {
          viewBtn.addEventListener('click', () => {
            window.location.href = `property-details.html?id=${property.id}`;
          });
        }
        
        if (addTransactionBtn) {
          addTransactionBtn.addEventListener('click', () => {
            const modal = document.getElementById('addTransactionModal');
            if (modal) {
              const propertyIdField = document.getElementById('transactionPropertyId');
              if (propertyIdField) {
                propertyIdField.value = property.id;
              }
              modal.classList.remove('hidden');
              modal.classList.add('flex');
            }
          });
        }
      } catch (propertyError) {
        console.error(`❌ Erro ao processar imóvel ${property.id}:`, propertyError);
        continue;
      }
    }
    
    const totalProfit = totalIncome - totalExpense;
    console.log('💯 Atualizando resumo financeiro:', { totalIncome, totalExpense, totalProfit });
    updateDashboardSummary(totalIncome, totalExpense, totalProfit);
    
    console.log('✅ Carregamento concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro crítico ao carregar imóveis:', error);
    showErrorState('Não foi possível carregar seus imóveis. Por favor, tente novamente.');
  }
};

// Tornar funções globais
window.addProperty = addProperty;
window.getProperties = getProperties;
window.getProperty = getProperty;
window.updateProperty = updateProperty;
window.deleteProperty = deleteProperty;
window.getPropertyFinancialSummary = getPropertyFinancialSummary;
window.loadAndDisplayProperties = loadAndDisplayProperties;
