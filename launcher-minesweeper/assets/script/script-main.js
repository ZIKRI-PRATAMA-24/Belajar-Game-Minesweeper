document.getElementById("gameForm").addEventListener("submit", function (e) {
    e.preventDefault(); // mencegah reload

    let pilihan = document.getElementById("versi").value;

    if (pilihan !== "") {
        window.location.href = pilihan; // pindah halaman
    } else {
        alert("Pilih versi game dulu!");
    }
});