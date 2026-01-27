package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	_ "github.com/lib/pq" // Драйвер для Postgres
)

// Game - структура, описывающая игру
type Game struct {
	ID       int    `json:"id"`
	Title    string `json:"title"`
	Genre    string `json:"genre"`
	Status   string `json:"status"`
	Rating   int    `json:"rating"`
	ImageURL string `json:"image_url"`
	Comment  string `json:"comment"`
}

var db *sql.DB

func main() {
	// Настройки подключения к БД
	connStr := os.Getenv("DATABASE_URL")
	if connStr == "" {
		// Для локального запуска
		connStr = "postgres://postgres:password@localhost:5432/postgres?sslmode=disable"
	}

	var err error
	// Подключение к базе
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}

	// Главная страница
	fs := http.FileServer(http.Dir("./"))
	http.Handle("/", fs)

	// API для работы с играми
	http.HandleFunc("/api/games", gamesHandler)         // GET и POST
	http.HandleFunc("/api/games/delete", deleteHandler) // DELETE
	http.HandleFunc("/api/games/update", updateHandler) // UPDATE

	// Сервер
	port := ":8080"
	fmt.Println("Сервер запущен на http://localhost" + port)
	err = http.ListenAndServe(port, nil)
	if err != nil {
		log.Fatal(err)
	}
}

// gamesHandler выбирает действие в зависимости от метода
func gamesHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	switch r.Method {
	case "GET":
		getGames(w, r)
	case "POST":
		createGame(w, r)
	default:
		http.Error(w, "Метод не поддерживается", http.StatusMethodNotAllowed)
	}
}

// getGames - Получить все игры из БД
func getGames(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT id, title, genre, status, rating, image_url, comment FROM games ORDER BY id DESC")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var games []Game
	for rows.Next() {
		var g Game
		if err := rows.Scan(&g.ID, &g.Title, &g.Genre, &g.Status, &g.Rating, &g.ImageURL, &g.Comment); err != nil {
			continue
		}
		games = append(games, g)
	}

	// Отправка списка на клиент
	json.NewEncoder(w).Encode(games)
}

// createGame - Добавить новую игру
func createGame(w http.ResponseWriter, r *http.Request) {
	var g Game
	if err := json.NewDecoder(r.Body).Decode(&g); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	sqlStatement := `
	INSERT INTO games (title, genre, status, rating, image_url, comment)
	VALUES ($1, $2, $3, $4, $5, $6)
	RETURNING id`

	err := db.QueryRow(sqlStatement, g.Title, g.Genre, g.Status, g.Rating, g.ImageURL, g.Comment).Scan(&g.ID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Возврат созданной игры в клиент
	json.NewEncoder(w).Encode(g)
}

// deleteHandler - Удалить игру
func deleteHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "DELETE" {
		http.Error(w, "Только DELETE метод разрешен", http.StatusMethodNotAllowed)
		return
	}

	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "Не указан ID", http.StatusBadRequest)
		return
	}

	_, err := db.Exec("DELETE FROM games WHERE id = $1", id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "deleted"}`))
}

// updateHandler - Обновить данные игры
func updateHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "PUT" {
		http.Error(w, "Только PUT метод разрешен", http.StatusMethodNotAllowed)
		return
	}

	var g Game
	if err := json.NewDecoder(r.Body).Decode(&g); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	sqlStatement := `
	UPDATE games 
	SET title = $1, genre = $2, status = $3, rating = $4, image_url = $5, comment = $6
	WHERE id = $7`

	_, err := db.Exec(sqlStatement, g.Title, g.Genre, g.Status, g.Rating, g.ImageURL, g.Comment, g.ID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "updated"}`))
}
