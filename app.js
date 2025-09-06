// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZQRlDcJKsxhcskJ2mCboLrToJR8XzlAQ",
  authDomain: "alfahosp-c92d4.firebaseapp.com",
  projectId: "alfahosp-c92d4",
  storageBucket: "alfahosp-c92d4.firebasestorage.app",
  messagingSenderId: "784505611670",
  appId: "1:784505611670:web:d77f333f96c7b6b860a9b7"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// DOM Elements
const loginNav = document.getElementById('login-nav');
const mainContent = document.getElementById('main-content');

const loginContainer = document.getElementById('login-container');
const signupContainer = document.getElementById('signup-container');
const dashboard = document.getElementById('dashboard');
const dashboardContent = document.getElementById('dashboard-content');

const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

const googleLoginBtn = document.getElementById('google-login');
const logoutButton = document.getElementById('logout-button');

const showSignup = document.getElementById('show-signup');
const showLogin = document.getElementById('show-login');

const userProfileImg = document.getElementById('user-profile-img');
const profileModal = document.getElementById('profile-modal');
const modalContentDetails = document.getElementById('modal-content-details');
const closeModalBtn = document.querySelector('.close-button');


// UI Toggling
const showLoginPage = () => {
    loginContainer.style.display = 'block';
    signupContainer.style.display = 'none';
    mainContent.style.display = 'none';
    dashboard.style.display = 'none';
};

const showSignupPage = () => {
    loginContainer.style.display = 'none';
    signupContainer.style.display = 'block';
};

loginNav.addEventListener('click', (e) => {
    e.preventDefault();
    showLoginPage();
});

showSignup.addEventListener('click', (e) => {
    e.preventDefault();
    showSignupPage();
});

showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    showLoginPage();
});

// Modal Logic
const openModal = (userData) => {
    modalContentDetails.innerHTML = `
        <p><strong>Email:</strong> ${userData.email || 'N/A'}</p>
        <p><strong>Phone:</strong> ${userData.phone || 'N/A'}</p>
        <p><strong>Age:</strong> ${userData.age || 'N/A'}</p>
        <p><strong>Date of Birth:</strong> ${userData.dob || 'N/A'}</p>
        <p><strong>Address:</strong> ${userData.address || 'N/A'}</p>
    `;
    profileModal.style.display = 'block';
};

closeModalBtn.addEventListener('click', () => {
    profileModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target == profileModal) {
        profileModal.style.display = 'none';
    }
});


// Firebase Auth Listener
auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in.
        db.collection('users').doc(user.uid).get().then(doc => {
            const userData = doc.data() || {};
            // Setup Dashboard
            dashboardContent.innerHTML = `
                <h3>Welcome, ${user.displayName || userData.email}!</h3>
                <p><strong>Email:</strong> ${userData.email || 'N/A'}</p>
                <p><strong>Phone:</strong> ${userData.phone || 'N/A'}</p>
                <p><strong>Age:</strong> ${userData.age || 'N/A'}</p>
                <p><strong>Date of Birth:</strong> ${userData.dob || 'N/A'}</p>
                <p><strong>Address:</strong> ${userData.address || 'N/A'}</p>
            `;

            // Setup Profile Image and Modal
            if (user.photoURL) {
                userProfileImg.src = user.photoURL;
                userProfileImg.style.display = 'inline';
                userProfileImg.onclick = () => openModal(userData);
            } else {
                userProfileImg.style.display = 'none';
            }
        });

        mainContent.style.display = 'none';
        loginContainer.style.display = 'none';
        signupContainer.style.display = 'none';
        dashboard.style.display = 'block';
        logoutButton.style.display = 'inline';
        loginNav.style.display = 'none';

    } else {
        // User is signed out.
        mainContent.style.display = 'block';
        dashboard.style.display = 'none';
        logoutButton.style.display = 'none';
        userProfileImg.style.display = 'none';
        loginNav.style.display = 'inline';
        loginContainer.style.display = 'none';
        signupContainer.style.display = 'none';
    }
});

// Sign-up Logic
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = signupForm['signup-email'].value;
    const password = signupForm['signup-password'].value;
    const phone = signupForm['signup-phone'].value;
    const age = signupForm['signup-age'].value;
    const dob = signupForm['signup-dob'].value;
    const address = signupForm['signup-address'].value;

    auth.createUserWithEmailAndPassword(email, password)
        .then(cred => {
            return db.collection('users').doc(cred.user.uid).set({
                phone, age, dob, address, email
            });
        })
        .then(() => {
            signupForm.reset();
        })
        .catch(err => {
            alert(err.message);
        });
});

// Login Logic
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = loginForm['login-email'].value;
    const password = loginForm['login-password'].value;

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            loginForm.reset();
        })
        .catch(err => {
            alert(err.message);
        });
});

// Google Sign-in Logic
googleLoginBtn.addEventListener('click', () => {
    auth.signInWithPopup(googleProvider)
        .then(cred => {
            if (cred.additionalUserInfo.isNewUser) {
                return db.collection('users').doc(cred.user.uid).set({
                    email: cred.user.email,
                    // Note: other details are not collected in Google sign-up
                });
            }
        })
        .catch(err => {
            alert(err.message);
        });
});


// Logout Logic
logoutButton.addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut();
});
