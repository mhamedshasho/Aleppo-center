let accounts = JSON.parse(localStorage.getItem('accounts')) || [];

function saveAccounts() {
    localStorage.setItem('accounts', JSON.stringify(accounts));
}

function addAccount() {
    let name = document.getElementById('accountName').value.trim();
    if(!name) return alert('ادخل اسم الحساب');
    if(accounts.find(a=>a.name===name)) return alert('هذا الحساب موجود مسبقاً');
    accounts.push({name: name, payments: []});
    saveAccounts();
    document.getElementById('accountName').value = '';
    renderAccounts();
}

function addPayment(index) {
    let amount = prompt('ادخل قيمة الدفعة:');
    let currency = prompt('اختر العملة: SYP او USD:').toUpperCase();
    if(!amount || isNaN(amount) || (currency!=='USD' && currency!=='SYP')) return alert('ادخل بيانات صحيحة');
    let date = new Date().toLocaleDateString();
    accounts[index].payments.push({amount: parseFloat(amount), currency, date});
    saveAccounts();
    renderAccounts();
}

function deletePayment(accIndex, payIndex) {
    accounts[accIndex].payments.splice(payIndex,1);
    saveAccounts();
    renderAccounts();
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

    let totalPaid = account.payments.reduce((a,b)=>{
        if(b.currency==='USD') return a;
        return a+b.amount;
    },0);

    doc.save(`${account.name}.pdf`);
}

function renderAccounts() {
    let container = document.getElementById('accountsContainer');
    container.innerHTML = '';

    accounts.forEach((acc,index)=>{
        let totalUSD = acc.payments.filter(p=>p.currency==='USD').reduce((a,b)=>a+b.amount,0);
        let totalSYP = acc.payments.filter(p=>p.currency==='SYP').reduce((a,b)=>a+b.amount,0);
        let card = document.createElement('div');
        card.className = 'account-card';
        card.innerHTML = `
            <h3>${acc.name} 
                <button onclick="addPayment(${index})">إضافة دفعة</button>
                <button onclick="savePDF(${index})">حفظ PDF</button>
            </h3>
            <ul>
                ${acc.payments.map((p,i)=>`
                    <li>
                        ${p.date} - ${p.amount} ${p.currency} 
                        <button onclick="deletePayment(${index},${i})">حذف</button>
                    </li>`).join('')}
            </ul>
            <div class="account-summary">
                مجموع بالدولار: ${totalUSD} | مجموع بالليرة السورية: ${totalSYP}
            </div>
        `;
        container.appendChild(card);
    });
}

renderAccounts();
