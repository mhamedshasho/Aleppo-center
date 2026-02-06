let accounts = JSON.parse(localStorage.getItem('accounts')) || [];
let currentAccountIndex = null;
let chart = null;

function saveAccounts() {
    localStorage.setItem('accounts', JSON.stringify(accounts));
}

function addAccount() {
    let name = document.getElementById('accountName').value.trim();
    let debt = parseFloat(document.getElementById('accountDebt').value) || 0;
    if(!name) return alert('ادخل اسم الحساب');
    if(accounts.find(a=>a.name===name)) return alert('هذا الحساب موجود مسبقاً');
    accounts.push({name: name, payments: [], totalDebt: debt});
    saveAccounts();
    document.getElementById('accountName').value = '';
    document.getElementById('accountDebt').value = '';
    renderAccounts();
}

function renderAccounts() {
    let container = document.getElementById('accountsContainer');
    container.innerHTML = '';
    accounts.forEach((acc,index)=>{
        let card = document.createElement('div');
        card.className = 'account-card';
        card.innerText = `${acc.name} | ما عليه: ${acc.totalDebt} `;
        card.onclick = () => openAccount(index);
        container.appendChild(card);
    });
}

function openAccount(index) {
    currentAccountIndex = index;
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('accountView').style.display = 'block';
    document.getElementById('accountTitle').innerText = accounts[index].name;
    renderPayments();
}

function backToMain() {
    document.getElementById('mainMenu').style.display = 'block';
    document.getElementById('accountView').style.display = 'none';
    currentAccountIndex = null;
    if(chart) { chart.destroy(); chart = null; }
    renderAccounts();
}

function addPaymentToAccount() {
    let amount = parseFloat(document.getElementById('paymentAmount').value);
    let currency = document.getElementById('paymentCurrency').value;
    let type = document.getElementById('paymentType').value;
    if(isNaN(amount) || amount<=0) return alert('ادخل مبلغ صحيح');
    let date = new Date().toLocaleDateString();
    accounts[currentAccountIndex].payments.push({amount,currency,type,date});

    if(type==='payment'){
        accounts[currentAccountIndex].totalDebt -= amount;
        if(accounts[currentAccountIndex].totalDebt <0) accounts[currentAccountIndex].totalDebt = 0;
    } else if(type==='debt'){
        accounts[currentAccountIndex].totalDebt += amount;
    }

    saveAccounts();
    document.getElementById('paymentAmount').value = '';
    renderPayments();
}

function deletePayment(payIndex) {
    let p = accounts[currentAccountIndex].payments[payIndex];
    if(p.type==='payment') accounts[currentAccountIndex].totalDebt += p.amount;
    if(p.type==='debt') accounts[currentAccountIndex].totalDebt -= p.amount;
    if(accounts[currentAccountIndex].totalDebt<0) accounts[currentAccountIndex].totalDebt=0;

    accounts[currentAccountIndex].payments.splice(payIndex,1);
    saveAccounts();
    renderPayments();
}

function deleteCurrentAccount() {
    if(confirm('هل انت متأكد من حذف الحساب؟')) {
        accounts.splice(currentAccountIndex,1);
        saveAccounts();
        backToMain();
    }
}

function renderPayments() {
    let acc = accounts[currentAccountIndex];
    let list = document.getElementById('paymentList');
    list.innerHTML = '';
    acc.payments.forEach((p,i)=>{
        let li = document.createElement('li');
        li.innerHTML = `${p.date} | ${p.type==='payment'?'دفعة':'دين'}: ${p.amount} ${p.currency} <button onclick="deletePayment(${i})">حذف</button>`;
        list.appendChild(li);
    });

    let totalPaidUSD = acc.payments.filter(p=>p.currency==='USD' && p.type==='payment').reduce((a,b)=>a+b.amount,0);
    let totalPaidSYP = acc.payments.filter(p=>p.currency==='SYP' && p.type==='payment').reduce((a,b)=>a+b.amount,0);

    document.getElementById('accountSummary').innerHTML = `
        مجموع ما دفع بالدولار: ${totalPaidUSD} | مجموع ما دفع بالليرة: ${totalPaidSYP} <br>
        ما تبقى عليه: ${acc.totalDebt}
    `;

    renderChart(acc);
}

function renderChart(account) {
    const ctx = document.getElementById('paymentChart').getContext('2d');
    let labels = account.payments.map(p=>p.date);
    let dataPaidUSD = account.payments.map(p=>p.currency==='USD' && p.type==='payment'?p.amount:0);
    let dataPaidSYP = account.payments.map(p=>p.currency==='SYP' && p.type==='payment'?p.amount:0);
    let dataDebtUSD = account.payments.map(p=>p.currency==='USD' && p.type==='debt'?p.amount:0);
    let dataDebtSYP = account.payments.map(p=>p.currency==='SYP' && p.type==='debt'?p.amount:0);

    if(chart) chart.destroy();

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                { label: 'دفعات USD', data: dataPaidUSD, backgroundColor:'#3498db' },
                { label: 'دفعات SYP', data: dataPaidSYP, backgroundColor:'#f1c40f' },
                { label: 'ديون USD', data: dataDebtUSD, backgroundColor:'#e74c3c' },
                { label: 'ديون SYP', data: dataDebtSYP, backgroundColor:'#e67e22' }
            ]
        },
        options: { responsive:true, plugins:{legend:{position:'top'}} }
    });
}

function savePDF(index) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let account = accounts[index];
    doc.text(`دفعات الحساب: ${account.name}`, 10, 10);

    let y = 20;
    account.payments.forEach(p=>{
        doc.text(`تاريخ: ${p.date} | ${p.type==='payment'?'دفعة':'دين'}: ${p.amount} ${p.currency}`, 10, y);
        y+=10;
    });

    let totalPaidUSD = account.payments.filter(p=>p.currency==='USD' && p.type==='payment').reduce((a,b)=>a+b.amount,0);
    let totalPaidSYP = account.payments.filter(p=>p.currency==='SYP' && p.type==='payment').reduce((a,b)=>a+b.amount,0);

    doc.text(`مجموع ما دفع بالدولار: ${totalPaidUSD}`, 10, y+10);
    doc.text(`مجموع ما دفع بالليرة السورية: ${totalPaidSYP}`, 10, y+20);
    doc.text(`ما تبقى عليه: ${account.totalDebt}`,10,y+30);
    doc.save(`${account.name}.pdf`);
}

renderAccounts();
