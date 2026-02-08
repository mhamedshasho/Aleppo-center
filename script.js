let payments = [];
let balance = 0;

function addPayment() {
    const date = date.value;
    const details = document.getElementById("details").value;
    const amount = Number(document.getElementById("amount").value);
    const type = document.getElementById("type").value;
    const currency = document.getElementById("currency").value;

    if (!date || !amount) return alert("أدخل البيانات");

    payments.push({ date, details, amount, type, currency });
    renderTable();
}

function deletePayment(index) {
    payments.splice(index, 1);
    renderTable();
}

function renderTable() {
    const body = document.getElementById("tableBody");
    body.innerHTML = "";

    let totalDebit = 0;
    let totalCredit = 0;
    balance = 0;

    payments.forEach((p, i) => {
        let debit = 0;
        let credit = 0;

        if (p.type === "debit") {
            debit = p.amount;
            balance += p.amount;
            totalDebit += p.amount;
        } else {
            credit = p.amount;
            balance -= p.amount;
            totalCredit += p.amount;
        }

        const row = `
            <tr>
                <td>${p.date}</td>
                <td>${p.details}</td>
                <td>${debit || ""}</td>
                <td>${credit || ""}</td>
                <td>${balance}</td>
                <td><button class="delete-btn" onclick="deletePayment(${i})">✕</button></td>
            </tr>
        `;
        body.innerHTML += row;
    });

    document.getElementById("totalDebit").innerText = totalDebit;
    document.getElementById("totalCredit").innerText = totalCredit;
    document.getElementById("finalBalance").innerText =
        "الرصيد الإجمالي: " + balance;
}
