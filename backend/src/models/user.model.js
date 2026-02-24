import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        // ── Identity ────────────────────────────────────────────────────────
        fullName: {
            type: String,
            required: [true, 'Full name is required'],
            trim: true,
            minlength: [2, 'Full name must be at least 2 characters'],
            maxlength: [100, 'Full name cannot exceed 100 characters'],
        },
        gender: {
            type: String,
            enum: ['male', 'female'],
            required: [true, 'Gender is required'],
        },
        ageRange: {
            type: String,
            required: [true, 'Age range is required'],
        },
        employmentStatus: {
            type: String,
            required: [true, 'Employment status is required'],
        },

        // ── Location ────────────────────────────────────────────────────────
        country: {
            type: String,
            required: [true, 'Country is required'],
            trim: true,
        },
        region: {
            type: String,
            trim: true,
            default: '',
        },
        town: {
            type: String,
            trim: true,
            default: '',
        },

        // ── Security credentials ─────────────────────────────────────────────
        email: {
            type: String,
            trim: true,
            lowercase: true,
            sparse: true,           // allows null & enforces uniqueness only when set
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
        },
        phone: {
            type: String,
            trim: true,
            sparse: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false,          // Never returned in queries by default
        },

        // ── OTP verification ─────────────────────────────────────────────────
        isEmailVerified: { type: Boolean, default: false },
        isPhoneVerified: { type: Boolean, default: false },
        otp: {
            code: { type: String, select: false },
            expiresAt: { type: Date, select: false },
            purpose: {
                type: String,
                enum: ['email_verification', 'phone_verification', 'password_reset'],
                select: false,
            },
        },

        // ── Tokens ───────────────────────────────────────────────────────────
        refreshToken: { type: String, select: false },
        passwordResetToken: { type: String, select: false },
        passwordResetExpires: { type: Date, select: false },

        // ── Status ───────────────────────────────────────────────────────────
        role: {
            type: String,
            enum: ['user', 'admin', 'org'],
            default: 'user',
        },
        isActive: { type: Boolean, default: true },
        lastLogin: { type: Date },
    },
    {
        timestamps: true,   // createdAt, updatedAt
        versionKey: false,
    }
);


// ── Pre-save: hash password ───────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// ── Instance method: compare passwords ───────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// ── Instance method: safe public profile ─────────────────────────────────────
userSchema.methods.toPublicJSON = function () {
    return {
        id: this._id,
        fullName: this.fullName,
        email: this.email,
        phone: this.phone,
        gender: this.gender,
        ageRange: this.ageRange,
        employmentStatus: this.employmentStatus,
        country: this.country,
        region: this.region,
        town: this.town,
        role: this.role,
        isEmailVerified: this.isEmailVerified,
        isPhoneVerified: this.isPhoneVerified,
        isActive: this.isActive,
        lastLogin: this.lastLogin,
        createdAt: this.createdAt,
    };
};

const User = mongoose.model('User', userSchema);
export default User;
