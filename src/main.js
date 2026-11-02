import "./style.css";


const CHIAVE = "todo-tasks";

function caricaStato() {
    const testo = localStorage.getItem(CHIAVE);

    if (testo === null) {
        return [];
    }

    try {
        const dati = JSON.parse(testo);

        if (!Array.isArray(dati)) {
            return [];
        }

        return dati
            .filter(t =>
                t &&
                Number.isFinite(Number(t.id)) &&
                typeof t.title === "string" &&
                typeof t.completed === "boolean"
            )
            .map(t => ({
                id: Number(t.id),
                title: t.title,
                completed: t.completed
            }));
    } catch (errore) {
        console.error("Errore nel caricamento dei task:", errore);
        return [];
    }
}

let tasks = caricaStato();


const lista = document.querySelector("#lista");
const info = document.querySelector("#info");
const form = document.querySelector("#form-task");
const campo = document.querySelector("#campo-task");
const vuoto = document.querySelector("#vuoto");
const pulisciCompletati = document.querySelector("#pulisci-completati");


function salvaStato() {
    try {
        localStorage.setItem(CHIAVE, JSON.stringify(tasks));
    } catch (errore) {
        console.error("Errore nel salvataggio dei task:", errore);
    }
}


function escapeHtml(testo) {
    return testo.replace(/[&<>"']/g, carattere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[carattere]);
}


function render() {
    lista.innerHTML = tasks.map(t => `
        <li class="task ${t.completed ? "fatto" : ""}" data-id="${t.id}">
            <button
                class="check-task"
                type="button"
                aria-label="${t.completed ? "Segna come da fare" : "Segna come completato"}"
                aria-pressed="${t.completed}"
            >
                <span aria-hidden="true">${t.completed ? "✓" : ""}</span>
            </button>

            <span class="titolo">${escapeHtml(t.title)}</span>

            <button
                class="elimina"
                type="button"
                aria-label="Elimina: ${escapeHtml(t.title)}"
                title="Elimina task"
            >
                ×
            </button>
        </li>
    `).join("");

    const completati = tasks.filter(t => t.completed).length;
    const daFare = tasks.filter(t => !t.completed).length;

    info.textContent =
        `Totali: ${tasks.length} · Completati: ${completati} · Da fare: ${daFare}`;

    vuoto.hidden = tasks.length > 0;
    pulisciCompletati.hidden = completati === 0;
}


function aggiornaStato(nuoviTasks) {
    tasks = nuoviTasks;
    salvaStato();
    render();
}




function addTask(title) {
    const pulito = title.trim();

    if (pulito === "") {
        return;
    }

    aggiornaStato([
        ...tasks,
        {
            id: Date.now(),
            title: pulito,
            completed: false
        }
    ]);
}


function toggleTask(id) {
    aggiornaStato(
        tasks.map(t =>
            t.id === id
                ? { ...t, completed: !t.completed }
                : t
        )
    );
}


function deleteTask(id) {
    aggiornaStato(
        tasks.filter(t => t.id !== id)
    );
}


function deleteCompletedTasks() {
    aggiornaStato(
        tasks.filter(t => !t.completed)
    );
}




form.addEventListener("submit", evento => {
    evento.preventDefault();

    const titolo = campo.value;

    if (titolo.trim() === "") {
        campo.focus();
        return;
    }

    addTask(titolo);

    campo.value = "";
    campo.focus();
});


lista.addEventListener("click", evento => {
    const elemento = evento.target.closest("button");
    const riga = evento.target.closest("li[data-id]");

    if (!riga || !elemento) {
        return;
    }

    const id = Number(riga.dataset.id);

    if (elemento.classList.contains("elimina")) {
        deleteTask(id);
        return;
    }

    if (elemento.classList.contains("check-task")) {
        toggleTask(id);
    }
});


pulisciCompletati.addEventListener(
    "click",
    deleteCompletedTasks
);


render();