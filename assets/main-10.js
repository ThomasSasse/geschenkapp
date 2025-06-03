
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, set, onValue, push, remove, update } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBnmptcPPnOXDMCPL6OE_CHOl1xCS-Xgsk",
  authDomain: "geschenkapp-91046.firebaseapp.com",
  databaseURL: "https://geschenkapp-91046-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "geschenkapp-91046",
  storageBucket: "geschenkapp-91046.appspot.com",
  messagingSenderId: "762458542948",
  appId: "1:762458542948:web:9bdd39d254a6670c21a071"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const familienRef = ref(db, "familien");

const container = document.getElementById("familien-container");
const addButton = document.getElementById("add-family");

function createFamilyElement(key, name = "", amount = "") {
  const row = document.createElement("div");
  row.className = "familie-row";
  row.id = `row-${key}`;

  const nameInput = document.createElement("input");
  nameInput.placeholder = "Familie";
  nameInput.value = name;
  nameInput.oninput = () => {
    update(ref(db, "familien/" + key), { name: nameInput.value });
    if (nameInput.value === "") {
      setTimeout(() => {
        onValue(ref(db, "familien/" + key), (snapshot) => {
          const val = snapshot.val();
          if (val && val.name === "") {
            remove(ref(db, "familien/" + key));
          }
        }, { onlyOnce: true });
      }, 20000);
    }
  };

  const amountInput = document.createElement("input");
  amountInput.placeholder = "Auslagen";
  amountInput.type = "number";
  amountInput.value = amount;
  amountInput.oninput = () => {
    update(ref(db, "familien/" + key), { amount: amountInput.value });
  };

  const del = document.createElement("button");
  del.className = "delete-button";
  del.innerText = "🗑️";
  del.onclick = () => {
    remove(ref(db, "familien/" + key));
  };

  row.appendChild(nameInput);
  row.appendChild(amountInput);
  row.appendChild(del);
  container.appendChild(row);
}

function getNextAvailableNumber(existing) {
  const used = new Set(Object.values(existing).map(f => f.number));
  for (let i = 1; i <= 999; i++) {
    if (!used.has(i)) return i;
  }
  return Object.keys(existing).length + 1;
}

addButton.onclick = () => {
  onValue(familienRef, (snapshot) => {
    const data = snapshot.val() || {};
    const number = getNextAvailableNumber(data);
    const key = push(familienRef).key;
    const familie = {
      name: `Familie ${number}`,
      amount: "",
      createdAt: Date.now(),
      number: number
    };
    set(ref(db, "familien/" + key), familie);
  }, { onlyOnce: true });
};

onValue(familienRef, (snapshot) => {
  container.innerHTML = "";
  const familien = snapshot.val();
  if (familien) {
    const sorted = Object.entries(familien).sort((a, b) => a[1].number - b[1].number);
    sorted.forEach(([key, val]) => createFamilyElement(key, val.name, val.amount));
  }
});
