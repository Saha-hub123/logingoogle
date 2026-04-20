package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"google.golang.org/api/idtoken"
)

// GANTI DENGAN CLIENT ID GOOGLE KAMU
const googleClientID = "913953057682-rnnu6q9tvqfr6p960io76nm9fkio2m4i.apps.googleusercontent.com"

// Struktur untuk menangkap request dari CrootJS
type AuthRequest struct {
	Token string `json:"token"`
}

// Middleware untuk mengizinkan CORS dari GitHub Pages
func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Ganti dengan URL GitHub Pages kamu
		w.Header().Set("Access-Control-Allow-Origin", "https://saha-hub123.github.io")
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		// Handle preflight request
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next(w, r)
	}
}

// Handler untuk memvalidasi Token Google
func authGoogleHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req AuthRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	// Validasi token langsung ke server Google
	payload, err := idtoken.Validate(context.Background(), req.Token, googleClientID)
	if err != nil {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	// Ekstrak data dari token yang sudah tervalidasi
	email := payload.Claims["email"]
	name := payload.Claims["name"]

	// Di sini kamu bisa menambahkan logika untuk mengecek user ke Database kamu
	

	// Kirim response sukses ke Frontend
	response := map[string]interface{}{
		"status":  "success",
		"message": "Login berhasil!",
		"user": map[string]interface{}{
			"name":  name,
			"email": email,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func main() {
	http.HandleFunc("/api/auth/google", enableCORS(authGoogleHandler))

	// Domcloud / Alwaysdata biasanya menggunakan port default tertentu atau env PORT
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server berjalan di port %s...\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}