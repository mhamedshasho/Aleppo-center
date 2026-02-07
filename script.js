let accounts = JSON.parse(localStorage.getItem("accounts")) || [];
let current = null;

let filterText="", filterMonth="", filterYear="", accountSearch="";

function save(){ localStorage.setItem("accounts", JSON.stringify(accounts)); }

function getDate(){ return new Date().toLocaleDateString('ar-EG'); }

function addAccount(){
    let name = accName.value.trim();
    if(!name) return alert("ادخل اسم الحساب");
    accounts.push({ name, payments:[] });
    accName.value="";
    save();
    renderCards();
}

function searchAccount(v){ accountSearch=v.trim(); renderCards(); }

function renderCards(){
    cards.innerHTML="";
    accounts.filter(a => !accountSearch || a.name.includes(accountSearch))
    .forEach((a,i)=>{
        let d=document.createElement("div");
        d.className="card";
        d.innerHTML=`<h3>${a.name}</h3><small>اضغط للدخول</small>`;
        d.onclick=()=>openAccount(i);
        cards.appendChild(d);
    });
}

function openAccount(i){
    current=i;
    accountsView.style.display="none";
    accountView.style.display="block";
    renderAccount();
}

function back(){ current=null; accountView.style.display="none"; accountsView.style.display="block"; }

function deleteAccount(){
    if(!confirm("حذف الحساب نهائيًا؟")) return;
    accounts.splice(current,1);
    save();
    back();
    renderCards();
}

function addPay(currency){
    let title = prompt("اسم الدفعة");
    if(!title) return;
    let amount = Number(prompt("المبلغ"));
    if(!amount || amount<=0) return;
    let date = getDate();
    accounts[current].payments.push({ title, amount, currency, date });
    save();
    renderAccount();
}

function editItem(i){
    let p = accounts[current].payments[i];
    let t = prompt("اسم الدفعة",p.title) || p.title;
    let a = Number(prompt("المبلغ",p.amount));
    if(!a || a<=0) return;
    p.title=t; p.amount=a;
    save();
    renderAccount();
}

function deleteItem(i){
    if(!confirm("حذف الدفعة؟")) return;
    accounts[current].payments.splice(i,1);
    save();
    renderAccount();
}

function setSearch(v){filterText=v.trim(); renderAccount();}
function setMonth(v){filterMonth=v; renderAccount();}
function setYear(v){filterYear=v; renderAccount();}

function getFilteredPayments(){
    return accounts[current].payments.filter(p=>{
        let ok=true;
        if(filterText){
            let textMatch=p.title.includes(filterText);
            let num=Number(filterText);
            let amountMatch=!isNaN(num) && p.amount===num;
            if(!textMatch && !amountMatch) ok=false;
        }
        let parts=p.date.split("/");
        let month=parts[1], year=parts[2]||parts[0];
        if(filterMonth && month!==filterMonth) ok=false;
        if(filterYear && year!==filterYear) ok=false;
        return ok;
    });
}

function renderAccount(){
    let acc=accounts[current];
    title.innerText=acc.name;
    let list=getFilteredPayments();
    let html=`<table><tr><th>التاريخ</th><th>التفاصيل</th><th>عليه</th><th>له</th><th>الرصيد</th></tr>`;
    let balance=0;
    list.forEach((p,i)=>{
        let debit=0, credit=p.amount;
        balance += credit - debit;
        html+=`<tr>
            <td>${p.date}</td>
            <td>${p.title}</td>
            <td class="amount-negative">${debit}</td>
            <td class="amount-positive">${credit}</td>
            <td>${balance}</td>
        </tr>`;
    });
    let totalSYP=list.filter(p=>p.currency==="SYP").reduce((a,b)=>a+b.amount,0);
    let totalUSD=list.filter(p=>p.currency==="USD").reduce((a,b)=>a+b.amount,0);
    html+=`<tr class="total">
        <td colspan="2">إجمالي العمليات</td>
        <td>-</td>
        <td>${totalSYP} سوري / ${totalUSD} دولار</td>
        <td>-</td>
    </tr>`;
    html+=`</table>`;
    info.innerHTML=html;
}

async function savePDF() {
    if(current===null) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "landscape" });

    let acc = accounts[current];
    let list = getFilteredPayments();

    doc.setFontSize(16);
    doc.text(`كشف حساب: ${acc.name}`, 14, 20);

    let startY = 30;
    doc.setFontSize(12);
    doc.text("التاريخ", 14, startY);
    doc.text("التفاصيل", 50, startY);
    doc.text("عليه", 120, startY);
    doc.text("له", 150, startY);
    doc.text("الرصيد", 180, startY);

    let y = startY + 8;
    let balance = 0;

    list.forEach(p=>{
        let debit=0, credit=p.amount;
        balance += credit - debit;

        doc.text(p.date, 14, y);
        doc.text(p.title, 50, y);
        doc.text(debit.toString(), 120, y);
        doc.text(credit.toString(), 150, y);
        doc.text(balance.toString(), 180, y);
        y+=8;
    });

    let totalSYP = list.filter(p=>p.currency==="SYP").reduce((a,b)=>a+b.amount,0);
    let totalUSD = list.filter(p=>p.currency==="USD").reduce((a,b)=>a+b.amount,0);
    y+=4;
    doc.text(`إجمالي العمليات: ${totalSYP} سوري / ${totalUSD} دولار`, 14, y);

    doc.save(`${acc.name}.pdf`);
}

/* تشغيل */
renderCards();
