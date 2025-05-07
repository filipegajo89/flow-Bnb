// Arquivo principal da aplicação FlowBnb
console.log('Arquivo app.js carregado');

// Inicializar a aplicação
const initApp = () => {
  console.log('Inicializando aplicação FlowBnb...');
  
  // Verificar se é a primeira execução
  checkFirstRun();
  
  // Não duplicamos a verificação de autenticação aqui
  // Isso já está sendo feito em auth.js
  
  // Adicionar logs para depuração
  console.log('Caminho atual:', window.location.pathname);
  console.log('URL completa:', window.location.href);
};

// Verificar se é a primeira execução do aplicativo
const checkFirstRun = () => {
  const isFirstRun = localStorage.getItem('flowbnbFirstRun') !== 'false';
  
  if (isFirstRun) {
    console.log('Primeira execução detectada');
    
    // Marcar que não é mais a primeira execução
    localStorage.setItem('flowbnbFirstRun', 'false');
    
    // Exibir mensagem de boas-vindas ou tutorial (versão futura)
  }
};

// Inicializar quando a página for carregada
document.addEventListener('DOMContentLoaded', initApp);

// Adicione este código no final do arquivo app.js
document.addEventListener('DOMContentLoaded', function() {
    // Tente encontrar o botão do menu do usuário - ajuste o seletor conforme necessário
    const userMenuBtn = document.querySelector('.avatar-button') || document.getElementById('userAvatarBtn');
    const userMenuDropdown = document.querySelector('.dropdown-menu') || document.getElementById('userDropdownMenu');
    
    if (userMenuBtn && userMenuDropdown) {
        console.log('Menu do usuário encontrado');
        
        userMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Botão do menu do usuário clicado');
            // Alternar a visibilidade do dropdown
            userMenuDropdown.classList.toggle('show');
        });
        
        // Fechar o dropdown quando clicar fora dele
        document.addEventListener('click', function(event) {
            if (!userMenuBtn.contains(event.target) && !userMenuDropdown.contains(event.target)) {
                userMenuDropdown.classList.remove('show');
            }
        });
    } else {
        console.warn('Botão de menu de usuário ou dropdown não encontrado');
    }
});
