import JSZip from 'jszip';

// ── formatters ───────────────────────────────────────────────────────────────

const $ = (n: number) => '$' + Math.round(n).toLocaleString('en-US');
const $d = (n: number, d = 2) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (n: number) => `${n}%`;
const num = (n: number, d = 0) => n.toLocaleString('en-US', { maximumFractionDigits: d });
const mo = (n: number) => `${n} month${n !== 1 ? 's' : ''}`;
const row = (label: string, value: string) => `| ${label} | ${value} |`;
const table = (rows: [string, string][]) =>
    `| | |\n|---|---|\n${rows.map(([l, v]) => row(l, v)).join('\n')}`;
const h2 = (s: string) => `## ${s}`;
const h3 = (s: string) => `### ${s}`;
const hr = '\n---\n';

// ── Salary & Taxes ───────────────────────────────────────────────────────────

interface SalaryProfile { id: string; name: string; data: { annualGross: number; taxRate: number; contribution401k: number; monthlyExpenses: number } }

const renderSalary = (raw: string): string => {
    const profiles: SalaryProfile[] = JSON.parse(raw);
    return profiles.map((p) => {
        const d = p.data;
        const annual401k = (d.annualGross * d.contribution401k) / 100;
        const taxableIncome = d.annualGross - annual401k;
        const annualTax = (taxableIncome * d.taxRate) / 100;
        const takeHomeAnnual = taxableIncome - annualTax;
        const takeHomeMonthly = takeHomeAnnual / 12;
        const monthlySavings = takeHomeMonthly - d.monthlyExpenses;

        return [
            h2(p.name),
            '',
            h3('Inputs'),
            table([
                ['Annual Gross Salary', $(d.annualGross)],
                ['Tax Rate', pct(d.taxRate)],
                ['Retirement Contribution', pct(d.contribution401k)],
                ['Monthly Expenses', $(d.monthlyExpenses)],
            ]),
            '',
            h3('Results'),
            table([
                ['Annual Retirement Contribution', $(annual401k)],
                ['Taxable Income', $(taxableIncome)],
                ['Annual Tax', $(annualTax)],
                ['Take-Home Pay (Annual)', $(takeHomeAnnual)],
                ['Take-Home Pay (Monthly)', $(takeHomeMonthly)],
                ['Monthly Savings After Expenses', monthlySavings >= 0 ? $(monthlySavings) : `-${$(-monthlySavings)}`],
            ]),
        ].join('\n');
    }).join(`\n${hr}\n`);
};

// ── Mortgage Equity ──────────────────────────────────────────────────────────

interface MortgageProfile { id: string; name: string; data: { homePrice: number; downPayment: number; interestRate: number; termYears: number; annualTaxes: number } }

const renderMortgage = (raw: string): string => {
    const profiles: MortgageProfile[] = JSON.parse(raw);
    return profiles.map((p) => {
        const d = p.data;
        const principal = d.homePrice - d.downPayment;
        const monthlyRate = d.interestRate / 100 / 12;
        const numPayments = d.termYears * 12;
        const monthlyPI = (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
            (Math.pow(1 + monthlyRate, numPayments) - 1);
        const monthlyTaxes = d.annualTaxes / 12;
        const totalMonthly = monthlyPI + monthlyTaxes;
        const totalInterest = (monthlyPI * numPayments) - principal;
        const totalCost = d.homePrice + totalInterest + d.annualTaxes * d.termYears;
        const downPct = ((d.downPayment / d.homePrice) * 100).toFixed(1);

        return [
            h2(p.name),
            '',
            h3('Inputs'),
            table([
                ['Home Price', $(d.homePrice)],
                ['Down Payment', `${$(d.downPayment)} (${downPct}%)`],
                ['Interest Rate', pct(d.interestRate)],
                ['Loan Term', `${d.termYears} years`],
                ['Annual Property Taxes', $(d.annualTaxes)],
            ]),
            '',
            h3('Results'),
            table([
                ['Loan Amount', $(principal)],
                ['Monthly Principal & Interest', $d(monthlyPI)],
                ['Monthly Taxes', $d(monthlyTaxes)],
                ['Total Monthly Payment', $d(totalMonthly)],
                ['Total Interest Paid', $(totalInterest)],
                ['Total Cost of Home', $(totalCost)],
            ]),
        ].join('\n');
    }).join(`\n${hr}\n`);
};

// ── Wealth Growth ────────────────────────────────────────────────────────────

interface InvestmentProfile { id: string; name: string; data: { initialAmount: number; monthlyContribution: number; annualReturn: number; years: number } }

const renderInvestment = (raw: string): string => {
    const profiles: InvestmentProfile[] = JSON.parse(raw);
    return profiles.map((p) => {
        const d = p.data;
        let currentBalance = d.initialAmount;
        let totalInvested = d.initialAmount;
        const monthlyRate = d.annualReturn / 100 / 12;
        for (let i = 0; i < d.years; i++) {
            for (let m = 0; m < 12; m++) {
                currentBalance = (currentBalance + d.monthlyContribution) * (1 + monthlyRate);
                totalInvested += d.monthlyContribution;
            }
        }
        const totalEarnings = currentBalance - totalInvested;

        return [
            h2(p.name),
            '',
            h3('Inputs'),
            table([
                ['Initial Investment', $(d.initialAmount)],
                ['Monthly Contribution', $(d.monthlyContribution)],
                ['Expected Annual Return', pct(d.annualReturn)],
                ['Time Horizon', `${d.years} years`],
            ]),
            '',
            h3('Results'),
            table([
                ['Total Contributed', $(totalInvested)],
                ['Investment Growth', $(totalEarnings)],
                ['Final Portfolio Value', $(currentBalance)],
                ['Return Multiple', `${(currentBalance / totalInvested).toFixed(2)}×`],
            ]),
        ].join('\n');
    }).join(`\n${hr}\n`);
};

// ── Debt Repayment ───────────────────────────────────────────────────────────

interface DebtScenario { id: string; name: string; data: { balance: number; annualRate: number; monthlyPayment: number } }

const renderDebt = (raw: string): string => {
    const scenarios: DebtScenario[] = JSON.parse(raw);
    return scenarios.map((s) => {
        const d = s.data;
        const monthlyRate = d.annualRate / 100 / 12;
        const minPayment = d.balance * monthlyRate;

        if (d.monthlyPayment <= minPayment) {
            return [
                h2(s.name),
                '',
                h3('Inputs'),
                table([
                    ['Debt Balance', $(d.balance)],
                    ['Annual Interest Rate', pct(d.annualRate)],
                    ['Monthly Payment', $(d.monthlyPayment)],
                ]),
                '',
                `> ⚠️ Monthly payment of ${$(d.monthlyPayment)} does not cover the monthly interest of ${$d(minPayment)}. This debt cannot be repaid at this payment level.`,
            ].join('\n');
        }

        let balance = d.balance;
        let totalPaid = 0;
        let month = 0;
        while (balance > 0.01 && month <= 360) {
            const interest = balance * monthlyRate;
            const principal = Math.min(d.monthlyPayment - interest, balance);
            balance -= principal;
            totalPaid += d.monthlyPayment;
            month++;
        }
        const totalInterest = totalPaid - d.balance;
        const years = Math.floor(month / 12);
        const months = month % 12;
        const timeStr = years > 0 ? `${years} yr${years !== 1 ? 's' : ''} ${months} mo` : `${months} months`;

        return [
            h2(s.name),
            '',
            h3('Inputs'),
            table([
                ['Debt Balance', $(d.balance)],
                ['Annual Interest Rate', pct(d.annualRate)],
                ['Monthly Payment', $(d.monthlyPayment)],
            ]),
            '',
            h3('Results'),
            table([
                ['Time to Pay Off', timeStr],
                ['Total Paid', $(totalPaid)],
                ['Total Interest Paid', $(totalInterest)],
                ['Interest as % of Balance', `${((totalInterest / d.balance) * 100).toFixed(1)}%`],
            ]),
        ].join('\n');
    }).join(`\n${hr}\n`);
};

// ── Goals Tracking ───────────────────────────────────────────────────────────

interface Goal { id: string; name: string; target: number; current: number }
interface GoalsProfile { id: string; name: string; data: { goals: Goal[] } }

const renderGoals = (raw: string): string => {
    const profiles: GoalsProfile[] = JSON.parse(raw);
    return profiles.map((p) => {
        const goals = p.data.goals;
        const totalTarget = goals.reduce((a, g) => a + g.target, 0);
        const totalCurrent = goals.reduce((a, g) => a + g.current, 0);
        const overallPct = totalTarget > 0 ? ((totalCurrent / totalTarget) * 100).toFixed(1) : '0';

        const goalRows = goals.map((g) => {
            const gpct = g.target > 0 ? ((g.current / g.target) * 100).toFixed(1) : '0';
            const remaining = g.target - g.current;
            return `| ${g.name} | ${$(g.current)} | ${$(g.target)} | ${gpct}% | ${remaining > 0 ? $(remaining) + ' remaining' : '✓ Complete'} |`;
        }).join('\n');

        return [
            h2(p.name),
            '',
            h3('Summary'),
            table([
                ['Total Saved', $(totalCurrent)],
                ['Total Target', $(totalTarget)],
                ['Overall Progress', `${overallPct}%`],
                ['Remaining', $(totalTarget - totalCurrent)],
            ]),
            '',
            h3('Individual Goals'),
            '| Goal | Saved | Target | Progress | Status |',
            '|---|---|---|---|---|',
            goalRows,
        ].join('\n');
    }).join(`\n${hr}\n`);
};

// ── Time Allocation ──────────────────────────────────────────────────────────

interface TimeProfile { id: string; name: string; data: { sleep: number; work: number; chores: number; fitness: number; leisure: number; learning: number } }

const renderTime = (raw: string): string => {
    const profiles: TimeProfile[] = JSON.parse(raw);
    return profiles.map((p) => {
        const d = p.data;
        const total = d.sleep + d.work + d.chores + d.fitness + d.leisure + d.learning;
        const remaining = 168 - total;

        const pctOf = (h: number) => `${h} hrs (${((h / 168) * 100).toFixed(1)}%)`;

        return [
            h2(p.name),
            '',
            h3('Weekly Hours (168 hrs total)'),
            table([
                ['Sleep', pctOf(d.sleep)],
                ['Work', pctOf(d.work)],
                ['Chores / Errands', pctOf(d.chores)],
                ['Fitness', pctOf(d.fitness)],
                ['Leisure', pctOf(d.leisure)],
                ['Learning', pctOf(d.learning)],
                ['Unallocated', `${remaining} hrs`],
            ]),
            '',
            remaining < 0
                ? `> ⚠️ Over-allocated by ${Math.abs(remaining)} hours. A week has only 168 hours.`
                : remaining === 0
                    ? '> Every hour of the week is allocated.'
                    : `> ${remaining} hours per week unscheduled — free time or flex buffer.`,
        ].join('\n');
    }).join(`\n${hr}\n`);
};

// ── Bardal Factor ────────────────────────────────────────────────────────────

const BARDAL_POSITIONS = [
    { id: 'entry', label: 'Entry Level', rate: 0.75 },
    { id: 'skilled', label: 'Skilled / Technical', rate: 1.0 },
    { id: 'professional', label: 'Professional', rate: 1.25 },
    { id: 'manager', label: 'Manager', rate: 1.5 },
    { id: 'senior', label: 'Sr. Manager / Director', rate: 1.75 },
    { id: 'executive', label: 'Executive / C-Suite', rate: 2.0 },
];
const BARDAL_AVAILABILITY = [
    { id: 'high', label: 'High', multiplier: 0.9 },
    { id: 'moderate', label: 'Moderate', multiplier: 1.0 },
    { id: 'low', label: 'Low', multiplier: 1.15 },
];
const bardalAgeFactor = (age: number) => {
    if (age >= 60) return 4;
    if (age >= 55) return 3;
    if (age >= 50) return 2;
    if (age >= 45) return 1;
    return 0;
};

interface BardalData { annualSalary: number; age: number; yearsOfService: number; positionLevel: string; fieldAvailability: string }

const renderBardal = (raw: string): string => {
    const d: BardalData = JSON.parse(raw);
    const position = BARDAL_POSITIONS.find((p) => p.id === d.positionLevel) ?? BARDAL_POSITIONS[2];
    const availability = BARDAL_AVAILABILITY.find((a) => a.id === d.fieldAvailability) ?? BARDAL_AVAILABILITY[1];

    const serviceMonths = position.rate * d.yearsOfService;
    const ageBonus = bardalAgeFactor(d.age);
    const rawMonths = serviceMonths + ageBonus;
    const adjustedMonths = rawMonths * availability.multiplier;
    const noticeMonths = Math.min(Math.max(Math.round(adjustedMonths * 2) / 2, 1), 24);
    const noticeLow = Math.max(noticeMonths - 1.5, 1);
    const noticeHigh = Math.min(noticeMonths + 1.5, 24);
    const monthlySalary = d.annualSalary / 12;
    const severance = monthlySalary * noticeMonths;
    const severanceLow = monthlySalary * noticeLow;
    const severanceHigh = monthlySalary * noticeHigh;

    return [
        h3('Employee Details'),
        table([
            ['Annual Salary', $(d.annualSalary)],
            ['Age', `${d.age} years`],
            ['Years of Service', `${d.yearsOfService} years`],
            ['Character of Employment', position.label],
            ['Availability of Similar Work', availability.label],
        ]),
        '',
        h3('Factor Breakdown'),
        table([
            ['Service Factor', `${num(serviceMonths, 1)} months (${d.yearsOfService} yrs × ${position.rate})`],
            ['Age Bonus', `${ageBonus} months`],
            ['Availability Adjustment', `×${availability.multiplier}`],
            ['Adjusted Notice Period', mo(noticeMonths)],
            ['Notice Range', `${noticeLow}–${noticeHigh} months`],
        ]),
        '',
        h3('Estimated Severance'),
        table([
            ['Monthly Salary', $(monthlySalary)],
            ['Estimated Severance', $(severance)],
            ['Severance Range', `${$(severanceLow)} – ${$(severanceHigh)}`],
        ]),
        '',
        `> *This is a general estimate using the Bardal factors. Actual entitlement depends on jurisdiction and specific facts. Consult an employment lawyer.*`,
    ].join('\n');
};

// ── Wrongful Dismissal ───────────────────────────────────────────────────────

const WD_POSITIONS = BARDAL_POSITIONS;
const WD_AVAILABILITY = BARDAL_AVAILABILITY;
const WD_DISMISSAL = [
    { id: 'without_cause', label: 'Without Cause' },
    { id: 'constructive', label: 'Constructive Dismissal' },
];

interface WDData {
    annualSalary: number; age: number; yearsOfService: number;
    positionLevel: string; fieldAvailability: string; dismissalType: string;
    badFaithDamages: boolean; writtenContract: boolean; mitigationMonths: number;
    feeType: string; contingencyPct: number; flatFee: number;
}

const renderWrongfulDismissal = (raw: string): string => {
    const d: WDData = JSON.parse(raw);
    const position = WD_POSITIONS.find((p) => p.id === d.positionLevel) ?? WD_POSITIONS[2];
    const availability = WD_AVAILABILITY.find((a) => a.id === d.fieldAvailability) ?? WD_AVAILABILITY[1];
    const dismissalLabel = WD_DISMISSAL.find((x) => x.id === d.dismissalType)?.label ?? d.dismissalType;
    const monthly = d.annualSalary / 12;

    const serviceMonths = position.rate * d.yearsOfService;
    const ageBonus = bardalAgeFactor(d.age);
    const raw2 = (serviceMonths + ageBonus) * availability.multiplier;
    const noticeMonths = Math.min(Math.max(Math.round(raw2 * 2) / 2, 1), 24);
    const noticeLow = Math.max(noticeMonths - 1.5, 1);
    const noticeHigh = Math.min(noticeMonths + 1.5, 24);

    const payInLieu = monthly * noticeMonths;
    const constructiveAdder = d.dismissalType === 'constructive' ? monthly * noticeMonths * 0.10 : 0;
    const badFaithAdder = d.badFaithDamages ? monthly * 2 : 0;
    const mitigationDeduction = monthly * d.mitigationMonths;
    const totalGross = payInLieu + constructiveAdder + badFaithAdder;
    const totalNet = Math.max(totalGross - mitigationDeduction, 0);
    const settlementLow = totalNet * 0.60;
    const settlementHigh = totalNet * 0.80;
    const legalFees = d.feeType === 'contingency'
        ? totalNet * (d.contingencyPct / 100)
        : d.flatFee;
    const netAfterLegal = Math.max(totalNet - legalFees, 0);

    const breakdownRows: [string, string][] = [
        ['Reasonable Notice Period', `${noticeMonths} months (range: ${noticeLow}–${noticeHigh})`],
        ['Pay in Lieu of Notice', $(payInLieu)],
    ];
    if (constructiveAdder > 0) breakdownRows.push(['Constructive Dismissal Uplift (+10%)', $(constructiveAdder)]);
    if (badFaithAdder > 0) breakdownRows.push(['Bad Faith Damages (+2 months)', $(badFaithAdder)]);
    breakdownRows.push(['Total Damages (Gross)', $(totalGross)]);
    if (mitigationDeduction > 0) breakdownRows.push([`Mitigation Deduction (${d.mitigationMonths} months earned)`, `-${$(mitigationDeduction)}`]);
    breakdownRows.push(['Total Damages (Net)', $(totalNet)]);
    breakdownRows.push([
        d.feeType === 'contingency' ? `Legal Fees (${d.contingencyPct}% contingency)` : 'Legal Fees (flat)',
        `-${$(legalFees)}`
    ]);
    breakdownRows.push(['Estimated Net After Fees', $(netAfterLegal)]);

    return [
        h3('Employment Details'),
        table([
            ['Annual Salary', $(d.annualSalary)],
            ['Age', `${d.age} years`],
            ['Years of Service', `${d.yearsOfService} years`],
            ['Character of Employment', position.label],
            ['Availability of Similar Work', availability.label],
            ['Type of Dismissal', dismissalLabel],
            ['Bad Faith Damages', d.badFaithDamages ? 'Yes' : 'No'],
            ['Written Employment Contract', d.writtenContract ? 'Yes (may limit entitlement)' : 'No'],
            ['Mitigation Income Earned', `${d.mitigationMonths} months`],
        ]),
        '',
        h3('Damages Breakdown'),
        table(breakdownRows),
        '',
        h3('Settlement Range'),
        table([
            ['Typical Settlement (60–80%)', `${$(settlementLow)} – ${$(settlementHigh)}`],
        ]),
        '',
        d.writtenContract
            ? `> ⚠️ **Written contract noted.** An enforceable termination clause may limit entitlement to statutory minimums. Consult a qualified employment lawyer.`
            : '',
        `> *This calculator provides general estimates based on common law reasonable notice. Results are for informational purposes only and do not constitute legal advice.*`,
    ].filter(Boolean).join('\n');
};

// ── Severance & EI ───────────────────────────────────────────────────────────

const SEV_PROVINCES = [
    { id: 'on', label: 'Ontario', termMax: 8, sevWeekPerYear: 1, sevMax: 26, sevMinYears: 5, sevLargeEmployer: true },
    { id: 'bc', label: 'BC', termMax: 8, sevWeekPerYear: 0, sevMax: 0, sevMinYears: 0, sevLargeEmployer: false },
    { id: 'ab', label: 'Alberta', termMax: 8, sevWeekPerYear: 0, sevMax: 0, sevMinYears: 0, sevLargeEmployer: false },
    { id: 'qc', label: 'Quebec', termMax: 8, sevWeekPerYear: 1, sevMax: 8, sevMinYears: 0, sevLargeEmployer: false },
    { id: 'other', label: 'Other / Federal', termMax: 8, sevWeekPerYear: 0, sevMax: 0, sevMinYears: 0, sevLargeEmployer: false },
];
const SEV_EI_REGIONS = [
    { id: 'low', label: 'Low (<6%)', rate: 5, minHours: 700, maxWeeks: 35 },
    { id: 'mod', label: 'Moderate (6–9%)', rate: 7.5, minHours: 595, maxWeeks: 40 },
    { id: 'high', label: 'High (9–13%)', rate: 11, minHours: 490, maxWeeks: 43 },
    { id: 'vhigh', label: 'Very High (>13%)', rate: 14, minHours: 420, maxWeeks: 45 },
];
const EI_MAX_INSURABLE = 63200;
const EI_BENEFIT_RATE = 0.55;
const EI_MAX_WEEKLY = Math.round((EI_MAX_INSURABLE / 52) * EI_BENEFIT_RATE);

interface SeveranceEIData {
    annualSalary: number; yearsOfService: number; province: string; largeEmployer: boolean;
    hoursPerWeek: number; weeksWorked: number; eiRegion: string; receivingSeveranceInLieu: boolean;
}

const renderSeveranceEI = (raw: string): string => {
    const d: SeveranceEIData = JSON.parse(raw);
    const province = SEV_PROVINCES.find(p => p.id === d.province) ?? SEV_PROVINCES[0];
    const region = SEV_EI_REGIONS.find(r => r.id === d.eiRegion) ?? SEV_EI_REGIONS[1];
    const weekly = d.annualSalary / 52;

    const termWeeks = Math.min(Math.max(d.yearsOfService, 0), province.termMax);
    const termPay = weekly * termWeeks;

    let sevWeeks = 0;
    if (province.sevWeekPerYear > 0) {
        const qualifies = d.yearsOfService >= province.sevMinYears && (!province.sevLargeEmployer || d.largeEmployer);
        if (qualifies) sevWeeks = Math.min(d.yearsOfService * province.sevWeekPerYear, province.sevMax);
    }
    const sevPay = weekly * sevWeeks;
    const totalESA = termPay + sevPay;

    const insurableHours = d.hoursPerWeek * d.weeksWorked;
    const eiQualifies = insurableHours >= region.minHours;
    const weeklyInsurable = Math.min(weekly, EI_MAX_INSURABLE / 52);
    const weeklyBenefit = Math.min(weeklyInsurable * EI_BENEFIT_RATE, EI_MAX_WEEKLY);
    const clampedHours = Math.min(Math.max(insurableHours, region.minHours), 1820);
    const durationWeeks = eiQualifies
        ? Math.round(14 + ((clampedHours - region.minHours) / (1820 - region.minHours)) * (region.maxWeeks - 14))
        : 0;
    const waitWeeks = d.receivingSeveranceInLieu ? termWeeks : 0;
    const eiTotal = weeklyBenefit * durationWeeks;
    const totalIncome = totalESA + eiTotal;
    const runwayMonths = totalIncome / (d.annualSalary / 12);

    return [
        h3('Employment Details'),
        table([
            ['Annual Salary', $(d.annualSalary)],
            ['Years of Service', `${d.yearsOfService} years`],
            ['Province', province.label],
            ['Hours per Week', `${d.hoursPerWeek} hrs`],
            ['Weeks Worked (last year)', `${d.weeksWorked} weeks`],
            ['EI Region Unemployment Rate', region.label],
            ['Receiving Pay in Lieu', d.receivingSeveranceInLieu ? 'Yes' : 'No'],
        ]),
        '',
        h3('ESA Entitlements'),
        table([
            ['Termination Pay', `${$(termPay)} (${termWeeks} weeks)`],
            ['Severance Pay', sevWeeks > 0 ? `${$(sevPay)} (${sevWeeks} weeks)` : 'Not applicable'],
            ['Total ESA', $(totalESA)],
        ]),
        '',
        h3('Employment Insurance'),
        table([
            ['Insurable Hours', `${num(insurableHours)} (need ${region.minHours})`],
            ['EI Qualification', eiQualifies ? '✓ Qualifies' : '✗ Does not qualify'],
            ...(eiQualifies ? [
                ['Weekly EI Benefit', $(weeklyBenefit)] as [string, string],
                ['EI Duration', `${durationWeeks} weeks`] as [string, string],
                ['Total EI', $(eiTotal)] as [string, string],
                ['EI Starts After', `${waitWeeks} week wait (pay in lieu period)`] as [string, string],
            ] : []),
        ]),
        '',
        h3('Summary'),
        table([
            ['Total ESA + EI Income', $(totalIncome)],
            ['Financial Runway', `~${runwayMonths.toFixed(1)} months`],
        ]),
    ].join('\n');
};

// ── Weight Loss ──────────────────────────────────────────────────────────────

const WL_ACTIVITY = [
    { id: 'sedentary', label: 'Sedentary', multiplier: 1.2 },
    { id: 'light', label: 'Light', multiplier: 1.375 },
    { id: 'moderate', label: 'Moderate', multiplier: 1.55 },
    { id: 'active', label: 'Active', multiplier: 1.725 },
    { id: 'very', label: 'Very Active', multiplier: 1.9 },
];

interface WeightLossData { currentWeight: number; targetWeight: number; weightUnit: string; height: number; heightUnit: string; age: number; sex: string; activityLevel: string }

const renderWeightLoss = (raw: string): string => {
    const d: WeightLossData = JSON.parse(raw);
    const toKg = (w: number) => d.weightUnit === 'lbs' ? w / 2.2046 : w;
    const toCm = (h: number) => d.heightUnit === 'in' ? h * 2.54 : h;
    const activity = WL_ACTIVITY.find(a => a.id === d.activityLevel) ?? WL_ACTIVITY[2];

    const weightKg = toKg(d.currentWeight);
    const targetKg = toKg(d.targetWeight);
    const heightCm = toCm(d.height);
    const bmr = d.sex === 'male'
        ? 10 * weightKg + 6.25 * heightCm - 5 * d.age + 5
        : 10 * weightKg + 6.25 * heightCm - 5 * d.age - 161;
    const tdee = Math.round(bmr * activity.multiplier);
    const tolosKg = Math.max(weightKg - targetKg, 0);
    const deficit = Math.round(Math.min(Math.max(tdee * 0.20, 250), Math.min(tdee - 1200, 1000)));
    const dailyTarget = tdee - deficit;
    const weeklyLossKg = (deficit * 7) / 7700;
    const weeklyLossLbs = weeklyLossKg * 2.2046;
    const weeksToGoal = tolosKg > 0 ? Math.ceil(tolosKg / weeklyLossKg) : 0;
    const monthsToGoal = (weeksToGoal / 4.33).toFixed(1);

    return [
        h3('Your Profile'),
        table([
            ['Current Weight', `${d.currentWeight} ${d.weightUnit}`],
            ['Target Weight', `${d.targetWeight} ${d.weightUnit}`],
            ['Weight to Lose', `${num(tolosKg * (d.weightUnit === 'lbs' ? 2.2046 : 1), 1)} ${d.weightUnit}`],
            ['Height', `${d.height} ${d.heightUnit}`],
            ['Age', `${d.age} years`],
            ['Sex', d.sex === 'male' ? 'Male' : 'Female'],
            ['Activity Level', activity.label],
        ]),
        '',
        h3('Calorie Targets'),
        table([
            ['Basal Metabolic Rate (BMR)', `${num(Math.round(bmr))} kcal/day`],
            ['Total Daily Energy Expenditure (TDEE)', `${num(tdee)} kcal/day`],
            ['Daily Calorie Deficit', `${num(deficit)} kcal`],
            ['Daily Calorie Target', `${num(dailyTarget)} kcal`],
        ]),
        '',
        h3('Progress Estimate'),
        table([
            ['Estimated Weekly Loss', `${num(weeklyLossKg, 2)} kg / ${num(weeklyLossLbs, 2)} lbs`],
            ['Weeks to Goal', `${weeksToGoal} weeks`],
            ['Months to Goal', `${monthsToGoal} months`],
        ]),
        '',
        `> *Deficit is set to 20% of TDEE, clamped to a safe range (250–1,000 kcal), keeping daily intake above 1,200 kcal.*`,
    ].join('\n');
};

// ── Calorie Deficit Planner ──────────────────────────────────────────────────

const CD_ACTIVITY = [
    { id: 'sedentary', label: 'Sedentary', multiplier: 1.2 },
    { id: 'light', label: 'Light', multiplier: 1.375 },
    { id: 'moderate', label: 'Moderate', multiplier: 1.55 },
    { id: 'active', label: 'Active', multiplier: 1.725 },
    { id: 'very', label: 'Very Active', multiplier: 1.9 },
];
const CD_GOALS = [
    { id: '0.5', label: '0.5 lbs/wk', deficit: 250 },
    { id: '1.0', label: '1 lb/wk', deficit: 500 },
    { id: '1.5', label: '1.5 lbs/wk', deficit: 750 },
    { id: '2.0', label: '2 lbs/wk', deficit: 1000 },
];

interface CalorieData { sex: string; age: number; currentWeight: number; weightUnit: string; height: number; heightUnit: string; activityLevel: string; weeklyGoal: string; exerciseCalories: number }

const renderCalorieDeficit = (raw: string): string => {
    const d: CalorieData = JSON.parse(raw);
    const toKg = (w: number) => d.weightUnit === 'lbs' ? w / 2.2046 : w;
    const toCm = (h: number) => d.heightUnit === 'in' ? h * 2.54 : h;
    const activity = CD_ACTIVITY.find(a => a.id === d.activityLevel) ?? CD_ACTIVITY[2];
    const goal = CD_GOALS.find(g => g.id === d.weeklyGoal) ?? CD_GOALS[1];

    const weightKg = toKg(d.currentWeight);
    const heightCm = toCm(d.height);
    const bmr = d.sex === 'male'
        ? 10 * weightKg + 6.25 * heightCm - 5 * d.age + 5
        : 10 * weightKg + 6.25 * heightCm - 5 * d.age - 161;
    const tdee = Math.round(bmr * activity.multiplier);
    const exercisePortion = Math.min(d.exerciseCalories, goal.deficit);
    const dietPortion = Math.max(goal.deficit - exercisePortion, 0);
    const dailyFoodTarget = tdee - dietPortion;
    const safe = dailyFoodTarget >= 1200;
    const safeDietPortion = safe ? dietPortion : Math.max(tdee - 1200, 0);
    const safeFoodTarget = tdee - safeDietPortion;
    const effectiveDeficit = safeDietPortion + exercisePortion;

    return [
        h3('Your Profile'),
        table([
            ['Sex', d.sex === 'male' ? 'Male' : 'Female'],
            ['Age', `${d.age} years`],
            ['Current Weight', `${d.currentWeight} ${d.weightUnit}`],
            ['Height', `${d.height} ${d.heightUnit}`],
            ['Activity Level', activity.label],
            ['Weekly Loss Goal', goal.label],
            ['Exercise Calories Burned', d.exerciseCalories > 0 ? `${d.exerciseCalories} kcal/day` : 'None'],
        ]),
        '',
        h3('Daily Calorie Plan'),
        table([
            ['Basal Metabolic Rate (BMR)', `${num(Math.round(bmr))} kcal/day`],
            ['Total Daily Energy Expenditure (TDEE)', `${num(tdee)} kcal/day`],
            ['Target Total Deficit', `${num(goal.deficit)} kcal/day`],
            ['From Exercise', `${num(exercisePortion)} kcal/day`],
            ['From Diet (eat less)', `${num(safeDietPortion)} kcal/day`],
            ['Daily Food Target', `${num(safeFoodTarget)} kcal/day`],
            ['Effective Daily Deficit', `${num(effectiveDeficit)} kcal/day`],
        ]),
        !safe ? `\n> ⚠️ Your food target was adjusted to stay above 1,200 kcal/day, which reduces your effective deficit.` : '',
    ].filter(Boolean).join('\n');
};

// ── Protein Intake ───────────────────────────────────────────────────────────

const PR_ACTIVITY = [
    { id: 'sedentary', label: 'Sedentary', rate: 0.8 },
    { id: 'light', label: 'Light', rate: 1.1 },
    { id: 'moderate', label: 'Moderate', rate: 1.4 },
    { id: 'active', label: 'Active', rate: 1.7 },
    { id: 'athlete', label: 'Athlete', rate: 2.1 },
];
const SCOOP_GRAMS = 25;
const prAgeFactor = (age: number) => age >= 65 ? 0.2 : age >= 50 ? 0.1 : 0;

interface ProteinData { weight: number; weightUnit: string; age: number; activityLevel: string }

const renderProtein = (raw: string): string => {
    const d: ProteinData = JSON.parse(raw);
    const toKg = (w: number) => d.weightUnit === 'lbs' ? w / 2.2046 : w;
    const activity = PR_ACTIVITY.find(a => a.id === d.activityLevel) ?? PR_ACTIVITY[2];
    const weightKg = toKg(d.weight);
    const ageFactor = prAgeFactor(d.age);
    const rateGPerKg = activity.rate + ageFactor;

    const proteinG = Math.round(weightKg * rateGPerKg);
    const proteinLow = Math.round(weightKg * (rateGPerKg - 0.15));
    const proteinHigh = Math.round(weightKg * (rateGPerKg + 0.15));
    const scoops = (proteinG / SCOOP_GRAMS).toFixed(1);
    const scoopsLow = (proteinLow / SCOOP_GRAMS).toFixed(1);
    const scoopsHigh = (proteinHigh / SCOOP_GRAMS).toFixed(1);

    return [
        h3('Your Profile'),
        table([
            ['Weight', `${d.weight} ${d.weightUnit} (${num(Math.round(weightKg * 10) / 10, 1)} kg)`],
            ['Age', `${d.age} years`],
            ['Activity Level', activity.label],
        ]),
        '',
        h3('Daily Protein Target'),
        table([
            ['Protein Rate Applied', `${num(rateGPerKg, 2)} g/kg${ageFactor > 0 ? ` (includes +${ageFactor} age bonus)` : ''}`],
            ['Recommended Daily Protein', `${proteinG} g`],
            ['Recommended Range', `${proteinLow} – ${proteinHigh} g`],
            ['Protein Powder Scoops (25g)', `${scoops} scoops (range: ${scoopsLow}–${scoopsHigh})`],
        ]),
    ].join('\n');
};

// ── Days Between ─────────────────────────────────────────────────────────────

interface DaysBetweenData { startDate: string; endDate: string }

const renderDaysBetween = (raw: string): string => {
    const d: DaysBetweenData = JSON.parse(raw);
    const start = new Date(d.startDate);
    const end = new Date(d.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return '> Invalid dates.';

    const diffMs = end.getTime() - start.getTime();
    const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
    const absDays = Math.abs(days);
    const wholeWeeks = Math.floor(absDays / 7);
    const remainderDays = absDays % 7;
    const wholeMonths = Math.floor(absDays / 30.4375);
    const years = Math.floor(absDays / 365.25);
    const direction = days === 0 ? 'the same day' : days > 0 ? 'in the future' : 'in the past';

    return [
        h3('Date Range'),
        table([
            ['Start Date', d.startDate],
            ['End Date', d.endDate],
            ['Direction', direction],
        ]),
        '',
        h3('Results'),
        table([
            ['Total Days', `${num(absDays)} days`],
            ['In Weeks', `${wholeWeeks} weeks, ${remainderDays} days`],
            ['In Months', `~${wholeMonths} months`],
            ['In Years', `~${years} years`],
        ]),
    ].join('\n');
};

// ── Career Path Projection ───────────────────────────────────────────────────

interface CareerData { currentSalary: number; annualRaise: number; yearsToModel: number; promotionEveryYears: number; promotionBump: number; jobHopEveryYears: number; jobHopBump: number }

const projectCareer = (salary: number, years: number, annualRaise: number, eventEvery: number, eventBump: number) => {
    let s = salary;
    let lifetime = 0;
    for (let y = 0; y <= years; y++) {
        if (y > 0) {
            s = s * (1 + annualRaise / 100);
            if (eventEvery > 0 && y % eventEvery === 0) s = s * (1 + eventBump / 100);
        }
        lifetime += s;
    }
    return { finalSalary: Math.round(s), lifetimeEarnings: Math.round(lifetime) };
};

const renderCareer = (raw: string): string => {
    const d: CareerData = JSON.parse(raw);
    const stay = projectCareer(d.currentSalary, d.yearsToModel, d.annualRaise, d.promotionEveryYears, d.promotionBump);
    const hop = projectCareer(d.currentSalary, d.yearsToModel, d.annualRaise, d.jobHopEveryYears, d.jobHopBump);
    const noGrowth = projectCareer(d.currentSalary, d.yearsToModel, 0, 0, 0);
    const salaryDiff = stay.finalSalary - hop.finalSalary;
    const lifetimeDiff = hop.lifetimeEarnings - stay.lifetimeEarnings;

    return [
        h3('Parameters'),
        table([
            ['Starting Salary', $(d.currentSalary)],
            ['Annual Raise', pct(d.annualRaise)],
            ['Years Modelled', `${d.yearsToModel} years`],
        ]),
        '',
        h3('Scenario A — Stay & Promote'),
        table([
            ['Promotion Every', `${d.promotionEveryYears} years`],
            ['Promotion Salary Bump', pct(d.promotionBump)],
            [`Salary at Year ${d.yearsToModel}`, $(stay.finalSalary)],
            ['Lifetime Earnings', $(stay.lifetimeEarnings)],
        ]),
        '',
        h3('Scenario B — Job Hop'),
        table([
            ['Change Companies Every', `${d.jobHopEveryYears} years`],
            ['Salary Bump per Move', pct(d.jobHopBump)],
            [`Salary at Year ${d.yearsToModel}`, $(hop.finalSalary)],
            ['Lifetime Earnings', $(hop.lifetimeEarnings)],
        ]),
        '',
        h3('No Growth Baseline'),
        table([
            [`Salary at Year ${d.yearsToModel}`, $(noGrowth.finalSalary)],
            ['Lifetime Earnings', $(noGrowth.lifetimeEarnings)],
        ]),
        '',
        h3('Comparison'),
        table([
            ['Final Salary Difference (Stay vs Hop)', salaryDiff >= 0 ? `Stay pays ${$(Math.abs(salaryDiff))} more` : `Job Hop pays ${$(Math.abs(salaryDiff))} more`],
            ['Lifetime Earnings Difference', lifetimeDiff > 0 ? `Job Hop earns ${$(lifetimeDiff)} more overall` : `Stay earns ${$(Math.abs(lifetimeDiff))} more overall`],
        ]),
    ].join('\n');
};

// ── zip builder ──────────────────────────────────────────────────────────────

interface FileEntry {
    filename: string;
    storageKey: string;
    render: (raw: string) => string;
}

const FILE_MAP: FileEntry[] = [
    { filename: 'Salary & Taxes.md',          storageKey: 'salary_profiles',        render: renderSalary },
    { filename: 'Mortgage Equity.md',          storageKey: 'mortgage_profiles',      render: renderMortgage },
    { filename: 'Wealth Growth.md',            storageKey: 'investment_profiles',    render: renderInvestment },
    { filename: 'Debt Repayment.md',           storageKey: 'debt_scenarios',         render: renderDebt },
    { filename: 'Goals Tracking.md',           storageKey: 'goals_profiles',         render: renderGoals },
    { filename: 'Time Allocation.md',          storageKey: 'time_profiles',          render: renderTime },
    { filename: 'Bardal Factor.md',            storageKey: 'bardal_data',            render: renderBardal },
    { filename: 'Wrongful Dismissal.md',       storageKey: 'wrongfuldismissal_data', render: renderWrongfulDismissal },
    { filename: 'Severance & EI.md',           storageKey: 'severanceei_data',       render: renderSeveranceEI },
    { filename: 'Weight Loss.md',              storageKey: 'weightloss_data',        render: renderWeightLoss },
    { filename: 'Calorie Deficit Planner.md',  storageKey: 'caloriedeficit_data',    render: renderCalorieDeficit },
    { filename: 'Protein Intake.md',           storageKey: 'protein_data',           render: renderProtein },
    { filename: 'Days Between.md',             storageKey: 'daysbetween_data',       render: renderDaysBetween },
    { filename: 'Career Path Projection.md',   storageKey: 'careerpath_data',        render: renderCareer },
];

const buildZip = async (frontmatter: string | null): Promise<Blob> => {
    const zip = new JSZip();

    for (const entry of FILE_MAP) {
        const raw = localStorage.getItem(entry.storageKey);
        if (!raw) continue;
        try {
            const body = entry.render(raw);
            if (!body.trim()) continue;
            const title = entry.filename.replace('.md', '');
            const header = frontmatter
                ? `${frontmatter}\n\n# ${title}\n\n`
                : `# ${title}\n\n`;
            zip.file(entry.filename, header + body + '\n');
        } catch {
            // skip silently if stored data is malformed
        }
    }

    return zip.generateAsync({ type: 'blob' });
};

const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
};

export const exportNotion = async (): Promise<void> => {
    const blob = await buildZip(null);
    triggerDownload(blob, `whatif-notion-${new Date().toISOString().split('T')[0]}.zip`);
};

export const exportObsidian = async (): Promise<void> => {
    const blob = await buildZip('---\ntags: [whatif]\n---');
    triggerDownload(blob, `whatif-obsidian-${new Date().toISOString().split('T')[0]}.zip`);
};

// ── MCP / RAG JSON export ─────────────────────────────────────────────────────

type KV = Record<string, string>;
type ProfileEntry = { profile: string; inputs: KV; results: KV };
type SingleEntry  = { inputs: KV; results: KV };

const dataFromSalary = (raw: string): ProfileEntry[] =>
    (JSON.parse(raw) as SalaryProfile[]).map((p) => {
        const d = p.data;
        const annual401k     = (d.annualGross * d.contribution401k) / 100;
        const taxableIncome  = d.annualGross - annual401k;
        const annualTax      = (taxableIncome * d.taxRate) / 100;
        const takeHomeAnnual = taxableIncome - annualTax;
        const takeHomeMonthly = takeHomeAnnual / 12;
        const monthlySavings  = takeHomeMonthly - d.monthlyExpenses;
        return {
            profile: p.name,
            inputs: {
                'Annual Gross Salary':       $(d.annualGross),
                'Tax Rate':                  pct(d.taxRate),
                'Retirement Contribution':   pct(d.contribution401k),
                'Monthly Expenses':          $(d.monthlyExpenses),
            },
            results: {
                'Annual Retirement Contribution': $(annual401k),
                'Taxable Income':                 $(taxableIncome),
                'Annual Tax':                     $(annualTax),
                'Take-Home Pay (Annual)':         $(takeHomeAnnual),
                'Take-Home Pay (Monthly)':        $(takeHomeMonthly),
                'Monthly Savings After Expenses': monthlySavings >= 0 ? $(monthlySavings) : `-${$(-monthlySavings)}`,
            },
        };
    });

const dataFromMortgage = (raw: string): ProfileEntry[] =>
    (JSON.parse(raw) as MortgageProfile[]).map((p) => {
        const d = p.data;
        const principal    = d.homePrice - d.downPayment;
        const monthlyRate  = d.interestRate / 100 / 12;
        const n            = d.termYears * 12;
        const monthlyPI    = (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
        const monthlyTaxes = d.annualTaxes / 12;
        const totalMonthly = monthlyPI + monthlyTaxes;
        const totalInterest = monthlyPI * n - principal;
        const totalCost    = d.homePrice + totalInterest + d.annualTaxes * d.termYears;
        return {
            profile: p.name,
            inputs: {
                'Home Price':            $(d.homePrice),
                'Down Payment':          `${$(d.downPayment)} (${((d.downPayment / d.homePrice) * 100).toFixed(1)}%)`,
                'Interest Rate':         pct(d.interestRate),
                'Loan Term':             `${d.termYears} years`,
                'Annual Property Taxes': $(d.annualTaxes),
            },
            results: {
                'Loan Amount':                   $(principal),
                'Monthly Principal & Interest':  $d(monthlyPI),
                'Monthly Taxes':                 $d(monthlyTaxes),
                'Total Monthly Payment':         $d(totalMonthly),
                'Total Interest Paid':           $(totalInterest),
                'Total Cost of Home':            $(totalCost),
            },
        };
    });

const dataFromInvestment = (raw: string): ProfileEntry[] =>
    (JSON.parse(raw) as InvestmentProfile[]).map((p) => {
        const d = p.data;
        let balance = d.initialAmount;
        let invested = d.initialAmount;
        const rate = d.annualReturn / 100 / 12;
        for (let i = 0; i < d.years; i++)
            for (let m = 0; m < 12; m++) { balance = (balance + d.monthlyContribution) * (1 + rate); invested += d.monthlyContribution; }
        return {
            profile: p.name,
            inputs: {
                'Initial Investment':     $(d.initialAmount),
                'Monthly Contribution':   $(d.monthlyContribution),
                'Expected Annual Return': pct(d.annualReturn),
                'Time Horizon':           `${d.years} years`,
            },
            results: {
                'Total Contributed':   $(invested),
                'Investment Growth':   $(balance - invested),
                'Final Portfolio Value': $(balance),
                'Return Multiple':     `${(balance / invested).toFixed(2)}×`,
            },
        };
    });

const dataFromDebt = (raw: string): ProfileEntry[] =>
    (JSON.parse(raw) as DebtScenario[]).map((s) => {
        const d = s.data;
        const monthlyRate = d.annualRate / 100 / 12;
        const minPayment  = d.balance * monthlyRate;
        if (d.monthlyPayment <= minPayment) return {
            profile: s.name,
            inputs: { 'Debt Balance': $(d.balance), 'Annual Interest Rate': pct(d.annualRate), 'Monthly Payment': $(d.monthlyPayment) },
            results: { 'Warning': `Payment of ${$(d.monthlyPayment)} does not cover monthly interest of ${$d(minPayment)}` },
        };
        let balance = d.balance, totalPaid = 0, month = 0;
        while (balance > 0.01 && month <= 360) {
            const interest = balance * monthlyRate;
            balance -= Math.min(d.monthlyPayment - interest, balance);
            totalPaid += d.monthlyPayment;
            month++;
        }
        const years = Math.floor(month / 12), months = month % 12;
        return {
            profile: s.name,
            inputs: { 'Debt Balance': $(d.balance), 'Annual Interest Rate': pct(d.annualRate), 'Monthly Payment': $(d.monthlyPayment) },
            results: {
                'Time to Pay Off':        years > 0 ? `${years} yr${years !== 1 ? 's' : ''} ${months} mo` : `${months} months`,
                'Total Paid':             $(totalPaid),
                'Total Interest Paid':    $(totalPaid - d.balance),
                'Interest as % of Balance': `${(((totalPaid - d.balance) / d.balance) * 100).toFixed(1)}%`,
            },
        };
    });

const dataFromGoals = (raw: string): ProfileEntry[] =>
    (JSON.parse(raw) as GoalsProfile[]).map((p) => {
        const goals = p.data.goals;
        const totalTarget  = goals.reduce((a, g) => a + g.target, 0);
        const totalCurrent = goals.reduce((a, g) => a + g.current, 0);
        const goalSummary  = Object.fromEntries(goals.map((g) => {
            const gpct = g.target > 0 ? ((g.current / g.target) * 100).toFixed(1) : '0';
            const remaining = g.target - g.current;
            return [g.name, `${$(g.current)} of ${$(g.target)} (${gpct}%)${remaining <= 0 ? ' — Complete' : ''}`];
        }));
        return {
            profile: p.name,
            inputs: goalSummary,
            results: {
                'Total Saved':     $(totalCurrent),
                'Total Target':    $(totalTarget),
                'Overall Progress': `${totalTarget > 0 ? ((totalCurrent / totalTarget) * 100).toFixed(1) : 0}%`,
                'Remaining':       $(Math.max(totalTarget - totalCurrent, 0)),
            },
        };
    });

const dataFromTime = (raw: string): ProfileEntry[] =>
    (JSON.parse(raw) as TimeProfile[]).map((p) => {
        const d = p.data;
        const total = d.sleep + d.work + d.chores + d.fitness + d.leisure + d.learning;
        const pctOf = (h: number) => `${h} hrs (${((h / 168) * 100).toFixed(1)}%)`;
        return {
            profile: p.name,
            inputs: {
                'Sleep': pctOf(d.sleep), 'Work': pctOf(d.work), 'Chores / Errands': pctOf(d.chores),
                'Fitness': pctOf(d.fitness), 'Leisure': pctOf(d.leisure), 'Learning': pctOf(d.learning),
            },
            results: {
                'Total Allocated': `${total} hrs`,
                'Unallocated':     `${168 - total} hrs`,
                'Status':          total > 168 ? `Over by ${total - 168} hrs` : total === 168 ? 'Fully allocated' : `${168 - total} hrs free`,
            },
        };
    });

const dataFromBardal = (raw: string): SingleEntry => {
    const d: BardalData = JSON.parse(raw);
    const position     = BARDAL_POSITIONS.find((p) => p.id === d.positionLevel) ?? BARDAL_POSITIONS[2];
    const availability = BARDAL_AVAILABILITY.find((a) => a.id === d.fieldAvailability) ?? BARDAL_AVAILABILITY[1];
    const serviceMonths  = position.rate * d.yearsOfService;
    const ageBonus       = bardalAgeFactor(d.age);
    const noticeMonths   = Math.min(Math.max(Math.round((serviceMonths + ageBonus) * availability.multiplier * 2) / 2, 1), 24);
    const noticeLow      = Math.max(noticeMonths - 1.5, 1);
    const noticeHigh     = Math.min(noticeMonths + 1.5, 24);
    const monthly        = d.annualSalary / 12;
    return {
        inputs: {
            'Annual Salary': $(d.annualSalary), 'Age': `${d.age} years`,
            'Years of Service': `${d.yearsOfService} years`, 'Position Level': position.label,
            'Field Availability': availability.label,
        },
        results: {
            'Estimated Notice Period': mo(noticeMonths),
            'Notice Range':            `${noticeLow}–${noticeHigh} months`,
            'Monthly Salary':          $(monthly),
            'Estimated Severance':     $(monthly * noticeMonths),
            'Severance Range':         `${$(monthly * noticeLow)} – ${$(monthly * noticeHigh)}`,
        },
    };
};

const dataFromWrongfulDismissal = (raw: string): SingleEntry => {
    const d: WDData = JSON.parse(raw);
    const position     = WD_POSITIONS.find((p) => p.id === d.positionLevel) ?? WD_POSITIONS[2];
    const availability = WD_AVAILABILITY.find((a) => a.id === d.fieldAvailability) ?? WD_AVAILABILITY[1];
    const monthly      = d.annualSalary / 12;
    const rawMonths    = (position.rate * d.yearsOfService + bardalAgeFactor(d.age)) * availability.multiplier;
    const noticeMonths = Math.min(Math.max(Math.round(rawMonths * 2) / 2, 1), 24);
    const payInLieu    = monthly * noticeMonths;
    const constructiveAdder = d.dismissalType === 'constructive' ? payInLieu * 0.10 : 0;
    const badFaithAdder     = d.badFaithDamages ? monthly * 2 : 0;
    const totalNet     = Math.max(payInLieu + constructiveAdder + badFaithAdder - monthly * d.mitigationMonths, 0);
    const legalFees    = d.feeType === 'contingency' ? totalNet * (d.contingencyPct / 100) : d.flatFee;
    return {
        inputs: {
            'Annual Salary': $(d.annualSalary), 'Age': `${d.age} years`,
            'Years of Service': `${d.yearsOfService} years`, 'Position Level': position.label,
            'Dismissal Type': WD_DISMISSAL.find((x) => x.id === d.dismissalType)?.label ?? d.dismissalType,
            'Bad Faith Damages': d.badFaithDamages ? 'Yes' : 'No',
            'Written Contract': d.writtenContract ? 'Yes' : 'No',
            'Mitigation Income Earned': `${d.mitigationMonths} months`,
        },
        results: {
            'Reasonable Notice Period': mo(noticeMonths),
            'Total Damages (Net)':      $(totalNet),
            'Settlement Range':         `${$(totalNet * 0.60)} – ${$(totalNet * 0.80)}`,
            'Legal Fees':               $(legalFees),
            'Estimated Net After Fees': $(Math.max(totalNet - legalFees, 0)),
        },
    };
};

const dataFromSeveranceEI = (raw: string): SingleEntry => {
    const d: SeveranceEIData = JSON.parse(raw);
    const province     = SEV_PROVINCES.find((p) => p.id === d.province) ?? SEV_PROVINCES[0];
    const region       = SEV_EI_REGIONS.find((r) => r.id === d.eiRegion) ?? SEV_EI_REGIONS[1];
    const weekly       = d.annualSalary / 52;
    const termWeeks    = Math.min(Math.max(d.yearsOfService, 0), province.termMax);
    const termPay      = weekly * termWeeks;
    let sevWeeks = 0;
    if (province.sevWeekPerYear > 0) {
        const qualifies = d.yearsOfService >= province.sevMinYears && (!province.sevLargeEmployer || d.largeEmployer);
        if (qualifies) sevWeeks = Math.min(d.yearsOfService * province.sevWeekPerYear, province.sevMax);
    }
    const totalESA       = termPay + weekly * sevWeeks;
    const insurableHours = d.hoursPerWeek * d.weeksWorked;
    const eiQualifies    = insurableHours >= region.minHours;
    const weeklyBenefit  = Math.min(Math.min(weekly, EI_MAX_INSURABLE / 52) * EI_BENEFIT_RATE, EI_MAX_WEEKLY);
    const clampedHours   = Math.min(Math.max(insurableHours, region.minHours), 1820);
    const durationWeeks  = eiQualifies ? Math.round(14 + ((clampedHours - region.minHours) / (1820 - region.minHours)) * (region.maxWeeks - 14)) : 0;
    const eiTotal        = weeklyBenefit * durationWeeks;
    const totalIncome    = totalESA + eiTotal;
    return {
        inputs: {
            'Annual Salary': $(d.annualSalary), 'Years of Service': `${d.yearsOfService} years`,
            'Province': province.label, 'EI Region': region.label,
            'Hours per Week': `${d.hoursPerWeek}`, 'Weeks Worked': `${d.weeksWorked}`,
            'Receiving Pay in Lieu': d.receivingSeveranceInLieu ? 'Yes' : 'No',
        },
        results: {
            'Termination Pay':     `${$(termPay)} (${termWeeks} weeks)`,
            'Severance Pay':       sevWeeks > 0 ? `${$(weekly * sevWeeks)} (${sevWeeks} weeks)` : 'Not applicable',
            'Total ESA':           $(totalESA),
            'EI Qualification':    eiQualifies ? 'Qualifies' : 'Does not qualify',
            'Weekly EI Benefit':   eiQualifies ? $(weeklyBenefit) : 'N/A',
            'EI Duration':         eiQualifies ? `${durationWeeks} weeks` : 'N/A',
            'Total EI':            eiQualifies ? $(eiTotal) : 'N/A',
            'Total ESA + EI':      $(totalIncome),
            'Financial Runway':    `~${(totalIncome / (d.annualSalary / 12)).toFixed(1)} months`,
        },
    };
};

const dataFromWeightLoss = (raw: string): SingleEntry => {
    const d: WeightLossData = JSON.parse(raw);
    const toKg  = (w: number) => d.weightUnit === 'lbs' ? w / 2.2046 : w;
    const toCm  = (h: number) => d.heightUnit === 'in'  ? h * 2.54   : h;
    const activity = WL_ACTIVITY.find((a) => a.id === d.activityLevel) ?? WL_ACTIVITY[2];
    const weightKg = toKg(d.currentWeight), targetKg = toKg(d.targetWeight), heightCm = toCm(d.height);
    const bmr  = d.sex === 'male' ? 10 * weightKg + 6.25 * heightCm - 5 * d.age + 5 : 10 * weightKg + 6.25 * heightCm - 5 * d.age - 161;
    const tdee = Math.round(bmr * activity.multiplier);
    const deficit      = Math.round(Math.min(Math.max(tdee * 0.20, 250), Math.min(tdee - 1200, 1000)));
    const tolosKg      = Math.max(weightKg - targetKg, 0);
    const weeklyLossKg = (deficit * 7) / 7700;
    const weeksToGoal  = tolosKg > 0 ? Math.ceil(tolosKg / weeklyLossKg) : 0;
    return {
        inputs: {
            'Current Weight': `${d.currentWeight} ${d.weightUnit}`, 'Target Weight': `${d.targetWeight} ${d.weightUnit}`,
            'Height': `${d.height} ${d.heightUnit}`, 'Age': `${d.age} years`,
            'Sex': d.sex === 'male' ? 'Male' : 'Female', 'Activity Level': activity.label,
        },
        results: {
            'BMR':                 `${Math.round(bmr)} kcal/day`,
            'TDEE':                `${tdee} kcal/day`,
            'Daily Calorie Deficit': `${deficit} kcal`,
            'Daily Calorie Target':  `${tdee - deficit} kcal`,
            'Weekly Loss Estimate':  `${num(weeklyLossKg * (d.weightUnit === 'lbs' ? 2.2046 : 1), 2)} ${d.weightUnit}`,
            'Weeks to Goal':         `${weeksToGoal} weeks`,
            'Months to Goal':        `${(weeksToGoal / 4.33).toFixed(1)} months`,
        },
    };
};

const dataFromCalorieDeficit = (raw: string): SingleEntry => {
    const d: CalorieData = JSON.parse(raw);
    const toKg  = (w: number) => d.weightUnit === 'lbs' ? w / 2.2046 : w;
    const toCm  = (h: number) => d.heightUnit === 'in'  ? h * 2.54   : h;
    const activity = CD_ACTIVITY.find((a) => a.id === d.activityLevel) ?? CD_ACTIVITY[2];
    const goal     = CD_GOALS.find((g) => g.id === d.weeklyGoal) ?? CD_GOALS[1];
    const weightKg = toKg(d.currentWeight), heightCm = toCm(d.height);
    const bmr  = d.sex === 'male' ? 10 * weightKg + 6.25 * heightCm - 5 * d.age + 5 : 10 * weightKg + 6.25 * heightCm - 5 * d.age - 161;
    const tdee = Math.round(bmr * activity.multiplier);
    const exercisePortion = Math.min(d.exerciseCalories, goal.deficit);
    const safeDietPortion = Math.max(Math.min(goal.deficit - exercisePortion, tdee - 1200), 0);
    const effectiveDeficit = safeDietPortion + exercisePortion;
    return {
        inputs: {
            'Sex': d.sex === 'male' ? 'Male' : 'Female', 'Age': `${d.age} years`,
            'Weight': `${d.currentWeight} ${d.weightUnit}`, 'Height': `${d.height} ${d.heightUnit}`,
            'Activity Level': activity.label, 'Weekly Loss Goal': goal.label,
            'Exercise Calories': d.exerciseCalories > 0 ? `${d.exerciseCalories} kcal/day` : 'None',
        },
        results: {
            'BMR':                   `${Math.round(bmr)} kcal/day`,
            'TDEE':                  `${tdee} kcal/day`,
            'From Exercise':         `${exercisePortion} kcal/day`,
            'From Diet':             `${safeDietPortion} kcal/day`,
            'Daily Food Target':     `${tdee - safeDietPortion} kcal/day`,
            'Effective Daily Deficit': `${effectiveDeficit} kcal/day`,
        },
    };
};

const dataFromProtein = (raw: string): SingleEntry => {
    const d: ProteinData = JSON.parse(raw);
    const toKg     = (w: number) => d.weightUnit === 'lbs' ? w / 2.2046 : w;
    const activity = PR_ACTIVITY.find((a) => a.id === d.activityLevel) ?? PR_ACTIVITY[2];
    const weightKg = toKg(d.weight);
    const ageFactor   = prAgeFactor(d.age);
    const rateGPerKg  = activity.rate + ageFactor;
    const proteinG    = Math.round(weightKg * rateGPerKg);
    const proteinLow  = Math.round(weightKg * (rateGPerKg - 0.15));
    const proteinHigh = Math.round(weightKg * (rateGPerKg + 0.15));
    return {
        inputs: {
            'Weight': `${d.weight} ${d.weightUnit}`, 'Age': `${d.age} years`, 'Activity Level': activity.label,
        },
        results: {
            'Protein Rate': `${num(rateGPerKg, 2)} g/kg${ageFactor > 0 ? ` (includes +${ageFactor} age bonus)` : ''}`,
            'Recommended Daily Protein': `${proteinG} g`,
            'Recommended Range':         `${proteinLow} – ${proteinHigh} g`,
            'Protein Powder Scoops (25g)': `${(proteinG / SCOOP_GRAMS).toFixed(1)} scoops`,
        },
    };
};

const dataFromDaysBetween = (raw: string): SingleEntry => {
    const d: DaysBetweenData = JSON.parse(raw);
    const start = new Date(d.startDate), end = new Date(d.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return { inputs: {}, results: { 'Error': 'Invalid dates' } };
    const diffMs   = end.getTime() - start.getTime();
    const days     = Math.round(diffMs / (1000 * 60 * 60 * 24));
    const absDays  = Math.abs(days);
    return {
        inputs: { 'Start Date': d.startDate, 'End Date': d.endDate },
        results: {
            'Direction':   days === 0 ? 'Same day' : days > 0 ? 'Future' : 'Past',
            'Total Days':  `${num(absDays)} days`,
            'In Weeks':    `${Math.floor(absDays / 7)} weeks, ${absDays % 7} days`,
            'In Months':   `~${Math.floor(absDays / 30.4375)} months`,
            'In Years':    `~${Math.floor(absDays / 365.25)} years`,
        },
    };
};

const dataFromCareer = (raw: string): SingleEntry => {
    const d: CareerData = JSON.parse(raw);
    const stay    = projectCareer(d.currentSalary, d.yearsToModel, d.annualRaise, d.promotionEveryYears, d.promotionBump);
    const hop     = projectCareer(d.currentSalary, d.yearsToModel, d.annualRaise, d.jobHopEveryYears, d.jobHopBump);
    const noGrowth = projectCareer(d.currentSalary, d.yearsToModel, 0, 0, 0);
    const lifetimeDiff = hop.lifetimeEarnings - stay.lifetimeEarnings;
    return {
        inputs: {
            'Starting Salary': $(d.currentSalary), 'Annual Raise': pct(d.annualRaise),
            'Years Modelled': `${d.yearsToModel} years`,
            'Promotion Every': `${d.promotionEveryYears} years`, 'Promotion Bump': pct(d.promotionBump),
            'Job Hop Every': `${d.jobHopEveryYears} years`, 'Job Hop Bump': pct(d.jobHopBump),
        },
        results: {
            [`Stay & Promote — Salary at Year ${d.yearsToModel}`]: $(stay.finalSalary),
            'Stay & Promote — Lifetime Earnings':                   $(stay.lifetimeEarnings),
            [`Job Hop — Salary at Year ${d.yearsToModel}`]:         $(hop.finalSalary),
            'Job Hop — Lifetime Earnings':                          $(hop.lifetimeEarnings),
            'No Growth Baseline — Lifetime Earnings':               $(noGrowth.lifetimeEarnings),
            'Lifetime Earnings Advantage':                          lifetimeDiff > 0
                ? `Job Hop earns ${$(lifetimeDiff)} more`
                : `Stay earns ${$(Math.abs(lifetimeDiff))} more`,
        },
    };
};

interface DataEntry {
    label: string;
    storageKey: string;
    renderData: (raw: string) => ProfileEntry[] | SingleEntry;
}

const DATA_MAP: DataEntry[] = [
    { label: 'Salary & Taxes',         storageKey: 'salary_profiles',        renderData: dataFromSalary },
    { label: 'Mortgage Equity',         storageKey: 'mortgage_profiles',      renderData: dataFromMortgage },
    { label: 'Wealth Growth',           storageKey: 'investment_profiles',    renderData: dataFromInvestment },
    { label: 'Debt Repayment',          storageKey: 'debt_scenarios',         renderData: dataFromDebt },
    { label: 'Goals Tracking',          storageKey: 'goals_profiles',         renderData: dataFromGoals },
    { label: 'Time Allocation',         storageKey: 'time_profiles',          renderData: dataFromTime },
    { label: 'Bardal Factor',           storageKey: 'bardal_data',            renderData: dataFromBardal },
    { label: 'Wrongful Dismissal',      storageKey: 'wrongfuldismissal_data', renderData: dataFromWrongfulDismissal },
    { label: 'Severance & EI',          storageKey: 'severanceei_data',       renderData: dataFromSeveranceEI },
    { label: 'Weight Loss',             storageKey: 'weightloss_data',        renderData: dataFromWeightLoss },
    { label: 'Calorie Deficit Planner', storageKey: 'caloriedeficit_data',    renderData: dataFromCalorieDeficit },
    { label: 'Protein Intake',          storageKey: 'protein_data',           renderData: dataFromProtein },
    { label: 'Days Between',            storageKey: 'daysbetween_data',       renderData: dataFromDaysBetween },
    { label: 'Career Path Projection',  storageKey: 'careerpath_data',        renderData: dataFromCareer },
];

export const exportMcpRag = (): void => {
    const calculators: Record<string, unknown> = {};

    for (const entry of DATA_MAP) {
        const raw = localStorage.getItem(entry.storageKey);
        if (!raw) continue;
        try {
            calculators[entry.label] = entry.renderData(raw);
        } catch {
            // skip malformed data
        }
    }

    const payload = {
        source:    'What-If Dashboard',
        exported:  new Date().toISOString().split('T')[0],
        calculators,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    triggerDownload(blob, `whatif-rag-${payload.exported}.json`);
};
