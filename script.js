const GOOGLE_API_KEY = "AIzaSyCMdLLpQpplV0bwIeijz6ejSGvYbWJ65OA";
const GOOGLE_CX = "2363b334861ad4bf3";
const sportForm = document.getElementById("sport-form");
const sportInput = document.getElementById("sportInput");
const optionInput = document.getElementById("categorySelect");
const resultsContainer = document.getElementById("resultsContainer");
const messageBox = document.getElementById("messageBox");

function showMsg(text, type = "info") {
    messageBox.textContent = text;
    messageBox.className = "message " + type;
    messageBox.classList.remove("hidden");
}

function clearResults() {
    resultsContainer.innerHTML = "";
}

async function isRealSport(sport) {
    try {
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${sport}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!data.extract) return false;
        const text = data.extract.toLowerCase();
        const keywords = ["sport", "sports", "game", "athletics", "competition", "team", "tournament"];
        return keywords.some(k => text.includes(k)); 
    } 
    catch {
        return false;
    }
}

async function fetchSportBasics(sport) {
    try {
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${sport}`;
        const res = await fetch(url);
        return await res.json();
    } catch {
        return null;
    }
}

async function googleSearch(query) {
    const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    return await res.json();
}

function getSportDetails(sport) {
    sport = sport.toLowerCase();
    if (sport.includes("chess")) {
        return {
            type: "Board Game",
            players: "2 players",
            environment: "Indoor",
            equipment: "Chess board and pieces"
        };
    }
    if (sport.includes("padel")) {
        return {
            type: "Racket Sport",
            players: "Doubles (2 vs 2)",
            environment: "Outdoor / Indoor",
            equipment: "Padel racket, ball, enclosed court"
        };
    }
    if (sport.includes("football")) {
        return {
            type: "Team Sport",
            players: "11 vs 11",
            environment: "Outdoor",
            equipment: "Football, goalposts"
        };
    }
    return {
        type: "Sport",
        players: "Varies",
        environment: "Indoor / Outdoor",
        equipment: "Standard sport equipment"
    };
}

function renderBasicCard(data) {
    const card = document.createElement("article");
    card.classList.add("result-card", "left-card");
    const title = data.title || "Unknown sport";
    const desc = data.extract || "No description found";
    const image = data.thumbnail ? data.thumbnail.source : "";
    const details = getSportDetails(title);
    card.innerHTML = `
        <h3>${title}</h3>
        ${image ? `<img src="${image}" class="sport-img">` : ""}
        <p><strong>Description:</strong><br>${desc}</p>
        <p><strong>Type of Sport:</strong> ${details.type}</p>
        <p><strong>Number of Players:</strong> ${details.players}</p>
        <p><strong>Environment:</strong> ${details.environment}</p>
        <p><strong>Main Equipment:</strong> ${details.equipment}</p>
        <a href="${data.content_urls.desktop.page}" target="_blank">
            Open on Wikipedia
        </a>
    `;
    resultsContainer.appendChild(card);
}

function renderExtraCard(title, results) {
    const card = document.createElement("article");
    card.classList.add("result-card", "right-card");
    let content = "";
    if (results.items && results.items.length > 0) {
        results.items.slice(0, 5).forEach(item => {
            content += `
                <div class="extra-item">
                    <a href="${item.link}" target="_blank">${item.title}</a>
                    <p>${item.snippet}</p>
                </div>
            `;
        });
    } else {
        content = "<p>no additional information found</p>";
    }
    card.innerHTML = `
        <h3>${title}</h3>
        ${content}
    `;
    resultsContainer.appendChild(card);
}

async function fetchSportData(sport, option) {
    clearResults();
    showMsg("Loading data", "info");
    const valid = await isRealSport(sport);
    if (!valid) {
        showMsg("this not a real sport, try another one", "error");
        return;
    }
    const basics = await fetchSportBasics(sport);
    if (basics) renderBasicCard(basics);
    let searchQuery = "";
    switch (option) {
        case "rules":
            searchQuery = `${sport} official rules`;
            break;
        case "tournaments":
            searchQuery = `${sport} international tournaments`;
            break;
        case "players":
            searchQuery = `famous ${sport} players`;
            break;
        case "ageGender":
            searchQuery = `${sport} suitable age and gender`;
            break;
    }
    const extra = await googleSearch(searchQuery);
    renderExtraCard(`${option} in ${sport}`, extra);
    showMsg("Data loaded successfully", "success");
}

sportForm.addEventListener("submit", e => {
    e.preventDefault();
    const sport = sportInput.value.trim();
    const option = optionInput.value;
    if (sport.length < 3) {
        showMsg("Sport name must be at least 3 characters", "error");
        return;
    }
    if (!option) {
        showMsg("Please choose what you want to see", "error");
        return;
    }
    fetchSportData(sport, option);
});

document.getElementById("clearBtn").addEventListener("click", () => {
    clearResults();
    messageBox.classList.add("hidden");
    sportForm.reset();
});