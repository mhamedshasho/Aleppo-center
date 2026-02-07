let accounts = JSON.parse(localStorage.getItem("accounts")) || [];
let current = null;
let accountSearchText = "";
let historySearchText = "";

/* ========== حفظ ========== */
function save(){
    localStorage.setItem("accounts", JSON.stringify(accounts));
}

/* ========== تاريخ ========== */
function getDate(){
    if(confirm("هل تريد تاريخ اليوم تلقائياً؟")){
        return new Date().toLocaleDateString('ar-EG');
    }
    return prompt("ادخل التاريخ (YYYY/MM/DD)") || new Date().toLocaleDateString('ar-EG');
}

/* ========== إضافة حساب ========== */
function addAccount(){
    let name = accName.value.trim();
    let amount = Number(accAmount.value) || 0;
    let cur = accCurrency.value;

    if(!name) return alert("ادخل اسم الحساب");

    accounts.push({
        name,
        debtSYP: cur==="SYP"?amount:0,
        debtUSD: cur==="USD"?amount:0,
        paySYP:0,
        payUSD:0,
        history:[]
    });

    accName.value="";
    accAmount.value="";
    save();
    renderCards();
}

/* ========== بحث حسابات ========== */
function searchAccounts(text){
    accountSearchText = text.trim();
    renderCards();
}

/* ========== عرض البطاقات ========== */
function renderCards(){
    cards.innerHTML="";
    accounts.forEach((a,i)=>{
        if(accountSearchText && !a.name.includes(accountSearchText)) return;

        let div=document.createElement("div");
        div.className="card";
        div.innerHTML=`<h3>${a.name}</h3><small>اضغط للدخول</small>`;
        div.onclick=()=>openAccount(i);
        cards.appendChild(div);
    });
}

/* ========== فتح حساب ========== */
function openAccount(i){
    current=i;
    accountsView.style.display="none";
    accountView.style.display="block";
    historySearchText="";
    renderAccount();
}

/* ========== رجوع ========== */
function back(){
    current=null;
    accountView.style.display="none";
    accountsView.style.display="block";
    renderCards();
}

/* ========== حذف حساب ========== */
function deleteAccount(){
    if(!confirm("حذف الحساب نهائياً؟")) return;
    accounts.splice(current,1);
    save();
    back();
}

/* ========== إضافة دين ========== */
function addDebt(cur){
    let name = prompt("اسم الدين (مثال: إيجار)");
    if(!name) return;

    let v = Number(prompt("المبلغ"));
    if(!v || v<=0) return;

    let d = getDate();
    let acc = accounts[current];

    if(cur==="SYP") acc.debtSYP += v;
    else acc.debtUSD += v;

    acc.history.push({
        title:name,
        type:"دين",
        currency:cur,
        amount:v,
        date:d
    });

    save();
    renderAccount();
}

/* ========== إضافة دفعة ========== */
function addPay(cur){
    let name = prompt("اسم الدفعة (مثال: دفعة أولى)");
    if(!name) return;

    let v = Number(prompt("المبلغ"));
    if(!v || v<=0) return;

    let d = getDate();
    let acc = accounts[current];

    if(cur==="SYP") acc.paySYP += v;
    else acc.payUSD += v;

    acc.history.push({
        title:name,
        type:"دفعة",
        currency:cur,
        amount:v,
        date:d
    });

    save();
    renderAccount();
}

/* ========== تعديل عملية ========== */
function editItem(i){
    let acc = accounts[current];
    let h = acc.history[i];

    let newName = prompt("اسم العملية", h.title) || h.title;
    let newAmount = Number(prompt("المبلغ", h.amount));
    if(!newAmount || newAmount<=0) return;

    if(h.type==="دين"){
        if(h.currency==="SYP") acc.debtSYP -= h.amount;
        else acc.debtUSD -= h.amount;
    }else{
        if(h.currency==="SYP") acc.paySYP -= h.amount;
        else acc.payUSD -= h.amount;
    }

    h.title = newName;
    h.amount = newAmount;

    if(h.type==="دين"){
        if(h.currency==="SYP") acc.debtSYP += newAmount;
        else acc.debtUSD += newAmount;
    }else{
        if(h.currency==="SYP") acc.paySYP += newAmount;
        else acc.payUSD += newAmount;
    }

    save();
    renderAccount();
}

/* ========== حذف عملية ========== */
function deleteItem(i){
    let acc = accounts[current];
    let h = acc.history[i];

    if(!confirm("حذف العملية؟")) return;

    if(h.type==="دين"){
        if(h.currency==="SYP") acc.debtSYP -= h.amount;
        else acc.debtUSD -= h.amount;
    }else{
        if(h.currency==="SYP") acc.paySYP -= h.amount;
        else acc.payUSD -= h.amount;
    }

    acc.history.splice(i,1);
    save();
    renderAccount();
}

/* ========== بحث داخل العمليات ========== */
function searchHistory(text){
    historySearchText = text.trim();
    renderAccount();
}

/* ========== عرض الحساب ========== */
function renderAccount(){
    let acc = accounts[current];
    title.innerText = acc.name;

    let remainSYP = acc.debtSYP - acc.paySYP;
    let remainUSD = acc.debtUSD - acc.payUSD;

    let html = `
    <b>سوري</b><br>
    دين: ${acc.debtSYP}<br>
    مدفوع: ${acc.paySYP}<br>
    المتبقي: ${remainSYP}<hr>

    <b>دولار</b><br>
    دين: ${acc.debtUSD}<br>
    مدفوع: ${acc.payUSD}<br>
    المتبقي: ${remainUSD}<hr>

    <input placeholder="بحث عن دفعة أو دين" oninput="searchHistory(this.value)">
    <b>السجل</b>
    `;

    acc.history.forEach((h,i)=>{
        let text = `${h.title} ${h.type} ${h.currency} ${h.amount} ${h.date}`;
        if(historySearchText && !text.includes(historySearchText)) return;

        html += `
        <div class="log ${h.type==="دين"?"debt":"pay"}">
            <b>${h.title}</b><br>
            ${h.date} – ${h.type} – ${h.amount} ${h.currency}<br>
            <button onclick="editItem(${i})">تعديل</button>
            <button onclick="deleteItem(${i})">حذف</button>
        </div>`;
    });

    info.innerHTML = html;
}

/* ========== تشغيل ========== */
renderCards();
