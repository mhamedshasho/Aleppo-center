let payments = [];
let editIndex = null;

const nameInput = document.getElementById('name');
const amountInput = document.getElementById('amount');
const currencySelect = document.getElementById('currency');
const addBtn = document.getElementById('addBtn');
const tableBody = document.querySelector('#paymentTable tbody');

function getCurrentDate() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${year}-${month}-${day}`;
}

function renderTable() {
    tableBody.innerHTML = '';
    payments.forEach((p, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${p.name}</td>
            <td>${p.amount} ${p.currency}</td>
            <td>${p.date}</td>
            <td>
                <button class="edit-btn" onclick="editPayment(${index})">تعديل</button>
                <button class="delete-btn" onclick="deletePayment(${index})">حذف</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function addPayment() {
    const name = nameInput.value.trim();
    const amount = amountInput.value.trim();
    const currency = currencySelect.value;

    if(!name || !amount) return alert('الرجاء إدخال جميع الحقول');

    const date = getCurrentDate();

    if(editIndex !== null){
        payments[editIndex] = {name, amount, currency, date};
        editIndex = null;
        addBtn.textContent = 'إضافة دفعة';
    } else {
        payments.push({name, amount, currency, date});
    }

    nameInput.value = '';
    amountInput.value = '';
    currencySelect.value = 'SYP';
    renderTable();
}

function editPayment(index){
    nameInput.value = payments[index].name;
    amountInput.value = payments[index].amount;
    currencySelect.value = payments[index].currency;
    addBtn.textContent = 'حفظ التعديل';
    editIndex = index;
}

function deletePayment(index){
    if(confirm('هل أنت متأكد من حذف هذه الدفعة؟')){
        payments.splice(index,1);
        renderTable();
    }
}

addBtn.addEventListener('click', addPayment);

// حفظ كصورة
document.getElementById('saveImageBtn').addEventListener('click', ()=>{
    html2canvas(document.querySelector('.container')).then(canvas=>{
        const link = document.createElement('a');
        link.download='aleppo-center-payments.png';
        link.href = canvas.toDataURL();
        link.click();
    });
});

// حفظ كـ PDF
document.getElementById('savePdfBtn').addEventListener('click', ()=>{
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.html(document.querySelector('.container'), {
        callback: function(pdf){
            pdf.save('aleppo-center-payments.pdf');
        },
        x: 10,
        y: 10,
        width: 180
    });
});
