import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCnB1JHi8K1TZtUk-SQ9r4pzYik_PLwqyQ",
    authDomain: "pritam-online-center.firebaseapp.com",
    projectId: "pritam-online-center",
    storageBucket: "pritam-online-center.firebasestorage.app",
    messagingSenderId: "310541912344",
    appId: "1:310541912344:web:3f05beef1626edfe2f766d",
    measurementId: "G-T87S6TXHR6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🔍 ग्राहक सर्च फंक्शन (नाम, मोबाइल या POC आईडी तीनों से काम करेगा)
async function searchCustomerHistory() {
    const queryText = document.getElementById('cust-search-query').value.trim().toLowerCase();
    const resultsArea = document.getElementById('search-results-area');
    const historyList = document.getElementById('history-list');

    if (!queryText) {
        alert("कृपया अपना नाम, मोबाइल नंबर या कस्टमर आईडी दर्ज करें!");
        return;
    }

    historyList.innerHTML = "<p style='color:#666; font-size:14px;'>खोज जा रहा है...</p>";
    resultsArea.style.display = "block";

    try {
        const q = query(collection(db, "transactions"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        let found = false;
        historyList.innerHTML = "";

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const cID = (data.customerID || "").toLowerCase();
            const cName = (data.customerName || "").toLowerCase();
            const cPhone = String(data.customerPhone || "");

            // आईडी, नाम या फोन नंबर में से कुछ भी मैच होने पर
            if (cID.includes(queryText) || cName.includes(queryText) || cPhone.includes(queryText)) {
                if(!found) {
                    // पहली बार मैच होने पर ऊपर कस्टमर की परमानेंट आईडी दिखाएं
                    historyList.innerHTML += `<div style='background:#f1f5f9; padding:6px 10px; border-radius:6px; margin-bottom:10px; font-size:13px; color:#475569;'><b>🆔 आपकी ग्राहक आईडी: ${data.customerID || 'N/A'}</b></div>`;
                }
                found = true;
                
                const item = document.createElement('div');
                item.className = "history-item";
                
                const due = data.dueAmount || 0;
                const statusText = due === 0 ? "✅ पूरा हुआ" : "⏳ उधारी बाकी";
                const statusClass = due === 0 ? "status-done" : "status-pending";

                item.innerHTML = `
                    <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                        <b>🛠️ ${data.workTitle || 'ऑनलाइन काम'}</b>
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </div>
                    <p style="color:#555; font-size:13px;">तारीख: ${data.date || '-'}</p>
                    <p style="margin-top:4px; font-size:13px;">
                        कुल चार्ज: <b>₹${data.totalAmount || 0}</b> | 
                        जमा: <span style="color:green;"><b>₹${data.paidAmount || 0}</b></span> | 
                        बाकी: <span style="color:red;"><b>₹${due}</b></span>
                    </p>
                `;
                historyList.appendChild(item);
            }
        });

        if (!found) {
            historyList.innerHTML = "<p style='color:red; font-size:14px;'>❌ कोई रिकॉर्ड नहीं मिला। कृपया सही विवरण डालें।</p>";
        }

    } catch (error) {
        console.error(error);
        historyList.innerHTML = "<p style='color:red; font-size:14px;'>⚠️ डेटा लोड करने में त्रुटि आई।</p>";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const searchBtn = document.getElementById('btn-cust-search');
    if (searchBtn) searchBtn.addEventListener('click', searchCustomerHistory);
});