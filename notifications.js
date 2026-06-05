import { doc, collection, getDocs, addDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

let db;
export function initNotificationsManager(firestoreDb) { db = firestoreDb; }

export async function saveNotification() {
    const id = document.getElementById('edit-doc-id').value;
    const title = document.getElementById('notice-title').value.trim();
    const docs = document.getElementById('notice-docs').value.trim();
    const start = document.getElementById('notice-start').value.trim();
    const last = document.getElementById('notice-last').value.trim();
    if(!title) return alert("शीर्षक जरूरी है!");
    const noticeData = { title, docs, start, last, timestamp: new Date() };
    try {
        if(id) { await updateDoc(doc(db, "notifications", id), noticeData); alert("सूचना संशोधित हुई!"); }
        else { await addDoc(collection(db, "notifications"), noticeData); alert("सूचना लाइव हुई!"); }
        cancelEdit(); loadAdminNotifications();
    } catch(e) { alert(e.message); }
}

export async function loadAdminNotifications() {
    const listDiv = document.getElementById('admin-notice-list');
    if(!listDiv) return; listDiv.innerHTML = "लोड हो रहा है...";
    try {
        const querySnapshot = await getDocs(collection(db, "notifications"));
        listDiv.innerHTML = "";
        querySnapshot.forEach((documentSnap) => {
            const data = documentSnap.data(); const id = documentSnap.id;
            const item = document.createElement('div');
            item.className = 'adm-notice-item';
            item.innerHTML = `<div><strong>${data.title}</strong><br><small>लास्ट डेट: ${data.last || 'N/A'}</small></div>
                <div><button class="btn-edit" onclick="editNotice('${id}', '${data.title}', \`${data.docs || ''}\`, '${data.start || ''}', '${data.last || ''}')">Edit ✏></button> <button class="btn-delete" style="padding:5px 10px; font-size:12px;" onclick="deleteNotice('${id}')">Delete 🗑></button></div>`;
            listDiv.appendChild(item);
        });
    } catch(e) { listDiv.innerHTML = "त्रुटि आई।"; }
}

window.editNotice = function(id, title, docs, start, last) {
    document.getElementById('edit-doc-id').value = id; document.getElementById('notice-title').value = title; document.getElementById('notice-docs').value = docs; document.getElementById('notice-start').value = start; document.getElementById('notice-last').value = last;
    document.getElementById('form-action-title').innerText = "✏> नोटिफिकेशन एडिट करें"; document.getElementById('btn-save-notice').innerText = "बदलाव सेव करें"; document.getElementById('btn-cancel-edit').classList.remove('hidden');
}

export function cancelEdit() {
    document.getElementById('edit-doc-id').value = ""; document.getElementById('notice-title').value = ""; document.getElementById('notice-docs').value = ""; document.getElementById('notice-start').value = ""; document.getElementById('notice-last').value = "";
    document.getElementById('form-action-title').innerText = "📢 नया नोटिफिकेशन लाइव करें"; document.getElementById('btn-save-notice').innerText = "होमपेज पर लाइव करें"; document.getElementById('btn-cancel-edit').classList.add('hidden');
}

export async function deleteNotice(id) {
    if(!confirm("क्या डिलीट करना चाहते हैं?")) return;
    try { await deleteDoc(doc(db, "notifications", id)); alert("हटा दिया गया!"); loadAdminNotifications(); } catch(e) { alert(e.message); }
}