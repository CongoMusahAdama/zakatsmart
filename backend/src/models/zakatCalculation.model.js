import mongoose from 'mongoose';

const zakatCalculationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        // ── Label ──────────────────────────────────────────────────────────────
        label: {
            type: String,
            trim: true,
            default: '',
            maxlength: [100, 'Label cannot exceed 100 characters'],
        },

        // ── Currency ───────────────────────────────────────────────────────────
        currency: {
            type: String,
            enum: ['GHS', 'NGN', 'USD'],
            default: 'GHS',
        },

        // ── Assets ──────────────────────────────────────────────────────────────
        assets: {
            cash: { type: Number, default: 0, min: 0 },
            momo: { type: Number, default: 0, min: 0 },
            bank: { type: Number, default: 0, min: 0 },
            goldGrams: { type: Number, default: 0, min: 0 },
            silverGrams: { type: Number, default: 0, min: 0 },
            stocks: { type: Number, default: 0, min: 0 },
            businessInventory: { type: Number, default: 0, min: 0 },
            tradeGoods: { type: Number, default: 0, min: 0 },
        },

        // ── Deductions ──────────────────────────────────────────────────────────
        deductions: {
            debts: { type: Number, default: 0, min: 0 },
        },

        // ── Computed (stored for history display) ──────────────────────────────
        totalAssets: { type: Number, default: 0 },
        zakatableAmount: { type: Number, default: 0 },
        zakatDue: { type: Number, default: 0 },
        nisabUsed: { type: Number, default: 0 },
        goldPriceUsed: { type: Number, default: 0 },
        silverPriceUsed: { type: Number, default: 0 },
        isAboveNisab: { type: Boolean, default: false },

        // ── Status ─────────────────────────────────────────────────────────────
        isPaid: { type: Boolean, default: false },
        paidAt: { type: Date },
        paidNote: { type: String, trim: true, default: '' },

        // ── Lunar year tracking ────────────────────────────────────────────────
        zakatYear: {
            type: String,   // e.g. "1446" (Hijri) or "2025"
            default: () => new Date().getFullYear().toString(),
        },
    },
    {
        timestamps: true,   // createdAt, updatedAt
        versionKey: false,
    }
);

// Indexes for fast user-scoped queries
zakatCalculationSchema.index({ user: 1, createdAt: -1 });

const ZakatCalculation = mongoose.model('ZakatCalculation', zakatCalculationSchema);
export default ZakatCalculation;
