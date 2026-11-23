const sampleKits = [
    { id: 1, title: "RG 1/144 RX-78-2 Gundam Ver. 2.0", manufacturer: "Bandai", grade: "Real Grade", status: "Completed" },
    { id: 2, title: "MODEROID Strelitzia", manufacturer: "Good Smile", grade: "Non-Scale", status: "In Progress" },
    { id: 3, title: "Megami Device ASRA Ninja", manufacturer: "Kotobukiya", grade: "1/1 Scale", status: "Backlog" },
    { id: 4, title: "HGUC 1/144 Nightingale", manufacturer: "Bandai", grade: "High Grade", status: "Backlog" }
];

document.addEventListener("DOMContentLoaded", () => {
    const kitGrid = document.getElementById("kit-grid");
    const searchInput = document.getElementById("search-input");
    const manufacturerFilter = document.getElementById("manufacturer-filter");

    function renderKits(kits) {
        if (!kitGrid) return;
        kitGrid.innerHTML = "";

        kits.forEach(kit => {
            const badgeClass =
                kit.manufacturer === "Bandai" ? "badge-bandai" :
                kit.manufacturer === "Good Smile" ? "badge-moderoid" :
                kit.manufacturer === "Kotobukiya" ? "badge-kotobukiya" : "";

            const card = document.createElement("div");
            card.className = "kit-card";
            card.innerHTML = `<div class="kit-image-placeholder">[ Kit Image ]</div>
            <div class="kit-info">
                <span class="badge ${badgeClass}">${kit.manufacturer}</span>
                <h3 class="kit-title">${kit.title}</h3>
                <div class="kit-meta">
                    <p><strong>Grade:</strong> ${kit.grade}</p>
                    <p><strong>Status:</strong> ${kit.status}</p>
                </div>
            </div>`;
            kitGrid.appendChild(card);
        });
    }

    renderKits(sampleKits);

    if (searchInput && manufacturerFilter) {
        const filterData = () => {
            const query = searchInput.value.toLowerCase();
            const selectedManufacturer = manufacturerFilter.value;

            const filtered = sampleKits.filter(kit => {
                const matchesQuery = kit.title.toLowerCase().includes(query) || kit.grade.toLowerCase().includes(query);
                const matchesBrand = selectedManufacturer === "" || kit.manufacturer === selectedManufacturer;
                return matchesQuery && matchesBrand;
            });

            renderKits(filtered);
        };

        searchInput.addEventListener("input", filterData);
        manufacturerFilter.addEventListener("change", filterData);
    }

    async function checkAuthSession() {
        const token = localStorage.getItem("plamolog_token");
        const navLinks = document.querySelector(".nav-links");
        if (!token || !navLinks) return;

        try {
            const res = await fetch("/api/auth/me", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                navLinks.innerHTML = `
                    <a href="index.html" class="active">Catalog</a>
                    <a href="#">Build Journals</a>
                    <a href="#">Paints</a>
                    <span style="color: #38bdf8; font-weight: 600;">Builder: ${data.user.username}</span>
                    <a href="#" id="logout-btn" style="color: #f97316;">Logout</a>
                `;

                document.getElementById("logout-btn").addEventListener("click", (e) => {
                    e.preventDefault();
                    localStorage.removeItem("plamolog_token");
                    window.location.href = "login.html";
                });
            } else {
                localStorage.removeItem("plamolog_token");
            }
        } catch (err) {
            console.error("Session check failed:", err);
        }
    }

    checkAuthSession();
});
