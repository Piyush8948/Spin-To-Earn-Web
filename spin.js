// Prize configuration with probabilities
const prizes = [
    { value: 0.5, probability: 0.40 },
    { value: 1.0, probability: 0.30 },
    { value: 1.5, probability: 0.15 },
    { value: 2.0, probability: 0.10 },
    { value: 2.5, probability: 0.05 }
];

// DOM Elements
const spinBtn = document.getElementById('spinBtn');
const winningPopup = document.getElementById('winningPopup');
const winAmount = document.getElementById('winAmount');
const closePopup = document.getElementById('closePopup');
const spinsLeft = document.getElementById('spinsLeft');
const totalEarnings = document.getElementById('totalEarnings');
const watchAdBtn = document.getElementById('watchAdBtn');

// Game state
let userData = {
    dailySpins: 5,
    dailyEarnings: 0,
    totalEarnings: 0
};

// Initialize AdMob (replace with your AdMob configuration)
let rewardedAd = null;
function initializeAds() {
    // Initialize your ad network here
    // Example: AdMob initialization code
}

// Load user data from Firebase
async function loadUserData() {
    if (!currentUser) return;
    
    const userRef = db.collection('users').doc(currentUser.uid);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
        userData = userDoc.data();
        updateDisplays();
    }
}

// Update displays
function updateDisplays() {
    spinsLeft.textContent = userData.dailySpins;
    totalEarnings.textContent = userData.dailyEarnings.toFixed(2);
    
    // Show/hide watch ad button
    if (userData.dailySpins <= 0) {
        spinBtn.style.display = 'none';
        watchAdBtn.style.display = 'block';
    } else {
        spinBtn.style.display = 'block';
        watchAdBtn.style.display = 'none';
    }
    
    // Disable spin if daily limit reached
    if (userData.dailyEarnings >= 10) {
        spinBtn.disabled = true;
        watchAdBtn.disabled = true;
        alert('You have reached your earning limit for today. Come back tomorrow!');
    }
}

// Get random prize based on probabilities
function getRandomPrize() {
    const random = Math.random();
    let cumulativeProbability = 0;
    
    for (const prize of prizes) {
        cumulativeProbability += prize.probability;
        if (random <= cumulativeProbability) {
            return prize.value;
        }
    }
    return prizes[0].value; // Fallback to lowest prize
}

// Update Firebase with new data
async function updateUserData(updates) {
    if (!currentUser) return;
    
    const userRef = db.collection('users').doc(currentUser.uid);
    await userRef.update(updates);
    Object.assign(userData, updates);
    updateDisplays();
}

// Spin function
async function spin() {
    if (!currentUser) {
        alert('Please login to spin!');
        return;
    }
    
    if (userData.dailyEarnings >= 10) {
        alert('You have reached your earning limit for today. Come back tomorrow!');
        return;
    }
    
    if (userData.dailySpins <= 0) {
        alert('Watch an ad to get more spins!');
        return;
    }
    
    spinBtn.disabled = true;
    
    // Simulate spinning
    setTimeout(async () => {
        const prize = getRandomPrize();
        const newEarnings = userData.dailyEarnings + prize;
        
        if (newEarnings > 10) {
            alert('This spin would exceed your daily limit. Try again tomorrow!');
            spinBtn.disabled = false;
            return;
        }
        
        // Update Firebase
        await updateUserData({
            dailySpins: userData.dailySpins - 1,
            dailyEarnings: newEarnings,
            totalEarnings: userData.totalEarnings + prize
        });
        
        // Show winning popup
        winAmount.textContent = prize.toFixed(2);
        winningPopup.style.display = 'flex';
        
        spinBtn.disabled = false;
    }, 1000);
}

// Watch ad for more spins
async function watchAd() {
    if (!currentUser) {
        alert('Please login to watch ads!');
        return;
    }
    
    // Show ad
    // Replace with your actual ad implementation
    try {
        // Simulate ad watching
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Reward user with one spin
        await updateUserData({
            dailySpins: userData.dailySpins + 1
        });
        
        alert('You got 1 free spin!');
    } catch (error) {
        alert('Failed to load ad. Please try again later.');
    }
}

// Close popup
function closeWinningPopup() {
    winningPopup.style.display = 'none';
}

// Event Listeners
spinBtn.addEventListener('click', spin);
watchAdBtn.addEventListener('click', watchAd);
closePopup.addEventListener('click', closeWinningPopup);

// Initialize
initializeAds();
loadUserData(); 