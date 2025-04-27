import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc, query, where, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBlJ00qFF3jS5WgBwkRCVqMZGsdaTYjRY0",
    authDomain: "spin-to-earn-680bf.firebaseapp.com",
    projectId: "spin-to-earn-680bf",
    storageBucket: "spin-to-earn-680bf.firebaseapp.com",
    messagingSenderId: "130933785553",
    appId: "1:130933785553:web:26953bbed617ba594e16f0",
    measurementId: "G-1ZW8CMEC98"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const loginBtn2 = document.getElementById('loginBtn2');
const logoutBtn = document.getElementById('logoutBtn');
const userSection = document.getElementById('userSection');
const dashboard = document.getElementById('dashboard');
const spinBtn = document.getElementById('spinBtn');
const withdrawBtn = document.getElementById('withdrawBtn');
const userPhoto = document.getElementById('userPhoto');
const userName = document.getElementById('userName');
const userBalance = document.getElementById('userBalance');
const todayEarnings = document.getElementById('todayEarnings');
const totalEarnings = document.getElementById('totalEarnings');
const spinsLeft = document.getElementById('spinsLeft');
const earningsProgress = document.getElementById('earningsProgress');
const spinHistory = document.getElementById('spinHistory');
const wheelCanvas = document.getElementById('wheelCanvas');
const wheelCanvas2 = document.getElementById('wheelCanvas2');
const dashboardPhoto = document.getElementById('dashboardPhoto');
const dashboardName = document.getElementById('dashboardName');
const dashboardEmail = document.getElementById('dashboardEmail');

// Wheel configuration
const wheelConfig = {
    segments: [1, 2, 5, 1, 2, 10, 1, 5],
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB']
};

let isSpinning = false;
let currentUser = null;
let ctx = wheelCanvas.getContext('2d');
let ctx2 = wheelCanvas2.getContext('2d');
let dailySpins = 3;

// Set canvas size
function resizeCanvas() {
    const size = Math.min(window.innerWidth * 0.8, 500);
    wheelCanvas.width = size;
    wheelCanvas.height = size;
    wheelCanvas2.width = size;
    wheelCanvas2.height = size;
    drawWheel();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Google Login Function
async function handleGoogleLogin() {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        // Create or update user document in Firestore
        const userDoc = doc(db, 'users', user.uid);
        const userData = await getDoc(userDoc);
        
        if (!userData.exists()) {
            // New user
            await setDoc(userDoc, {
                name: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                balance: 0,
                todayEarnings: 0,
                spinsLeft: 5,
                lastSpinDate: new Date().toISOString().split('T')[0]
            });
        } else {
            // Existing user - check if it's a new day
            const lastSpinDate = userData.data().lastSpinDate;
            const today = new Date().toISOString().split('T')[0];
            
            if (lastSpinDate !== today) {
                await updateDoc(userDoc, {
                    spinsLeft: 5,
                    todayEarnings: 0,
                    lastSpinDate: today
                });
            }
        }
        
        updateUI(user);
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    }
}

// Add click event listeners to both login buttons
loginBtn.addEventListener('click', handleGoogleLogin);
loginBtn2.addEventListener('click', handleGoogleLogin);

// Logout
logoutBtn.addEventListener('click', () => {
    signOut(auth);
});

// Auth State Change Listener
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        showUserInterface(user);
        updateUserStats();
    } else {
        currentUser = null;
        hideUserInterface();
    }
});

// Show user interface after login
function showUserInterface(user) {
    loginBtn.classList.add('hidden');
    loginBtn2.classList.add('hidden');
    userSection.classList.remove('hidden');
    dashboard.classList.remove('hidden');
    
    userPhoto.src = user.photoURL;
    dashboardPhoto.src = user.photoURL;
    userName.textContent = user.displayName;
    dashboardName.textContent = user.displayName;
    dashboardEmail.textContent = user.email;

    // Scroll to dashboard
    dashboard.scrollIntoView({ behavior: 'smooth' });
}

// Hide user interface after logout
function hideUserInterface() {
    loginBtn.classList.remove('hidden');
    loginBtn2.classList.remove('hidden');
    userSection.classList.add('hidden');
    dashboard.classList.add('hidden');
}

// Update UI with user data
async function updateUI(user) {
    try {
        const userDoc = doc(db, 'users', user.uid);
        const userData = await getDoc(userDoc);
        
        if (userData.exists()) {
            const data = userData.data();
            
            // Update navigation
            userPhoto.src = user.photoURL;
            userName.textContent = user.displayName;
            userBalance.textContent = data.balance.toFixed(2);
            userSection.classList.remove('hidden');
            loginBtn.classList.add('hidden');
            
            // Update dashboard
            dashboardPhoto.src = user.photoURL;
            dashboardName.textContent = user.displayName;
            dashboardEmail.textContent = user.email;
            todayEarnings.textContent = data.todayEarnings.toFixed(2);
            totalEarnings.textContent = data.balance.toFixed(2);
            spinsLeft.textContent = data.spinsLeft;
            
            // Update progress bar
            const progress = (data.todayEarnings / 10) * 100;
            earningsProgress.style.width = `${progress}%`;
            
            // Update withdraw button
            withdrawBtn.disabled = data.balance < 10;
            
            // Show dashboard
            dashboard.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error updating UI:', error);
    }
}

// Update user stats from Firestore
async function updateUserStats() {
    if (!currentUser) return;

    const userRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    userBalance.textContent = userData.balance;
    totalEarnings.textContent = userData.totalEarnings || 0;
    todayEarnings.textContent = userData.todayEarnings || 0;
    withdrawBtn.disabled = userData.balance < 10;

    // Update progress bar
    const progress = (userData.todayEarnings / 10) * 100;
    earningsProgress.style.width = `${Math.min(progress, 100)}%`;

    // Reset daily earnings and spins if it's a new day
    const lastSpinDate = userData.lastSpinDate ? userData.lastSpinDate.toDate() : null;
    if (lastSpinDate && !isSameDay(lastSpinDate, new Date())) {
        await updateDoc(userRef, {
            todayEarnings: 0,
            dailySpins: 3
        });
        todayEarnings.textContent = '0';
        dailySpins = 3;
    } else {
        dailySpins = userData.dailySpins || 3;
    }

    spinsLeft.textContent = dailySpins;
    spinBtn.disabled = dailySpins <= 0 || userData.todayEarnings >= 10;

    updateSpinHistory();
}

// Check if two dates are the same day
function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

// Draw the wheel
function drawWheel() {
    const centerX = wheelCanvas.width / 2;
    const centerY = wheelCanvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    const segments = wheelConfig.segments;
    const segmentAngle = (Math.PI * 2) / segments.length;

    // Draw on both canvases
    [ctx, ctx2].forEach(context => {
        context.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);

        // Draw segments
        segments.forEach((value, index) => {
            context.beginPath();
            context.fillStyle = wheelConfig.colors[index];
            context.moveTo(centerX, centerY);
            context.arc(centerX, centerY, radius, index * segmentAngle, (index + 1) * segmentAngle);
            context.lineTo(centerX, centerY);
            context.fill();
            context.stroke();

            // Draw text
            context.save();
            context.translate(centerX, centerY);
            context.rotate(index * segmentAngle + segmentAngle / 2);
            context.textAlign = 'right';
            context.fillStyle = '#fff';
            context.font = 'bold 20px Poppins';
            context.fillText(`₹${value}`, radius - 20, 5);
            context.restore();
        });
    });
}

// Spin the wheel
async function spinWheel() {
    if (isSpinning || !currentUser) return;

    const userRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    // Check daily limit
    if (userData.todayEarnings >= 10) {
        showNotification('You have reached your daily earning limit. Come back tomorrow!', 'error');
        return;
    }

    if (dailySpins <= 0) {
        showNotification('No spins left for today!', 'error');
        return;
    }

    isSpinning = true;
    spinBtn.disabled = true;

    // Random rotation (3-5 full spins + random segment)
    const spinDegrees = 1080 + Math.random() * 720;
    const finalRotation = spinDegrees * Math.PI / 180;
    
    // Determine winning segment
    const segments = wheelConfig.segments;
    const segmentAngle = (Math.PI * 2) / segments.length;
    const winningIndex = Math.floor((finalRotation % (Math.PI * 2)) / segmentAngle);
    const winAmount = segments[winningIndex];

    // Animate spin
    let currentRotation = 0;
    const spinSpeed = 0.1;
    
    function animate() {
        currentRotation += spinSpeed;
        [ctx, ctx2].forEach(context => {
            context.save();
            context.translate(wheelCanvas.width / 2, wheelCanvas.height / 2);
            context.rotate(currentRotation);
            context.translate(-wheelCanvas.width / 2, -wheelCanvas.height / 2);
            drawWheel();
            context.restore();
        });

        if (currentRotation < finalRotation) {
            requestAnimationFrame(animate);
        } else {
            isSpinning = false;
            handleWin(winAmount);
        }
    }

    animate();
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } transform translate-x-full transition-transform duration-300`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);

    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Handle win
async function handleWin(amount) {
    if (!currentUser) return;

    const userRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    // Calculate new values
    const newBalance = userData.balance + amount;
    const newTodayEarnings = (userData.todayEarnings || 0) + amount;
    const newTotalEarnings = (userData.totalEarnings || 0) + amount;
    const newDailySpins = dailySpins - 1;

    // Update user data
    await updateDoc(userRef, {
        balance: newBalance,
        todayEarnings: newTodayEarnings,
        totalEarnings: newTotalEarnings,
        lastSpinDate: new Date(),
        dailySpins: newDailySpins
    });

    // Add to spin history
    await addDoc(collection(db, 'spinHistory'), {
        userId: currentUser.uid,
        amount: amount,
        timestamp: new Date()
    });

    // Update UI
    updateUserStats();
    showNotification(`Congratulations! You won ₹${amount}!`);
}

// Update spin history
async function updateSpinHistory() {
    if (!currentUser) return;

    const historyQuery = query(
        collection(db, 'spinHistory'),
        where('userId', '==', currentUser.uid),
        orderBy('timestamp', 'desc'),
        limit(10)
    );

    const querySnapshot = await getDocs(historyQuery);
    spinHistory.innerHTML = '';

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const date = data.timestamp.toDate();
        const historyItem = document.createElement('div');
        historyItem.className = 'flex justify-between items-center p-3 bg-gray-50 rounded-lg';
        historyItem.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <span class="text-white font-bold">₹</span>
                </div>
                <div>
                    <p class="font-medium">₹${data.amount}</p>
                    <p class="text-sm text-gray-500">${date.toLocaleDateString()} ${date.toLocaleTimeString()}</p>
                </div>
            </div>
            <span class="text-green-500 font-semibold">+₹${data.amount}</span>
        `;
        spinHistory.appendChild(historyItem);
    });
}

// Handle withdrawal request
withdrawBtn.addEventListener('click', async () => {
    if (!currentUser) return;

    const userRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    if (userData.balance < 10) {
        showNotification('Minimum withdrawal amount is ₹10', 'error');
        return;
    }

    // Create withdrawal request
    await addDoc(collection(db, 'withdrawalRequests'), {
        userId: currentUser.uid,
        amount: userData.balance,
        status: 'pending',
        timestamp: new Date(),
        userEmail: currentUser.email
    });

    // Reset user balance
    await updateDoc(userRef, {
        balance: 0
    });

    showNotification('Withdrawal request submitted successfully! We will process it soon.');
    updateUserStats();
});

// Initialize wheel
drawWheel();

// Add continuous spinning animation for hero section wheel
let heroWheelRotation = 0;
const heroSpinSpeed = 0.01;

function animateHeroWheel() {
    heroWheelRotation += heroSpinSpeed;
    ctx.save();
    ctx.translate(wheelCanvas.width / 2, wheelCanvas.height / 2);
    ctx.rotate(heroWheelRotation);
    ctx.translate(-wheelCanvas.width / 2, -wheelCanvas.height / 2);
    drawWheel();
    ctx.restore();
    requestAnimationFrame(animateHeroWheel);
}

// Start the hero wheel animation
animateHeroWheel();

// Spin button click handler
spinBtn.addEventListener('click', spinWheel);

// Initialize AdSense
(adsbygoogle = window.adsbygoogle || []).push({}); 