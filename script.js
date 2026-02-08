let payments = JSON.parse(localStorage.getItem("payments")) || [];
let editIndex = null;

function save() {
  localStorage.setItem("payments", JSON.stringify(payments));
}

function addPayment() {
  const name = nameInput.value;
  const amount = +amountInput.value;
  const currency = currencySelect.value;
  const type = typeInput.value;
  const date = dateInput.value;

  if (!name || !amount || !date) return;

  const obj = { name, amount, currency, type, date };

  if (editIndex !== null) {
    payments[editIndex] = obj;
    editIndex = null;
  } else {
    payments.push(obj);
  }

  save();
  clearForm();
  render();
}

function clearForm() {
  nameInput.value = "";
  amountInput.value = "";
  typeInput.value = "";
  dateInput.value = "";
}

function render() {
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  let totalUSD = 0;
  let totalSYP = 0;

  const search = document.getElementById("search").value.toLowerCase();
  const month = filterMonth.value;
  const year = filterYear.value;

  payments.forEach((p, i) => {
    const d = new Date(p.date);
    if (search && !(`${p.name}${p.amount}`.toLowerCase().includes(search))) return;
    if (month && d.getMonth()+1 != month) return;
    if (year && d.getFullYear() != year) return;

    if (p.currency === "USD") totalUSD += p.amount;
    if (p.currency === "SYP") totalSYP += p.amount;

    tbody.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td>${p.amount}</td>
        <td>${p.currency}</td>
        <td>${p.type}</td>
        <td>${p.date}</td>
        <td>
          <button class="action-btn edit" onclick="edit(${i})">تعديل</button>
          <button class="action-btn delete" onclick="remove(${i})">حذف</button>
        </td>
      </tr>
    `;
  });

  totalUSDSpan.textContent = totalUSD;
  totalSYPSPan.textContent = totalSYP;
}

function edit(i) {
  const p = payments[i];
  nameInput.value = p.name;
  amountInput.value = p.amount;
  currencySelect.value = p.currency;
  typeInput.value = p.type;
  dateInput.value = p.date;
  editIndex = i;
}

function remove(i) {
  if (!confirm("حذف الدفعة؟")) return;
  payments.splice(i,1);
  save();
  render();
}

/* عناصر */
const nameInput = document.getElementById("name");
const amountInput = document.getElementById("amount");
const currencySelect = document.getElementById("currency");
const typeInput = document.getElementById("type");
const dateInput = document.getElementById("date");
const filterMonth = document.getElementById("filterMonth");
const filterYear = document.getElementById("filterYear");
const totalUSDSpan = document.getElementById("totalUSD");
const totalSYPSPan = document.getElementById("totalSYP");

/* تعبئة الشهور والسنوات */
for (let m=1;m<=12;m++) filterMonth.innerHTML += `<option value="${m}">${m}</option>`;
for (let y=2020;y<=2035;y++) filterYear.innerHTML += `<option value="${y}">${y}</option>`;

render();
