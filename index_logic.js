import { doc, getDoc, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

let db;
export function initIndexManager(firestoreDb) {
    db = firestoreDb;
    loadLiveNotifications();
}

async function loadLiveNotifications() {
    const noticeContainer = document.getElementById('live-notice-board');
    if (!noticeContainer) return;
    noticeContainer.innerHTML = "<p>नवीनतम अपडेट लोड हो रहे हैं...</p>";
    try {
        const querySnapshot = await getDocs(collection(db, "notifications"));
        if (querySnapshot.empty) {
            noticeContainer.innerHTML = "<p>अभी कोई नया फॉर्म लाइव नहीं है।</p>";
            return;
        }
        noticeContainer.innerHTML = "";
        querySnapshot.forEach((documentSnap) => {
            const data = documentSnap.data();
            const card = document.createElement('div');
            card.className = 'notice-card';
            card.innerHTML = `
                <h3>📢 ${data.title}</h3>
                <p><strong>डॉक्यूमेंट लिस्ट:</strong> ${data.docs || 'N/A'}</p>
                <div style="display:flex; justify-content:space-between; margin-top:10px; font-size:13px;">
                    <span><b>शुरू तिथि:</b> ${data.start || 'N/A'}</span>
                    <span style="color:#dc3545;"><b>अंतिम तिथि:</b> ${data.last || 'N/A'}</span>
                </div>`;
            noticeContainer.appendChild(card);
        });
    } catch (e) { noticeContainer.innerHTML = "<p>डेटा लोड करने में समस्या आई।</p>"; }
}

export async function bookCustomerAppointment(userId, userName) {
    const date = document.getElementById('apt-date').value;
    const time = document.getElementById('apt-time').value;
    if (!date || !time) return alert("कृपया स्लॉट विवरण पूरा चुनें!");
    try {
        const statusSnap = await getDoc(doc(db, "system", "status"));
        if (statusSnap.exists() && statusSnap.data().booking_allowed === false) {
            return alert("🛑 असुविधा के लिए खेद है! प्रीतम भैया अभी उपलब्ध नहीं हैं। अपॉइंटमेंट स्लॉट ब्लॉक हैं।");
        }
        await addDoc(collection(db, "appointments"), { userId, customerName: userName, date, time, status: "Pending", timestamp: new Date() });
        alert("🎉 अपॉइंटमेंट सबमिट हो गया! प्रीतम भैया के अप्रूवल का इंतज़ार करें।");
    } catch (e) { alert("त्रुटि: " + e.message); }
}