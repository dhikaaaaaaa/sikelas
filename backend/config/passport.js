const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

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

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value.toLowerCase().trim();

        // Cari user di database berdasarkan email (case-insensitive)
        let user = await User.findOne({ email: new RegExp('^' + email + '$', 'i') });

        if (!user) {
          // Jika email belum ada di database, otomatis daftarkan sebagai Mahasiswa
          user = await User.create({
            name: profile.displayName || email.split('@')[0],
            email: email,
            googleId: profile.id,
            avatar: profile.photos?.[0]?.value || '',
            role: 'mahasiswa',
          });
        } else if (!user.googleId) {
          // Update googleId & avatar jika pertama kali login via Google
          user.googleId = profile.id;
          user.avatar = profile.photos?.[0]?.value || user.avatar;
          user.name = profile.displayName || user.name;
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    },
  ),
);

module.exports = passport;
