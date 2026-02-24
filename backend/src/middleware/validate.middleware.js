import { validationResult } from 'express-validator';

/**
 * Run after express-validator chains.
 * Returns 422 with a clean field→message map if any rule fails.
 */
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formatted = {};
        errors.array().forEach((err) => {
            if (!formatted[err.path]) {
                formatted[err.path] = err.msg;
            }
        });
        return res.status(422).json({
            success: false,
            message: 'Validation failed',
            errors: formatted,
        });
    }
    next();
};
