let accounts = JSON.parse(localStorage.getItem('accounts')) || [];
let currentAccountIndex = null;
let chart = null;

function saveAccounts() {
    localStorage.setItem('accounts', JSON.stringify(accounts));
}

function addAccount() {
    let name = document.getElementById('accountName').value.trim();
    if(!name) return alert('ادخل اسم الحساب');
    if(accounts.find(a=>a.name===name)) return alert('هذا الحساب موجود مسبقاً');
    accounts.push({name: name, payments: [], totalDue:0});
    saveAccounts();
    document.getElementById('accountName').value = '';
    renderAccounts();
}

function renderAccounts() {
    let container = document.getElementById('accountsContainer');
    container.innerHTML = '';
    accounts.forEach((acc,index)=>{
        let card = document.createElement('div');
        card.className = 'account-card';
        card.innerText = acc.name;
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
    if(isNaN(amount) || amount<=0) return alert('ادخل مبلغ صحيح');
    let date = new Date().toLocaleDateString();
    accounts[currentAccountIndex].payments.push({amount,currency,date});
    saveAccounts();
    document.getElementById('paymentAmount').value = '';
    renderPayments();
}

function deletePayment(payIndex) {
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
        li.innerHTML = `${p.date} - ${p.amount} ${p.currency} <button onclick="deletePayment(${i})">حذف</button>`;
        list.appendChild(li);
    });

    let totalUSD = acc.payments.filter(p=>p.currency==='USD').reduce((a,b)=>a+b.amount,0);
    let totalSYP = acc.payments.filter(p=>p.currency==='SYP').reduce((a,b)=>a+b.amount,0);

    document.getElementById('accountSummary').innerHTML = `
        مجموع بالدولار: ${totalUSD} | مجموع بالليرة: ${totalSYP} <br>
        ما تبقى عليه: ${acc.totalDue - (totalUSD + totalSYP)} 
    `;

    renderChart(acc);
}

function renderChart(account) {
    const ctx = document.getElementById('paymentChart').getContext('2d');
    let labels = account.payments.map(p=>p.date);
    let dataUSD = account.payments.map(p=>p.currency==='USD'?p.amount:0);
    let dataSYP = account.payments.map(p=>p.currency==='SYP'?p.amount:0);

    if(chart) chart.destroy();

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                { label: 'USD', data: dataUSD, backgroundColor:'#3498db' },
                { label: 'SYP', data: dataSYP, backgroundColor:'#f1c40f' }
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
        doc.text(`تاريخ: ${p.date} | المبلغ: ${p.amount} ${p.currency}`, 10, y);
        y+=10;
    });

    let totalUSD = account.payments.filter(p=>p.currency==='USD').reduce((a,b)=>a+b.amount,0);
    let totalSYP = account.payments.filter(p=>p.currency==='SYP').reduce((a,b)=>a+b.amount,0);

    doc.text(`مجموع بالدولار: ${totalUSD}`, 10, y+10);
    doc.text(`مجموع بالليرة السورية: ${totalSYP}`, 10, y+20);
    doc.save(`${account.name}.pdf`);
}

renderAccounts();
