
import React, { useMemo } from 'react';
import { Slider, Card, CardHeader, CardContent } from '../ui/Controls';
import { cn } from '../../lib/utils';

const STORAGE_KEY = 'wrongfuldismissal_data';

const POSITION_LEVELS = [
    { id: 'entry',        label: 'Entry Level',           rate: 0.75 },
    { id: 'skilled',      label: 'Skilled / Technical',   rate: 1.0  },
    { id: 'professional', label: 'Professional',          rate: 1.25 },
    { id: 'manager',      label: 'Manager',               rate: 1.5  },
    { id: 'senior',       label: 'Sr. Manager / Director',rate: 1.75 },
    { id: 'executive',    label: 'Executive / C-Suite',   rate: 2.0  },
] as const;

const AVAILABILITY = [
    { id: 'high',     label: 'High',     multiplier: 0.9  },
    { id: 'moderate', label: 'Moderate', multiplier: 1.0  },
    { id: 'low',      label: 'Low',      multiplier: 1.15 },
] as const;

const DISMISSAL_TYPES = [
    { id: 'without_cause', label: 'Without Cause'          },
    { id: 'constructive',  label: 'Constructive Dismissal' },
] as const;

const FEE_TYPES = [
    { id: 'contingency', label: 'Contingency (%)' },
    { id: 'flat',        label: 'Flat Fee ($)'    },
] as const;

type PositionId  = typeof POSITION_LEVELS[number]['id'];
type AvailId     = typeof AVAILABILITY[number]['id'];
type DismissalId = typeof DISMISSAL_TYPES[number]['id'];
type FeeTypeId   = typeof FEE_TYPES[number]['id'];

interface WrongfulData {
    annualSalary: number;
    age: number;
    yearsOfService: number;
    positionLevel: PositionId;
    fieldAvailability: AvailId;
    dismissalType: DismissalId;
    badFaithDamages: boolean;
    writtenContract: boolean;
    mitigationMonths: number;
    feeType: FeeTypeId;
    contingencyPct: number;
    flatFee: number;
}

const DEFAULT_DATA: WrongfulData = {
    annualSalary: 80000,
    age: 42,
    yearsOfService: 8,
    positionLevel: 'professional',
    fieldAvailability: 'moderate',
    dismissalType: 'without_cause',
    badFaithDamages: false,
    writtenContract: false,
    mitigationMonths: 0,
    feeType: 'contingency',
    contingencyPct: 33,
    flatFee: 10000,
};

const MAX_NOTICE = 24;

const calcAgeFactor = (age: number) => {
    if (age >= 60) return 4;
    if (age >= 55) return 3;
    if (age >= 50) return 2;
    if (age >= 45) return 1;
    return 0;
};

const fmt = (n: number) => '$' + n.toLocaleString(undefined, { maximumFractionDigits: 0 });
const fmtMo = (n: number) => `${n} month${n !== 1 ? 's' : ''}`;

const ButtonGroup = <T extends string>({
    options, value, onChange, label,
}: {
    options: readonly { id: T; label: string }[];
    value: T;
    onChange: (v: T) => void;
    label: string;
}) => {
    return (
        <div className="mb-6">
            <span className="text-[10px] font-normal uppercase tracking-[0.15em] text-black dark:text-white/60 mb-3 block">{label}</span>
            <div className="flex flex-wrap gap-2">
                {options.map(opt => (
                    <button
                        key={opt.id}
                        onClick={() => onChange(opt.id)}
                        className={cn(
                            'px-3 py-1.5 text-[11px] font-normal border transition-all cursor-pointer',
                            value === opt.id
                                ? 'bg-[#387E67] dark:bg-[#52B788] border-[#387E67] dark:border-[#52B788] text-white'
                                : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/60 hover:border-slate-400 dark:hover:border-white/30'
                        )}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

const Toggle = ({ label, description, value, onChange }: { label: string; description?: string; value: boolean; onChange: (v: boolean) => void }) => {
    return (
        <div className="mb-5 flex items-start justify-between gap-4">
            <div>
                <span className="text-[10px] font-normal uppercase tracking-[0.15em] text-black dark:text-white/60 block">{label}</span>
                {description && <span className="text-[10px] text-slate-400 dark:text-white/30 mt-0.5 block">{description}</span>}
            </div>
            <button
                onClick={() => onChange(!value)}
                className={cn(
                    'shrink-0 w-10 h-5 rounded-full transition-colors relative cursor-pointer',
                    value ? 'bg-[#387E67] dark:bg-[#52B788]' : 'bg-slate-200 dark:bg-white/20'
                )}
                aria-pressed={value}
            >
                <span className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform', value ? 'left-5' : 'left-0.5')} />
            </button>
        </div>
    );
};

export const WrongfulDismissalCalculator = ({ compact }: { compact?: boolean }) => {
    const [data, setData] = React.useState<WrongfulData>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? { ...DEFAULT_DATA, ...JSON.parse(saved) } : DEFAULT_DATA;
        } catch { return DEFAULT_DATA; }
    });

    React.useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }, [data]);

    const results = useMemo(() => {
        const position     = POSITION_LEVELS.find(p => p.id === data.positionLevel) ?? POSITION_LEVELS[2];
        const availability = AVAILABILITY.find(a => a.id === data.fieldAvailability) ?? AVAILABILITY[1];
        const monthly      = data.annualSalary / 12;

        const serviceMonths   = position.rate * data.yearsOfService;
        const ageBonus        = calcAgeFactor(data.age);
        const raw             = (serviceMonths + ageBonus) * availability.multiplier;
        const noticeMonths    = Math.min(Math.max(Math.round(raw * 2) / 2, 1), MAX_NOTICE);
        const noticeLow       = Math.max(noticeMonths - 1.5, 1);
        const noticeHigh      = Math.min(noticeMonths + 1.5, MAX_NOTICE);

        const payInLieu           = monthly * noticeMonths;
        const constructiveAdder   = data.dismissalType === 'constructive' ? monthly * noticeMonths * 0.10 : 0;
        const badFaithAdder       = data.badFaithDamages ? monthly * 2 : 0;
        const mitigationDeduction = monthly * data.mitigationMonths;

        const totalDamagesGross = payInLieu + constructiveAdder + badFaithAdder;
        const totalDamagesNet   = Math.max(totalDamagesGross - mitigationDeduction, 0);

        const settlementLow  = totalDamagesNet * 0.60;
        const settlementHigh = totalDamagesNet * 0.80;

        const legalFees = data.feeType === 'contingency'
            ? totalDamagesNet * (data.contingencyPct / 100)
            : data.flatFee;

        const netAfterLegal = Math.max(totalDamagesNet - legalFees, 0);
        const cappedNote = raw >= MAX_NOTICE;

        return {
            noticeMonths, noticeLow, noticeHigh,
            payInLieu, constructiveAdder, badFaithAdder, mitigationDeduction,
            totalDamagesGross, totalDamagesNet,
            settlementLow, settlementHigh,
            legalFees, netAfterLegal,
            monthly, cappedNote,
        };
    }, [data]);

    const update = (patch: Partial<WrongfulData>) => setData(d => ({ ...d, ...patch }));

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Inputs */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Employment Details</h3>
                        </CardHeader>
                        <CardContent>
                            <Slider label="Annual Salary" value={data.annualSalary} min={30000} max={500000} step={1000} suffix="$" onChange={v => update({ annualSalary: v })} />
                            <Slider label="Age" value={data.age} min={18} max={75} suffix=" yrs" onChange={v => update({ age: v })} />
                            <Slider label="Years of Service" value={data.yearsOfService} min={0} max={40} suffix=" yrs" onChange={v => update({ yearsOfService: v })} />
                            <ButtonGroup label="Character of Employment" options={POSITION_LEVELS} value={data.positionLevel} onChange={v => update({ positionLevel: v })} />
                            <ButtonGroup label="Availability of Similar Work" options={AVAILABILITY} value={data.fieldAvailability} onChange={v => update({ fieldAvailability: v })} />
                        </CardContent>
                    </Card>
                </div>

                {/* Results */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Circumstances</h3>
                        </CardHeader>
                        <CardContent>
                            <ButtonGroup label="Type of Dismissal" options={DISMISSAL_TYPES} value={data.dismissalType} onChange={v => update({ dismissalType: v })} />
                            <Toggle
                                label="Bad Faith Damages"
                                description="Employer acted in bad faith during dismissal (hostile manner, false allegations, undue delay)"
                                value={data.badFaithDamages}
                                onChange={v => update({ badFaithDamages: v })}
                            />
                            <Toggle
                                label="Written Employment Contract"
                                description="A signed contract with a termination clause may cap your entitlement — consult a lawyer to determine enforceability"
                                value={data.writtenContract}
                                onChange={v => update({ writtenContract: v })}
                            />
                            <Slider
                                label="Months of Mitigation Income Earned"
                                value={data.mitigationMonths}
                                min={0}
                                max={Math.ceil(results.noticeHigh)}
                                suffix=" mo"
                                onChange={v => update({ mitigationMonths: v })}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Legal Fees</h3>
                        </CardHeader>
                        <CardContent>
                            <ButtonGroup label="Fee Structure" options={FEE_TYPES} value={data.feeType} onChange={v => update({ feeType: v })} />
                            {data.feeType === 'contingency' ? (
                                <Slider label="Contingency Rate" value={data.contingencyPct} min={20} max={45} suffix="%" onChange={v => update({ contingencyPct: v })} />
                            ) : (
                                <Slider label="Flat Fee" value={data.flatFee} min={2500} max={50000} step={500} suffix="$" onChange={v => update({ flatFee: v })} />
                            )}
                        </CardContent>
                    </Card>

                    <Card variant="summary">
                        <CardContent>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-white/60 text-[10px] uppercase tracking-[0.3em] font-normal mb-1">Estimated Damages</p>
                                    <p className="text-4xl font-light tracking-tighter font-sans">
                                        {fmt(results.totalDamagesNet)}
                                    </p>
                                    <p className="text-white/40 text-[10px] mt-1 font-normal">
                                        Notice period: {fmtMo(results.noticeMonths)} (range: {results.noticeLow}–{results.noticeHigh})
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white/40 text-[10px] uppercase tracking-widest font-normal mb-1">Typical Settlement</p>
                                    <p className="text-xl font-light tracking-tighter text-white/90">
                                        {fmt(results.settlementLow)} – {fmt(results.settlementHigh)}
                                    </p>
                                    <p className="text-white/40 text-[10px] mt-1 font-normal">60–80% of full damages</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {data.writtenContract && (
                        <div className="border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/10 p-4">
                            <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                                <strong>Written contract noted.</strong> An enforceable termination clause may limit your entitlement to statutory minimums only. Courts may void clauses that fail to meet applicable employment standards. Consult a qualified employment lawyer.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Full damages breakdown */}
            {!compact && (
                <Card>
                    <CardHeader>
                        <h3 className="text-xs font-normal text-[#8f969d] dark:text-white/40 uppercase tracking-[0.2em] leading-none py-1">Damages Breakdown</h3>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y divide-slate-100 dark:divide-white/5 text-sm">
                            {[
                                { label: 'Reasonable Notice Period',           value: `${results.noticeMonths} months (range: ${results.noticeLow}–${results.noticeHigh})` },
                                { label: 'Pay in Lieu of Notice',              value: fmt(results.payInLieu) },
                                ...(results.constructiveAdder > 0 ? [{ label: 'Constructive Dismissal Uplift (+10%)', value: fmt(results.constructiveAdder) }] : []),
                                ...(results.badFaithAdder > 0      ? [{ label: 'Bad Faith Damages (+2 mos)',          value: fmt(results.badFaithAdder) }] : []),
                                { label: 'Total Damages (Gross)',              value: fmt(results.totalDamagesGross) },
                                ...(results.mitigationDeduction > 0 ? [{ label: `Mitigation Deduction (${data.mitigationMonths} mos earned)`, value: `–${fmt(results.mitigationDeduction)}` }] : []),
                                { label: 'Total Damages (Net)',                value: fmt(results.totalDamagesNet) },
                                { label: data.feeType === 'contingency' ? `Legal Fees (${data.contingencyPct}% contingency)` : `Legal Fees (flat)`, value: `–${fmt(results.legalFees)}` },
                                { label: 'Estimated Net After Fees',          value: fmt(results.netAfterLegal) },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex justify-between items-center py-3">
                                    <span className="text-slate-500 dark:text-white/40 text-xs uppercase tracking-wider">{label}</span>
                                    <span className="font-mono text-slate-900 dark:text-white text-sm">{value}</span>
                                </div>
                            ))}
                        </div>
                        {results.cappedNote && (
                            <p className="mt-4 text-[11px] text-amber-600 dark:text-amber-400">
                                Notice period has been capped at {MAX_NOTICE} months. Courts rarely exceed this limit.
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}

            {!compact && (
                <p className="text-[11px] text-slate-400 dark:text-white/25 leading-relaxed border-t border-slate-100 dark:border-white/5 pt-6">
                    <strong className="text-slate-500 dark:text-white/40">Legal notice:</strong> This calculator provides general estimates for wrongful dismissal damages based on common law reasonable notice principles.
                    Results are for informational purposes only and do not constitute legal advice. Actual entitlements vary by jurisdiction, contractual terms, and the specific facts of each case.
                    Consult a qualified employment lawyer in your jurisdiction before taking any action.
                </p>
            )}
        </div>
    );
};
