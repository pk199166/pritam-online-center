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

// 📢 1. लाइव नोटिफिकेशन लोड करना (डेटाबेस से)
async function loadLiveAnnouncement() {
    try {
        const q = query(collection(db, "notifications"), orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        const noticeDiv = document.getElementById("live-announcement");
        
        if (!snapshot.empty && noticeDiv) {
            const latestNotice = snapshot.docs[0].data();
            noticeDiv.innerText = "📢 " + (latestNotice.text || "दुकान खुली है, आप अपना काम करवा सकते हैं।");
        }
    } catch (e) {
        console.error("नोटिफिकेशन लोड एरर: ", e);
    }
}

// 🔍 2. ग्राहक सर्च फंक्शन
async function searchCustomerHistory() {
    const queryText = document.getElementById('cust-search-query').value.trim();
    const resultsArea = document.getElementById('search-results-area');
    const historyList = document.getElementById('history-list');

    if (!queryText) {
        alert("कृपया अपना नाम या मोबाइल नंबर दर्ज करें!");
        return;
    }

    historyList.innerHTML = "<p style='color:#666; font-size:14px;'>खोज जा रहा है, कृपया प्रतीक्षा करें...</p>";
    resultsArea.style.display = "block";

    try {
        const txRef = collection(db, "transactions");
        const q = query(txRef, orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        let found = false;
        historyList.innerHTML = "";

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const cName = (data.customerName || "").toLowerCase();
            const cPhone = String(data.customerPhone || "");
            const searchLower = queryText.toLowerCase();

            if (cName.includes(searchLower) || cPhone.includes(searchLower)) {
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
                    <p style="margin-top:4px;">
                        कुल चार्ज: <b>₹${data.totalAmount || 0}</b> | 
                        जमा: <span style="color:green;"><b>₹${data.paidAmount || 0}</b></span> | 
                        बाकी: <span style="color:red;"><b>₹${due}</b></span>
                    </p>
                `;
                historyList.appendChild(item);
            }
        });

        if (!found) {
            historyList.innerHTML = "<p style='color:red; font-size:14px;'>❌ कोई रिकॉर्ड नहीं मिला। कृपया सही नाम या नंबर डालें।</p>";
        }

    } catch (error) {
        console.error("सर्च एरर: ", error);
        historyList.innerHTML = "<p style='color:red; font-size:14px;'>⚠️ सर्वर से कनेक्ट करने में समस्या आई।</p>";
    }
}

// 🔄 3. इवेंट लिसनर्स चालू करना
document.addEventListener("DOMContentLoaded", () => {
    loadLiveAnnouncement();

    const searchBtn = document.getElementById('btn-cust-search');
    if (searchBtn) searchBtn.addEventListener('click', searchCustomerHistory);
    
    const searchInput = document.getElementById('cust-search-query');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchCustomerHistory();
        });
    }

    // 📅 अपॉइंटमेंट बटन का असली एक्शन (अगर आपके पास appointment.html फ़ाइल है)
    const bookingBtn = document.getElementById('booking-btn');
    if (bookingBtn) {
        bookingBtn.setAttribute("href", "appointment.html"); // इसे सीधे बुकिंग पेज से जोड़ दिया
    }
});