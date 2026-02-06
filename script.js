let accounts = JSON.parse(localStorage.getItem('accounts') || "[]");

function saveAccounts(){
    localStorage.setItem('accounts', JSON.stringify(accounts));
    renderAccounts();
}

function addAccount(){
    let name = document.getElementById('accountName').value.trim();
    let debtInput = document.getElementById('accountDebt').value;
    let debt = parseFloat(debtInput);
    if(isNaN(debt)) debt = 0;
    let currency = document.getElementById('accountCurrency').value;

    if(!name) return alert('ادخل اسم الحساب');
    if(accounts.find(a => a.name === name)) return alert('هذا الحساب موجود');

    accounts.push({
        name: name,
        totalDebt: debt,
        currency: currency,
        payments: []
    });

    saveAccounts();
    document.getElementById('accountName').value = '';
    document.getElementById('accountDebt').value = '';
}

function deleteAccount(index){
    if(confirm('هل تريد حذف الحساب؟')){
        accounts.splice(index,1);
        saveAccounts();
    }
}

function addPayment(accountIndex){
    let amountInput = prompt('ادخل مبلغ الدفعة:');
    let amount = parseFloat(amountInput);
    if(isNaN(amount) || amount <= 0) return;

    let currency = prompt('ادخل العملة (USD أو SYP):','USD');
    if(currency !== 'USD' && currency !== 'SYP') return;

    let today = new Date().toLocaleDateString('ar-EG');

    accounts[accountIndex].payments.push({
        amount: amount,
        currency: currency,
        date: today
    });

    saveAccounts();
}

function deletePayment(accountIndex, paymentIndex){
    accounts[accountIndex].payments.splice(paymentIndex,1);
    saveAccounts();
}

function getTotalPaidByCurrency(account, currency){
    return account.payments
        .filter(p => p.currency === currency)
        .reduce((sum,p)=> sum + Number(p.amount), 0);
}

function renderAccounts(){
    let container = document.getElementById('accountsList');
    container.innerHTML = '';

    accounts.forEach((acc,index)=>{
        let accDiv = document.createElement('div');
        accDiv.className = 'account';

        let paidUSD = getTotalPaidByCurrency(acc,'USD');
        let paidSYP = getTotalPaidByCurrency(acc,'SYP');

        let remainingUSD = acc.currency === 'USD'
            ? acc.totalDebt - paidUSD
            : 0;

        let remainingSYP = acc.currency === 'SYP'
            ? acc.totalDebt - paidSYP
            : 0;

        if(isNaN(remainingUSD)) remainingUSD = 0;
        if(isNaN(remainingSYP)) remainingSYP = 0;

        accDiv.innerHTML = `
        <div class="account-header">
            <span>${acc.name} - ${acc.currency} - مجموع: ${acc.totalDebt}</span>
            <button onclick="deleteAccount(${index})">حذف الحساب</button>
        </div>

        <div>المدفوع بالدولار: ${paidUSD}</div>
        <div>المدفوع بالليرة: ${paidSYP}</div>

        <div>المتبقي بالدولار: ${remainingUSD}</div>
        <div>المتبقي بالليرة: ${remainingSYP}</div>

        <div class="payments">
            ${acc.payments.map((p,i)=>`
                <div class="payment">
                    ${p.date} : ${p.amount} ${p.currency}
                    <button onclick="deletePayment(${index},${i})">حذف</button>
                </div>
            `).join('')}
        </div>

        <div class="add-payment">
            <button onclick="addPayment(${index})">اضافة دفعة</button>
            <button onclick="savePDF(${index})">حفظ PDF</button>
        </div>
        `;

        container.appendChild(accDiv);
    });
}

function savePDF(index){
    let acc = accounts[index];

    let paidUSD = getTotalPaidByCurrency(acc,'USD');
    let paidSYP = getTotalPaidByCurrency(acc,'SYP');

    let remainingUSD = acc.currency === 'USD' ? acc.totalDebt - paidUSD : 0;
    let remainingSYP = acc.currency === 'SYP' ? acc.totalDebt - paidSYP : 0;

    let content =
`حساب: ${acc.name}
عملة الحساب: ${acc.currency}
مجموع الحساب: ${acc.totalDebt}

المدفوع بالدولار: ${paidUSD}
المدفوع بالليرة: ${paidSYP}

المتبقي بالدولار: ${remainingUSD}
المتبقي بالليرة: ${remainingSYP}

الدفعات:
`;

    acc.payments.forEach(p=>{
        content += `${p.date} : ${p.amount} ${p.currency}\n`;
    });

    let blob = new Blob([content], {type:"text/plain"});
    let link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = acc.name + '.txt';
    link.click();
}

renderAccounts();
