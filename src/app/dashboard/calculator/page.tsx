"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
    Coins, Wallet, Smartphone, Gem, TrendingUp, Briefcase,
    Home, ArrowRight, Info, CheckCircle2, AlertCircle,
    ChevronDown, ChevronUp, Scale, Save, Trash2,
    History, CheckCircle, Loader2, RefreshCw, PlusCircle, X, Edit3,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import LiveSummary from "@/components/dashboard/LiveSummary";
import { zakatApi, ZakatCalculation, ApiError } from "@/lib/api";
import Swal from "sweetalert2";

// ─────────────────────────────────────────────────────────────────────────────
type Currency = { code: "GHS" | "NGN" | "USD"; symbol: string; nisab: number; goldPrice: number; silverPrice: number };
const CURRENCIES: Currency[] = [
    { code: "GHS", symbol: "₵", nisab: 12450.00, goldPrice: 420.50, silverPrice: 5.20 },
    { code: "NGN", symbol: "₦", nisab: 1560000.00, goldPrice: 52000.00, silverPrice: 650.00 },
    { code: "USD", symbol: "$", nisab: 1150.00, goldPrice: 68.50, silverPrice: 0.85 },
];

const EMPTY_ASSETS = { cash: 0, momo: 0, bank: 0, goldGrams: 0, silverGrams: 0, stocks: 0, businessInventory: 0, tradeGoods: 0 };

// ── History Drawer ────────────────────────────────────────────────────────────
function HistoryDrawer({
    open, onClose, history, currencySymbol,
    onLoad, onDelete, onMarkPaid, loading,
}: {
    open: boolean;
    onClose: () => void;
    history: ZakatCalculation[];
    currencySymbol: string;
    onLoad: (c: ZakatCalculation) => void;
    onDelete: (id: string) => void;
    onMarkPaid: (id: string) => void;
    loading: boolean;
}) {
    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" />
                    <motion.div
                        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 320, damping: 30 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[61] flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="bg-brand-green text-white p-6 flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tight">Calculation History</h2>
                                <p className="text-white/60 text-xs mt-1">{history.length} saved calculation{history.length !== 1 ? "s" : ""}</p>
                            </div>
                            <button onClick={onClose} className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {loading ? (
                                <div className="flex justify-center items-center py-20"><Loader2 size={28} className="animate-spin text-brand-green" /></div>
                            ) : history.length === 0 ? (
                                <div className="text-center py-20">
                                    <History size={36} className="text-gray-200 mx-auto mb-3" />
                                    <p className="text-gray-400 text-sm font-medium">No history yet.<br />Save your first calculation!</p>
                                </div>
                            ) : history.map(calc => (
                                <div key={calc._id} className={`border rounded-xl p-4 transition-all ${calc.isPaid ? "border-brand-green/30 bg-brand-green/5" : "border-gray-100 bg-white hover:border-gray-200"}`}>
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <div className="min-w-0">
                                            <p className="font-black text-[#111] text-sm truncate">{calc.label}</p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">
                                                {new Date(calc.createdAt).toLocaleDateString()} · {calc.currency} · {calc.zakatYear}
                                            </p>
                                        </div>
                                        {calc.isPaid && (
                                            <span className="shrink-0 bg-brand-green/10 text-brand-green text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">Paid</span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                                            <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">Total Assets</p>
                                            <p className="font-black text-sm text-[#111]">{currencySymbol}{calc.totalAssets.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                        </div>
                                        <div className={`rounded-lg p-2 text-center ${calc.isAboveNisab ? "bg-brand-green/10" : "bg-gray-50"}`}>
                                            <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">Zakat Due</p>
                                            <p className={`font-black text-sm ${calc.isAboveNisab ? "text-brand-green" : "text-gray-300"}`}>
                                                {currencySymbol}{calc.zakatDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button onClick={() => { onLoad(calc); onClose(); }}
                                            className="flex-1 bg-brand-green text-white text-[10px] font-black uppercase tracking-widest py-2 rounded-lg hover:bg-brand-green-hover transition-all active:scale-95 flex items-center justify-center gap-1">
                                            <RefreshCw size={11} /> Load
                                        </button>
                                        {!calc.isPaid && (
                                            <button onClick={() => onMarkPaid(calc._id)}
                                                className="flex-1 bg-brand-green/10 text-brand-green text-[10px] font-black uppercase tracking-widest py-2 rounded-lg hover:bg-brand-green/20 transition-all active:scale-95 flex items-center justify-center gap-1">
                                                <CheckCircle size={11} /> Mark Paid
                                            </button>
                                        )}
                                        <button onClick={() => onDelete(calc._id)}
                                            className="w-8 bg-red-50 text-red-400 rounded-lg hover:bg-red-100 transition-all flex items-center justify-center">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ZakatCalculatorPage() {
    const [currentCurrency, setCurrentCurrency] = useState<Currency>(CURRENCIES[0]);
    const [expandedAccordion, setExpandedAccordion] = useState<string | null>("cash");
    const [showGuide, setShowGuide] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    // ── Asset state
    const [assets, setAssets] = useState({ ...EMPTY_ASSETS });
    const [debts, setDebts] = useState(0);
    const [label, setLabel] = useState("");

    // ── CRUD state
    const [activeId, setActiveId] = useState<string | null>(null);   // currently loaded calc
    const [history, setHistory] = useState<ZakatCalculation[]>([]);
    const [saving, setSaving] = useState(false);
    const [fulfilling, setFulfilling] = useState(false);
    const [histLoading, setHistLoading] = useState(false);
    const [apiError, setApiError] = useState("");

    // ── Computed
    const totalAssets = useMemo(() => {
        const cashTotal = assets.cash + assets.momo + assets.bank;
        const goldTotal = (assets.goldGrams * currentCurrency.goldPrice) + (assets.silverGrams * currentCurrency.silverPrice);
        const bizTotal = assets.businessInventory + assets.tradeGoods;
        return cashTotal + goldTotal + bizTotal + assets.stocks;
    }, [assets, currentCurrency]);

    const zakatableAmount = Math.max(0, totalAssets - debts);
    const isAboveNisab = zakatableAmount >= currentCurrency.nisab;
    const zakatDue = isAboveNisab ? zakatableAmount * 0.025 : 0;

    // ── Load history
    const loadHistory = useCallback(async () => {
        setHistLoading(true);
        try {
            const res = await zakatApi.list(1, 20);
            setHistory(res.data.calculations);
        } catch { /* silently fail */ }
        finally { setHistLoading(false); }
    }, []);

    useEffect(() => { loadHistory(); }, [loadHistory]);

    // ── Handlers
    const handleInputChange = (key: string, value: string) => {
        const num = parseFloat(value) || 0;
        setAssets(prev => ({ ...prev, [key]: num }));
        setActiveId(null); // mark as unsaved once user edits
    };

    const handleReset = async (silent = false) => {
        if (!silent) {
            const res = await Swal.fire({
                title: "Clear All Fields?",
                text: "This will reset all asset and debt values to zero. Any unsaved changes will be lost.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#64748b",
                confirmButtonText: "Yes, clear everything",
                cancelButtonText: "Cancel",
                background: "#ffffff",
                customClass: { popup: "swal-zakat-premium-popup" },
            });
            if (!res.isConfirmed) return;
        }

        setAssets({ ...EMPTY_ASSETS });
        setDebts(0);
        setLabel("");
        setActiveId(null);
        setApiError("");

        if (!silent) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Calculator Reset',
                showConfirmButton: false,
                timer: 1500,
            });
        }
    };

    const handleSave = async () => {
        if (totalAssets <= 0) {
            Swal.fire({
                title: "No Input Detected",
                text: "Please enter your assets before saving the calculation.",
                icon: "warning",
                confirmButtonColor: "#005C46",
            });
            return;
        }

        setSaving(true); setApiError("");
        try {
            const payload = {
                assets,
                deductions: { debts },
                currency: currentCurrency.code,
                label: label || `Calculation ${new Date().toLocaleDateString()}`,
                zakatYear: new Date().getFullYear().toString(),
            };

            let saved: ZakatCalculation;
            if (activeId) {
                const res = await zakatApi.update(activeId, payload);
                saved = res.data.calculation;
            } else {
                const res = await zakatApi.create(payload);
                saved = res.data.calculation;
                setActiveId(saved._id);
            }

            await loadHistory();

            await Swal.fire({
                html: `
                  <div style="font-family:'Inter',sans-serif;text-align:center;padding:0;overflow:hidden;border-radius:24px">
                    <div style="background:linear-gradient(135deg,#005C46 0%,#007a5e 100%);padding:44px 24px 56px;position:relative;overflow:hidden">
                      <div style="position:absolute;top:-40px;right:-40px;width:160px;height:160px;background:rgba(255,255,255,0.08);border-radius:50%"></div>
                      <div style="position:absolute;bottom:-20px;left:-30px;width:120px;height:120px;background:rgba(255,255,255,0.05);border-radius:50%"></div>
                      <div style="position:relative;z-index:2">
                        <img src="/zakat logo.png" width="64" height="64" style="object-fit:contain;margin-bottom:12px;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.1))" />
                        <div style="color:white;font-size:14px;font-weight:900;letter-spacing:0.4em;text-transform:uppercase;opacity:0.9">ZAKATAID</div>
                      </div>
                    </div>
                    
                    <div style="margin-top:-32px;display:flex;justify-content:center;margin-bottom:20px;position:relative;z-index:3">
                      <div style="width:64px;height:64px;border-radius:50%;background:#F7A300;border:6px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 12px 30px rgba(247,163,0,0.4);font-size:28px">💾</div>
                    </div>
                    
                    <div style="padding:0 32px 28px">
                      <p style="color:#005C46;font-size:12px;font-weight:900;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 10px;opacity:0.7">
                        ${activeId ? "Record Updated" : "Saved Successfully"}
                      </p>
                      <h2 style="margin:0 0 12px;font-family:'Outfit',sans-serif;font-size:1.8rem;font-weight:900;color:#111;letter-spacing:-0.04em;line-height:1.2">${saved.label}</h2>
                      <div style="display:inline-block;padding:8px 20px;background:#F0F7F5;border-radius:100px;border:1px solid rgba(0,92,70,0.1)">
                        <p style="color:#005C46;font-size:14px;font-weight:700;margin:0">Zakat Due: ${currentCurrency.symbol}${saved.zakatDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      </div>
                    </div>
                  </div>`,
                timer: 2500, timerProgressBar: true, showConfirmButton: false,
                background: "#ffffff", padding: 0, width: '420px',
                customClass: { popup: "swal-zakat-premium-popup", timerProgressBar: "swal-zakat-premium-bar" },
            });
        } catch (err) {
            setApiError(err instanceof ApiError ? err.message : "Failed to save. Please try again.");
        } finally { setSaving(false); }
    };

    const handleLoad = (calc: ZakatCalculation) => {
        const c = CURRENCIES.find(x => x.code === calc.currency) ?? CURRENCIES[0];
        setCurrentCurrency(c);
        setAssets({ ...EMPTY_ASSETS, ...calc.assets });
        setDebts(calc.deductions.debts);
        setLabel(calc.label);
        setActiveId(calc._id);
        setApiError("");

        // Scroll to top immediately
        // We use { focus: false } in a toast if we use one, 
        // but here we just scroll and show a minimal toast to avoid focus stealing
        window.scrollTo({ top: 0, behavior: "smooth" });

        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: `Loaded: ${calc.label}`,
            showConfirmButton: false,
            timer: 2000,
            background: '#ffffff',
            color: '#111',
            iconColor: '#005C46'
        });
    };

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: "Delete Record?",
            text: "This spiritual record will be permanently removed from your history.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Permanently Delete",
            cancelButtonText: "Keep Record",
            background: "#ffffff",
            customClass: { popup: "swal-zakat-popup" },
        });
        if (!result.isConfirmed) return;

        try {
            await zakatApi.delete(id);
            if (activeId === id) handleReset(true);
            await loadHistory();

            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Record deleted',
                showConfirmButton: false,
                timer: 2000,
            });
        } catch (err) {
            setApiError(err instanceof ApiError ? err.message : "Delete failed.");
        }
    };

    const handleMarkPaid = async (id: string) => {
        const confirmResult = await Swal.fire({
            title: "Mark as Fulfilled?",
            text: "Are you sure you want to mark this calculation as paid?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#005C46",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Yes, fulfilled",
            background: "#ffffff",
            customClass: { popup: "swal-zakat-popup" },
        });

        if (!confirmResult.isConfirmed) return;

        try {
            await zakatApi.markPaid(id);
            await loadHistory();

            await Swal.fire({
                html: `
                  <div style="font-family:'Inter',sans-serif;text-align:center;padding:0;overflow:hidden;border-radius:24px">
                    <div style="background:linear-gradient(135deg,#005C46 0%,#007a5e 100%);padding:40px 24px 50px;position:relative;overflow:hidden">
                      <div style="position:absolute;top:-30px;right:-30px;width:140px;height:140px;background:rgba(255,255,255,0.06);border-radius:50%"></div>
                      <img src="/zakat logo.png" width="56" height="56" style="object-fit:contain;margin-bottom:10px" />
                      <div style="color:white;font-size:14px;font-weight:900;letter-spacing:0.3em;text-transform:uppercase">ZAKATAID</div>
                    </div>
                    <div style="margin-top:-30px;display:flex;justify-content:center;margin-bottom:18px;position:relative;z-index:2">
                      <div style="width:60px;height:60px;border-radius:50%;background:#005C46;border:5px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 25px rgba(0,92,70,0.3);font-size:24px">✅</div>
                    </div>
                    <div style="padding:0 28px 15px">
                      <p style="color:#005C46;font-size:11px;font-weight:800;letter-spacing:0.25em;text-transform:uppercase;margin:0 0 6px">Payment Updated</p>
                      <h2 style="margin:0 0 8px;font-family:'Outfit',sans-serif;font-size:1.5rem;font-weight:900;color:#111;letter-spacing:-0.04em">Zakat Fulfilled</h2>
                      <p style="color:#64748b;font-size:14px;font-weight:500;margin:0">Allah has noted your obedience. May it be a source of barakah.</p>
                    </div>
                  </div>`,
                timer: 2500, timerProgressBar: true, showConfirmButton: false,
                background: "#ffffff", padding: 0,
                customClass: { popup: "swal-zakat-popup", timerProgressBar: "swal-zakat-bar" },
            });
        } catch { /* silent */ }
    };

    /** Save (or update) the current calc then immediately mark it as paid. */
    const handleFulfill = async () => {
        if (zakatDue <= 0) return;

        const confirmResult = await Swal.fire({
            title: "Fulfill Zakat Now?",
            text: `You are about to mark ${currentCurrency.symbol}${zakatDue.toLocaleString()} as fulfilled. This will store the calculation and update its payment status.`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#005C46",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Yes, fulfill now",
            cancelButtonText: "Not yet",
            background: "#ffffff",
            customClass: { popup: "swal-zakat-premium-popup" },
        });

        if (!confirmResult.isConfirmed) return;

        setFulfilling(true);
        setApiError("");
        try {
            // 1 — ensure the calculation exists in the database
            let calcId = activeId;
            const payload = {
                assets,
                deductions: { debts },
                currency: currentCurrency.code,
                label: label || `Calculation ${new Date().toLocaleDateString()}`,
                zakatYear: new Date().getFullYear().toString(),
            };

            if (calcId) {
                await zakatApi.update(calcId, payload);
            } else {
                const res = await zakatApi.create(payload);
                calcId = res.data.calculation._id;
                setActiveId(calcId);
            }

            // 2 — mark as paid
            await zakatApi.markPaid(calcId!);
            await loadHistory();

            await Swal.fire({
                html: `
                  <div style="font-family:'Inter',sans-serif;text-align:center;padding:0;overflow:hidden;border-radius:24px">
                    <div style="background:linear-gradient(135deg,#005C46 0%,#007a5e 100%);padding:44px 24px 56px;position:relative;overflow:hidden">
                      <div style="position:absolute;top:-40px;right:-40px;width:160px;height:160px;background:rgba(255,255,255,0.08);border-radius:50%"></div>
                      <div style="position:absolute;bottom:-20px;left:-30px;width:120px;height:120px;background:rgba(255,255,255,0.05);border-radius:50%"></div>
                      <div style="position:relative;z-index:2">
                        <img src="/zakat logo.png" width="64" height="64" style="object-fit:contain;margin-bottom:12px;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.1))" />
                        <div style="color:white;font-size:14px;font-weight:900;letter-spacing:0.4em;text-transform:uppercase;opacity:0.9">ZAKATAID</div>
                      </div>
                    </div>
                    
                    <div style="margin-top:-32px;display:flex;justify-content:center;margin-bottom:20px;position:relative;z-index:3">
                      <div style="width:64px;height:64px;border-radius:50%;background:#005C46;border:6px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 12px 30px rgba(0,92,70,0.4);font-size:28px">✅</div>
                    </div>
                    
                    <div style="padding:0 32px 24px">
                      <p style="color:#005C46;font-size:12px;font-weight:900;letter-spacing:0.3em;text-transform:uppercase;margin:0 0 10px;opacity:0.7">Zakat Fulfilled</p>
                      <h2 style="margin:0 0 12px;font-family:'Outfit',sans-serif;font-size:1.8rem;font-weight:900;color:#111;letter-spacing:-0.04em;line-height:1.2">
                        <span style="color:#005C46">${currentCurrency.symbol}</span>${zakatDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </h2>
                      <p style="color:#64748b;font-size:14px;font-weight:500;margin:0">Alhamdulillah, your spiritual obligation has been marked as fulfilled.</p>
                      
                      <div style="margin:28px 0 0;padding:24px;background:linear-gradient(135deg,#f8fafc 0%,#f1f5f9 100%);border-radius:20px;border:1px solid rgba(0,92,70,0.05);position:relative">
                        <div style="position:absolute;top:10px;right:16px;color:rgba(0,92,70,0.1);font-size:40px;font-weight:900 font-family:'serif'">"</div>
                        <p style="margin:0;color:#005C46;font-size:22px;direction:rtl;font-weight:700;font-family:'Noto Sans Arabic', sans-serif">تَقَبَّلَ اللَّهُ طَاعَتَكُمْ</p>
                        <p style="margin:8px 0 0;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em">May Allah accept your obedience</p>
                      </div>
                    </div>
                  </div>`,
                timer: 2500,
                timerProgressBar: true,
                showConfirmButton: false,
                background: "#ffffff",
                padding: 0,
                width: '420px',
                customClass: {
                    popup: "swal-zakat-premium-popup",
                    timerProgressBar: "swal-zakat-premium-bar"
                },
            });
        } catch (err) {
            setApiError(err instanceof ApiError ? err.message : "Fulfillment failed. Please try again.");
        } finally {
            setFulfilling(false);
        }
    };

    const assetCategories = [
        {
            id: "cash", title: "Cash & Savings", icon: Wallet,
            color: "text-emerald-600", bgColor: "bg-emerald-50",
            fields: [
                { key: "cash", label: "Physical Cash", icon: Coins },
                { key: "momo", label: "Mobile Money (MoMo)", icon: Smartphone },
                { key: "bank", label: "Savings/Current Accounts", icon: Home },
            ],
        },
        {
            id: "gold", title: "Gold & Jewelry", icon: Gem,
            color: "text-amber-500", bgColor: "bg-amber-50",
            fields: [
                { key: "goldGrams", label: "Gold Weight (Grams)", icon: Scale, unit: "g" },
                { key: "silverGrams", label: "Silver Weight (Grams)", icon: Scale, unit: "g" },
            ],
        },
        {
            id: "business", title: "Business Assets", icon: Briefcase,
            color: "text-blue-600", bgColor: "bg-blue-50",
            fields: [
                { key: "businessInventory", label: "Total Inventory Value", icon: TrendingUp },
                { key: "tradeGoods", label: "Tradeable Goods", icon: TrendingUp },
            ],
        },
        {
            id: "debts", title: "Debts & Deductions", icon: AlertCircle, isDeduction: true,
            color: "text-rose-500", bgColor: "bg-rose-50",
            fields: [{ key: "debts", label: "Immediate Debts/Bills", icon: AlertCircle }],
        },
    ];

    return (
        <div className="w-full flex flex-col gap-8 pb-20 relative">
            {/* ── Guide Overlay ── */}
            <AnimatePresence>
                {showGuide && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
                        onClick={() => setShowGuide(false)}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white max-w-2xl w-full p-8 rounded-none shadow-2xl relative max-h-[90vh] overflow-y-auto">
                            <button onClick={() => setShowGuide(false)} className="absolute top-4 right-4 text-gray-400 hover:text-brand-green p-2"><X size={22} /></button>
                            <div className="text-center mb-8 mt-2">
                                <div className="w-16 h-16 bg-brand-green/10 text-brand-green flex items-center justify-center mx-auto mb-4"><Info size={28} /></div>
                                <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">How to Calculate Your Zakat</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {[
                                    ["Add Your Total Wealth", "Include Cash, Gold/Silver, and Business goods owned for one lunar year."],
                                    ["Subtract What You Owe", "Deduct Immediate Debts and short-term obligations."],
                                    ["Check Nisab Threshold", "If remaining wealth exceeds Nisab, Zakat is obligatory."],
                                    ["Pay 2.5%", "Zakat = 2.5% of your eligible wealth — the calculator applies this automatically."],
                                ].map(([title, desc], i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-brand-green text-white flex items-center justify-center font-black text-sm shrink-0">{i + 1}</div>
                                            <h4 className="font-bold text-foreground uppercase text-xs tracking-wider">{title}</h4>
                                        </div>
                                        <p className="text-xs text-slate-text leading-relaxed pl-11">{desc}</p>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => setShowGuide(false)} className="w-full bg-brand-green text-white py-4 font-black text-sm uppercase tracking-widest hover:bg-brand-green-light transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-green/20">
                                Got it, let's calculate! <ArrowRight size={18} />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── History Drawer ── */}
            <HistoryDrawer
                open={showHistory} onClose={() => setShowHistory(false)}
                history={history} currencySymbol={currentCurrency.symbol}
                onLoad={handleLoad} onDelete={handleDelete}
                onMarkPaid={handleMarkPaid} loading={histLoading}
            />

            {/* ── Hero Header ── */}
            <div className="relative overflow-hidden bg-brand-green text-white p-6 md:p-10 shadow-lg shadow-brand-green/20">
                <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/5 rounded-full pointer-events-none" />
                <div className="absolute -bottom-16 -left-8 w-72 h-72 bg-white/5 rounded-full pointer-events-none" />
                <Scale size={120} className="absolute -right-4 -bottom-6 text-white/5 pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-3">
                    <div className="flex items-center gap-4">
                        <span className="text-brand-orange font-arabic text-xl" dir="rtl">السَّلَامُ عَلَيْكُمْ</span>
                        {activeId && (
                            <span className="bg-white/10 border border-white/20 text-white/80 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5">
                                <CheckCircle2 size={11} /> Editing saved calculation
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <h1 className="text-3xl md:text-4xl font-heading font-black uppercase tracking-tight leading-none">Smart Zakat Calculator</h1>
                                <button onClick={() => setShowGuide(true)}
                                    className="bg-brand-orange text-white px-3 py-1.5 text-[10px] font-black uppercase tracking-widest hover:bg-brand-orange-hover transition-all flex items-center gap-1.5 active:scale-95 w-fit">
                                    <Info size={14} /> Guide
                                </button>
                            </div>
                            <p className="text-white/70 text-sm font-medium max-w-xl">A guided journey to fulfil your spiritual obligation with precision.</p>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* History button */}
                            <button onClick={() => setShowHistory(true)}
                                className="relative flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95">
                                <History size={14} /> History
                                {history.length > 0 && (
                                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-brand-orange rounded-full text-white text-[9px] font-black flex items-center justify-center">
                                        {history.length}
                                    </span>
                                )}
                            </button>

                            {/* Currency switcher */}
                            <div className="flex bg-white/10 backdrop-blur-sm border border-white/20 p-1 h-fit w-fit">
                                {CURRENCIES.map((curr) => (
                                    <button key={curr.code} onClick={() => setCurrentCurrency(curr)}
                                        className={cn("px-4 py-2 text-sm font-black transition-all",
                                            currentCurrency.code === curr.code ? "bg-white text-brand-green" : "text-white/70 hover:text-white")}>
                                        {curr.code}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── API error banner ── */}
            {apiError && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle size={16} className="shrink-0" /> {apiError}
                    <button onClick={() => setApiError("")} className="ml-auto text-red-300 hover:text-red-500"><X size={14} /></button>
                </div>
            )}

            {/* ── Label + action bar ── */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <input
                    type="text"
                    placeholder='Label this calculation (e.g. "Zakat 2025")'
                    value={label}
                    onChange={e => setLabel(e.target.value)}
                    className="flex-1 bg-white border border-gray-100 shadow-sm rounded-none py-3 px-4 text-sm font-semibold outline-none focus:border-brand-green/30 focus:ring-2 focus:ring-brand-green/5 transition-all"
                />
                <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleReset()}
                        className="flex items-center gap-1.5 px-4 py-3 bg-white border border-gray-100 text-gray-400 hover:text-red-400 hover:border-red-100 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">
                        <RefreshCw size={13} /> Reset
                    </button>
                    <button onClick={handleSave} disabled={saving}
                        className="flex items-center gap-1.5 px-5 py-3 bg-brand-green text-white text-[10px] font-black uppercase tracking-widest hover:bg-brand-green-hover shadow-lg shadow-brand-green/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                        {saving ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : <><Save size={13} /> {activeId ? "Update" : "Save"}</>}
                    </button>
                    <button onClick={() => handleReset(true)}
                        className="flex items-center gap-1.5 px-4 py-3 bg-white border border-brand-green/20 text-brand-green text-[10px] font-black uppercase tracking-widest hover:bg-brand-green/5 transition-all active:scale-95">
                        <PlusCircle size={13} /> New
                    </button>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="grid grid-cols-12 gap-8 items-start">
                {/* Left Column */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
                    {/* Market Summary Cards */}
                    <div className="grid grid-cols-3 gap-2 md:gap-6">
                        {[
                            { label: "Nisab Threshold", val: `${currentCurrency.symbol}${currentCurrency.nisab.toLocaleString()}`, sub: "Minimum wealth", bg: "bg-brand-green", Icon: TrendingUp },
                            { label: "Gold 24K Price", val: `${currentCurrency.symbol}${currentCurrency.goldPrice}/g`, sub: "Market rate", bg: "bg-[#B8860B]", Icon: Gem },
                            { label: "Silver Price", val: `${currentCurrency.symbol}${currentCurrency.silverPrice}/g`, sub: "Market rate", bg: "bg-[#708090]", Icon: Scale },
                        ].map(({ label, val, sub, bg, Icon }) => (
                            <div key={label} className={`relative overflow-hidden ${bg} rounded-none p-3 md:p-6 text-white shadow-lg group`}>
                                <div className="relative z-10">
                                    <div className="p-1 md:p-2 bg-white/20 w-fit mb-2 md:mb-4"><Icon size={16} className="md:w-5 md:h-5" /></div>
                                    <p className="text-[7px] md:text-[10px] font-bold text-white/70 uppercase tracking-widest">{label}</p>
                                    <h3 className="text-sm md:text-2xl font-black tracking-tight leading-none mt-0.5 truncate">{val}</h3>
                                    <p className="text-[7px] md:text-[10px] text-white/50 mt-1 font-medium hidden sm:block">{sub}</p>
                                </div>
                                <Icon size={60} className="absolute -bottom-2 -right-2 text-white/10 -rotate-12 group-hover:scale-110 transition-transform duration-500 md:w-[90px] md:h-[90px]" />
                            </div>
                        ))}
                    </div>

                    {/* Asset Accordions */}
                    <div className="flex flex-col gap-4">
                        {assetCategories.map((category) => {
                            const isExpanded = expandedAccordion === category.id;
                            const categoryTotal = category.fields.reduce((acc, field) => {
                                if (field.key === "debts") return acc + debts;
                                if (field.key === "goldGrams") return acc + (assets.goldGrams * currentCurrency.goldPrice);
                                if (field.key === "silverGrams") return acc + (assets.silverGrams * currentCurrency.silverPrice);
                                return acc + (assets[field.key as keyof typeof assets] || 0);
                            }, 0);

                            return (
                                <React.Fragment key={category.id}>
                                    <div className={cn(
                                        "bg-white border rounded-none shadow-sm transition-all",
                                        isExpanded ? "ring-2 ring-brand-green/10 border-brand-green/20" : "border-gray-100 hover:border-gray-200"
                                    )}>
                                        <button onClick={() => setExpandedAccordion(isExpanded ? null : category.id)}
                                            className="w-full flex items-center justify-between p-6 text-left">
                                            <div className="flex items-center gap-4">
                                                <div className={cn("w-12 h-12 flex items-center justify-center transition-all",
                                                    isExpanded ? `${category.bgColor} ${category.color}` : "bg-light-gray text-slate-text")}>
                                                    <category.icon size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-foreground">{category.title}</h3>
                                                    <p className="text-xs text-slate-text font-medium">{category.fields.length} item{category.fields.length !== 1 ? "s" : ""} to track</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {categoryTotal > 0 && !isExpanded && (
                                                    <div className="text-right hidden sm:block">
                                                        <p className="text-[10px] uppercase font-black text-slate-text">Sub-total</p>
                                                        <p className={`text-sm font-bold ${category.isDeduction ? "text-red-500" : "text-brand-green"}`}>
                                                            {category.isDeduction ? "−" : ""}{currentCurrency.symbol}{categoryTotal.toLocaleString()}
                                                        </p>
                                                    </div>
                                                )}
                                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </div>
                                        </button>

                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                    <div className="p-6 pt-0 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {category.fields.map((field) => {
                                                            const val = field.key === "debts"
                                                                ? debts
                                                                : (assets[field.key as keyof typeof assets] || 0);
                                                            return (
                                                                <div key={field.key} className="relative group">
                                                                    <label className="text-xs font-bold text-slate-text uppercase tracking-widest mb-1.5 block ml-1">{field.label}</label>
                                                                    <div className="relative">
                                                                        <div className={cn("absolute left-4 top-1/2 -translate-y-1/2 transition-colors", category.color)}>
                                                                            <field.icon size={18} />
                                                                        </div>
                                                                        <input
                                                                            type="number" min="0"
                                                                            value={val || ""}
                                                                            onChange={e => {
                                                                                if (field.key === "debts") {
                                                                                    setDebts(parseFloat(e.target.value) || 0);
                                                                                    setActiveId(null);
                                                                                } else {
                                                                                    handleInputChange(field.key, e.target.value);
                                                                                }
                                                                            }}
                                                                            placeholder="0.00"
                                                                            className="w-full bg-light-gray/50 border-2 border-transparent focus:border-brand-green focus:bg-white py-3.5 pl-12 pr-12 text-foreground font-black outline-none transition-all"
                                                                        />
                                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-brand-green uppercase">
                                                                            {"unit" in field ? (field as { unit: string }).unit : currentCurrency.code}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Mobile live summary after cash section */}
                                    {category.id === "cash" && (
                                        <div className="lg:hidden">
                                            <LiveSummary symbol={currentCurrency.symbol} totalAssets={totalAssets}
                                                totalDeductions={debts} zakatableAmount={zakatableAmount}
                                                zakatDue={zakatDue} isAboveNisab={isAboveNisab} nisab={currentCurrency.nisab}
                                                onFulfill={handleFulfill} fulfilling={fulfilling} />
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>

                    {/* Scholar tip */}
                    <div className="bg-white p-6 border border-gray-100 shadow-sm flex gap-4 items-start">
                        <div className="w-10 h-10 bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0"><Info size={20} /></div>
                        <div>
                            <h4 className="font-bold text-foreground mb-1">Scholar Tip: Personal vs Business Assets</h4>
                            <p className="text-sm text-slate-text">Only inventory for trade is zakatable. Equipment and fixed assets used to run your business are NOT included in the calculation.</p>
                        </div>
                    </div>
                </div>

                {/* Right Column — Desktop sticky sidebar */}
                <div className="col-span-12 lg:col-span-4 lg:sticky lg:top-24 space-y-6 hidden lg:block">
                    <LiveSummary symbol={currentCurrency.symbol} totalAssets={totalAssets}
                        totalDeductions={debts} zakatableAmount={zakatableAmount}
                        zakatDue={zakatDue} isAboveNisab={isAboveNisab} nisab={currentCurrency.nisab}
                        onFulfill={handleFulfill} fulfilling={fulfilling} />

                    {/* Save CTA */}
                    <div className="bg-white p-5 border border-gray-100">
                        <h4 className="font-bold text-sm text-foreground mb-1">Save this Calculation</h4>
                        <p className="text-xs text-slate-text leading-relaxed mb-4">Store your progress and track payments over time from your history.</p>
                        <button onClick={handleSave} disabled={saving}
                            className="w-full bg-brand-green text-white font-black text-xs uppercase tracking-widest py-3 flex items-center justify-center gap-2 hover:bg-brand-green-hover transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-brand-green/10">
                            {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> {activeId ? "Update Record" : "Save Calculation"}</>}
                        </button>
                    </div>

                    {/* Quick support */}
                    <div className="bg-light-gray p-5 border border-gray-200">
                        <h4 className="font-bold text-sm text-foreground mb-1">Need help calculating?</h4>
                        <p className="text-xs text-slate-text leading-relaxed mb-4">Our spiritual advisors are available for a live chat to guide you.</p>
                        <button className="text-brand-green text-xs font-black uppercase tracking-widest hover:underline flex items-center gap-2">
                            Chat with an Advisor <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Saved Records Table ── */}
            <div className="bg-white border border-gray-100 shadow-sm mt-8 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                            <History size={20} className="text-brand-green" /> Saved Calculations
                        </h2>
                        <p className="text-xs text-slate-text font-medium mt-1">Manage, update, and track your spiritual obligations</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={loadHistory}
                            disabled={histLoading}
                            className="p-2.5 bg-light-gray text-slate-text hover:text-brand-green transition-all active:scale-95 disabled:opacity-50"
                        >
                            <RefreshCw size={18} className={cn(histLoading && "animate-spin")} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-brand-green text-white">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-r border-white/20">Record Details</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-r border-white/20">Total Assets</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center border-r border-white/20">Nisab Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-r border-white/20">Zakat Due</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-r border-white/20">Payment Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {histLoading && history.length === 0 ? (
                                [...Array(3)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-8">
                                            <div className="h-4 bg-gray-100 rounded-full w-3/4 mx-auto" />
                                        </td>
                                    </tr>
                                ))
                            ) : history.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 bg-gray-50 text-gray-200 flex items-center justify-center rounded-full">
                                                <History size={24} />
                                            </div>
                                            <p className="text-sm font-medium text-slate-text">No saved records found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                history.map((calc) => {
                                    const symbol = CURRENCIES.find(c => c.code === calc.currency)?.symbol || "₵";
                                    return (
                                        <tr key={calc._id} className={cn(
                                            "group transition-all hover:bg-brand-green/[0.02] border-b border-gray-100",
                                            activeId === calc._id ? "bg-brand-green/[0.04]" : ""
                                        )}>
                                            <td className="px-6 py-5 border-r border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-10 h-10 flex items-center justify-center shrink-0 text-sm font-black",
                                                        calc.isPaid ? "bg-brand-green/10 text-brand-green" : "bg-gray-100 text-slate-text"
                                                    )}>
                                                        {calc.currency.substring(0, 1)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-foreground truncate">{calc.label}</p>
                                                        <p className="text-[10px] text-slate-text font-medium uppercase tracking-wider mt-0.5">
                                                            {new Date(calc.createdAt).toLocaleDateString()} · {calc.zakatYear}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 border-r border-gray-100">
                                                <p className="text-xs font-black text-foreground">{symbol}{calc.totalAssets.toLocaleString()}</p>
                                                <p className="text-[9px] text-slate-text font-bold uppercase tracking-tighter">Gross Assets</p>
                                            </td>
                                            <td className="px-6 py-5 text-center border-r border-gray-100">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full",
                                                    calc.isAboveNisab
                                                        ? "bg-brand-green/10 text-brand-green"
                                                        : "bg-amber-100 text-amber-700"
                                                )}>
                                                    {calc.isAboveNisab ? "Above Nisab" : "Below Nisab"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 border-r border-gray-100">
                                                <p className={cn(
                                                    "text-sm font-black",
                                                    calc.isAboveNisab ? "text-brand-green" : "text-slate-text/40"
                                                )}>
                                                    {symbol}{calc.zakatDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </p>
                                            </td>
                                            <td className="px-6 py-5 border-r border-gray-100">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "w-2 h-2 rounded-full",
                                                        calc.isPaid ? "bg-brand-green shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-amber-400"
                                                    )} />
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-foreground">
                                                            {calc.isPaid ? "Fulfilled" : "Pending"}
                                                        </p>
                                                        {calc.isPaid && calc.paidAt && (
                                                            <p className="text-[9px] text-slate-text font-medium">
                                                                On {new Date(calc.paidAt).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => handleLoad(calc)}
                                                        className="flex items-center gap-1 px-3 py-2 bg-brand-green/5 text-brand-green hover:bg-brand-green/10 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg"
                                                    >
                                                        <Edit3 size={13} />
                                                        <span>Edit</span>
                                                    </button>
                                                    {!calc.isPaid && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleMarkPaid(calc._id); }}
                                                            className="flex items-center gap-1 px-3 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg"
                                                        >
                                                            <CheckCircle size={13} />
                                                            <span>Pay</span>
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(calc._id); }}
                                                        className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-500 hover:bg-red-100 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg"
                                                    >
                                                        <Trash2 size={13} />
                                                        <span>Delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 bg-light-gray/30 border-t border-gray-100 text-center">
                    <p className="text-[10px] text-slate-text font-medium uppercase tracking-widest">
                        Showing {history.length} most recent calculations
                    </p>
                </div>
            </div>
        </div>
    );
}
