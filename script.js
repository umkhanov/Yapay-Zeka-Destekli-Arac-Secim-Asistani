// URL вашего backend на Render.com
const BACKEND_URL = 'https://your-backend-app.onrender.com/api/recommend';

// Элементы DOM
const searchBtn = document.getElementById('searchBtn');
const userQuery = document.getElementById('userQuery');
const loading = document.getElementById('loading');
const results = document.getElementById('results');
const error = document.getElementById('error');
const explanation = document.getElementById('explanation');
const carsList = document.getElementById('carsList');

// Обработчик кнопки поиска
searchBtn.addEventListener('click', handleSearch);

// Поиск по Enter (Ctrl+Enter в textarea)
userQuery.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
        handleSearch();
    }
});

async function handleSearch() {
    const query = userQuery.value.trim();
    
    // Валидация
    if (!query) {
        showError('Lütfen bir sorgu girin!');
        return;
    }
    
    // Сброс предыдущих результатов
    hideError();
    hideResults();
    showLoading();
    
    try {
        // Запрос к backend
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: query })
        });
        
        if (!response.ok) {
            throw new Error(`Sunucu hatası: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Проверка на ошибки от backend
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Отображение результатов
        displayResults(data);
        
    } catch (err) {
        console.error('Hata:', err);
        showError(`Bir hata oluştu: ${err.message}`);
    } finally {
        hideLoading();
    }
}

function displayResults(data) {
    // Отображаем объяснение от Gemini
    explanation.innerHTML = formatExplanation(data.explanation);
    
    // Отображаем автомобили
    carsList.innerHTML = '';
    
    if (!data.cars || data.cars.length === 0) {
        carsList.innerHTML = '<p style="text-align:center; color:#666;">Kriterlere uygun araç bulunamadı.</p>';
    } else {
        data.cars.forEach(car => {
            carsList.appendChild(createCarCard(car));
        });
    }
    
    // Показываем результаты
    showResults();
}

function createCarCard(car) {
    const card = document.createElement('div');
    card.className = 'car-card';
    
    // Изображение (если есть URL в данных)
    const imageUrl = car.image_url || getDefaultCarImage(car.brand);
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="${car.brand} ${car.model}" class="car-image" 
             onerror="this.src='https://via.placeholder.com/400x200/667eea/ffffff?text=Araba+Resmi+Yok'">
        <div class="car-info">
            <div class="car-name">${car.brand} ${car.model}</div>
            <div class="car-score">Skor: ${car.utility_score.toFixed(2)}</div>
            <div class="car-details">
                <div class="car-detail">
                    <span class="detail-label">💰 Fiyat</span>
                    <span class="detail-value">${formatPrice(car.price)} TL</span>
                </div>
                <div class="car-detail">
                    <span class="detail-label">⛽ Yakıt</span>
                    <span class="detail-value">${car.fuel_type}</span>
                </div>
                <div class="car-detail">
                    <span class="detail-label">📊 Tüketim</span>
                    <span class="detail-value">${car.fuel_consumption} L/100km</span>
                </div>
                <div class="car-detail">
                    <span class="detail-label">⚡ Güç</span>
                    <span class="detail-value">${car.horsepower} HP</span>
                </div>
                <div class="car-detail">
                    <span class="detail-label">🚗 Gövde</span>
                    <span class="detail-value">${car.body_type}</span>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

// Форматирование объяснения (разбивка на параграфы)
function formatExplanation(text) {
    return text.split('\n').map(line => {
        line = line.trim();
        if (line) {
            return `<p>${line}</p>`;
        }
        return '';
    }).join('');
}

// Форматирование цены
function formatPrice(price) {
    return new Intl.NumberFormat('tr-TR').format(price);
}

// Заглушка для изображений (можно заменить на реальный поиск)
function getDefaultCarImage(brand) {
    // В будущем можно использовать API для поиска изображений
    const brandLogos = {
        'Toyota': 'https://www.carlogos.org/car-logos/toyota-logo.png',
        'BMW': 'https://www.carlogos.org/car-logos/bmw-logo.png',
        'Mercedes': 'https://www.carlogos.org/car-logos/mercedes-benz-logo.png',
        'Volkswagen': 'https://www.carlogos.org/car-logos/volkswagen-logo.png',
        'Renault': 'https://www.carlogos.org/car-logos/renault-logo.png',
        'Fiat': 'https://www.carlogos.org/car-logos/fiat-logo.png'
    };
    
    return brandLogos[brand] || 'https://via.placeholder.com/400x200/667eea/ffffff?text=Araba';
}

// Утилиты для UI
function showLoading() {
    loading.classList.remove('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

function showResults() {
    results.classList.remove('hidden');
}

function hideResults() {
    results.classList.add('hidden');
}

function showError(message) {
    error.textContent = message;
    error.classList.remove('hidden');
    
    // Автоскрытие через 5 секунд
    setTimeout(() => {
        hideError();
    }, 5000);
}

function hideError() {
    error.classList.add('hidden');
}
