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
    if(accounts.find(a=>a.name===name)) return alert('هذا الحساب موجود');

    accounts.push({name:name, totalDebt: debt, currency: currency, payments: []});
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
    if(isNaN(amount) || amount<=0) return;

    let today = new Date().toLocaleDateString('ar-EG');
    accounts[accountIndex].payments.push({amount: amount, date: today});
    saveAccounts();
}

function deletePayment(accountIndex, paymentIndex){
    accounts[accountIndex].payments.splice(paymentIndex,1);
    saveAccounts();
}

function getTotalPaid(account){
    return account.payments.reduce((sum,p)=>sum+p.amount,0);
}

function renderAccounts(){
    let container = document.getElementById('accountsList');
    container.innerHTML = '';
    accounts.forEach((acc,index)=>{
        let accDiv = document.createElement('div');
        accDiv.className = 'account';
        let totalPaid = getTotalPaid(acc);
        let remaining = acc.totalDebt - totalPaid;

        accDiv.innerHTML = `
        <div class="account-header">
            <span>${acc.name} - ${acc.currency} - مجموع: ${acc.totalDebt}</span>
            <button onclick="deleteAccount(${index})">حذف الحساب</button>
        </div>
        <div>مدفوع: ${totalPaid} - الباقي: ${remaining}</div>
        <div class="payments">
            ${acc.payments.map((p,i)=>`<div class="payment">${p.date}: ${p.amount} <button onclick="deletePayment(${index},${i})">حذف</button></div>`).join('')}
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
    let content = `حساب: ${acc.name}\nالعملة: ${acc.currency}\nمجموع الحساب: ${acc.totalDebt}\nمدفوع: ${getTotalPaid(acc)}\nالباقي: ${acc.totalDebt - getTotalPaid(acc)}\n\nالدفعات:\n`;
    acc.payments.forEach(p=>{
        content += `${p.date} : ${p.amount}\n`;
    });
    let blob = new Blob([content], {type:"text/plain"});
    let link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = acc.name + '.txt';
    link.click();
}

renderAccounts();
