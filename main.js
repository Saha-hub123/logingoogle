// Pengganti fungsi CrootJS yang sedang Error/404 (Memakai JavaScript Murni)
const setInner = (id, content) => { document.getElementById(id).innerHTML = content; };

// Ganti dengan URL Golang kamu di Domcloud / Alwaysdata
const BACKEND_URL = "https://vibrant-toe-nus.sgp.dom.my.id/api/auth/google";

// --- LOGIKA CEK SESI (Saat Halaman Baru Dibuka) ---
const sesiTersimpan = localStorage.getItem("user_google");
if (sesiTersimpan) {
    const user = JSON.parse(sesiTersimpan);
    
    // Tampilkan data user & tombol logout
    setInner("hasil-login", `
        <h3 style="color: #4ade80;">Anda sudah Login!</h3>
        <p style="margin-top: 5px; font-size: 0.9em;">Selamat datang kembali, <b>${user.name}</b><br><span style="color: #94a3b8">${user.email}</span></p>
        <button id="btn-logout" style="margin-top: 15px; padding: 6px 12px; background: #f87171; color: white; border: none; border-radius: 6px; cursor: pointer;">Logout</button>
    `);

    // Sembunyikan div tombol Google (agar tidak numpuk)
    document.querySelector(".google-btn-wrapper").style.display = "none";

    // Berikan fungsi klik pada tombol logout
    document.getElementById("btn-logout").addEventListener("click", () => {
        localStorage.removeItem("user_google");
        window.location.reload(); // muat ulang halaman
    });
}
// ---------------------------------------------------

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
        if (!res.ok) throw new Error("Gagal verifikasi di backend (Pastikan backend menyala & CORS benar)");
        return res.json();
    })
    .then(data => {
        // --- SIMPAN KE BROWSER ---
        localStorage.setItem("user_google", JSON.stringify(data.user));

        // Gunakan CrootJS untuk menampilkan hasil sukses ke div id="hasil-login"
        const tampilanSukses = `
            <h3 style="color: #4ade80;">${data.message}</h3>
            <p style="margin-top: 5px; font-size: 0.9em;">Halo, <b>${data.user.name}</b><br><span style="color: #94a3b8">${data.user.email}</span></p>
        `;
        setInner("hasil-login", tampilanSukses);

        document.querySelector(".google-btn-wrapper").style.display = "none";
        
        // Refresh sedikit agar merender tombol logout & status baru
        setTimeout(() => window.location.reload(), 1500);
    })
    .catch(err => {
        console.error("Error:", err);
        setInner("hasil-login", `<span style="color: #f87171; font-weight: 600;">Error: ${err.message}</span>`);
    });
};