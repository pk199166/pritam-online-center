import { doc, collection, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

let db;
export function initCustomersManager(firestoreDb) { db = firestoreDb; }

export async function loadAllCustomers() {
    const reqDiv = document.getElementById('admin-requests-list');
    if(!reqDiv) return; reqDiv.innerHTML = "लोड हो रहा है...";
    try {
        const querySnapshot = await getDocs(collection(db, "customers"));
        reqDiv.innerHTML = "";
        querySnapshot.forEach((documentSnap) => {
            const data = documentSnap.data(); const uid = documentSnap.id;
            const isPending = data.status === "Pending";
            const item = document.createElement('div');
            item.className = 'request-item';
            item.style.backgroundColor = isPending ? '#fff3cd' : '#e8f5e9';
            item.innerHTML = `<div><strong>नाम:</strong> ${data.name} | <strong>मोबाइल:</strong> ${data.mobile}<br><small><b>UID:</b> ${uid}</small></div>
                <div>${isPending ? `<button class="btn-submit" style="width:auto; background:#28a745; padding:5px 10px;" onclick="changeUserStatus('${uid}', 'Approved')">Approve ✅</button>` : `<button class="btn-delete" style="width:auto; background:#dc3545; padding:5px 10px; margin:0;" onclick="changeUserStatus('${uid}', 'Pending')">Block ❌</button>`}</div>`;
            reqDiv.appendChild(item);
        });
    } catch (e) { reqDiv.innerHTML = "त्रुटि आई।"; }
}

export function changeUserStatus(uid, newStatus) {
    updateDoc(doc(db, "customers", uid), { status: newStatus }).then(() => { loadAllCustomers(); }).catch (e => { alert(e.message); });
}
window.changeUserStatus = changeUserStatus;