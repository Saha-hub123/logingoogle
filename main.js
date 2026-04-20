// Import fungsi manipulasi DOM dari CrootJS
import { setInner } from "https://cdn.jsdelivr.net/gh/crootjs/lib@main/dom.js";

// Ganti dengan URL Golang kamu di Domcloud / Alwaysdata
const BACKEND_URL = "https://afraid-pension-wud.sgp.dom.my.id/api/auth/google";

// Fungsi callback ini harus berada di scope global (window) agar bisa dipanggil oleh script Google
window.handleGoogleLogin = (response) => {
    // response.credential adalah JWT Token dari Google
    const googleToken = response.credential;
    
    setInner("hasil-login", "<i>Sedang memverifikasi ke server...</i>");

    // Kirim token ke backend Golang
    fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: googleToken })
    })
    .then(res => {
        if (!res.ok) throw new Error("Gagal verifikasi di backend");
        return res.json();
    })
    .then(data => {
        // Gunakan CrootJS untuk menampilkan hasil sukses ke div id="hasil-login"
        const tampilanSukses = `
            <h3 style="color: #4ade80;">${data.message}</h3>
            <p style="margin-top: 5px; font-size: 0.9em;">Halo, <b>${data.user.name}</b><br><span style="color: #94a3b8">${data.user.email}</span></p>
        `;
        setInner("hasil-login", tampilanSukses);
    })
    .catch(err => {
        console.error("Error:", err);
        setInner("hasil-login", `<span style="color: #f87171; font-weight: 600;">Error: ${err.message}</span>`);
    });
};