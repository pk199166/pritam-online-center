import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { calculateLiveStats } from "./dashboard.js";

let db;
export function initAppointmentManager(firestoreDb) { db = firestoreDb; }

export async function getLiveShopBookingStatus(globalShopOpenStatusSetter) {
    try {
        const docSnap = await getDoc(doc(db, "system", "status"));
        const statusText = document.getElementById('current-shop-status-text');
        const toggleBtn = document.getElementById('btn-toggle-status');
        
        if(docSnap.exists() && docSnap.data().booking_allowed === false) {
            globalShopOpenStatusSetter(false);
            statusText.innerText = "🛑 स्लॉट बंद हैं"; statusText.className = "status-indicator status-closed";
            toggleBtn.innerText = "बुकिंग चालू करें 🟢"; toggleBtn.style.backgroundColor = "#28a745";
        } else {
            globalShopOpenStatusSetter(true);
            statusText.innerText = "🟢 स्लॉट खुले हैं"; statusText.className = "status-indicator status-open";
            toggleBtn.innerText = "स्लॉट ब्लॉक करें 🛑"; toggleBtn.style.backgroundColor = "#dc3545";
        }
    } catch(e) { console.log(e.message); }
}

export async function toggleShopBookingStatus(currentStatus, callback) {
    const nextStatus = !currentStatus;
    if(!confirm(nextStatus ? "क्या स्लॉट खोलने हैं?" : "क्या स्लॉट ब्लॉक करने हैं?")) return;
    try {
        await setDoc(doc(db, "system", "status"), { booking_allowed: nextStatus }, { merge: true });
        alert("अपडेट सफल!"); callback();
    } catch(e) { alert(e.message); }
}

export async function loadAdminAppointments() {
    const aptDiv = document.getElementById('admin-apt-list');
    if (!aptDiv) return; aptDiv.innerHTML = "लोड हो रहा है...";
    try {
        const querySnapshot = await getDocs(collection(db, "appointments"));
        if(querySnapshot.empty) { aptDiv.innerHTML = "<p>कोई रिक्वेस्ट नहीं है।</p>"; return; }
        aptDiv.innerHTML = "";
        querySnapshot.forEach(async (documentSnap) => {
            const data = documentSnap.data(); const aptId = documentSnap.id;
            const custSnap = await getDoc(doc(db, "customers", data.userId));
            const name = custSnap.exists() ? custSnap.data().name : "अज्ञात ग्राहक";
            const item = document.createElement('div');
            item.className = 'request-item';
            item.style.borderLeftColor = data.status === "Approved" ? "green" : (data.status === "Rejected" ? "red" : "orange");
            item.innerHTML = `<div><strong>ग्राहक:</strong> ${name}<br><strong>तारीख:</strong> ${data.date} | <strong>समय:</strong> ${data.time}<br><strong>स्टेटस:</strong> <b>${data.status}</b></div>
                <div>${data.status === "Pending" ? `<button class="btn-submit" style="width:auto; background:#28a745; padding:5px 10px; margin-bottom:2px;" onclick="changeAptStatus('${aptId}', 'Approved')">Approve ✅</button> <button class="btn-delete" style="width:auto; background:#dc3545; padding:5px 10px; margin:0;" onclick="changeAptStatus('${aptId}', 'Rejected')">Reject ❌</button>` : `<span style="color:#666; font-size:12px;">Done</span>`}</div>`;
            aptDiv.appendChild(item);
        });
    } catch (e) { aptDiv.innerHTML = "त्रुटि आई।"; }
}

export async function changeAptStatus(id, status) {
    try {
        await updateDoc(doc(db, "appointments", id), { status: status });
        alert("अपडेट हुआ!"); loadAdminAppointments(); calculateLiveStats();
    } catch (e) { alert(e.message); }
}