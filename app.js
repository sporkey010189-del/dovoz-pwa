// === КОНФИГУРАЦИЯ ===
const CONFIG = {
  // ⚠️ ЗАМЕНИТЕ ЭТОТ URL НА ВАШ НОВЫЙ ИЗ НОВОГО СКРИПТА
  API_URL: "https://script.google.com/macros/s/AKfycbzkLbw9dekhpuQsctrdTRkMitrNhSsg7bqDRpSYnhcPqScLlhRzisoTcx1p8ECbzUTF/exec",
  SHEET_IDS: {
    "ULN": "1wX3MOY3OMFl1sTZCKyZvusjnpnjn8dn9VLKUBkjJ9w",
    "VRN": "1Ai820refQUAqUjNbfrv5ZUTP1pQqY3-MFqyF92U-a2A",
    "SMR": "1iEUoKlBXm7Nm3ixaDEQ8HFLcVh0hbfaL2Kwjxh25Uc0",
    "KRD": "1TyyLWAlbY8ohpmgdBbIi1iXZCTkxwm4psQdSpNu1iaI",
    "NBCH": "1a6pwlwjnmdl3U43JeLBDqmVBKepJfy-RsUKE8e7GxE0",
    "VLG": "1a8Q2fNaIMNUnctpktbnu_I9GgKCzWW_S4wf39QGpc-M"
  }
};

// === ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ===
let currentCity = "ULN";
let currentCityName = "Ульяновск";

// === DOM ЭЛЕМЕНТЫ ===
const citySelectionScreen = document.getElementById('citySelection');
const searchScreen = document.getElementById('searchScreen');
const currentCityElement = document.getElementById('currentCity');
const gmInput = document.getElementById('gmInput');
const resultText = document.getElementById('resultText');
const loadingElement = document.getElementById('loading');
const helpModal = document.getElementById('helpModal');
const helpContent = document.getElementById('helpContent');
const toast = document.getElementById('toast');

// === ВЫБОР ГОРОДА ===
function selectCity(cityCode, cityName) {
  currentCity = cityCode;
  currentCityName = cityName;
  currentCityElement.textContent = `РЦ: ${cityName}`;
  citySelectionScreen.classList.remove('active');
  searchScreen.classList.add('active');
  resultText.innerHTML = `🔍 Поиск довозов: <strong>${cityName}</strong><br><br>
                          Введите номер ГМ для поиска<br>
                          (только цифры, без букв и символов)<br><br>
                          Пример: 112472979<br><br>
                          <small>Номер ГМ содержит только цифры</small>`;
  showToast(`Выбран РЦ: ${cityName}`);
}

// === НАЗАД К ВЫБОРУ ГОРОДА ===
function goBack() {
  searchScreen.classList.remove('active');
  citySelectionScreen.classList.add('active');
}

// === ПОИСК ГМ ===
async function searchGm() {
  const gmNumber = gmInput.value.trim();
  if (!gmNumber) {
    showToast("Введите номер ГМ");
    return;
  }
  if (!/^\d+$/.test(gmNumber)) {
    showToast("Номер ГМ должен содержать только цифры");
    return;
  }

  checkCityConsistency(gmNumber);
  showLoading(true);
  resultText.textContent = "⏳ Ищем в базе данных...";

  try {
    // 🔹 ИСПОЛЬЗУЕМ GET (не POST!)
    const params = new URLSearchParams({
      gm: gmNumber,
      text: gmNumber,
      city: currentCity
    });
    const url = `${CONFIG.API_URL}?${params.toString()}`;
    
    const response = await fetch(url, { method: 'GET' });
    const data = await response.json();

    if (data.ok) {
      resultText.innerHTML = formatText(data.result?.text || "📊 Ответ получен");
    } else {
      resultText.textContent = `❌ Ошибка: ${data.error || "Неизвестная ошибка"}`;
    }
  } catch (error) {
    resultText.innerHTML = `⚠️ Ошибка подключения<br><br>
      Не удалось подключиться к серверу.<br>
      Проверьте интернет.<br><br>
      <small>Ошибка: ${error.message}</small>`;
  } finally {
    showLoading(false);
  }
}

// === ПРОВЕРКА СООТВЕТСТВИЯ ГОРОДА И ГМ ===
function checkCityConsistency(gmNumber) {
  const firstDigit = gmNumber.charAt(0);
  let expectedCity = null;
  switch(firstDigit) {
    case '1': case '2': case '4': case '9': expectedCity = "ULN"; break;
    case '5': expectedCity = "VRN"; break;
    case '6': expectedCity = "SMR"; break;
    case '3': expectedCity = "KRD"; break;
    case '7': expectedCity = "NBCH"; break;
    case '8': expectedCity = "VLG"; break;
  }
  if (expectedCity && expectedCity !== currentCity) {
    showToast(`⚠️ Вы ищете ГМ другого города. Выбран РЦ: ${currentCityName}`, 4000);
  }
}

// === ФОРМАТИРОВАНИЕ ТЕКСТА ===
function formatText(text) {
  return text.replace(/\n/g, '<br>')
             .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
             .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

// === ЗАГРУЗКА И ТОСТЫ ===
function showLoading(show) {
  loadingElement.classList.toggle('active', show);
}

function showToast(message, duration = 3000) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

function showHelp() {
  const helpText = `
    <h4>📋 Помощь по использованию</h4>
    <p><strong>Выбран РЦ:</strong> ${currentCityName}</p>
    <p><strong>Что можно искать:</strong></p>
    <ul><li>Номер ГМ (ШК) из РАН - только цифры</li></ul>
    <p><strong>Что НЕЛЬЗЯ:</strong></p>
    <ul><li>Накладные (123/456), текст, буквы</li></ul>
    <p><strong>Города и цифры:</strong></p>
    <ul>
      <li>1,2,4,9 – Ульяновск</li>
      <li>5 – Воронеж</li>
      <li>6 – Самара</li>
      <li>3 – Краснодар</li>
      <li>7 – НБЧ</li>
      <li>8 – Волгоград</li>
    </ul>
  `;
  helpContent.innerHTML = helpText;
  helpModal.classList.add('active');
}

function closeHelp() {
  helpModal.classList.remove('active');
}

// === ОБРАБОТЧИКИ ===
gmInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchGm();
});

helpModal.addEventListener('click', (e) => {
  if (e.target === helpModal) closeHelp();
});

// === ИНИЦИАЛИЗАЦИЯ ===
document.addEventListener('DOMContentLoaded', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log('✅ Service Worker зарегистрирован'))
      .catch(err => console.error('❌ Ошибка Service Worker:', err));
  }
  gmInput.focus();
});
