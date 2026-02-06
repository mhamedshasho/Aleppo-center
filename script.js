let accounts = JSON.parse(localStorage.getItem('accounts') || "[]");
let currentAccount = null;

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

    accounts.push({name:name, totalDebt: debt, currency: currency, payments: [], debts: []});
    saveAccounts();
    document.getElementById('accountName').value='';
    document.getElementById('accountDebt').value='';
}

function deleteAccount(index){
    if(confirm('هل تريد حذف الحساب؟')){
        accounts.splice(index,1);
        saveAccounts();
    }
}

function renderAccounts(){
    let container = document.getElementById('accountsList');
    container.innerHTML = '';
    accounts.forEach((acc,index)=>{
        let div = document.createElement('div');
        div.className='account';
        div.innerHTML=`<span onclick="openAccount(${index})">${acc.name}</span> - ${acc.currency} - مجموع: ${acc.totalDebt}`;
        container.appendChild(div);
    });
}

function openAccount(index){
    currentAccount = index;
    document.getElementById('accountsPage').style.display='none';
    document.getElementById('singleAccountPage').style.display='block';
    renderSingleAccount();
}

function backToAccounts(){
    currentAccount = null;
    document.getElementById('singleAccountPage').style.display='none';
    document.getElementById('accountsPage').style.display='block';
}

function renderSingleAccount(){
    let acc = accounts[currentAccount];
    document.getElementById('accTitle').innerText=acc.name;

    let paidSYP = acc.payments.filter(t=>t.currency==='سوري').reduce((a,b)=>a+b.amount,0);
    let paidUSD = acc.payments.filter(t=>t.currency==='دولار').reduce((a,b)=>a+b.amount,0);
    let debtSYP = acc.debts.filter(t=>t.currency==='سوري').reduce((a,b)=>a+b.amount,0);
    let debtUSD = acc.debts.filter(t=>t.currency==='دولار').reduce((a,b)=>a+b.amount,0);

    document.getElementById('paidSYP').innerText=paidSYP;
    document.getElementById('paidUSD').innerText=paidUSD;
    document.getElementById('debtSYP').innerText=debtSYP;
    document.getElementById('debtUSD').innerText=debtUSD;

    document.getElementById('remainingSYP').innerText=(debtSYP - paidSYP);
    document.getElementById('remainingUSD').innerText=(debtUSD - paidUSD);

    let transactionsDiv=document.getElementById('transactions');
    transactionsDiv.innerHTML='';

    acc.payments.forEach((p,i)=>{
        transactionsDiv.innerHTML+=`<div class="payment">${p.date} دفعة ${p.amount} ${p.currency} <button onclick="deleteTransaction('payment',${i})">حذف</button></div>`;
    });
    acc.debts.forEach((d,i)=>{
        transactionsDiv.innerHTML+=`<div class="debt">${d.date} دين ${d.amount} ${d.currency} <button onclick="deleteTransaction('debt',${i})">حذف</button></div>`;
    });
}

function addPaymentOrDebt(type){
    let amountInput=prompt('ادخل المبلغ:');
    let amount=parseFloat(amountInput);
    if(isNaN(amount) || amount<=0) return alert('مبلغ غير صحيح');
    let currency=prompt('اختر العملة: سوري او دولار');
    if(currency!=='سوري' && currency!=='دولار') return alert('اختر العملة صحيحة');
    let today = new Date().toLocaleDateString('ar-EG');

    if(type==='payment') accounts[currentAccount].payments.push({amount:amount, currency:currency, date:today});
    else accounts[currentAccount].debts.push({amount:amount, currency:currency, date:today});

    saveAccounts();
    renderSingleAccount();
}

function deleteTransaction(type,index){
    if(confirm('هل تريد الحذف؟')){
        if(type==='payment') accounts[currentAccount].payments.splice(index,1);
        else accounts[currentAccount].debts.splice(index,1);
        saveAccounts();
        renderSingleAccount();
    }
}

function savePDF(index){
    let acc = accounts[index];
    let content=`حساب: ${acc.name}\nالعملات:\n`;
    content+=`مدفوع بالليرة: ${acc.payments.filter(t=>t.currency==='سوري').reduce((a,b)=>a+b.amount,0)}\n`;
    content+=`مدفوع بالدولار: ${acc.payments.filter(t=>t.currency==='دولار').reduce((a,b)=>a+b.amount,0)}\n`;
    content+=`ديون بالليرة: ${acc.debts.filter(t=>t.currency==='سوري').reduce((a,b)=>a+b.amount,0)}\n`;
    content+=`ديون بالدولار: ${acc.debts.filter(t=>t.currency==='دولار').reduce((a,b)=>a+b.amount,0)}\n`;
    content+=`ما تبقى بالليرة: ${(acc.debts.filter(t=>t.currency==='سوري').reduce((a,b)=>a+b.amount,0))-(acc.payments.filter(t=>t.currency==='سوري').reduce((a,b)=>a+b.amount,0))}\n`;
    content+=`ما تبقى بالدولار: ${(acc.debts.filter(t=>t.currency==='دولار').reduce((a,b)=>a+b.amount,0))-(acc.payments.filter(t=>t.currency==='دولار').reduce((a,b)=>a+b.amount,0))}\n\nالمدفوعات:\n`;
    acc.payments.forEach(p=>{ content+=`${p.date} دفعة ${p.amount} ${p.currency}\n`});
    acc.debts.forEach(d=>{ content+=`${d.date} دين ${d.amount} ${d.currency}\n`});
    let blob = new Blob([content],{type:"text/plain"});
    let link=document.createElement('a');
    link.href=URL.createObjectURL(blob);
    link.download=acc.name+'.txt';
    link.click();
}

renderAccounts();
