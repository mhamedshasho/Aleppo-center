let accounts = JSON.parse(localStorage.getItem('accounts') || "[]");
let currentAccountIndex = null;

function saveAccounts(){
    localStorage.setItem('accounts', JSON.stringify(accounts));
    renderAccounts();
}

function addAccount(){
    let name = document.getElementById('accountName').value.trim();
    let debtSYP = parseFloat(document.getElementById('accountDebtSYP').value) || 0;
    let debtUSD = parseFloat(document.getElementById('accountDebtUSD').value) || 0;
    if(!name) return alert('ادخل اسم الحساب');
    if(accounts.find(a=>a.name===name)) return alert('هذا الحساب موجود');

    accounts.push({name:name, debtSYP:debtSYP, debtUSD:debtUSD, paymentsSYP:[], paymentsUSD:[]});
    saveAccounts();
    document.getElementById('accountName').value = '';
    document.getElementById('accountDebtSYP').value = '';
    document.getElementById('accountDebtUSD').value = '';
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
        div.className = 'account';
        div.innerHTML = `<span onclick="openAccount(${index})">${acc.name}</span>
        <button onclick="deleteAccount(${index})">حذف</button>`;
        container.appendChild(div);
    });
}

function openAccount(index){
    currentAccountIndex = index;
    document.getElementById('accountsPage').style.display='none';
    document.getElementById('accountDetailPage').style.display='block';
    updateAccountDetails();
}

function backToAccounts(){
    document.getElementById('accountDetailPage').style.display='none';
    document.getElementById('accountsPage').style.display='block';
    currentAccountIndex = null;
}

function updateAccountDetails(){
    if(currentAccountIndex===null) return;
    let acc = accounts[currentAccountIndex];
    document.getElementById('accountTitle').innerText = acc.name;
    let totalPaidSYP = acc.paymentsSYP.reduce((sum,p)=>sum+p.amount,0);
    let totalPaidUSD = acc.paymentsUSD.reduce((sum,p)=>sum+p.amount,0);
    let remainingSYP = acc.debtSYP - totalPaidSYP;
    let remainingUSD = acc.debtUSD - totalPaidUSD;

    document.getElementById('accountDebts').innerHTML =
        `<p>الديون بالليرة: ${acc.debtSYP} - ما تبقى: ${remainingSYP.toFixed(2)}</p>
         <p>الديون بالدولار: ${acc.debtUSD} - ما تبقى: ${remainingUSD.toFixed(2)}</p>`;

    document.getElementById('paymentsSYP').innerHTML =
        '<h4>الدفعات بالليرة:</h4>' +
        acc.paymentsSYP.map((p,i)=>`<div class="payment">${p.date}: ${p.amount} <button onclick="deletePayment('SYP',${i})">حذف</button></div>`).join('');

    document.getElementById('paymentsUSD').innerHTML =
        '<h4>الدفعات بالدولار:</h4>' +
        acc.paymentsUSD.map((p,i)=>`<div class="payment">${p.date}: ${p.amount} <button onclick="deletePayment('USD',${i})">حذف</button></div>`).join('');
}

function addPayment(currency){
    if(currentAccountIndex===null) return;
    let amountInput = prompt('ادخل مبلغ الدفعة:');
    let amount = parseFloat(amountInput);
    if(isNaN(amount)||amount<=0) return;
    let today = new Date().toLocaleDateString('ar-EG');
    if(currency==='SYP') accounts[currentAccountIndex].paymentsSYP.push({amount:amount,date:today});
    if(currency==='USD') accounts[currentAccountIndex].paymentsUSD.push({amount:amount,date:today});
    saveAccounts();
    updateAccountDetails();
}

function deletePayment(currency,index){
    if(currentAccountIndex===null) return;
    if(currency==='SYP') accounts[currentAccountIndex].paymentsSYP.splice(index,1);
    if(currency==='USD') accounts[currentAccountIndex].paymentsUSD.splice(index,1);
    saveAccounts();
    updateAccountDetails();
}

function savePDF(){
    if(currentAccountIndex===null) return;
    let acc = accounts[currentAccountIndex];
    let totalPaidSYP = acc.paymentsSYP.reduce((sum,p)=>sum+p.amount,0);
    let totalPaidUSD = acc.paymentsUSD.reduce((sum,p)=>sum+p.amount,0);
    let remainingSYP = acc.debtSYP - totalPaidSYP;
    let remainingUSD = acc.debtUSD - totalPaidUSD;

    let content = `حساب: ${acc.name}\n`;
    content += `الديون بالليرة: ${acc.debtSYP} - ما تبقى: ${remainingSYP.toFixed(2)}\n`;
    content += `الديون بالدولار: ${acc.debtUSD} - ما تبقى: ${remainingUSD.toFixed(2)}\n\n`;

    content += `الدفعات بالليرة:\n`;
    acc.paymentsSYP.forEach(p=>content += `${p.date}: ${p.amount}\n`);

    content += `\nالدفعات بالدولار:\n`;
    acc.paymentsUSD.forEach(p=>content += `${p.date}: ${p.amount}\n`);

    let blob = new Blob([content], {type:"text/plain"});
    let link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = acc.name+'.txt';
    link.click();
}

renderAccounts();
