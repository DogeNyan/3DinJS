'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [games, setGames] = useState([]); // Список игр
  const [formData, setFormData] = useState({ // Данные формы
    id: null,
    title: '',
    genre: '',
    status: '',
    rating: '',
    image_url: '',
    comment: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchGames();
  }, []);

  // Загрузка с сервера
  const fetchGames = async () => {
    try {
      const res = await fetch('/api/games');
      if (res.ok) {
        const data = await res.json();
        setGames(data || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    }
  };

  // Обработка
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Отправка
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = { ...formData, rating: parseInt(formData.rating) };

    const url = isEditing ? '/api/games/update' : '/api/games';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      resetForm();
      fetchGames();
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  };

  // Удаление
  const handleDelete = async (id) => {
    if (!confirm('Удалить игру?')) return;
    try {
      await fetch(`/api/games/delete?id=${id}`, { method: 'DELETE' });
      fetchGames();
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };

  // Редактирование
  const startEdit = (game) => {
    setFormData(game);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Сброс формы
  const resetForm = () => {
    setFormData({ id: null, title: '', genre: '', status: '', rating: '', image_url: '', comment: '' });
    setIsEditing(false);
  };

  // --- Верстка ---
  return (
    <div className="main-wrapper">
      <header>
        <h1> Моя Полка Игр </h1>
      </header>

      <main className="container">
        {}
        <section className="form-section">
          <h2>{isEditing ? 'Редактировать игру' : 'Добавить игру'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Название игры"
                required
              />
              <input
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                placeholder="Жанр (например: RPG)"
              />
            </div>
            <div className="form-group">
              <select name="status" value={formData.status} onChange={handleChange} required>
                <option value="" disabled>Статус прохождения</option>
                <option value="Играю">Играю</option>
                <option value="Прошел">Прошел</option>
                <option value="В планах">В планах</option>
              </select>
              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                min="0" max="10"
                placeholder="Оценка (0-10)"
                required
              />
            </div>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="Ссылка на обложку (URL)"
            />
            <textarea
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              rows="3"
              placeholder="Ваш комментарий или заметка"
            ></textarea>

            <div className="form-actions">
              <button type="submit">
                {isEditing ? 'Сохранить изменения' : 'Добавить на полку'}
              </button>
              {isEditing && (
                <button type="button" className="cancel-btn" onClick={resetForm}>
                  Отмена
                </button>
              )}
            </div>
          </form>
        </section>

        {}
        <section className="games-grid">
          {games.length === 0 ? (
            <p style={{ width: '100%', textAlign: 'center' }}>Полка пуста...</p>
          ) : (
            games.map((game) => (
              <div key={game.id} className="game-card">
                <img 
                  src={game.image_url || 'https://placehold.co/300x180'} 
                  alt={game.title} 
                />
                
                <div className="actions">
                  <button className="icon-btn edit-btn" onClick={() => startEdit(game)}>✎</button>
                  <button className="icon-btn delete-btn" onClick={() => handleDelete(game.id)}>✖</button>
                </div>

                <div className="card-content">
                  <h3>{game.title}</h3>
                  <span className="tag">{game.genre}</span>
                  <span className="tag">{game.status}</span>
                  <p>Оценка: <span className="rating">{game.rating} / 10</span></p>
                  <p className="comment">{game.comment || 'Нет комментариев'}</p>
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}