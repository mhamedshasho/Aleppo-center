let payments = JSON.parse(localStorage.getItem("payments")) || [];
let editIndex = null;

const tableBody = document.getElementById("tableBody");
const totalCredit = document.getElementById("totalCredit");
const totalDebit = document.getElementById("totalDebit");
const balance = document.getElementById("balance");

const dateInput = document.getElementById("date");
const detailsInput = document.getElementById("details");
const debitInput = document.getElementById("debit");
const creditInput = document.getElementById("credit");

function save() { localStorage.setItem("payments", JSON.stringify(payments)); }

function addPayment() {
  if(!dateInput.value || (!debitInput.value && !creditInput.value)) return;

  const obj = {
    date: dateInput.value,
    details: detailsInput.value,
    debit: +debitInput.value || 0,
    credit: +creditInput.value || 0
  };

  if(editIndex !== null) { payments[editIndex] = obj; editIndex=null; }
  else payments.push(obj);

  save(); clearForm(); render();
}

function clearForm() { dateInput.value=""; detailsInput.value=""; debitInput.value=""; creditInput.value=""; }

function render() {
  tableBody.innerHTML = "";
  let totalD=0, totalC=0, bal=0;

  payments.forEach((p,i)=>{
    bal += p.credit - p.debit;
    tableBody.innerHTML += `
      <tr>
        <td>${p.date}</td>
        <td>${p.details}</td>
        <td>${p.debit}</td>
        <td>${p.credit}</td>
        <td>${bal}</td>
        <td>
          <button onclick="editPayment(${i})">تعديل</button>
          <button onclick="removePayment(${i})">حذف</button>
        </td>
      </tr>
    `;
    totalD += p.debit; totalC += p.credit;
  });

  totalDebit.textContent = totalD;
  totalCredit.textContent = totalC;
  balance.textContent = bal;
}

function editPayment(i) {
  const p = payments[i];
  dateInput.value = p.date;
  detailsInput.value = p.details;
  debitInput.value = p.debit;
  creditInput.value = p.credit;
  editIndex = i;
}

function removePayment(i) {
  if(!confirm("حذف الدفعة؟")) return;
  payments.splice(i,1);
  save();
  render();
}

function toggleDark() { document.documentElement.classList.toggle("dark"); }

render();
