import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  set,
  push,
  remove,
  update
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBnmptcPPnOXDMCPL6OE_CHOl1xCS-Xgsk",
  authDomain: "geschenkapp-91046.firebaseapp.com",
  databaseURL: "https://geschenkapp-91046-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "geschenkapp-91046",
  storageBucket: "geschenkapp-91046.appspot.com",
  messagingSenderId: "762458542948",
  appId: "1:762458542948:web:9bdd39d254a6670c21a071"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const familienRef = ref(db, "familien");

const familienContainer = document.getElementById("familien-container");
const addButton = document.getElementById("add-family");

onValue(familienRef, (snapshot) => {
  familienContainer.innerHTML = "";
  const data = snapshot.val();
  if (data) {
    const entries = Object.entries(data)
      .map(([key, value]) => ({ key, ...value }))
      .sort((a, b) => a.index - b.index);

    entries.forEach((familie) => {
      const row = document.createElement("div");
      row.className = "familie-row";

      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.value = familie.name;
      nameInput.placeholder = "Familienname";
      nameInput.addEventListener("input", () => {
        update(ref(db, `familien/${familie.key}`), {
          name: nameInput.value
        });
        if (nameInput.value === "") {
          // Lösche den Eintrag 20 Sekunden nach Leeren
          setTimeout(() => {
            get(ref(db, `familien/${familie.key}`)).then((snap) => {
              if (snap.exists() && snap.val().name === "") {
                remove(ref(db, `familien/${familie.key}`));
              }
            });
          }, 20000);
        }
      });

      const ausgabenInput = document.createElement("input");
      ausgabenInput.type = "number";
      ausgabenInput.value = familie.ausgaben || "";
      ausgabenInput.placeholder = "€ Auslagen";
      ausgabenInput.addEventListener("input", () => {
        update(ref(db, `familien/${familie.key}`), {
          ausgaben: parseFloat(ausgabenInput.value)
        });
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑️";
      deleteBtn.addEventListener("click", () => {
        remove(ref(db, `familien/${familie.key}`));
      });

      row.appendChild(nameInput);
      row.appendChild(ausgabenInput);
      row.appendChild(deleteBtn);

      familienContainer.appendChild(row);
    });
  }
});

addButton.addEventListener("click", () => {
  onValue(familienRef, (snapshot) => {
    const data = snapshot.val() || {};
    const usedNumbers = Object.values(data)
      .map((f) => f.name)
      .filter((n) => n && n.startsWith("Familie "))
      .map((n) => parseInt(n.split(" ")[1]))
      .filter((n) => !isNaN(n));
    let nextNumber = 1;
    while (usedNumbers.includes(nextNumber)) {
      nextNumber++;
    }

    const newKey = push(familienRef).key;
    const newFamilie = {
      name: `Familie ${nextNumber}`,
      ausgaben: 0,
      createdAt: Date.now(),
      index: nextNumber
    };
    set(ref(db, `familien/${newKey}`), newFamilie);

    // Automatisch löschen, wenn nach 20 Sek. noch Standardname
    setTimeout(() => {
      get(ref(db, `familien/${newKey}`)).then((snap) => {
        if (snap.exists() && snap.val().name === `Familie ${nextNumber}`) {
          remove(ref(db, `familien/${newKey}`));
        }
      });
    }, 20000);
  }, { onlyOnce: true });
});