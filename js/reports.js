// Funções específicas para a página de relatórios

// Variáveis para os gráficos
let mainChart;
let incomeDistributionChart;
let expenseDistributionChart;

// Variáveis de controle para filtros
let currentFilters = {
    property: 'all',
    period: 'month',
    startDate: null,
    endDate: null,
    chartType: 'bar'
};

// Cores para gráficos
const chartColors = {
    income: 'rgba(9, 177, 136, 0.7)',
    expense: 'rgba(231, 76, 60, 0.7)',
    profit: 'rgba(28, 93, 239, 0.7)',
    categories: [
        'rgba(52, 152, 219, 0.7)',
        'rgba(155, 89, 182, 0.7)',
        'rgba(52, 73, 94, 0.7)',
        'rgba(230, 126, 34, 0.7)',
        'rgba(241, 196, 15, 0.7)',
        'rgba(26, 188, 156, 0.7)',
        'rgba(231, 76, 60, 0.7)',
        'rgba(46, 204, 113, 0.7)'
    ]
};

// Inicializar a página de relatórios
const initReportsPage = async () => {
    console.log('Inicializando página de relatórios...');
    
    try {
        // Configurar listeners de eventos
        setupEventListeners();
        
        // Carregar opções de imóveis para o filtro
        await loadPropertyOptions();
        
        // Definir datas padrão para período personalizado
        setDefaultDates();
        
        // Carregar e exibir dados do relatório
        await loadAndDisplayReportData();
        
    } catch (error) {
        console.error('Erro ao inicializar página de relatórios:', error);
        showErrorMessage('Ocorreu um erro ao carregar a página. Por favor, atualize e tente novamente.');
    }
};

// Configurar todos os listeners de eventos da página
const setupEventListeners = () => {
    // Filtro de imóvel
    const propertyFilter = document.getElementById('propertyFilter');
    if (propertyFilter) {
        propertyFilter.addEventListener('change', () => {
            currentFilters.property = propertyFilter.value;
            loadAndDisplayReportData();
        });
    }
    
    // Filtro de período
    const periodFilter = document.getElementById('periodFilter');
    if (periodFilter) {
        periodFilter.addEventListener('change', () => {
            currentFilters.period = periodFilter.value;
            
            // Mostrar/ocultar período personalizado
            const customPeriod = document.getElementById('customPeriod');
            if (customPeriod) {
                if (periodFilter.value === 'custom') {
                    customPeriod.classList.remove('hidden');
                } else {
                    customPeriod.classList.add('hidden');
                    loadAndDisplayReportData();
                }
            }
        });
    }
    
    // Filtro de tipo de gráfico
    const chartTypeFilter = document.getElementById('chartTypeFilter');
    if (chartTypeFilter) {
        chartTypeFilter.addEventListener('change', () => {
            currentFilters.chartType = chartTypeFilter.value;
            updateChartType();
        });
    }
    
    // Botão de aplicar filtros personalizados
    const applyFiltersBtn = document.getElementById('applyFilters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            const startDateInput = document.getElementById('startDate');
            const endDateInput = document.getElementById('endDate');
            
            if (startDateInput && endDateInput) {
                // Validar datas
                if (!startDateInput.value || !endDateInput.value) {
                    showErrorMessage('Por favor, preencha ambas as datas.');
                    return;
                }
                
                const startDate = new Date(startDateInput.value);
                const endDate = new Date(endDateInput.value);
                
                if (startDate > endDate) {
                    showErrorMessage('A data inicial não pode ser maior que a data final.');
                    return;
                }
                
                // Atualizar filtros e carregar dados
                currentFilters.startDate = startDate;
                currentFilters.endDate = endDate;
                loadAndDisplayReportData();
            }
        });
    }
    
    // Botão de exportar relatório
    const exportReportBtn = document.getElementById('exportReportBtn');
    if (exportReportBtn) {
        exportReportBtn.addEventListener('click', exportReport);
    }
    
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

// Carregar opções de imóveis para o filtro
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
    } catch (error) {
        console.error('Erro ao carregar opções de imóveis:', error);
        throw error;
    }
};

// Definir datas padrão para período personalizado
const setDefaultDates = () => {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (startDateInput && endDateInput) {
        // Definir data inicial como o primeiro dia do mês atual
        const firstDayOfMonth = new Date();
        firstDayOfMonth.setDate(1);
        
        // Definir data final como o dia atual
        const today = new Date();
        
        // Formatar datas para o formato yyyy-mm-dd
        const formatDateForInput = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        
        startDateInput.value = formatDateForInput(firstDayOfMonth);
        endDateInput.value = formatDateForInput(today);
        
        // Atualizar filtros
        currentFilters.startDate = firstDayOfMonth;
        currentFilters.endDate = today;
    }
};

// Função principal para carregar e exibir os dados do relatório
const loadAndDisplayReportData = async () => {
    try {
        showLoadingState();
        
        // Obter datas para o período selecionado
        const { startDate, endDate } = getDateRangeForPeriod(currentFilters.period);
        
        // Carregar dados de transações para o período
        const transactionsData = await getTransactionsDataForReport(
            currentFilters.property, 
            startDate || currentFilters.startDate, 
            endDate || currentFilters.endDate
        );
        
        // Se não houver dados, exibir estado vazio
        if (!transactionsData || !transactionsData.transactions || transactionsData.transactions.length === 0) {
            showEmptyState();
            return;
        }
        
        // Atualizar resumo financeiro
        updateFinancialSummary(transactionsData.totals);
        
        // Atualizar estatísticas detalhadas
        updateDetailedStatistics(transactionsData);
        
        // Atualizar tabela de resumo por imóvel
        updatePropertySummaryTable(transactionsData.propertySummary);
        
        // Atualizar gráficos
        updateCharts(transactionsData);
        
    } catch (error) {
        console.error('Erro ao carregar dados do relatório:', error);
        showErrorState('Ocorreu um erro ao carregar os dados do relatório. Por favor, tente novamente.');
    }
};

// Obter datas para o período selecionado
const getDateRangeForPeriod = (periodType) => {
    const today = new Date();
    let startDate = null;
    let endDate = null;
    
    switch (periodType) {
        case 'month':
            // Mês atual
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            break;
            
        case 'last_month':
            // Mês anterior
            startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            endDate = new Date(today.getFullYear(), today.getMonth(), 0);
            break;
            
        case 'year':
            // Ano atual
            startDate = new Date(today.getFullYear(), 0, 1);
            endDate = new Date(today.getFullYear(), 11, 31);
            break;
            
        case 'last_year':
            // Ano anterior
            startDate = new Date(today.getFullYear() - 1, 0, 1);
            endDate = new Date(today.getFullYear() - 1, 11, 31);
            break;
            
        case 'custom':
            // Período personalizado (já definido nos filtros)
            startDate = currentFilters.startDate;
            endDate = currentFilters.endDate;
            break;
    }
    
    return { startDate, endDate };
};

// Obter dados de transações para o relatório
const getTransactionsDataForReport = async (propertyId, startDate, endDate) => {
    try {
        const userId = auth.currentUser.uid;
        
        // Iniciar com a consulta básica
        let query = db.collection('transactions')
            .where('userId', '==', userId);
        
        // Adicionar filtro de imóvel se necessário
        if (propertyId && propertyId !== 'all') {
            query = query.where('propertyId', '==', propertyId);
        }
        
        // Adicionar filtro de data se ambas as datas forem fornecidas
        if (startDate && endDate) {
            // Ajustar horários para incluir todo o dia
            const adjustedStartDate = new Date(startDate);
            adjustedStartDate.setHours(0, 0, 0, 0);
            
            const adjustedEndDate = new Date(endDate);
            adjustedEndDate.setHours(23, 59, 59, 999);
            
            query = query.where('date', '>=', adjustedStartDate)
                        .where('date', '<=', adjustedEndDate);
        }
        
        // Ordenar por data
        query = query.orderBy('date', 'asc');
        
        // Executar a consulta
        const snapshot = await query.get();
        
        // Converter para array de transações
        const transactions = [];
        snapshot.forEach(doc => {
            transactions.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Calcular totais gerais
        const totals = {
            income: 0,
            expense: 0,
            profit: 0
        };
        
        // Contabilizar valores por imóvel
        const propertySummary = {};
        
        // Contabilizar valores por categoria
        const categoryData = {
            income: {},
            expense: {}
        };
        
        // Contabilizar valores por mês para o gráfico principal
        const monthlyData = {};
        
        // Processar cada transação
        for (const transaction of transactions) {
            const amount = parseFloat(transaction.amount);
            
            // Adicionar ao total geral
            if (transaction.type === 'income') {
                totals.income += amount;
            } else if (transaction.type === 'expense') {
                totals.expense += amount;
            }
            
            // Adicionar ao resumo do imóvel
            if (!propertySummary[transaction.propertyId]) {
                propertySummary[transaction.propertyId] = {
                    id: transaction.propertyId,
                    name: null, // Será preenchido depois
                    income: 0,
                    expense: 0,
                    profit: 0,
                    margin: 0,
                    roi: 0
                };
            }
            
            if (transaction.type === 'income') {
                propertySummary[transaction.propertyId].income += amount;
            } else if (transaction.type === 'expense') {
                propertySummary[transaction.propertyId].expense += amount;
            }
            
            // Adicionar à categoria
            if (!categoryData[transaction.type][transaction.category]) {
                categoryData[transaction.type][transaction.category] = 0;
            }
            categoryData[transaction.type][transaction.category] += amount;
            
            // Adicionar ao mês
            const transactionDate = transaction.date instanceof Date ? transaction.date : transaction.date.toDate();
            const monthKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    income: 0,
                    expense: 0,
                    profit: 0,
                    date: transactionDate
                };
            }
            
            if (transaction.type === 'income') {
                monthlyData[monthKey].income += amount;
            } else if (transaction.type === 'expense') {
                monthlyData[monthKey].expense += amount;
            }
        }
        
        // Calcular lucro total
        totals.profit = totals.income - totals.expense;
        
        // Calcular lucro, margem e ROI para cada imóvel
        for (const propertyId in propertySummary) {
            const property = propertySummary[propertyId];
            property.profit = property.income - property.expense;
            property.margin = property.income > 0 ? (property.profit / property.income) * 100 : 0;
            // ROI é um cálculo simplificado aqui, idealmente precisaria do valor do imóvel
            property.roi = property.expense > 0 ? (property.profit / property.expense) * 100 : 0;
        }
        
        // Calcular lucro mensal
        for (const monthKey in monthlyData) {
            monthlyData[monthKey].profit = monthlyData[monthKey].income - monthlyData[monthKey].expense;
        }
        
        // Obter nomes dos imóveis
        await loadPropertyNames(propertySummary);
        
        // Calcular estatísticas
        const statistics = calculateStatistics(monthlyData, totals);
        
        return {
            transactions,
            totals,
            propertySummary,
            categoryData,
            monthlyData,
            statistics
        };
    } catch (error) {
        console.error('Erro ao obter dados para relatório:', error);
        throw error;
    }
};

// Carregar nomes dos imóveis para o resumo
const loadPropertyNames = async (propertySummary) => {
    try {
        for (const propertyId in propertySummary) {
            const property = await getProperty(propertyId);
            if (property) {
                propertySummary[propertyId].name = property.name;
            } else {
                propertySummary[propertyId].name = 'Imóvel não encontrado';
            }
        }
    } catch (error) {
        console.error('Erro ao carregar nomes dos imóveis:', error);
    }
};

// Calcular estatísticas detalhadas
const calculateStatistics = (monthlyData, totals) => {
    // Converter objeto em array
    const monthsArray = Object.values(monthlyData);
    
    // Se não houver dados, retornar valores padrão
    if (monthsArray.length === 0) {
        return {
            avgMonthlyIncome: 0,
            avgMonthlyExpense: 0,
            avgMonthlyProfit: 0,
            profitMargin: 0,
            maxMonthlyIncome: 0,
            maxMonthlyExpense: 0,
            maxProfitMonth: null,
            minProfitMonth: null
        };
    }
    
    // Calcular médias
    const avgMonthlyIncome = totals.income / monthsArray.length;
    const avgMonthlyExpense = totals.expense / monthsArray.length;
    const avgMonthlyProfit = totals.profit / monthsArray.length;
    
    // Calcular margem de lucro
    const profitMargin = totals.income > 0 ? (totals.profit / totals.income) * 100 : 0;
    
    // Encontrar valores máximos
    let maxMonthlyIncome = 0;
    let maxMonthlyExpense = 0;
    let maxProfit = -Infinity;
    let minProfit = Infinity;
    let maxProfitMonth = null;
    let minProfitMonth = null;
    
    for (const month of monthsArray) {
        if (month.income > maxMonthlyIncome) {
            maxMonthlyIncome = month.income;
        }
        
        if (month.expense > maxMonthlyExpense) {
            maxMonthlyExpense = month.expense;
        }
        
        if (month.profit > maxProfit) {
            maxProfit = month.profit;
            maxProfitMonth = month.date;
        }
        
        if (month.profit < minProfit) {
            minProfit = month.profit;
            minProfitMonth = month.date;
        }
    }
    
    return {
        avgMonthlyIncome,
        avgMonthlyExpense,
        avgMonthlyProfit,
        profitMargin,
        maxMonthlyIncome,
        maxMonthlyExpense,
        maxProfitMonth,
        minProfitMonth
    };
};

// Atualizar resumo financeiro
const updateFinancialSummary = (totals) => {
    const revenueEl = document.getElementById('reportTotalRevenue');
    const expensesEl = document.getElementById('reportTotalExpenses');
    const profitEl = document.getElementById('reportTotalProfit');
    
    if (revenueEl) revenueEl.textContent = formatCurrency(totals.income);
    if (expensesEl) expensesEl.textContent = formatCurrency(totals.expense);
    if (profitEl) {
        profitEl.textContent = formatCurrency(totals.profit);
        
        // Alterar cor com base no valor
        if (totals.profit > 0) {
            profitEl.classList.remove('text-red-600');
            profitEl.classList.add('text-blue-600');
        } else if (totals.profit < 0) {
            profitEl.classList.remove('text-blue-600');
            profitEl.classList.add('text-red-600');
        }
    }
};

// Atualizar estatísticas detalhadas
const updateDetailedStatistics = (data) => {
    const { statistics } = data;
    
    // Formatar meses para exibição
    const formatMonth = (date) => {
        if (!date) return '-';
        return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
    };
    
    // Atualizar elementos
    document.getElementById('avgMonthlyIncome').textContent = formatCurrency(statistics.avgMonthlyIncome);
    document.getElementById('avgMonthlyExpense').textContent = formatCurrency(statistics.avgMonthlyExpense);
    document.getElementById('avgMonthlyProfit').textContent = formatCurrency(statistics.avgMonthlyProfit);
    document.getElementById('profitMargin').textContent = statistics.profitMargin.toFixed(2) + '%';
    document.getElementById('maxMonthlyIncome').textContent = formatCurrency(statistics.maxMonthlyIncome);
    document.getElementById('maxMonthlyExpense').textContent = formatCurrency(statistics.maxMonthlyExpense);
    document.getElementById('maxProfitMonth').textContent = formatMonth(statistics.maxProfitMonth);
    document.getElementById('minProfitMonth').textContent = formatMonth(statistics.minProfitMonth);
};

// Atualizar tabela de resumo por imóvel
const updatePropertySummaryTable = (propertySummary) => {
    const tableBody = document.getElementById('propertyDetailsSummary');
    if (!tableBody) return;
    
    // Limpar tabela
    tableBody.innerHTML = '';
    
    // Converter objeto em array para facilitar ordenação
    const propertiesArray = Object.values(propertySummary);
    
    // Ordenar por lucro (maior para menor)
    propertiesArray.sort((a, b) => b.profit - a.profit);
    
    // Verificar se há imóveis
    if (propertiesArray.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                    Nenhum dado disponível para o período selecionado.
                </td>
            </tr>
        `;
        return;
    }
    
    // Adicionar cada imóvel à tabela
    for (const property of propertiesArray) {
        const row = document.createElement('tr');
        
        // Definir classe para o lucro (positivo ou negativo)
        const profitClass = property.profit >= 0 ? 'text-blue-600' : 'text-red-600';
        const marginClass = property.margin >= 0 ? 'text-blue-600' : 'text-red-600';
        const roiClass = property.roi >= 0 ? 'text-blue-600' : 'text-red-600';
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${property.name}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600">${formatCurrency(property.income)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-red-600">${formatCurrency(property.expense)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium ${profitClass}">${formatCurrency(property.profit)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm ${marginClass}">${property.margin.toFixed(2)}%</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm ${roiClass}">${property.roi.toFixed(2)}%</td>
        `;
        
        tableBody.appendChild(row);
    }
};

// Atualizar gráficos
const updateCharts = (data) => {
    const { monthlyData, categoryData } = data;
    
    // Atualizar gráfico principal
    updateMainChart(monthlyData);
    
    // Atualizar gráficos de distribuição
    updateDistributionCharts(categoryData);
};

// Atualizar gráfico principal
const updateMainChart = (monthlyData) => {
    const ctx = document.getElementById('mainChart');
    if (!ctx) return;
    
    // Converter objeto em array e ordenar por data
    const monthsArray = Object.values(monthlyData);
    monthsArray.sort((a, b) => a.date - b.date);
    
    // Preparar dados para o gráfico
    const labels = monthsArray.map(month => {
        const date = month.date instanceof Date ? month.date : new Date(month.date);
        return new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' }).format(date);
    });
    
    const incomeData = monthsArray.map(month => month.income);
    const expenseData = monthsArray.map(month => month.expense);
    const profitData = monthsArray.map(month => month.profit);
    
    // Verificar se o gráfico já existe
    if (mainChart) {
        mainChart.destroy();
    }
    
    // Configurar gráfico com base no tipo selecionado
    let chartConfig;
    
    const chartType = currentFilters.chartType;
    
    if (chartType === 'pie') {
        // Para gráfico de pizza, usamos apenas valores totais
        chartConfig = {
            type: 'pie',
            data: {
                labels: ['Receitas', 'Despesas'],
                datasets: [{
                    data: [
                        monthsArray.reduce((sum, month) => sum + month.income, 0),
                        monthsArray.reduce((sum, month) => sum + month.expense, 0)
                    ],
                    backgroundColor: [
                        chartColors.income,
                        chartColors.expense
                    ],
                    borderColor: [
                        chartColors.income.replace('0.7', '1'),
                        chartColors.expense.replace('0.7', '1')
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                return `${context.label}: ${formatCurrency(value)}`;
                            }
                        }
                    }
                }
            }
        };
    } else {
        // Para gráficos de barra e linha
        chartConfig = {
            type: chartType,
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Receitas',
                        data: incomeData,
                        backgroundColor: chartColors.income,
                        borderColor: chartColors.income.replace('0.7', '1'),
                        borderWidth: 1
                    },
                    {
                        label: 'Despesas',
                        data: expenseData,
                        backgroundColor: chartColors.expense,
                        borderColor: chartColors.expense.replace('0.7', '1'),
                        borderWidth: 1
                    },
                    {
                        label: 'Lucro',
                        data: profitData,
                        backgroundColor: chartColors.profit,
                        borderColor: chartColors.profit.replace('0.7', '1'),
                        borderWidth: 1,
                        // Usar linha apenas para gráfico de linha
                        type: chartType === 'line' ? 'line' : chartType
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toLocaleString('pt-BR');
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                return `${context.dataset.label}: ${formatCurrency(value)}`;
                            }
                        }
                    }
                }
            }
        };
    }
    
    // Criar novo gráfico - CORREÇÃO: usar mainChart em vez de incomeDistributionChart
    mainChart = new Chart(ctx, chartConfig);
    
    // Atualizar título
    document.getElementById('mainChartTitle').textContent = 'Receitas vs. Despesas';
};

// Atualizar gráficos de distribuição
const updateDistributionCharts = (categoryData) => {
    updateIncomeDistributionChart(categoryData.income);
    updateExpenseDistributionChart(categoryData.expense);
};

// Atualizar gráfico de distribuição de receitas
const updateIncomeDistributionChart = (incomeData) => {
    const ctx = document.getElementById('incomeDistributionChart');
    if (!ctx) return;
    
    // Nomes legíveis das categorias
    const categoryNames = {
        rent: 'Aluguel',
        service: 'Serviços adicionais',
        deposit: 'Depósito/Caução',
        other_income: 'Outras receitas'
    };
    
    // Converter objeto em array
    const categories = [];
    const values = [];
    
    for (const category in incomeData) {
        categories.push(categoryNames[category] || category);
        values.push(incomeData[category]);
    }
    
    // Verificar se o gráfico já existe
    if (incomeDistributionChart) {
        incomeDistributionChart.destroy();
    }
    
    // Configurar cores
    const backgroundColors = [];
    const borderColors = [];
    
    for (let i = 0; i < categories.length; i++) {
        const colorIndex = i % chartColors.categories.length;
        backgroundColors.push(chartColors.categories[colorIndex]);
        borderColors.push(chartColors.categories[colorIndex].replace('0.7', '1'));
    }
    
    // Criar novo gráfico
    incomeDistributionChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [{
                data: values,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 12,
                        font: {
                            size: 10
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            return `${context.label}: ${formatCurrency(value)}`;
                        }
                    }
                }
            }
        }
    });
};

// Atualizar gráfico de distribuição de despesas
const updateExpenseDistributionChart = (expenseData) => {
    const ctx = document.getElementById('expenseDistributionChart');
    if (!ctx) return;
    
    // Nomes legíveis das categorias
    const categoryNames = {
        maintenance: 'Manutenção',
        cleaning: 'Limpeza',
        utilities: 'Contas (água, luz, etc)',
        internet: 'Internet/TV',
        tax: 'Impostos',
        insurance: 'Seguro',
        supplies: 'Suprimentos',
        other_expense: 'Outras despesas'
    };
    
    // Converter objeto em array
    const categories = [];
    const values = [];
    
    for (const category in expenseData) {
        categories.push(categoryNames[category] || category);
        values.push(expenseData[category]);
    }
    
    // Verificar se o gráfico já existe
    if (expenseDistributionChart) {
        expenseDistributionChart.destroy();
    }
    
    // Configurar cores
    const backgroundColors = [];
    const borderColors = [];
    
    for (let i = 0; i < categories.length; i++) {
        const colorIndex = i % chartColors.categories.length;
        backgroundColors.push(chartColors.categories[colorIndex]);
        borderColors.push(chartColors.categories[colorIndex].replace('0.7', '1'));
    }
    
    // Criar novo gráfico
    expenseDistributionChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [{
                data: values,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 12,
                        font: {
                            size: 10
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            return `${context.label}: ${formatCurrency(value)}`;
                        }
                    }
                }
            }
        }
    });
};

// Atualizar tipo de gráfico principal
const updateChartType = () => {
    // Recarregar dados para atualizar o gráfico
    loadAndDisplayReportData();
};

// Exportar relatório para PDF
const exportReport = () => {
    // Implementação simplificada (em uma versão real usaria uma biblioteca de PDF)
    alert('Funcionalidade de exportação de relatório será implementada em breve.');
};

// Exibir estado de carregamento
const showLoadingState = () => {
    // Estado de carregamento para a tabela
    const tableBody = document.getElementById('propertyDetailsSummary');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-10 text-center">
                    <div class="inline-block">
                        <div class="spinner" style="width: 2rem; height: 2rem;"></div>
                    </div>
                    <p class="text-gray-500 mt-2">Carregando dados...</p>
                </td>
            </tr>
        `;
    }
};

// Exibir estado vazio (sem dados)
const showEmptyState = () => {
    // Estado vazio para a tabela
    const tableBody = document.getElementById('propertyDetailsSummary');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                    Nenhum dado disponível para o período selecionado.
                </td>
            </tr>
        `;
    }
    
    // Zerar resumo financeiro
    updateFinancialSummary({
        income: 0,
        expense: 0,
        profit: 0
    });
    
    // Zerar estatísticas detalhadas
    updateDetailedStatistics({
        statistics: {
            avgMonthlyIncome: 0,
            avgMonthlyExpense: 0,
            avgMonthlyProfit: 0,
            profitMargin: 0,
            maxMonthlyIncome: 0,
            maxMonthlyExpense: 0,
            maxProfitMonth: null,
            minProfitMonth: null
        }
    });
    
    // Limpar gráficos
    if (mainChart) {
        mainChart.destroy();
        mainChart = null;
    }
    
    if (incomeDistributionChart) {
        incomeDistributionChart.destroy();
        incomeDistributionChart = null;
    }
    
    if (expenseDistributionChart) {
        expenseDistributionChart.destroy();
        expenseDistributionChart = null;
    }
    
    // Criar gráficos vazios
    const mainCtx = document.getElementById('mainChart');
    if (mainCtx) {
        mainChart = new Chart(mainCtx, {
            type: 'bar',
            data: {
                labels: ['Sem dados'],
                datasets: [{
                    label: 'Sem dados',
                    data: [0],
                    backgroundColor: 'rgba(200, 200, 200, 0.5)',
                    borderColor: 'rgba(200, 200, 200, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    const incomeCtx = document.getElementById('incomeDistributionChart');
    if (incomeCtx) {
        incomeDistributionChart = new Chart(incomeCtx, {
            type: 'pie',
            data: {
                labels: ['Sem dados'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['rgba(200, 200, 200, 0.5)'],
                    borderColor: ['rgba(200, 200, 200, 1)'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    const expenseCtx = document.getElementById('expenseDistributionChart');
    if (expenseCtx) {
        expenseDistributionChart = new Chart(expenseCtx, {
            type: 'pie',
            data: {
                labels: ['Sem dados'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['rgba(200, 200, 200, 0.5)'],
                    borderColor: ['rgba(200, 200, 200, 1)'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
};

// Exibir estado de erro
const showErrorState = (message) => {
    // Estado de erro para a tabela
    const tableBody = document.getElementById('propertyDetailsSummary');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-4 text-center text-red-500">
                    <i class="fas fa-exclamation-circle text-red-500 text-2xl mb-2"></i>
                    <p>${message}</p>
                    <button id="retryLoadBtn" class="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                        <i class="fas fa-redo mr-2"></i>Tentar novamente
                    </button>
                </td>
            </tr>
        `;
        
        const retryLoadBtn = document.getElementById('retryLoadBtn');
        if (retryLoadBtn) {
            retryLoadBtn.addEventListener('click', loadAndDisplayReportData);
        }
    }
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
    if (window.location.pathname.includes('reports.html')) {
        // Verificar autenticação
        auth.onAuthStateChanged(user => {
            if (user) {
                // Inicializar página
                initReportsPage();
            } else {
                // Redirecionar para login
                window.location.href = '../index.html';
            }
        });
    }
});
