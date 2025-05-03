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

// Renderizar card de imóvel
const renderPropertyCard = (property, financialSummary) => {
  const card = document.createElement('div');
  card.className = 'property-card bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow';
  card.dataset.id = property.id;
  
  const statusClass = property.status === 'active' ? 'bg-green-500' : 'bg-gray-500';
  const statusText = property.status === 'active' ? 'Ativo' : 'Inativo';
  const imageUrl = property.image || 'https://via.placeholder.com/300x160?text=Imóvel';
  
  card.innerHTML = `
    <div class="h-40 bg-gray-200 relative">
      <img src="${imageUrl}" alt="${property.name}" class="w-full h-full object-cover">
      <div class="absolute top-0 right-0 ${statusClass} text-white text-xs font-bold px-2 py-1 m-2 rounded">
        ${statusText}
      </div>
    </div>
    <div class="p-4">
      <h3 class="font-bold text-lg mb-1">${property.name}</h3>
      <p class="text-gray-600 text-sm mb-3">
        <i class="fas fa-map-marker-alt mr-1"></i> ${property.city}, ${property.state}
      </p>
      <div class="flex justify-between items-center mb-3">
        <div>
          <p class="text-sm text-gray-500">Rendimento</p>
          <p class="font-bold text-green-600">+ ${financialSummary.formattedIncome}</p>
        </div>
        <div class="text-right">
          <p class="text-sm text-gray-500">Despesas</p>
          <p class="font-bold text-red-600">- ${financialSummary.formattedExpense}</p>
        </div>
      </div>
      <div class="pt-3 border-t">
        <p class="text-sm text-gray-500">Lucro Líquido</p>
        <p class="font-bold text-blue-600">${financialSummary.formattedProfit}</p>
      </div>
    </div>
    <div class="bg-gray-50 px-4 py-3 flex justify-between">
      <button class="viewPropertyBtn text-blue-600 hover:text-blue-800 text-sm font-medium">
        Ver Detalhes
      </button>
      <button class="addTransactionBtn text-blue-600 hover:text-blue-800 text-sm font-medium">
        <i class="fas fa-plus mr-1"></i> Transação
      </button>
    </div>
  `;
  
  return card;
};

// Carregar e exibir imóveis na página
const loadAndDisplayProperties = async (monthFilter = null) => {
  try {
    // Obter o elemento onde os imóveis serão exibidos
    const propertiesList = document.getElementById('propertiesList');
    if (!propertiesList) return;
    
    // Mostrar indicador de carregamento
    propertiesList.innerHTML = '<div class="col-span-full text-center py-10"><i class="fas fa-spinner fa-spin text-blue-500 text-2xl"></i></div>';
    
    // Obter imóveis do usuário
    const properties = await getProperties();
    
    // Verificar se há imóveis
    if (properties.length === 0) {
      propertiesList.innerHTML = `
        <div class="col-span-full text-center py-10">
          <p class="text-gray-500 mb-4">Você ainda não tem imóveis cadastrados.</p>
          <button id="addFirstPropertyBtn" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            <i class="fas fa-plus mr-2"></i>Adicionar Primeiro Imóvel
          </button>
        </div>
      `;
      
      // Adicionar listener ao botão
      const addFirstPropertyBtn = document.getElementById('addFirstPropertyBtn');
      if (addFirstPropertyBtn) {
        addFirstPropertyBtn.addEventListener('click', () => {
          const addPropertyModal = document.getElementById('addPropertyModal');
          if (addPropertyModal) {
            addPropertyModal.classList.remove('hidden');
            addPropertyModal.classList.add('flex');
          }
        });
      }
      
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
          window.location.href = `/pages/property-details.html?id=${property.id}`;
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
    }
    
    // Atualizar resumo geral
    updateDashboardSummary(totalIncome, totalExpense, totalProfit);
    
  } catch (error) {
    console.error('Erro ao carregar imóveis:', error);
    const propertiesList = document.getElementById('propertiesList');
    if (propertiesList) {
      propertiesList.innerHTML = `
        <div class="col-span-full text-center py-10">
          <p class="text-red-500">Erro ao carregar imóveis. Tente novamente.</p>
        </div>
      `;
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
