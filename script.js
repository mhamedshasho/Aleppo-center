let accounts = JSON.parse(localStorage.getItem('accounts') || "[]");
let currentAccountIndex = null;

function save(){
    localStorage.setItem('accounts', JSON.stringify(accounts));
    render();
}

function addAccount(){
    let name = accountName.value.trim();
    let debt = parseFloat(accountDebt.value);
    if(isNaN(debt)) debt = 0;
    let currency = accountCurrency.value;

    if(!name) return alert('ادخل الاسم');
    if(accounts.find(a=>a.name===name)) return alert('موجود مسبقاً');

    accounts.push({
        name,
        totalDebt: debt,
        currency,
        payments:[]
    });

    accountName.value='';
    accountDebt.value='';
    save();
}

function deleteAccount(i){
    if(confirm('حذف الحساب؟')){
        accounts.splice(i,1);
        currentAccountIndex=null;
        save();
    }
}

function addPayment(i){
    let amount = parseFloat(prompt('المبلغ'));
    if(isNaN(amount) || amount<=0) return;

    let currency = prompt('العملة USD أو SYP','USD');
    if(currency!=='USD' && currency!=='SYP') return;

    accounts[i].payments.push({
        amount,
        currency,
        date:new Date().toLocaleDateString('ar-EG')
    });
    save();
}

function deletePayment(ai,pi){
    accounts[ai].payments.splice(pi,1);
    save();
}

function openAccount(i){
    currentAccountIndex=i;
    render();
}

function back(){
    currentAccountIndex=null;
    render();
}

function render(){
    let c = accountsList;
    c.innerHTML='';

    if(currentAccountIndex===null){
        accounts.forEach((a,i)=>{
            let d=document.createElement('div');
            d.className='account';
            d.innerHTML=`${a.name} - ${a.currency}`;
            d.onclick=()=>openAccount(i);
            c.appendChild(d);
        });
        return;
    }

    let a=accounts[currentAccountIndex];
    let paidUSD=0, paidSYP=0;

    a.payments.forEach(p=>{
        if(p.currency==='USD') paidUSD+=p.amount;
        else paidSYP+=p.amount;
    });

    let remUSD = a.currency==='USD' ? a.totalDebt-paidUSD : 0;
    let remSYP = a.currency==='SYP' ? a.totalDebt-paidSYP : 0;
    if(isNaN(remUSD)) remUSD=0;
    if(isNaN(remSYP)) remSYP=0;

    c.innerHTML=`
        <button onclick="back()">رجوع</button>
        <h3>${a.name}</h3>
        <div>العملة: ${a.currency}</div>
        <div>المطلوب: ${a.totalDebt}</div>

        <div>مدفوع دولار: ${paidUSD}</div>
        <div>مدفوع سوري: ${paidSYP}</div>

        <div>المتبقي دولار: ${remUSD}</div>
        <div>المتبقي سوري: ${remSYP}</div>

        <hr>
        ${a.payments.map((p,i)=>`
            <div>
                ${p.date} - ${p.amount} ${p.currency}
                <button onclick="deletePayment(${currentAccountIndex},${i})">حذف</button>
            </div>
        `).join('')}

        <button onclick="addPayment(${currentAccountIndex})">إضافة دفعة</button>
        <button onclick="deleteAccount(${currentAccountIndex})">حذف الحساب</button>
    `;
}

render();
