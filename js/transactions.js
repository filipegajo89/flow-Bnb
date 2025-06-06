// Funções para gerenciamento de transações financeiras

// Adicionar uma nova transação
const addTransaction = (transactionData) => {
  const userId = auth.currentUser.uid;
  
  // Converter valor para número e data para objeto Date
  const amount = parseFloat(transactionData.amount);
  const date = new Date(transactionData.date);
  
  // Adicionar campos padrão
  const newTransaction = {
    ...transactionData,
    amount: amount,
    date: date,
    userId: userId,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  return db.collection('transactions').add(newTransaction)
    .then(docRef => {
      console.log('Transação adicionada com ID:', docRef.id);
      return docRef.id;
    })
    .catch(error => {
      console.error('Erro ao adicionar transação:', error);
      throw error;
    });
};

// Obter transações de um imóvel
const getPropertyTransactions = (propertyId, limit = null) => {
  let query = db.collection('transactions')
    .where('propertyId', '==', propertyId);
  
  if (limit) {
    query = query.limit(limit);
  }
  
  return query.get()
    .then(snapshot => {
      const transactions = [];
      snapshot.forEach(doc => {
        transactions.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Ordenar manualmente por data
      transactions.sort((a, b) => {
        const dateA = a.date ? (a.date.toDate ? a.date.toDate() : new Date(a.date)) : new Date(0);
        const dateB = b.date ? (b.date.toDate ? b.date.toDate() : new Date(b.date)) : new Date(0);
        return dateB - dateA;
      });
      
      return transactions;
    })
    .catch(error => {
      console.error('Erro ao obter transações:', error);
      throw error;
    });
};

// Obter transações de todos os imóveis do usuário
const getAllTransactions = (limit = null) => {
  const userId = auth.currentUser.uid;
  
  let query = db.collection('transactions')
    .where('userId', '==', userId);
  
  if (limit) {
    query = query.limit(limit);
  }
  
  return query.get()
    .then(snapshot => {
      const transactions = [];
      snapshot.forEach(doc => {
        transactions.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Ordenar manualmente por data
      transactions.sort((a, b) => {
        const dateA = a.date ? (a.date.toDate ? a.date.toDate() : new Date(a.date)) : new Date(0);
        const dateB = b.date ? (b.date.toDate ? b.date.toDate() : new Date(b.date)) : new Date(0);
        return dateB - dateA;
      });
      
      return transactions;
    })
    .catch(error => {
      console.error('Erro ao obter transações:', error);
      throw error;
    });
};

// Atualizar uma transação
const updateTransaction = (transactionId, transactionData) => {
  // Converter valor para número e data para objeto Date
  const amount = parseFloat(transactionData.amount);
  const date = new Date(transactionData.date);
  
  // Atualizar transação
  const updatedTransaction = {
    ...transactionData,
    amount: amount,
    date: date,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  return db.collection('transactions').doc(transactionId).update(updatedTransaction)
    .then(() => {
      console.log('Transação atualizada com sucesso');
      return true;
    })
    .catch(error => {
      console.error('Erro ao atualizar transação:', error);
      throw error;
    });
};

// Excluir uma transação
const deleteTransaction = (transactionId) => {
  return db.collection('transactions').doc(transactionId).delete()
    .then(() => {
      console.log('Transação excluída com sucesso');
      return true;
    })
    .catch(error => {
      console.error('Erro ao excluir transação:', error);
      throw error;
    });
};

// Renderizar linha de transação na tabela
const renderTransactionRow = async (transaction) => {
  try {
    // Obter informações do imóvel para exibir o nome
    const property = await getProperty(transaction.propertyId);
    
    const row = document.createElement('tr');
    
    // Definir classe e cor com base no tipo de transação
    const valueClass = transaction.type === 'income' ? 'text-green-600' : 'text-red-600';
    const valuePrefix = transaction.type === 'income' ? '+ ' : '- ';
    const badgeClass = transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    const badgeText = transaction.type === 'income' ? 'Receita' : 'Despesa';
    
    row.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${formatDate(transaction.date)}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell">${property ? property.name : 'Imóvel não encontrado'}</td>
      <td class="px-6 py-4 text-sm text-gray-600">${transaction.description}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm hidden md:table-cell">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}">
          ${badgeText}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium ${valueClass}">${valuePrefix}${formatCurrency(transaction.amount)}</td>
    `;
    
    return row;
  } catch (error) {
    console.error('Erro ao renderizar transação:', error);
    return null;
  }
};

// Carregar e exibir transações recentes no dashboard
const loadRecentTransactions = async () => {
  try {
    const recentTransactionsEl = document.getElementById('recentTransactions');
    if (!recentTransactionsEl) return;
    
    // Mostrar indicador de carregamento
    recentTransactionsEl.innerHTML = `
      <tr>
        <td colspan="5" class="px-6 py-10 text-center">
          <div class="inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-2"></div>
          <p class="text-gray-500">Carregando transações...</p>
        </td>
      </tr>
    `;
    
    // Obter transações recentes
    const transactions = await getAllTransactions(10);
    
    // Verificar se há transações
    if (transactions.length === 0) {
      recentTransactionsEl.innerHTML = `
        <tr>
          <td colspan="5" class="px-6 py-10 text-center">
            <i class="fas fa-receipt text-gray-300 text-4xl mb-3"></i>
            <p class="text-gray-500">Nenhuma transação registrada ainda.</p>
            <button id="addFirstTransactionBtn" class="mt-3 text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center mx-auto">
              <i class="fas fa-plus mr-2"></i>Nova Transação
            </button>
          </td>
        </tr>
      `;
      
      // Adicionar listener ao botão de adicionar primeira transação
      const addFirstTransactionBtn = document.getElementById('addFirstTransactionBtn');
      if (addFirstTransactionBtn) {
        addFirstTransactionBtn.addEventListener('click', () => {
          const modal = document.getElementById('quickTransactionModal');
          if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
          }
        });
      }
      
      return;
    }
    
    // Limpar tabela
    recentTransactionsEl.innerHTML = '';
    
    // Renderizar cada transação
    for (const transaction of transactions) {
      try {
        const row = await renderTransactionRow(transaction);
        if (row) {
          recentTransactionsEl.appendChild(row);
        }
      } catch (transactionError) {
        console.error('Erro ao processar transação:', transactionError);
        continue; // Continuar com a próxima transação mesmo se esta falhar
      }
    }
  } catch (error) {
    console.error('Erro ao carregar transações recentes:', error);
    const recentTransactionsEl = document.getElementById('recentTransactions');
    if (recentTransactionsEl) {
      recentTransactionsEl.innerHTML = `
        <tr>
          <td colspan="5" class="px-6 py-10 text-center">
            <i class="fas fa-exclamation-circle text-red-500 text-2xl mb-2"></i>
            <p class="text-red-500 font-medium mb-2">Erro ao carregar transações</p>
            <p class="text-gray-600 mb-3">Não foi possível carregar suas transações. Por favor, tente novamente.</p>
            <button onclick="loadRecentTransactions()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              <i class="fas fa-redo mr-2"></i>Tentar novamente
            </button>
          </td>
        </tr>
      `;
    }
  }
};

// Configurar listeners para modal de adicionar transação
const setupTransactionModalListeners = () => {
  const addTransactionModal = document.getElementById('addTransactionModal');
  const closeAddTransactionModal = document.getElementById('closeAddTransactionModal');
  const cancelAddTransaction = document.getElementById('cancelAddTransaction');
  const addTransactionForm = document.getElementById('addTransactionForm');
  const transactionTypeSelect = document.getElementById('transactionType');
  
  // Configurar fechamento do modal
  if (closeAddTransactionModal && addTransactionModal) {
    closeAddTransactionModal.addEventListener('click', () => {
      addTransactionModal.classList.remove('flex');
      addTransactionModal.classList.add('hidden');
    });
  }
  
  if (cancelAddTransaction && addTransactionModal) {
    cancelAddTransaction.addEventListener('click', () => {
      addTransactionModal.classList.remove('flex');
      addTransactionModal.classList.add('hidden');
    });
  }
  
  // Configurar filtro de categorias baseado no tipo de transação
  if (transactionTypeSelect) {
    transactionTypeSelect.addEventListener('change', () => {
      const incomeCategories = document.getElementById('incomeCategories');
      const expenseCategories = document.getElementById('expenseCategories');
      
      if (transactionTypeSelect.value === 'income') {
        incomeCategories.disabled = false;
        expenseCategories.disabled = true;
      } else {
        incomeCategories.disabled = true;
        expenseCategories.disabled = false;
      }
    });
  }
  
  // Configurar envio do formulário
  if (addTransactionForm) {
    addTransactionForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const propertyId = addTransactionForm.transactionPropertyId.value;
      
      const transactionData = {
        propertyId: propertyId,
        date: addTransactionForm.transactionDate.value,
        type: addTransactionForm.transactionType.value,
        category: addTransactionForm.transactionCategory.value,
        amount: addTransactionForm.transactionAmount.value,
        description: addTransactionForm.transactionDescription.value
      };
      
      try {
        await addTransaction(transactionData);
        addTransactionModal.classList.remove('flex');
        addTransactionModal.classList.add('hidden');
        addTransactionForm.reset();
        
        // Recarregar lista de transações e resumo financeiro
        loadRecentTransactions();
        loadAndDisplayProperties();
      } catch (error) {
        alert('Erro ao adicionar transação: ' + error.message);
      }
    });
  }
};

// Inicializar ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  auth.onAuthStateChanged(user => {
    if (user && window.location.pathname.includes('dashboard')) {
      setupTransactionModalListeners();
      loadRecentTransactions();
    }
  });
});
