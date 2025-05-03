// Configuração do Firebase
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "flowbnb-app.firebaseapp.com",
  projectId: "flowbnb-app",
  storageBucket: "flowbnb-app.appspot.com",
  messagingSenderId: "SUA_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referências para serviços do Firebase
const auth = firebase.auth();
const db = firebase.firestore();

// Configurações do Firestore
db.settings({
  timestampsInSnapshots: true
});

// Formato para valor em reais (BRL)
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Converte timestamp do Firestore para data legível
const formatDate = (timestamp) => {
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('pt-BR');
};

// Ajuste para entrada de valores monetários
const formatInputCurrency = (input) => {
  let value = input.value.replace(/\D/g, '');
  value = (parseInt(value) / 100).toFixed(2);
  input.value = value;
};
