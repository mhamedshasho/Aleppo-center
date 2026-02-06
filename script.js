let accounts = JSON.parse(localStorage.getItem('accounts')||'[]');
let selectedIndex = null;

function saveAccounts(){ 
    localStorage.setItem('accounts',JSON.stringify(accounts)); 
    renderAccounts(); 
}

function addAccount(){
    let name = document.getElementById('accountName').value.trim();
    let debt = parseFloat(document.getElementById('accountDebt').value) || 0;
    let currency = document.getElementById('accountCurrency').value;
    if(!name){alert('ادخل اسم الحساب'); return;}
    if(accounts.find(a=>a.name===name)){alert('هذا الحساب موجود'); return;}
    let newAcc = {
        name: name,
        debtSYP: currency==='SYP'?debt:0,
        debtUSD: currency==='USD'?debt:0,
        payments: []
    };
    accounts.push(newAcc);
    document.getElementById('accountName').value='';
    document.getElementById('accountDebt').value='';
    saveAccounts();
}

function deleteAccount(index){ 
    if(confirm('هل تريد حذف الحساب؟')){
        accounts.splice(index,1); 
        saveAccounts();
    }
}

function renderAccounts(){
    let container=document.getElementById('accountsList'); 
    container.innerHTML='';
    accounts.forEach((acc,i)=>{
        let div=document.createElement('div'); 
        div.className='account';
        div.innerHTML=`<div class="account-header">
            <span onclick="openAccount(${i})">${acc.name}</span>
            <button onclick="deleteAccount(${i})">حذف</button>
        </div>`;
        container.appendChild(div);
    });
}

function openAccount(index){
    selectedIndex=index;
    document.getElementById('mainView').style.display='none';
    document.getElementById('accountDetail').style.display='block';
    renderAccountDetails();
}

function backToMain(){
    selectedIndex=null; 
    document.getElementById('mainView').style.display='block'; 
    document.getElementById('accountDetail').style.display='none';
}

function addPaymentSelected(currency){
    if(selectedIndex===null) return;
    let amt = parseFloat(prompt('ادخل مبلغ الدفعة:')); 
    if(isNaN(amt) || amt<=0) return;
    let today = new Date().toLocaleDateString('ar-EG');
    accounts[selectedIndex].payments.push({type:'دفعة',currency:currency,amount:amt,date:today});
    saveAccounts();
}

function addDebtSelected(currency){
    if(selectedIndex===null) return;
    let amt = parseFloat(prompt('ادخل مبلغ الدين:')); 
    if(isNaN(amt) || amt<=0) return;
    let today = new Date().toLocaleDateString('ar-EG');
    accounts[selectedIndex].payments.push({type:'دين',currency:currency,amount:amt,date:today});
    saveAccounts();
}

function deleteCurrentAccount(){
    if(selectedIndex===null) return; 
    if(confirm('هل تريد حذف الحساب؟')){
        accounts.splice(selectedIndex,1);
        saveAccounts(); 
        backToMain();
    }
}

function renderAccountDetails(){
    if(selectedIndex===null) return;
    let acc = accounts[selectedIndex];
    document.getElementById('accName').innerText = acc.name;
    let tbody = document.querySelector('#accTable tbody'); 
    tbody.innerHTML='';
    
    let totalSYP = Number(acc.debtSYP) || 0;
    let totalUSD = Number(acc.debtUSD) || 0;
    let paidSYP = 0, paidUSD = 0;
    
    acc.payments.forEach((p,i)=>{
        let amt = Number(p.amount) || 0;
        let tr = document.createElement('tr');
        tr.innerHTML = `<td>${p.type}</td><td>${p.currency}</td><td>${amt}</td><td>${p.date}</td><td><button onclick="deletePayment(${i})">حذف</button></td>`;
        tbody.appendChild(tr);
        if(p.type==='دفعة'){ 
            if(p.currency==='SYP') paidSYP += amt; 
            else paidUSD += amt; 
        } else { 
            if(p.currency==='SYP') totalSYP += amt; 
            else totalUSD += amt; 
        }
    });

    document.getElementById('totalSYP').innerText = 'مجموع بالسوري: ' + totalSYP;
    document.getElementById('totalUSD').innerText = 'مجموع بالدولار: ' + totalUSD;
    document.getElementById('remainSYP').innerText = 'الباقي بالسوري: ' + Math.max(totalSYP - paidSYP,0);
    document.getElementById('remainUSD').innerText = 'الباقي بالدولار: ' + Math.max(totalUSD - paidUSD,0);
}

function deletePayment(idx){
    if(selectedIndex===null) return; 
    accounts[selectedIndex].payments.splice(idx,1); 
    saveAccounts();
}

function savePDFSelected(){
    if(selectedIndex===null) return;
    let acc = accounts[selectedIndex];
    let content=`حساب: ${acc.name}\n\n`;
    acc.payments.forEach(p=>{
        content+=`${p.type} - ${p.currency} : ${p.amount} - ${p.date}\n`;
    });
    content+=`\n${document.getElementById('totalSYP').innerText}\n${document.getElementById('totalUSD').innerText}\n${document.getElementById('remainSYP').innerText}\n${document.getElementById('remainUSD').innerText}`;
    let blob = new Blob([content], {type:"text/plain"});
    let link = document.createElement('a'); 
    link.href = URL.createObjectURL(blob); 
    link.download = acc.name+'.txt'; 
    link.click();
}

renderAccounts();
