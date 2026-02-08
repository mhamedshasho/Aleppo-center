let accounts = JSON.parse(localStorage.getItem("accounts")) || [];
let selectedAccountIndex = null;
let editAccountIndex = null;
let payments = JSON.parse(localStorage.getItem("payments")) || {};

const accountsView = document.getElementById("accountsView");
const accountsList = document.getElementById("accountsList");
const newAccountName = document.getElementById("newAccountName");

const accountView = document.getElementById("accountView");
const accountTitle = document.getElementById("accountTitle");

const dateInput = document.getElementById("date");
const detailsInput = document.getElementById("details");
const debitInput = document.getElementById("debit");
const creditInput = document.getElementById("credit");

const tableBody = document.getElementById("tableBody");
const totalCredit = document.getElementById("totalCredit");
const totalDebit = document.getElementById("totalDebit");
const balance = document.getElementById("balance");

function saveAccounts(){localStorage.setItem("accounts",JSON.stringify(accounts))}
function savePayments(){localStorage.setItem("payments",JSON.stringify(payments))}

function addAccount(){
  const name=newAccountName.value.trim();
  if(!name) return alert("أدخل اسم الحساب");
  if(editAccountIndex!==null){accounts[editAccountIndex]=name;editAccountIndex=null}
  else accounts.push(name);
  saveAccounts();
  newAccountName.value="";
  renderAccounts();
}

function renderAccounts(){
  accountsList.innerHTML="";
  accounts.forEach((name,i)=>{
    accountsList.innerHTML+=`
      <li>
        <span>${name}</span>
        <div>
          <button onclick="selectAccount(${i})">فتح</button>
          <button onclick="editAccount(${i})">تعديل</button>
          <button onclick="removeAccount(${i})">حذف</button>
        </div>
      </li>
    `;
  });
}

function selectAccount(i){
  selectedAccountIndex=i;
  accountsView.style.display="none";
  accountView.style.display="block";
  accountTitle.textContent=accounts[i];
  if(!payments[accounts[i]]) payments[accounts[i]]=[];
  renderPayments();
}

function editAccount(i){newAccountName.value=accounts[i];editAccountIndex=i}
function removeAccount(i){
  if(!confirm("هل تريد حذف هذا الحساب وجميع دفعاته؟")) return;
  const accName=accounts[i];
  accounts.splice(i,1);
  delete payments[accName];
  saveAccounts();
  savePayments();
  renderAccounts();
}

function backToAccounts(){
  selectedAccountIndex=null;
  accountView.style.display="none";
  accountsView.style.display="block";
}

let editPaymentIndex=null;

function addPayment(){
  if(selectedAccountIndex===null) return alert("اختر حساب أولاً");
  if(!dateInput.value||(!debitInput.value&&!creditInput.value)) return alert("أدخل التاريخ والدفعة");
  const payment={date:dateInput.value,details:detailsInput.value||"",debit:Number(debitInput.value)||0,credit:Number(creditInput.value)||0};
  const accName=accounts[selectedAccountIndex];
  if(editPaymentIndex!==null){payments[accName][editPaymentIndex]=payment;editPaymentIndex=null}
  else payments[accName].push(payment);
  savePayments();
  clearForm();
  renderPayments();
}

function clearForm(){
  dateInput.value="";
  detailsInput.value="";
  debitInput.value="";
  creditInput.value="";
  document.getElementById("saveBtn").textContent="حفظ الدفعة";
}

function renderPayments(){
  const accName=accounts[selectedAccountIndex];
  const accPayments=payments[accName]||[];
  tableBody.innerHTML="";
  let totalD=0,totalC=0,bal=0;
  accPayments.forEach((p,i)=>{
    bal+=p.credit-p.debit;
    tableBody.innerHTML+=`
      <tr>
        <td>${p.date}</td>
        <td>${p.details}</td>
        <td>${p.debit}</td>
        <td>${p.credit}</td>
        <td>${bal}</td>
        <td>
          <button onclick="editPayment(${i})">تعديل</button>
          <button onclick="removePayment(${i})">حذف</button>
        </td>
      </tr>
    `;
    totalD+=p.debit;
    totalC+=p.credit;
  });
  totalDebit.textContent=totalD;
  totalCredit.textContent=totalC;
  balance.textContent=bal;
}

function editPayment(i){
  const accName=accounts[selectedAccountIndex];
  const p=payments[accName][i];
  dateInput.value=p.date;
  detailsInput.value=p.details;
  debitInput.value=p.debit;
  creditInput.value=p.credit;
  editPaymentIndex=i;
  document.getElementById("saveBtn").textContent="تحديث الدفعة";
}

function removePayment(i){
  if(!confirm("هل تريد حذف هذه الدفعة؟")) return;
  const accName=accounts[selectedAccountIndex];
  payments[accName].splice(i,1);
  savePayments();
  renderPayments();
}

function toggleDark(){document.documentElement.classList.toggle("dark")}

renderAccounts();
