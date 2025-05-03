// Configuração do Firebase
const firebaseConfig = {
  apiKey: "-",
  authDomain: "flowbnb-86591.firebaseapp.com",
  projectId: "flowbnb-86591",
  storageBucket: "flowbnb-86591.firebasestorage.app",
  messagingSenderId: "417382171684",
  appId: "1:417382171684:web:f1b19bc1ec07cc4302c4b1"
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
