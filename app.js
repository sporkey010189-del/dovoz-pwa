// Конфигурация
const CONFIG = {
    SHEET_IDS: {
        "ULN": "1wX3MOY3OMFl1sTZCKyZvusjnpnjn8dn9VLKUBkjJ9w",
        "VRN": "1Ai820refQUAqUjNbfrv5ZUTP1pQqY3-MFqyF92U-a2A",
        "SMR": "1iEUoKlBXm7Nm3ixaDEQ8HFLcVh0hbfaL2Kwjxh25Uc0",
        "KRD": "1TyyLWAlbY8ohpmgdBbIi1iXZCTkxwm4psQdSpNu1iaI",
        "NBCH": "1a6pwlwjnmdl3U43JeLBDqmVBKepJfy-RsUKE8e7GxE0",
        "VLG": "1a8Q2fNaIMNUnctpktbnu_I9GgKCzWW_S4wf39QGpc-M"
    },
    API_URL: "https://script.google.com/macros/s/AKfycbzkLbw9dekhpuQsctrdTRkMitrNhSsg7bqDRpSYnhcPqScLlhRzisoTcx1p8ECbzUTF/exec"
};

// Глобальные переменные
let currentCity = "ULN";
let currentCityName = "Ульяновск";

// DOM элементы
const citySelectionScreen = document.getElementById('citySelection');
const searchScreen = document.getElementById('searchScreen');
const currentCityElement = document.getElementById('currentCity');
const gmInput = document.getElementById('gmInput');
const resultText = document.getElementById('resultText');
const loadingElement = document.getElementById('loading');
const helpModal = document.getElementById('helpModal');
const helpContent = document.getElementById('helpContent');
const toast = document.getElementById('toast');

// Выбор города
function selectCity(cityCode, cityName) {
    currentCity = cityCode;
    currentCityName = cityName;
    
    // Обновляем отображение
    currentCityElement.textContent = `РЦ: ${cityName}`;
    
    // Переключаем экраны
    citySelectionScreen.classList.remove('active');
    searchScreen.classList.add('active');
    
    // Показываем приветствие
    resultText.innerHTML = `🔍 Поиск довозов: <strong>${cityName}</strong><br><br>
                            Введите номер ГМ для поиска<br>
                            (только цифры, без букв и символов)<br><br>
                            Пример: 112472979<br><br>
                            <small>Номер ГМ содержит только цифры</small>`;
    
    showToast(`Выбран РЦ: ${cityName}`);
}

// Назад к выбору города
function goBack() {
    searchScreen.classList.remove('active');
    citySelectionScreen.classList.add('active');
}

// Поиск ГМ номера
async function searchGm() {
    const gmNumber = gmInput.value.trim();
    
    // Валидация
    if (!gmNumber) {
        showToast("Введите номер ГМ");
        return;
    }
    
    if (!/^\d+$/.test(gmNumber)) {
        showToast("Номер ГМ должен содержать только цифры");
        return;
    }
    
    // Проверка города по первой цифре
    checkCityConsistency(gmNumber);
    
    // Показываем загрузку
    showLoading(true);
    resultText.textContent = "⏳ Ищем в базе данных...";
    
    try {
        // Отправляем запрос
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                gm: gmNumber,
                text: gmNumber,
                city: currentCity
            })
        });
        
        const data = await response.json();
        
        // Обрабатываем ответ
        if (data.ok) {
            if (data.result && data.result.text) {
                resultText.innerHTML = formatText(data.result.text);
            } else {
                resultText.textContent = "📊 Ответ получен";
            }
        } else {
            resultText.textContent = `❌ Ошибка: ${data.error || "Неизвестная ошибка"}`;
        }
    } catch (error) {
        resultText.innerHTML = `⚠️ Ошибка подключения<br><br>
                               Не удалось подключиться к серверу.<br>
                               Проверьте интернет соединение.<br><br>
                               <small>Ошибка: ${error.message}</small>`;
    } finally {
        showLoading(false);
    }
}

// Проверка соответствия города и номера ГМ
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

// Форматирование текста (замена \n на <br>)
function formatText(text) {
    return text.replace(/\n/g, '<br>')
               .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
               .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

// Показать/скрыть загрузку
function showLoading(show) {
    if (show) {
        loadingElement.classList.add('active');
    } else {
        loadingElement.classList.remove('active');
    }
}

// Показать справку
function showHelp() {
    const helpText = `
        <h4>📋 Помощь по использованию</h4>
        <p><strong>Выбран РЦ:</strong> ${currentCityName}</p>
        
        <p><strong>Что можно искать:</strong></p>
        <ul>
            <li>Номер ГМ (ШК) из РАН - только цифры</li>
            <li>Пример: 112472979</li>
        </ul>
        
        <p><strong>Что НЕЛЬЗЯ искать:</strong></p>
        <ul>
            <li>Номер накладной (формат 123/456)</li>
            <li>Текст или буквы</li>
        </ul>
        
        <p><strong>Города и первые цифры ГМ:</strong></p>
        <ul>
            <li>1, 2, 4, 9 - Ульяновск</li>
            <li>5 - Воронеж</li>
            <li>6 - Самара</li>
            <li>3 - Краснодар</li>
            <li>7 - Набережные Челны</li>
            <li>8 - Волгоград</li>
        </ul>
        
        <p><strong>Статусы заданий:</strong></p>
        <ul>
            <li>"Расформирован" - выставить АР</li>
            <li>Другие статусы - ждите довоз</li>
        </ul>
        
        <p><strong>Установка на iPhone:</strong></p>
        <ol>
            <li>Откройте в Safari</li>
            <li>Нажмите кнопку "Поделиться"</li>
            <li>Выберите "На экран "Домой""</li>
            <li>Готово! Приложение установлено</li>
        </ol>
        
        <p><strong>Установка на Android:</strong></p>
        <ol>
            <li>Откройте в Chrome</li>
            <li>Нажмите меню (три точки)</li>
            <li>Выберите "Установить приложение"</li>
        </ol>
    `;
    
    helpContent.innerHTML = helpText;
    helpModal.classList.add('active');
}

// Закрыть справку
function closeHelp() {
    helpModal.classList.remove('active');
}

// Показать toast уведомление
function showToast(message, duration = 3000) {
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// Обработка нажатия Enter в поле ввода
gmInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchGm();
    }
});

// Закрытие модального окна по клику вне его
helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) {
        closeHelp();
    }
});

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем, поддерживает ли браузер PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log('Service Worker зарегистрирован'))
            .catch(err => console.error('Ошибка Service Worker:', err));
    }
    
    // Устанавливаем фокус на поле ввода при открытии поиска
    gmInput.focus();

});
