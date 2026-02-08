let accounts = JSON.parse(localStorage.getItem("accounts")) || [];
let currentAccountId = null;

/* حفظ */
function save() {
  localStorage.setItem("accounts", JSON.stringify(accounts));
}

/* حسابات */
function addAccount() {
  if (!newAccountName.value.trim()) return;

  accounts.push({
    id: Date.now(),
    name: newAccountName.value.trim(),
    payments: []
  });

  newAccountName.value = "";
  save();
  renderAccounts();
}

function renderAccounts() {
  accountsList.innerHTML = "";
  accounts.forEach(a => {
    accountsList.innerHTML += `
      <li>
        <span onclick="openAccount(${a.id})">${a.name}</span>
        <div>
          <button onclick="renameAccount(${a.id})">✏️</button>
          <button onclick="deleteAccount(${a.id})">🗑</button>
        </div>
      </li>
    `;
  });
}

function openAccount(id) {
  currentAccountId = id;
  accountsView.style.display = "none";
  accountView.style.display = "block";
  accountTitle.textContent = accounts.find(a => a.id === id).name;
  renderPayments();
}

function backToAccounts() {
  accountsView.style.display = "block";
  accountView.style.display = "none";
}

function renameAccount(id) {
  const acc = accounts.find(a => a.id === id);
  const name = prompt("اسم جديد", acc.name);
  if (!name) return;
  acc.name = name;
  save();
  renderAccounts();
}

function deleteAccount(id) {
  if (!confirm("حذف الحساب؟")) return;
  accounts = accounts.filter(a => a.id !== id);
  save();
  renderAccounts();
}

/* التاريخ */
function handleDateMode() {
  date.style.display = dateMode.value === "manual" ? "block" : "none";
}

/* دفعات */
function addPayment() {
  const acc = accounts.find(a => a.id === currentAccountId);
  if (!amount.value) return;

  let paymentDate =
    dateMode.value === "auto"
      ? new Date().toISOString().split("T")[0]
      : date.value;

  acc.payments.push({
    amount: +amount.value,
    currency: currency.value,
    type: type.value,
    direction: direction.value,
    date: paymentDate
  });

  save();
  renderPayments();

  amount.value = "";
  type.value = "";
  date.value = "";
}

function renderPayments() {
  const acc = accounts.find(a => a.id === currentAccountId);
  tableBody.innerHTML = "";

  acc.payments.forEach((p, i) => {
    tableBody.innerHTML += `
      <tr>
        <td>${p.amount}</td>
        <td>${p.currency}</td>
        <td>${p.direction === "in" ? "له" : "عليه"}</td>
        <td>${p.date}</td>
        <td><button onclick="removePayment(${i})">❌</button></td>
      </tr>
    `;
  });
}

function removePayment(i) {
  const acc = accounts.find(a => a.id === currentAccountId);
  acc.payments.splice(i, 1);
  save();
  renderPayments();
}

/* داكن */
function toggleDark() {
  document.documentElement.classList.toggle("dark");
}

renderAccounts();
