let gamesData = []; // Тут будут игоры

document.addEventListener('DOMContentLoaded', () => {
    loadGames();

    const form = document.getElementById('game-form');
    const cancelBtn = document.getElementById('cancel-btn');

    // Кнопка Отмены
    cancelBtn.addEventListener('click', resetForm);

    // Обработка отправки формы
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('game-id').value;
        
        const gameData = {
            title: document.getElementById('title').value,
            genre: document.getElementById('genre').value,
            status: document.getElementById('status').value,
            rating: parseInt(document.getElementById('rating').value),
            image_url: document.getElementById('image_url').value,
            comment: document.getElementById('comment').value
        };

        if (id) {
            // --- РЕЖИМ РЕДАКТИРОВАНИЯ ---
            gameData.id = parseInt(id);
            await fetch('/api/games/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(gameData)
            });
        } else {
            // --- РЕЖИМ СОЗДАНИЯ ---
            await fetch('/api/games', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(gameData)
            });
        }

        resetForm(); // Очистить форму и выйти из режима редактирования
        loadGames(); // Обновить список
    });
});

// Загрузка игр
async function loadGames() {
    const grid = document.getElementById('games-grid');
    grid.innerHTML = '<p style="text-align:center; width:100%;">Загрузка...</p>';

    try {
        const response = await fetch('/api/games');
        gamesData = await response.json();

        grid.innerHTML = '';

        if (!gamesData || gamesData.length === 0) {
            grid.innerHTML = '<p style="text-align:center; width:100%;">Полка пуста.</p>';
            return;
        }

        gamesData.forEach(game => {
            const card = document.createElement('div');
            card.className = 'game-card';
            
            const imgUrl = game.image_url || 'https://via.placeholder.com/300x180?text=No+Image';

            card.innerHTML = `
                <img src="${imgUrl}" alt="${game.title}">
                <div class="actions">
                    <button class="icon-btn edit-btn" onclick="startEdit(${game.id})" title="Редактировать">✎</button>
                    <button class="icon-btn delete-btn" onclick="deleteGame(${game.id})" title="Удалить">✖</button>
                </div>
                <div class="card-content">
                    <h3>${game.title}</h3>
                    <span class="tag">${game.genre}</span>
                    <span class="tag">${game.status}</span>
                    <p>Оценка: <span class="rating">${game.rating} / 10</span></p>
                    <p class="comment">${game.comment || 'Нет комментариев'}</p>
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        console.error(error);
    }
}

// Начать редактирование
function startEdit(id) {
    const game = gamesData.find(g => g.id === id);
    if (!game) return;

    document.getElementById('game-id').value = game.id;
    document.getElementById('title').value = game.title;
    document.getElementById('genre').value = game.genre;
    document.getElementById('status').value = game.status;
    document.getElementById('rating').value = game.rating;
    document.getElementById('image_url').value = game.image_url;
    document.getElementById('comment').value = game.comment;

    document.getElementById('submit-btn').innerText = "Сохранить изменения";
    document.getElementById('cancel-btn').style.display = "block";
    
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

function resetForm() {
    document.getElementById('game-form').reset();
    document.getElementById('game-id').value = "";
    
    document.getElementById('submit-btn').innerText = "Добавить на полку";
    document.getElementById('cancel-btn').style.display = "none";
}

async function deleteGame(id) {
    if (!confirm("Удалить игру?")) return;
    await fetch(`/api/games/delete?id=${id}`, { method: 'DELETE' });
    loadGames();
}