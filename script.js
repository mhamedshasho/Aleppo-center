let accounts = JSON.parse(localStorage.getItem('accounts')) || [];

const accountSelect = document.getElementById('accountSelect');
const addAccountBtn = document.getElementById('addAccountBtn');
const addPaymentBtn = document.getElementById('addPaymentBtn');

function updateAccountSelect() {
    accountSelect.innerHTML = '<option value="">اختر الحساب</option>';
    accounts.forEach((acc, idx) => {
        accountSelect.innerHTML += `<option value="${idx}">${acc.name}</option>`;
    });
}

function addAccount() {
    const name = document.getElementById('accountName').value.trim();
    if (!name) return;
    accounts.push({ name, payments: [] });
    saveAndRender();
    document.getElementById('accountName').value = '';
}

function addPayment() {
    const idx = accountSelect.value;
    const amount = parseFloat(document.getElementById('paymentAmount').value);
    const currency = document.getElementById('currency').value;
    if (idx === "" || !amount) return;
    const today = new Date().toISOString().split('T')[0];
    accounts[idx].payments.push({ amount, date: today, currency });
    saveAndRender();
    document.getElementById('paymentAmount').value = '';
    accountSelect.value = '';
}

function deletePayment(accIdx, payIdx) {
    accounts[accIdx].payments.splice(payIdx, 1);
    saveAndRender();
}

function deleteAccount(accIdx) {
    if (!confirm("هل تريد حذف هذا الحساب؟")) return;
    accounts.splice(accIdx, 1);
    saveAndRender();
}

function saveAndRender() {
    localStorage.setItem('accounts', JSON.stringify(accounts));
    renderAccounts();
    updateAccountSelect();
}

function renderAccounts() {
    const container = document.getElementById('accountsContainer');
    container.innerHTML = '';
    let totalAll = 0;
    accounts.forEach((acc, accIdx) => {
        const totalAcc = acc.payments.reduce((sum, p) => sum + p.amount, 0);
        totalAll += totalAcc;
        const card = document.createElement('div');
        card.className = 'account-card';
        card.innerHTML = `
            <h3>
                ${acc.name} 
                <button onclick="deleteAccount(${accIdx})">حذف الحساب</button>
            </h3>
            <ul>
                ${acc.payments.map((p, payIdx) => `
                    <li>
                        <span>${p.date} - ${p.amount.toFixed(2)} ${p.currency}</span>
                        <button onclick="deletePayment(${accIdx}, ${payIdx})">حذف</button>
                    </li>
                `).join('')}
            </ul>
            <strong>مجموع الحساب: ${totalAcc.toFixed(2)}</strong>
        `;
        container.appendChild(card);
    });
    document.getElementById('totalAll').innerText = `مجموع كل الحسابات: ${totalAll.toFixed(2)}`;
}

document.addEventListener('DOMContentLoaded', () => {
    renderAccounts();
    updateAccountSelect();
    addAccountBtn.addEventListener('click', addAccount);
    addPaymentBtn.addEventListener('click', addPayment);
});
