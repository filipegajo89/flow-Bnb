// ===============================================
// Arquivo: js/properties.js
// Funções para gerenciamento de imóveis
// ===============================================

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
      console.log(`Encontrados ${properties.length} imóveis`);
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

// Mostrar estado de carregamento na lista de imóveis
function showLoadingState() {
  const propertiesList = document.getElementById('propertiesList');
  if (propertiesList) {
    propertiesList.innerHTML = `
      <div class="col-span-full text-center py-10">
        <div class="inline-block w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-gray-500">Carregando seus imóveis...</p>
      </div>
    `;
  }
}

// Mostrar estado vazio (sem imóveis)
function showEmptyState() {
  const propertiesList = document.getElementById('propertiesList');
  if (propertiesList) {
    propertiesList.innerHTML = `
      <div class="col-span-full text-center py-10">
        <i class="fas fa-home text-gray-300 text-5xl mb-4"></i>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">Nenhum imóvel cadastrado</h3>
        <p class="text-gray-500 mb-4">Você ainda não tem imóveis cadastrados. Comece adicionando seu primeiro imóvel.</p>
        <button id="addFirstPropertyBtn" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
          <i class="fas fa-plus mr-2"></i>Adicionar Imóvel
        </button>
      </div>
    `;
    
    // Adicionar evento ao botão
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
}

// Mostrar estado de erro
function showErrorState(message) {
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
    
    // Adicionar evento ao botão de tentar novamente
    const retryLoadBtn = document.getElementById('retryLoadBtn');
    if (retryLoadBtn) {
      retryLoadBtn.addEventListener('click', () => {
        loadAndDisplayProperties();
      });
    }
  }
}

// Renderizar card de imóvel
const renderPropertyCard = (property, financialSummary) => {
  const card = document.createElement('div');
  card.className = 'bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1';
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
    <div class="p-4">
      <h3 class="text-lg font-bold text-gray-800 mb-2">${property.name}</h3>
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

// Atualizar resumo do dashboard
const updateDashboardSummary = (income, expense, profit) => {
  const totalRevenueEl = document.getElementById('totalRevenue');
  const totalExpensesEl = document.getElementById('totalExpenses');
  const totalProfitEl = document.getElementById('totalProfit');
  
  if (totalRevenueEl) totalRevenueEl.textContent = formatCurrency(income);
  if (totalExpensesEl) totalExpensesEl.textContent = formatCurrency(expense);
  if (totalProfitEl) totalProfitEl.textContent = formatCurrency(profit);
};

// Carregar e exibir imóveis
const loadAndDisplayProperties = async (monthFilter = null) => {
  try {
    console.log('Iniciando carregamento de imóveis...');
    
    // Obter o elemento onde os imóveis serão exibidos
    const propertiesList = document.getElementById('propertiesList');
    if (!propertiesList) {
      console.error('Elemento #propertiesList não encontrado no DOM');
      return;
    }
    
    // Mostrar indicador de carregamento
    showLoadingState();
    
    // Verificar se o usuário está autenticado
    const user = firebase.auth().currentUser;
    if (!user) {
      console.error('Usuário não autenticado');
      showErrorState('Você precisa estar autenticado para visualizar imóveis.');
      return;
    }
    
    // Obter imóveis do usuário
    console.log('Buscando imóveis do usuário...');
    const properties = await getProperties();
    console.log(`Obtidos ${properties.length} imóveis`);
    
    // Verificar se há imóveis
    if (properties.length === 0) {
      console.log('Nenhum imóvel encontrado');
      showEmptyState();
      updateDashboardSummary(0, 0, 0);
      return;
    }
    
    // Limpar lista e preparar para exibir os imóveis
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
    console.log('Renderizando cards de imóveis...');
    for (const property of properties) {
      try {
        console.log(`Processando imóvel: ${property.id} - ${property.name}`);
        
        // Calcular resumo financeiro
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
        console.error(`Erro ao processar imóvel ${property.id}:`, propertyError);
        continue; // Continuar com o próximo imóvel mesmo se este falhar
      }
    }
    
    // Atualizar resumo geral
    console.log('Atualizando resumo financeiro...');
    updateDashboardSummary(totalIncome, totalExpense, totalProfit);
    console.log('Carregamento de imóveis concluído com sucesso!');
    
  } catch (error) {
    console.error('Erro ao carregar imóveis:', error);
    showErrorState('Não foi possível carregar seus imóveis. Por favor, tente novamente.');
  }
};

// Configurar listeners para modal de adicionar imóvel
const setupPropertyModalListeners = () => {
  console.log('Configurando listeners para o modal de imóveis...');
  
  // Botão de adicionar imóvel
  const addPropertyBtn = document.getElementById('addPropertyBtn');
  const addPropertyModal = document.getElementById('addPropertyModal');
  
  if (addPropertyBtn && addPropertyModal) {
    console.log('Botão de adicionar imóvel encontrado');
    addPropertyBtn.addEventListener('click', () => {
      console.log('Botão de adicionar imóvel clicado');
      addPropertyModal.classList.remove('hidden');
      addPropertyModal.classList.add('flex');
    });
  } else {
    console.warn('Botão de adicionar imóvel ou modal não encontrado');
    console.log('addPropertyBtn:', addPropertyBtn);
    console.log('addPropertyModal:', addPropertyModal);
  }
  
  // Botão X para fechar o modal
  const closeAddPropertyModal = document.getElementById('closeAddPropertyModal');
  if (closeAddPropertyModal) {
    console.log('Botão X para fechar modal encontrado');
    closeAddPropertyModal.addEventListener('click', () => {
      console.log('Botão X para fechar modal clicado');
      addPropertyModal.classList.remove('flex');
      addPropertyModal.classList.add('hidden');
    });
  }
  
  // Botão Cancelar
  const cancelAddProperty = document.getElementById('cancelAddProperty');
  if (cancelAddProperty) {
    console.log('Botão Cancelar encontrado');
    cancelAddProperty.addEventListener('click', () => {
      console.log('Botão Cancelar clicado');
      addPropertyModal.classList.remove('flex');
      addPropertyModal.classList.add('hidden');
    });
  }
  
  // Formulário de adicionar imóvel
  const addPropertyForm = document.getElementById('addPropertyForm');
  if (addPropertyForm) {
    console.log('Formulário de adicionar imóvel encontrado');
    
    addPropertyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('Formulário de adicionar imóvel enviado');
      
      // Extrair dados do formulário
      const propertyName = document.getElementById('propertyName').value;
      const propertyAddress = document.getElementById('propertyAddress').value;
      const propertyCity = document.getElementById('propertyCity').value;
      const propertyState = document.getElementById('propertyState').value;
      const propertyImage = document.getElementById('propertyImage').value || null;
      
      const propertyData = {
        name: propertyName,
        address: propertyAddress,
        city: propertyCity,
        state: propertyState,
        image: propertyImage
      };
      
      console.log('Dados do imóvel a ser adicionado:', propertyData);
      
      try {
        // Adicionar o imóvel
        await addProperty(propertyData);
        console.log('Imóvel adicionado com sucesso');
        
        // Fechar o modal
        addPropertyModal.classList.remove('flex');
        addPropertyModal.classList.add('hidden');
        
        // Limpar o formulário
        addPropertyForm.reset();
        
        // Mostrar mensagem de sucesso
        alert('Imóvel adicionado com sucesso!');
        
        // Recarregar a página para mostrar o novo imóvel
        window.location.reload();
        
      } catch (error) {
        console.error('Erro ao adicionar imóvel:', error);
        alert('Erro ao adicionar imóvel: ' + error.message);
      }
    });
  }
  
  // Configurar filtro de mês
  const monthFilter = document.getElementById('monthFilter');
  if (monthFilter) {
    console.log('Filtro de mês encontrado');
    monthFilter.addEventListener('change', () => {
      const value = monthFilter.value;
      console.log(`Filtro de mês alterado para: ${value}`);
      loadAndDisplayProperties(value === 'all' ? null : value);
    });
  }
};

// Inicializar ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM carregado, iniciando verificação de autenticação...');
  
  auth.onAuthStateChanged(user => {
    if (user) {
      console.log('Usuário autenticado:', user.email);
      
      // Verificar se estamos na página do dashboard
      if (window.location.pathname.includes('dashboard')) {
        console.log('Página do dashboard detectada');
        setupPropertyModalListeners();
        loadAndDisplayProperties();
      }
    } else {
      console.log('Usuário não autenticado, redirecionando para login...');
    }
  });
});

// Tornar as funções globais para acesso de outros arquivos
window.addProperty = addProperty;
window.getProperties = getProperties;
window.getProperty = getProperty;
window.updateProperty = updateProperty;
window.deleteProperty = deleteProperty;
window.getPropertyFinancialSummary = getPropertyFinancialSummary;
window.loadAndDisplayProperties = loadAndDisplayProperties;

// Código adicional para corrigir problemas de navegação
document.addEventListener('DOMContentLoaded', function() {
  // Menu lateral - link para Imóveis
  const imoveisLink = document.querySelector('a[href*="imóveis"], a[href*="imoveis"], a[href*="properties"]');
  
  if (imoveisLink) {
    console.log('Link para página de imóveis encontrado:', imoveisLink.href);
    
    imoveisLink.addEventListener('click', function(e) {
      if (window.location.pathname.includes('dashboard')) {
        // Se estamos no dashboard, apenas recarregar a visualização de imóveis
        e.preventDefault();
        console.log('Clique no link de imóveis interceptado - recarregando visualização');
        loadAndDisplayProperties();
      }
    });
  } else {
    console.warn('Link para página de imóveis não encontrado');
  }
});
