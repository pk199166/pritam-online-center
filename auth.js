import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

let auth;
const ADMIN_EMAIL = "pk199166@gmail.com";

export function initAuthManager(firebaseApp, onLoginSuccess, onLogoutSuccess) {
    auth = getAuth(firebaseApp);

    onAuthStateChanged(auth, (user) => {
        if (user && user.email.toLowerCase() === ADMIN_EMAIL) {
            document.getElementById('admin-login-box').classList.add('hidden');
            document.getElementById('admin-dashboard').classList.remove('hidden');
            onLoginSuccess();
        } else {
            document.getElementById('admin-login-box').classList.remove('hidden');
            document.getElementById('admin-dashboard').classList.add('hidden');
            onLogoutSuccess();
        }
    });
}

window.loginAdmin = function() {
    const email = document.getElementById('admin-email').value.trim().toLowerCase();
    const password = document.getElementById('admin-password').value.trim();
    if (email !== ADMIN_EMAIL) return alert("एक्सेस डिनाइड!");
    
    signInWithEmailAndPassword(auth, email, password).catch(err => { alert("त्रुटि: " + err.message); });
}

window.logoutAdmin = function() {
    if(confirm("क्या आप लॉगआउट करना चाहते हैं?")) signOut(auth);
}