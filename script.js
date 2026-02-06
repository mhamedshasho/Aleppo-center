let accounts = JSON.parse(localStorage.getItem("accounts") || "[]");
let currentAccountIndex = null;

function save() {
    localStorage.setItem("accounts", JSON.stringify(accounts));
}

function today() {
    return new Date().toLocaleDateString("ar-EG");
}

function addAccount() {
    let name = accountName.value.trim();
    let debt = parseFloat(accountDebt.value) || 0;
    let currency = accountCurrency.value;

    if (!name) return;

    accounts.push({
        name,
        debts: {
            USD: currency === "USD" ? debt : 0,
            SYP: currency === "SYP" ? debt : 0
        },
        payments: []
    });

    save();
    accountName.value = "";
    accountDebt.value = "";
    renderAccounts();
}

function renderAccounts() {
    accountsList.innerHTML = "";
    accounts.forEach((a, i) => {
        let div = document.createElement("div");
        div.className = "account";
        div.innerHTML = `
            <strong>${a.name}</strong>
            <button onclick="openAccount(${i})">فتح</button>
            <button onclick="deleteAccount(${i})">حذف</button>
        `;
        accountsList.appendChild(div);
    });
}

function deleteAccount(i) {
    if (!confirm("حذف الحساب؟")) return;
    accounts.splice(i, 1);
    save();
    renderAccounts();
}

function openAccount(i) {
    currentAccountIndex = i;
    accountsPage.classList.add("hidden");
    accountPage.classList.remove("hidden");
    renderAccountPage();
}

function backToAccounts() {
    accountPage.classList.add("hidden");
    accountsPage.classList.remove("hidden");
}

function addPayment() {
    let amount = parseFloat(paymentAmount.value);
    if (!amount) return;

    let currency = paymentCurrency.value;
    let type = paymentType.value;

    accounts[currentAccountIndex].payments.push({
        amount,
        currency,
        type,
        date: today()
    });

    paymentAmount.value = "";
    save();
    renderAccountPage();
}

function deletePayment(i) {
    accounts[currentAccountIndex].payments.splice(i, 1);
    save();
    renderAccountPage();
}

function renderAccountPage() {
    let a = accounts[currentAccountIndex];
    accountTitle.textContent = a.name;

    let paidUSD = 0, paidSYP = 0;

    a.payments.forEach(p => {
        if (p.type === "pay") {
            if (p.currency === "USD") paidUSD += p.amount;
            if (p.currency === "SYP") paidSYP += p.amount;
        }
        if (p.type === "debt") {
            if (p.currency === "USD") a.debts.USD += p.amount;
            if (p.currency === "SYP") a.debts.SYP += p.amount;
        }
    });

    let remainUSD = a.debts.USD - paidUSD;
    let remainSYP = a.debts.SYP - paidSYP;

    remainUSD.textContent = remainUSD;
    remainSYP.textContent = remainSYP;

    paymentsList.innerHTML = "";

    let filter = filterCurrency.value;
    let list = a.payments.filter(p => filter === "ALL" || p.currency === filter);

    list.forEach((p, i) => {
        let div = document.createElement("div");
        div.className = "payment";
        div.innerHTML = `
            <span>${p.date} - ${p.type === "pay" ? "دفع" : "دين"} ${p.amount} ${p.currency}</span>
            <button onclick="deletePayment(${i})">✖</button>
        `;
        paymentsList.appendChild(div);
    });
}

function savePDF() {
    let a = accounts[currentAccountIndex];
    let text = `حساب: ${a.name}\nالمتبقي دولار: ${remainUSD.textContent}\nالمتبقي سوري: ${remainSYP.textContent}\n\n`;

    a.payments.forEach(p => {
        text += `${p.date} - ${p.type} ${p.amount} ${p.currency}\n`;
    });

    let blob = new Blob([text], { type: "text/plain" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = a.name + ".txt";
    link.click();
}

renderAccounts();
