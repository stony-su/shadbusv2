// This script helps you enable Firebase Authentication
// You need to run this manually in the Firebase Console

console.log(`
🔥 FIREBASE AUTHENTICATION SETUP 🔥

To enable Firebase Authentication, please follow these steps:

1. Go to: https://console.firebase.google.com/project/shadbus/authentication

2. Click "Get started" if you haven't already

3. Go to the "Sign-in method" tab

4. Enable "Email/Password" authentication:
   - Click on "Email/Password"
   - Toggle the "Enable" switch to ON
   - Click "Save"

5. Optional: You can also enable other providers like Google, Facebook, etc.

6. Go to "Users" tab to see registered users

7. Go to "Settings" tab to configure:
   - Authorized domains (add localhost for development)
   - User actions (password reset, etc.)

After enabling Email/Password authentication, the login/signup should work properly.

To test the app:
1. Refresh your browser
2. Click "Admin Login" 
3. Create a new account or sign in
4. Use the admin dashboard to manage buses and routes

For sample data, open browser console and run:
initializeSampleData()
`); 