// Import fungsi manipulasi DOM dari CrootJS
import { setInner } from "https://cdn.jsdelivr.net/gh/crootjs/lib@main/dom.js";

// Ganti dengan URL Golang kamu di Domcloud / Alwaysdata
const BACKEND_URL = "https://backend-kamu.domcloud.io/api/auth/google";

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
            <h3 style="color: green;">${data.message}</h3>
            <p>Halo, <b>${data.user.name}</b> (${data.user.email})</p>
        `;
        setInner("hasil-login", tampilanSukses);
    })
    .catch(err => {
        console.error("Error:", err);
        setInner("hasil-login", `<span style="color: red;">Error: ${err.message}</span>`);
    });
};