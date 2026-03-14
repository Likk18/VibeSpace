import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user already exists
            let user = await User.findOne({ googleId: profile.id });
            
            if (!user) {
                // Check if user exists with same email but different login method
                user = await User.findOne({ email: profile.emails[0].value });
                
                if (user) {
                    // Link Google ID to existing account
                    user.googleId = profile.id;
                    user.avatar = profile.photos[0].value;
                    await user.save();
                } else {
                    // Create new user
                    user = await User.create({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        googleId: profile.id,
                        avatar: profile.photos?.[0]?.value || '',
                        mode: 'single'
                    });
                }
            }
            
            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }));
} else {
    console.warn('⚠️ Google OAuth environment variables are missing. Google login will be disabled.');
}

// Serialize/Deserialize for session support if needed, 
// though we usually use JWT for VibeSpace
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;
