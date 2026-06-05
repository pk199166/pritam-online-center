import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

let db;
export function initDashboardManager(firestoreDb) { db = firestoreDb; }

export async function calculateLiveStats() {
    try {
        const todayStr = new Date().toLocaleDateString('hi-IN');
        const trxSnapshot = await getDocs(collection(db, "transactions"));
        let todayCash = 0;
        let totalMarketDue = 0;

        trxSnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.date === todayStr) todayCash += Number(data.paidAmount || 0);
        });

        const custSnapshot = await getDocs(collection(db, "customers"));
        custSnapshot.forEach((doc) => {
            totalMarketDue += Number(doc.data().total_due || 0);
        });

        const aptSnapshot = await getDocs(query(collection(db, "appointments"), where("status", "==", "Pending")));
        
        document.getElementById('stat-today-cash').innerText = `₹${todayCash}`;
        document.getElementById('stat-total-due').innerText = `₹${totalMarketDue}`;
        document.getElementById('stat-pending-apt').innerText = aptSnapshot.size;
    } catch (e) { console.log(e.message); }
}