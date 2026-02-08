// استرجاع البيانات من LocalStorage
let payments = JSON.parse(localStorage.getItem("payments")) || [];
let editIndex = null;

// عناصر DOM
const tableBody = document.getElementById("tableBody");
const totalCredit = document.getElementById("totalCredit");
const totalDebit = document.getElementById("totalDebit");
const balance = document.getElementById("balance");

const dateInput = document.getElementById("date");
const detailsInput = document.getElementById("details");
const debitInput = document.getElementById("debit");
const creditInput = document.getElementById("credit");

// حفظ البيانات في LocalStorage
function save() {
  localStorage.setItem("payments", JSON.stringify(payments));
}

// إضافة دفعة جديدة أو تعديل موجودة
function addPayment() {
  // تحقق من وجود تاريخ ودفعة واحدة على الأقل
  if (!dateInput.value || (!debitInput.value && !creditInput.value)) {
    alert("أدخل التاريخ والدفعة");
    return;
  }

  const payment = {
    date: dateInput.value,
    details: detailsInput.value || "",
    debit: Number(debitInput.value) || 0,
    credit: Number(creditInput.value) || 0
  };

  if (editIndex !== null) {
    payments[editIndex] = payment;
    editIndex = null;
  } else {
    payments.push(payment);
  }

  save();
  clearForm();
  renderPayments();
}

// مسح الفورم
function clearForm() {
  dateInput.value = "";
  detailsInput.value = "";
  debitInput.value = "";
  creditInput.value = "";
  document.getElementById("saveBtn").textContent = "حفظ الدفعة";
}

// عرض جميع الدفعات في الجدول وحساب الرصيد
function renderPayments() {
  tableBody.innerHTML = "";
  let totalD = 0, totalC = 0, bal = 0;

  payments.forEach((p, i) => {
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
    totalD += p.debit;
    totalC += p.credit;
  });

  totalDebit.textContent = totalD;
  totalCredit.textContent = totalC;
  balance.textContent = bal;
}

// تعديل دفعة
function editPayment(i) {
  const p = payments[i];
  dateInput.value = p.date;
  detailsInput.value = p.details;
  debitInput.value = p.debit;
  creditInput.value = p.credit;
  editIndex = i;
  document.getElementById("saveBtn").textContent = "تحديث الدفعة";
}

// حذف دفعة
function removePayment(i) {
  if (!confirm("هل تريد حذف هذه الدفعة؟")) return;
  payments.splice(i, 1);
  save();
  renderPayments();
}

// تبديل الوضع الليلي
function toggleDark() {
  document.documentElement.classList.toggle("dark");
}

// عرض البيانات عند تحميل الصفحة
renderPayments();
