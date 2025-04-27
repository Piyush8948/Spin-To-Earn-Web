# Spin to Earn - Win Real Money

A responsive web application where users can spin a wheel to earn real money. Built with HTML, CSS, and JavaScript, integrated with Firebase Authentication and Firestore Database.

## Features

- Google Authentication
- Responsive design that works on all devices
- Beautiful spinning wheel animation
- Daily earning limit of ₹10 per user
- Withdrawal system (minimum ₹10)
- Spin history tracking
- Google AdSense integration for monetization

## Setup

1. Clone this repository
2. Firebase configuration is already set up in the code
3. Set up Google AdSense:
   - Replace `YOUR_ADSENSE_ID` in `index.html` with your actual AdSense publisher ID
   - Replace `YOUR_AD_SLOT` with your actual ad slot ID

## Usage

1. Open `index.html` in a web browser
2. Log in with your Google account
3. Spin the wheel to win money (₹1 to ₹10 per spin)
4. Track your earnings in real-time
5. Request withdrawal when balance reaches ₹10 or more

## Technical Details

- Firebase Authentication for Google sign-in
- Firestore Database for storing user data, spin history, and withdrawal requests
- Canvas API for wheel animation
- Responsive CSS with media queries
- Modern JavaScript (ES6+) with async/await

## Database Structure

### Collections:

1. `users`
   - User profile information
   - Balance
   - Daily earnings tracking
   - Last spin timestamp

2. `spinHistory`
   - Spin records
   - Timestamps
   - Amounts won

3. `withdrawalRequests`
   - Pending withdrawal requests
   - User information
   - Amount requested

## Security Rules

Make sure to set up appropriate Firebase security rules to protect user data and prevent abuse.

## License

MIT License - Feel free to use this code for your own projects.

## Support

For any issues or questions, please open an issue in the repository. 