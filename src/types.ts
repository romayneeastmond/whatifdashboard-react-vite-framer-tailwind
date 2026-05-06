export type CalculatorType = 'salary' | 'mortgage' | 'investing' | 'time' | 'goals';

export interface SalaryData {
  annualGross: number;
  taxRate: number;
  contribution401k: number;
  monthlyExpenses: number;
}

export interface MortgageData {
  homePrice: number;
  downPayment: number;
  interestRate: number;
  termYears: number;
  annualTaxes: number;
}

export interface InvestmentData {
  initialAmount: number;
  monthlyContribution: number;
  annualReturn: number;
  years: number;
}

export interface TimeAllocationData {
  sleep: number;
  work: number;
  chores: number;
  fitness: number;
  leisure: number;
  learning: number;
}

export interface Goal {
	id: string;
	name: string;
	target: number;
	current: number;
}

export interface GoalsData {
	goals: Goal[];
}
