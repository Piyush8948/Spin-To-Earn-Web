// Firebase configuration
const firebaseConfig = {
    // Replace with your Firebase config
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// User state management
let currentUser = null;

// Initialize user state
auth.onAuthStateChanged((user) => {
    currentUser = user;
    if (user) {
        initializeUserData();
    }
});

// Initialize or reset user data
async function initializeUserData() {
    const userRef = db.collection('users').doc(currentUser.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
        // Create new user document
        await userRef.set({
            dailySpins: 5,
            dailyEarnings: 0,
            lastResetDate: new Date().toISOString().split('T')[0],
            totalEarnings: 0
        });
    } else {
        // Check if we need to reset daily values
        const userData = userDoc.data();
        const today = new Date().toISOString().split('T')[0];
        
        if (userData.lastResetDate !== today) {
            await userRef.update({
                dailySpins: 5,
                dailyEarnings: 0,
                lastResetDate: today
            });
        }
    }
} 