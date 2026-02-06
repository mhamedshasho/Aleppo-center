let accounts = JSON.parse(localStorage.getItem('accounts') || "[]");
let currentAccountIndex = null;

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

    accounts.push({
        name: name,
        totalDebtSYP: currency === "SYP" ? debt : 0,
        totalDebtUSD: currency === "USD" ? debt : 0,
        paymentsSYP: [],
        paymentsUSD: [],
        debtsSYP: [],
        debtsUSD: []
    });
    document.getElementById('accountName').value = '';
    document.getElementById('accountDebt').value = '';
    saveAccounts();
}

function deleteAccount(index){
    if(confirm('هل تريد حذف الحساب؟')){
        accounts.splice(index,1);
        saveAccounts();
    }
}

function openAccount(index){
    currentAccountIndex = index;
    renderAccountDetails();
}

function addPayment(currency){
    if(currentAccountIndex === null) return;
    let amountInput = prompt(`ادخل مبلغ الدفعة (${currency}) :`);
    let amount = parseFloat(amountInput);
    if(isNaN(amount) || amount <= 0) return;
    let today = new Date().toLocaleDateString('ar-EG');

    if(currency === "SYP") accounts[currentAccountIndex].paymentsSYP.push({amount, date: today});
    else accounts[currentAccountIndex].paymentsUSD.push({amount, date: today});
    saveAccounts();
}

function addDebt(currency){
    if(currentAccountIndex === null) return;
    let amountInput = prompt(`ادخل مبلغ الدين (${currency}) :`);
    let amount = parseFloat(amountInput);
    if(isNaN(amount) || amount <= 0) return;
    let today = new Date().toLocaleDateString('ar-EG');

    if(currency === "SYP") accounts[currentAccountIndex].debtsSYP.push({amount, date: today});
    else accounts[currentAccountIndex].debtsUSD.push({amount, date: today});
    saveAccounts();
}

function deletePayment(currency, index){
    if(currency === "SYP") accounts[currentAccountIndex].paymentsSYP.splice(index,1);
    else accounts[currentAccountIndex].paymentsUSD.splice(index,1);
    saveAccounts();
}

function deleteDebt(currency, index){
    if(currency === "SYP") accounts[currentAccountIndex].debtsSYP.splice(index,1);
    else accounts[currentAccountIndex].debtsUSD.splice(index,1);
    saveAccounts();
}

function getTotal(arr){
    return arr.reduce((sum,p)=>sum+p.amount,0);
}

function savePDF(){
    if(currentAccountIndex === null) return;
    let acc = accounts[currentAccountIndex];
    let content = `حساب: ${acc.name}\n\nالديون والمدفوعات:\n\n`;

    content += `مدفوع بالسوري: ${getTotal(acc.paymentsSYP)}\n`;
    content += `مدفوع بالدولار: ${getTotal(acc.paymentsUSD)}\n`;
    content += `ديون بالسوري: ${getTotal(acc.debtsSYP)}\n`;
    content += `ديون بالدولار: ${getTotal(acc.debtsUSD)}\n\n`;
    content += `ما تبقى عليه بالسوري: ${getTotal(acc.debtsSYP) - getTotal(acc.paymentsSYP)}\n`;
    content += `ما تبقى عليه بالدولار: ${getTotal(acc.debtsUSD) - getTotal(acc.paymentsUSD)}\n\n`;

    content += `الدفعات بالترتيب:\n`;
    acc.paymentsSYP.forEach(p => content += `${p.date} : ${p.amount} SYP\n`);
    acc.paymentsUSD.forEach(p => content += `${p.date} : ${p.amount} USD\n`);
    content += `\nالديون بالترتيب:\n`;
    acc.debtsSYP.forEach(d => content += `${d.date} : ${d.amount} SYP\n`);
    acc.debtsUSD.forEach(d => content += `${d.date} : ${d.amount} USD\n`);

    let blob = new Blob([content], {type:"text/plain"});
    let link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = acc.name + '.txt';
    link.click();
}

function renderAccounts(){
    let container = document.getElementById('accountsList');
    container.innerHTML = '';
    accounts.forEach((acc,index)=>{
        let accDiv = document.createElement('div');
        accDiv.className = 'account';
        accDiv.innerHTML = `
            <span onclick="openAccount(${index})">${acc.name}</span>
            <button onclick="deleteAccount(${index})">حذف الحساب</button>
        `;
        container.appendChild(accDiv);
    });
}

function renderAccountDetails(){
    let container = document.getElementById('accountsList');
    container.innerHTML = '';
    let acc = accounts[currentAccountIndex];
    let remainingSYP = getTotal(acc.debtsSYP) - getTotal(acc.paymentsSYP);
    let remainingUSD = getTotal(acc.debtsUSD) - getTotal(acc.paymentsUSD);

    let accDiv = document.createElement('div');
    accDiv.className = 'account-detail';
    accDiv.innerHTML = `
        <h2>${acc.name}</h2>
        <button onclick="currentAccountIndex=null; renderAccounts()">رجوع</button>
        <button onclick="savePDF()">حفظ PDF</button>

        <div>
            <h3>مدفوعات</h3>
            <button onclick="addPayment('SYP')">إضافة دفعة بالسوري</button>
            <button onclick="addPayment('USD')">إضافة دفعة بالدولار</button>
            <ul>
                ${acc.paymentsSYP.map((p,i)=>`<li>${p.date} : ${p.amount} SYP <button onclick="deletePayment('SYP',${i})">حذف</button></li>`).join('')}
                ${acc.paymentsUSD.map((p,i)=>`<li>${p.date} : ${p.amount} USD <button onclick="deletePayment('USD',${i})">حذف</button></li>`).join('')}
            </ul>
        </div>

        <div>
            <h3>ديون</h3>
            <button onclick="addDebt('SYP')">إضافة دين بالسوري</button>
            <button onclick="addDebt('USD')">إضافة دين بالدولار</button>
            <ul>
                ${acc.debtsSYP.map((d,i)=>`<li>${d.date} : ${d.amount} SYP <button onclick="deleteDebt('SYP',${i})">حذف</button></li>`).join('')}
                ${acc.debtsUSD.map((d,i)=>`<li>${d.date} : ${d.amount} USD <button onclick="deleteDebt('USD',${i})">حذف</button></li>`).join('')}
            </ul>
        </div>

        <div>
            <h3>ما تبقى عليه</h3>
            <p>بالسوري: ${remainingSYP}</p>
            <p>بالدولار: ${remainingUSD}</p>
        </div>
    `;
    container.appendChild(accDiv);
}

renderAccounts();
