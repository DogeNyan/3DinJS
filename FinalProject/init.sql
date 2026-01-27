CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    genre VARCHAR(100),
    status VARCHAR(50),
    rating INT CHECK (rating >= 0 AND rating <= 10),
    image_url TEXT,
    comment TEXT
);

INSERT INTO games (title, genre, status, rating, image_url, comment) 
VALUES 
('The Witcher 3', 'RPG', 'Прошел', 10, 'https://image.api.playstation.com/vulcan/ap/rnd/202211/0711/kh4MUIuMmHlktOHar3lVl6rY.png', 'Потратил уйму времени, но всё же закрыл Скеллиге'),
('Cyberpunk 2077', 'Action/RPG', 'Играю', 9, 'https://image.api.playstation.com/vulcan/ap/rnd/202311/2715/4597d264f333f208c160a027964436573752e259ca963f25.png', 'Самая любимая вселенная НРИ. Не жалею, что доверился разрабам');