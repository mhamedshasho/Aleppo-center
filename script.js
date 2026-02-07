let accounts = JSON.parse(localStorage.getItem("accounts")) || [];
let current = null;

let filterText = "";
let filterMonth = "";
let filterYear = "";

/* ===== حفظ ===== */
function save(){
    localStorage.setItem("accounts", JSON.stringify(accounts));
}

/* ===== تاريخ ===== */
function getDate(){
    if(confirm("هل تريد تاريخ اليوم تلقائياً؟")){
        return new Date().toLocaleDateString('ar-EG');
    }
    return prompt("ادخل التاريخ (YYYY/MM/DD)") || new Date().toLocaleDateString('ar-EG');
}

/* ===== إضافة حساب ===== */
function addAccount(){
    let name = accName.value.trim();
    if(!name) return alert("ادخل اسم الحساب");

    accounts.push({ name, payments:[] });

    accName.value="";
    save();
    renderCards();
}

/* ===== عرض الحسابات ===== */
function renderCards(){
    cards.innerHTML="";
    accounts.forEach((a,i)=>{
        let d=document.createElement("div");
        d.className="card";
        d.innerHTML=`<h3>${a.name}</h3><small>اضغط للدخول</small>`;
        d.onclick=()=>openAccount(i);
        cards.appendChild(d);
    });
}

/* ===== فتح حساب ===== */
function openAccount(i){
    current=i;
    accountsView.style.display="none";
    accountView.style.display="block";
    renderAccount();
}

/* ===== رجوع ===== */
function back(){
    current=null;
    accountView.style.display="none";
    accountsView.style.display="block";
}

/* ===== حذف حساب ===== */
function deleteAccount(){
    if(!confirm("حذف الحساب نهائياً؟")) return;
    accounts.splice(current,1);
    save();
    back();
    renderCards();
}

/* ===== إضافة دفعة ===== */
function addPay(currency){
    let title = prompt("اسم الدفعة (مثال: إيجار)");
    if(!title) return;

    let amount = Number(prompt("المبلغ"));
    if(!amount || amount<=0) return;

    let date = getDate();

    accounts[current].payments.push({ title, amount, currency, date });
    save();
    renderAccount();
}

/* ===== تعديل دفعة ===== */
function editItem(i){
    let p = accounts[current].payments[i];

    let t = prompt("اسم الدفعة", p.title) || p.title;
    let a = Number(prompt("المبلغ", p.amount));
    if(!a || a<=0) return;

    p.title = t;
    p.amount = a;

    save();
    renderAccount();
}

/* ===== حذف دفعة ===== */
function deleteItem(i){
    if(!confirm("حذف الدفعة؟")) return;
    accounts[current].payments.splice(i,1);
    save();
    renderAccount();
}

/* ===== فلترة ===== */
function setSearch(v){
    filterText = v.trim();
    renderAccount();
}
function setMonth(v){
    filterMonth = v;
    renderAccount();
}
function setYear(v){
    filterYear = v;
    renderAccount();
}

/* ===== حساب المجاميع ===== */
function calculateTotals(list){
    let syp=0, usd=0;
    list.forEach(p=>{
        if(p.currency==="SYP") syp+=p.amount;
        if(p.currency==="USD") usd+=p.amount;
    });
    return {syp, usd, count:list.length};
}

/* ===== فلترة الدفعات ===== */
function getFilteredPayments(){
    return accounts[current].payments.filter(p=>{
        let ok = true;

        if(filterText && !p.title.includes(filterText)) ok=false;

        let parts = p.date.split("/");
        let m = parts[1];
        let y = parts[0];

        if(filterMonth && m !== filterMonth) ok=false;
        if(filterYear && y !== filterYear) ok=false;

        return ok;
    });
}

/* ===== عرض الحساب ===== */
function renderAccount(){
    let acc = accounts[current];
    title.innerText = acc.name;

    let list = getFilteredPayments();
    let t = calculateTotals(list);

    let html = `
    <b>المجاميع (حسب الفلترة)</b><br>
    مجموع سوري: ${t.syp}<br>
    مجموع دولار: ${t.usd}<br>
    عدد العناصر: ${t.count}
    <hr>

    <input placeholder="بحث باسم الدفعة" oninput="setSearch(this.value)">
    <input placeholder="شهر (01-12)" oninput="setMonth(this.value)">
    <input placeholder="سنة (2026)" oninput="setYear(this.value)">
    <hr>
    `;

    list.forEach((p,i)=>{
        html+=`
        <div class="log pay">
            <b>${p.title}</b><br>
            ${p.date} – ${p.amount} ${p.currency}<br>
            <button onclick="editItem(${i})">تعديل</button>
            <button onclick="deleteItem(${i})">حذف</button>
        </div>`;
    });

    info.innerHTML = html;
}

/* ===== تشغيل ===== */
renderCards();
