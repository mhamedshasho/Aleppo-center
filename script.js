let accounts = JSON.parse(localStorage.getItem('accounts') || "[]");
let currentAccountIndex = null;

function saveAccounts() {
    localStorage.setItem('accounts', JSON.stringify(accounts));
    renderAccounts();
}

function addAccount() {
    let name = document.getElementById('accountName').value.trim();
    let debt = parseFloat(document.getElementById('accountDebt').value) || 0;
    let currency = document.getElementById('accountCurrency').value;
    if(!name) return alert('ادخل اسم الحساب');
    if(accounts.find(a => a.name === name)) return alert('هذا الحساب موجود');
    accounts.push({name, payments: []});
    if(debt>0) accounts[accounts.length-1].payments.push({type:'debt', amount:debt, currency:currency, date: new Date().toLocaleDateString('ar-EG')});
    saveAccounts();
    document.getElementById('accountName').value='';
    document.getElementById('accountDebt').value='';
}

function deleteAccount(index) {
    if(confirm('هل تريد حذف الحساب؟')) {
        accounts.splice(index,1);
        saveAccounts();
    }
}

function showAccount(index) {
    currentAccountIndex = index;
    document.getElementById('mainPage').classList.add('hidden');
    document.getElementById('accountPage').classList.remove('hidden');
    document.getElementById('accountTitle').innerText = accounts[index].name;
    renderPayments(index);
}

function backToMain() {
    currentAccountIndex = null;
    document.getElementById('accountPage').classList.add('hidden');
    document.getElementById('mainPage').classList.remove('hidden');
}

function addPaymentOrDebt() {
    let amount = parseFloat(document.getElementById('paymentAmount').value);
    let type = document.getElementById('paymentType').value;
    let currency = document.getElementById('paymentCurrency').value;
    if(isNaN(amount) || amount<=0) return alert('ادخل مبلغ صحيح');
    let today = new Date().toLocaleDateString('ar-EG');
    accounts[currentAccountIndex].payments.push({type, amount, currency, date: today});
    document.getElementById('paymentAmount').value='';
    saveAccounts();
}

function deletePayment(payIndex) {
    accounts[currentAccountIndex].payments.splice(payIndex,1);
    saveAccounts();
}

function calcTotals(acc) {
    let debtSYP=0, debtUSD=0, paidSYP=0, paidUSD=0;
    acc.payments.forEach(p=>{
        if(p.type==='debt'){
            if(p.currency==='SYP') debtSYP+=p.amount; else debtUSD+=p.amount;
        } else if(p.type==='payment'){
            if(p.currency==='SYP') paidSYP+=p.amount; else paidUSD+=p.amount;
        }
    });
    return {debtSYP, debtUSD, paidSYP, paidUSD, remainingSYP: debtSYP-paidSYP, remainingUSD: debtUSD-paidUSD};
}

function renderAccounts() {
    let container = document.getElementById('accountsList');
    container.innerHTML = '';
    accounts.forEach((acc,index)=>{
        let div = document.createElement('div');
        div.className='account';
        div.innerHTML = `<span>${acc.name}</span>
        <div>
        <button onclick="deleteAccount(${index})">حذف</button>
        </div>`;
        div.onclick = function(e){
            if(e.target.tagName!=='BUTTON') showAccount(index);
        };
        container.appendChild(div);
    });
}

function renderPayments(index) {
    let acc = accounts[index];
    let totals = calcTotals(acc);
    document.getElementById('debtSYP').innerText = totals.debtSYP;
    document.getElementById('debtUSD').innerText = totals.debtUSD;
    document.getElementById('paidSYP').innerText = totals.paidSYP;
    document.getElementById('paidUSD').innerText = totals.paidUSD;
    document.getElementById('remainingSYP').innerText = totals.remainingSYP;
    document.getElementById('remainingUSD').innerText = totals.remainingUSD;

    let filter = document.getElementById('filterCurrency').value;
    let list = document.getElementById('paymentsList');
    list.innerHTML = '';
    acc.payments.forEach((p,i)=>{
        if(filter==='all' || filter===p.currency){
            let div = document.createElement('div');
            div.className='payment';
            div.innerHTML=`${p.date} - ${p.type==='debt'?'دين':'دفعة'} - ${p.amount} ${p.currency} <button onclick="deletePayment(${i})">حذف</button>`;
            list.appendChild(div);
        }
    });
}

renderAccounts();
