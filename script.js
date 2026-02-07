let accounts = JSON.parse(localStorage.getItem('accounts') || "[]");
let currentIndex = null;

function saveAccounts() {
    localStorage.setItem('accounts', JSON.stringify(accounts));
    renderAccounts();
}

function addAccount() {
    let name = document.getElementById('accountName').value.trim();
    if (!name) return alert('ادخل اسم الحساب');
    if (accounts.find(a => a.name === name)) return alert('هذا الحساب موجود');

    accounts.push({ name: name, payments: [] });
    saveAccounts();
    document.getElementById('accountName').value = '';
}

function renderAccounts() {
    let container = document.getElementById('accountsView');
    container.innerHTML = '';
    accounts.forEach((acc, index) => {
        let card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `<h3>${acc.name}</h3><small>${acc.payments.length} دفعة</small>`;
        card.onclick = () => openAccount(index);
        container.appendChild(card);
    });
}

function searchAccounts() {
    let query = document.getElementById('searchAccount').value.toLowerCase();
    let filtered = accounts.filter(a => a.name.toLowerCase().includes(query));
    let container = document.getElementById('accountsView');
    container.innerHTML = '';
    filtered.forEach((acc, index) => {
        let card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `<h3>${acc.name}</h3><small>${acc.payments.length} دفعة</small>`;
        card.onclick = () => openAccount(accounts.indexOf(acc));
        container.appendChild(card);
    });
}

function openAccount(index) {
    currentIndex = index;
    document.getElementById('accountsView').style.display = 'none';
    document.getElementById('accountDetail').style.display = 'block';
    document.getElementById('accountTitle').innerText = accounts[index].name;
    renderCurrentAccount();
}

function backToAccounts() {
    document.getElementById('accountDetail').style.display = 'none';
    document.getElementById('accountsView').style.display = 'grid';
    currentIndex = null;
}

function addPayment() {
    let amount = parseFloat(document.getElementById('paymentAmount').value);
    if (isNaN(amount) || amount <= 0) return alert('ادخل مبلغ صحيح');
    let type = document.getElementById('paymentType').value;
    let currency = document.getElementById('paymentCurrency').value;
    let date = new Date().toLocaleDateString('ar-EG');

    accounts[currentIndex].payments.push({ amount, type, currency, date });
    saveAccounts();
    document.getElementById('paymentAmount').value = '';
    renderCurrentAccount();
}

function deletePayment(paymentIndex) {
    if (!confirm('هل تريد حذف هذه الدفعة؟')) return;
    accounts[currentIndex].payments.splice(paymentIndex, 1);
    saveAccounts();
    renderCurrentAccount();
}

function editPayment(paymentIndex) {
    let p = accounts[currentIndex].payments[paymentIndex];
    let newAmount = parseFloat(prompt('المبلغ الجديد:', p.amount));
    if (isNaN(newAmount) || newAmount <= 0) return;
    let newType = prompt('نوع الدفعة:', p.type);
    let newCurrency = prompt('العملة (USD/SYP):', p.currency);
    p.amount = newAmount;
    p.type = newType;
    p.currency = newCurrency;
    saveAccounts();
    renderCurrentAccount();
}

function deleteCurrentAccount() {
    if (!confirm('هل تريد حذف الحساب بالكامل؟')) return;
    accounts.splice(currentIndex, 1);
    saveAccounts();
    backToAccounts();
}

function renderCurrentAccount() {
    let acc = accounts[currentIndex];
    let filter = document.getElementById('searchPayment').value.toLowerCase();
    let payments = acc.payments.filter(p => 
        p.type.toLowerCase().includes(filter) || p.amount.toString().includes(filter)
    );

    let table = `<table>
        <thead>
            <tr>
                <th>التاريخ</th>
                <th>المبلغ</th>
                <th>العملة</th>
                <th>نوع الدفعة</th>
                <th>إجراءات</th>
            </tr>
        </thead>
        <tbody>`;

    let totalUSD = 0;
    let totalSYP = 0;

    payments.forEach((p, i) => {
        table += `<tr>
            <td>${p.date}</td>
            <td>${p.amount}</td>
            <td>${p.currency}</td>
            <td>${p.type}</td>
            <td>
                <button onclick="editPayment(${i})">تعديل</button>
                <button onclick="deletePayment(${i})">حذف</button>
            </td>
        </tr>`;
        if (p.currency === "USD") totalUSD += p.amount;
        if (p.currency === "SYP") totalSYP += p.amount;
    });

    table += `<tr class="total">
        <td colspan="1">المجموع الكلي</td>
        <td>${totalUSD + totalSYP}</td>
        <td>USD: ${totalUSD} | SYP: ${totalSYP}</td>
        <td colspan="2"></td>
    </tr>`;

    table += `</tbody></table>`;
    document.getElementById('info').innerHTML = table;
}

renderAccounts();
