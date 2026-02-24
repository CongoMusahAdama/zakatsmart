import ZakatCalculation from '../models/zakatCalculation.model.js';

// ── helpers ──────────────────────────────────────────────────────────────────
const CURRENCY_CONFIG = {
    GHS: { nisab: 12450.00, goldPrice: 420.50, silverPrice: 5.20 },
    NGN: { nisab: 1560000, goldPrice: 52000.00, silverPrice: 650.00 },
    USD: { nisab: 1150.00, goldPrice: 68.50, silverPrice: 0.85 },
};

function computeZakat(assets, deductions, currency) {
    const cfg = CURRENCY_CONFIG[currency] ?? CURRENCY_CONFIG.GHS;

    const cashTotal = (assets.cash || 0) + (assets.momo || 0) + (assets.bank || 0);
    const goldTotal = ((assets.goldGrams || 0) * cfg.goldPrice)
        + ((assets.silverGrams || 0) * cfg.silverPrice);
    const bizTotal = (assets.businessInventory || 0) + (assets.tradeGoods || 0);
    const stockTotal = assets.stocks || 0;

    const totalAssets = cashTotal + goldTotal + bizTotal + stockTotal;
    const zakatableAmount = Math.max(0, totalAssets - (deductions?.debts || 0));
    const isAboveNisab = zakatableAmount >= cfg.nisab;
    const zakatDue = isAboveNisab ? zakatableAmount * 0.025 : 0;

    return {
        totalAssets,
        zakatableAmount,
        zakatDue,
        isAboveNisab,
        nisabUsed: cfg.nisab,
        goldPriceUsed: cfg.goldPrice,
        silverPriceUsed: cfg.silverPrice,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
//  CREATE   POST /api/zakat
// ─────────────────────────────────────────────────────────────────────────────
export const createCalculation = async (req, res, next) => {
    try {
        const { assets = {}, deductions = {}, currency = 'GHS', label, zakatYear } = req.body;
        const computed = computeZakat(assets, deductions, currency);

        const calc = await ZakatCalculation.create({
            user: req.user._id,
            label: label || `Calculation ${new Date().toLocaleDateString()}`,
            currency,
            assets,
            deductions,
            zakatYear,
            ...computed,
        });

        res.status(201).json({ success: true, data: { calculation: calc } });
    } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
//  LIST     GET /api/zakat          (all for current user, newest first)
// ─────────────────────────────────────────────────────────────────────────────
export const listCalculations = async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, parseInt(req.query.limit) || 10);
        const skip = (page - 1) * limit;

        const [calculations, total] = await Promise.all([
            ZakatCalculation.find({ user: req.user._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            ZakatCalculation.countDocuments({ user: req.user._id }),
        ]);

        res.json({
            success: true,
            data: {
                calculations,
                pagination: { total, page, limit, pages: Math.ceil(total / limit) },
            },
        });
    } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
//  GET ONE  GET /api/zakat/:id
// ─────────────────────────────────────────────────────────────────────────────
export const getCalculation = async (req, res, next) => {
    try {
        const calc = await ZakatCalculation.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!calc) {
            return res.status(404).json({ success: false, message: 'Calculation not found.' });
        }

        res.json({ success: true, data: { calculation: calc } });
    } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
//  UPDATE   PATCH /api/zakat/:id
// ─────────────────────────────────────────────────────────────────────────────
export const updateCalculation = async (req, res, next) => {
    try {
        const calc = await ZakatCalculation.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!calc) {
            return res.status(404).json({ success: false, message: 'Calculation not found.' });
        }

        const { assets, deductions, currency, label, zakatYear, isPaid, paidNote } = req.body;

        if (assets) calc.assets = { ...calc.assets.toObject?.() ?? calc.assets, ...assets };
        if (deductions) calc.deductions = { ...calc.deductions.toObject?.() ?? calc.deductions, ...deductions };
        if (currency) calc.currency = currency;
        if (label) calc.label = label;
        if (zakatYear) calc.zakatYear = zakatYear;
        if (isPaid !== undefined) {
            calc.isPaid = isPaid;
            calc.paidAt = isPaid ? new Date() : undefined;
        }
        if (paidNote !== undefined) calc.paidNote = paidNote;

        // Re-compute whenever financial fields change
        if (assets || deductions || currency) {
            const computed = computeZakat(calc.assets, calc.deductions, calc.currency);
            Object.assign(calc, computed);
        }

        await calc.save();
        res.json({ success: true, data: { calculation: calc } });
    } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
//  DELETE   DELETE /api/zakat/:id
// ─────────────────────────────────────────────────────────────────────────────
export const deleteCalculation = async (req, res, next) => {
    try {
        const calc = await ZakatCalculation.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!calc) {
            return res.status(404).json({ success: false, message: 'Calculation not found.' });
        }

        res.json({ success: true, message: 'Calculation deleted.' });
    } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
//  MARK AS PAID   PATCH /api/zakat/:id/mark-paid
// ─────────────────────────────────────────────────────────────────────────────
export const markAsPaid = async (req, res, next) => {
    try {
        const calc = await ZakatCalculation.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!calc) {
            return res.status(404).json({ success: false, message: 'Calculation not found.' });
        }

        calc.isPaid = true;
        calc.paidAt = new Date();
        calc.paidNote = req.body.paidNote || '';
        await calc.save();

        res.json({ success: true, message: 'Zakat marked as paid.', data: { calculation: calc } });
    } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
//  SUMMARY  GET /api/zakat/summary  (stats for the dashboard)
// ─────────────────────────────────────────────────────────────────────────────
export const getSummary = async (req, res, next) => {
    try {
        const calcs = await ZakatCalculation.find({ user: req.user._id }).lean();
        const totalZakat = calcs.reduce((s, c) => s + (c.zakatDue || 0), 0);
        const paidZakat = calcs.filter(c => c.isPaid).reduce((s, c) => s + (c.zakatDue || 0), 0);

        res.json({
            success: true,
            data: {
                totalCalculations: calcs.length,
                totalZakatDue: totalZakat,
                totalZakatPaid: paidZakat,
                outstandingZakat: totalZakat - paidZakat,
                lastCalculation: calcs[0] || null,
            },
        });
    } catch (err) { next(err); }
};
