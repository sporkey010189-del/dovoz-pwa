// Регистрация Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('sw.js').then(function(registration) {
            console.log('ServiceWorker зарегистрирован: ', registration.scope);
        }, function(err) {
            console.log('Ошибка регистрации ServiceWorker: ', err);
        });
    });
}

// Проверка установки PWA
window.addEventListener('appinstalled', (evt) => {
    console.log('PWA приложение установлено');
});

// Запрос на установку PWA
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Показываем кнопку установки
    showInstallButton();
});

function showInstallButton() {
    const installButton = document.createElement('button');
    installButton.innerHTML = '📱 Установить приложение';
    installButton.className = 'install-btn';
    installButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4CAF50, #2E7D32);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 25px;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    
    installButton.onclick = async () => {
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('Пользователь установил PWA');
        }
        
        deferredPrompt = null;
        installButton.remove();
    };
    
    document.body.appendChild(installButton);
    
    // Автоматически скрыть через 10 секунд
    setTimeout(() => {
        if (installButton.parentNode) {
            installButton.remove();
        }
    }, 10000);
}

// Проверка режима PWA
function isRunningAsPWA() {
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone ||
           document.referrer.includes('android-app://');
}

// Кэширование данных для оффлайн работы
const CACHE_NAME = 'dovoz-cache-v1';
const CACHE_URLS = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/pwa.js',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png'
];

// Проверка онлайн/оффлайн статуса
function updateOnlineStatus() {
    if (!navigator.onLine) {
        showToast('⚠️ Работаем в оффлайн режиме');
    }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Инициализация статуса при загрузке
updateOnlineStatus();