import { doc, getDoc, collection, addDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { calculateLiveStats } from "./dashboard.js";

let db;
export function initLedgerManager(firestoreDb) { db = firestoreDb; }

export async function updateCustomerLedger() {
    const uid = document.getElementById('cust-uid').value.trim();
    const work = document.getElementById('work-title').value.trim();
    const total = Number(document.getElementById('total-amt').value);
    const paid = Number(document.getElementById('paid-amt').value);
    const fileLink = document.getElementById('cust-file-link').value.trim();
    
    if(!uid || !work) return alert("UID और विवरण अनिवार्य है!");
    const dueCalculated = total - paid;
    const today = new Date().toLocaleDateString('hi-IN');
    try {
        const custRef = doc(db, "customers", uid); const custSnap = await getDoc(custRef);
        if(custSnap.exists()) {
            const custName = custSnap.data().name;
            const finalDue = (custSnap.data().total_due || 0) + dueCalculated;
            await updateDoc(custRef, { total_due: finalDue });
            await addDoc(collection(db, "transactions"), { userId: uid, customerName: custName, workTitle: work, totalAmount: total, paidAmount: paid, dueAmount: dueCalculated, fileLink: fileLink, date: today, timestamp: new Date() });
            
            document.getElementById('rcpt-date').innerText = today;
            document.getElementById('rcpt-name').innerText = custName;
            document.getElementById('rcpt-work').innerText = work;
            document.getElementById('rcpt-total').innerText = total;
            document.getElementById('rcpt-paid').innerText = paid;
            document.getElementById('rcpt-due').innerText = dueCalculated;
            document.getElementById('rcpt-market-due').innerText = finalDue;
            document.getElementById('receipt-modal').classList.remove('hidden');
            alert("खाता अपडेट हो गया!");
            
            document.getElementById('cust-uid').value = ""; document.getElementById('work-title').value = ""; document.getElementById('total-amt').value = ""; document.getElementById('paid-amt').value = ""; document.getElementById('cust-file-link').value = "";
            calculateLiveStats();
        } else { alert("UID अमान्य है!"); }
    } catch (e) { alert(e.message); }
}

export async function addShopExpense() {
    const title = document.getElementById('exp-title').value.trim();
    const amt = Number(document.getElementById('exp-amt').value);
    const today = new Date().toLocaleDateString('hi-IN');
    if(!title || !amt) return alert("विवरण और राशि दर्ज करें!");
    try {
        await addDoc(collection(db, "expenses"), { title: title, amount: amt, date: today, timestamp: new Date() });
        alert("खर्च दर्ज हुआ!");
        document.getElementById('exp-title').value = ""; document.getElementById('exp-amt').value = "";
        calculateLiveStats();
    } catch (e) { alert(e.message); }
}