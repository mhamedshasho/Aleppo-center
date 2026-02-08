let accounts = JSON.parse(localStorage.getItem("accounts")) || [];
let currentAccountId = null;
let editPaymentIndex = null;

function save() {
  localStorage.setItem("accounts", JSON.stringify(accounts));
}

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
  resetForm();
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

function handleDateMode() {
  date.style.display = dateMode.value === "manual" ? "block" : "none";
}

function savePayment() {
  const acc = accounts.find(a => a.id === currentAccountId);
  if (!amount.value) return;

  const paymentDate =
    dateMode.value === "auto"
      ? new Date().toISOString().split("T")[0]
      : date.value;

  const payment = {
    amount: +amount.value,
    currency: currency.value,
    type: type.value,
    direction: direction.value,
    date: paymentDate
  };

  if (editPaymentIndex !== null) {
    acc.payments[editPaymentIndex] = payment;
    editPaymentIndex = null;
  } else {
    acc.payments.push(payment);
  }

  save();
  resetForm();
  renderPayments();
}

function renderPayments() {
  const acc = accounts.find(a => a.id === currentAccountId);
  const search = searchPayment.value.toLowerCase();

  tableBody.innerHTML = "";
  let totalUSD = 0, totalSYP = 0, count = 0;

  acc.payments.forEach((p, i) => {
    if (search && !(`${p.amount}${p.currency}${p.type}`.toLowerCase().includes(search))) return;

    tableBody.innerHTML += `
      <tr>
        <td>${p.amount}</td>
        <td>${p.currency}</td>
        <td>${p.direction === "in" ? "له" : "عليه"}</td>
        <td>${p.date}</td>
        <td>
          <button onclick="editPayment(${i})">✏️</button>
          <button onclick="removePayment(${i})">🗑</button>
        </td>
      </tr>
    `;

    if (p.currency === "USD") totalUSD += p.amount;
    if (p.currency === "SYP") totalSYP += p.amount;
    count++;
  });

  totalUSDSpan.textContent = totalUSD;
  totalSYPSpan.textContent = totalSYP;
  totalCountSpan.textContent = count;
}

function editPayment(i) {
  const acc = accounts.find(a => a.id === currentAccountId);
  const p = acc.payments[i];

  amount.value = p.amount;
  currency.value = p.currency;
  type.value = p.type;
  direction.value = p.direction;
  dateMode.value = "manual";
  handleDateMode();
  date.value = p.date;

  editPaymentIndex = i;
}

function removePayment(i) {
  if (!confirm("حذف الدفعة؟")) return;
  const acc = accounts.find(a => a.id === currentAccountId);
  acc.payments.splice(i, 1);
  save();
  renderPayments();
}

function resetForm() {
  amount.value = "";
  type.value = "";
  date.value = "";
  dateMode.value = "auto";
  handleDateMode();
}

function toggleDark() {
  document.documentElement.classList.toggle("dark");
}

renderAccounts();
