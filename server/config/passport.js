const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.warn("⚠️ Google Client ID or Secret missing. Google Auth will not work.");
} else {
    passport.use(
        new GoogleStrategy(
            {
                clientID: GOOGLE_CLIENT_ID,
                clientSecret: GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.NODE_ENV === 'production'
                    ? "https://food-ordering-system-x6mu.onrender.com/api/auth/google/callback"
                    : "http://localhost:5000/api/auth/google/callback",
                proxy: true // Important for Render deployment
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Check if user exists
                    let user = await User.findOne({ email: profile.emails[0].value });

                    if (user) {
                        return done(null, user);
                    }

                    // Generate a random password that meets requirements (8 chars, 1 uppercase, 1 number)
                    // Requirements: min 8 chars, 1 uppercase, 1 number
                    const randomPassword = 'G' + Math.random().toString(36).slice(-8).toUpperCase() + Math.floor(Math.random() * 10);

                    // Create new user
                    user = new User({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        password: randomPassword,
                        firstLogin: true,
                        googleId: profile.id,
                        role: 'user', // Default role for now, but firstLogin will force selection
                    });

                    await user.save();
                    done(null, user);
                } catch (err) {
                    done(err, null);
                }
            }
        )
    );
}

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});
