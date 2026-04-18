export type TaxRateCategory = "A" | "B" | "C";

export type TaxpayerStatus = "TK/0" | "TK/1" | "TK/2" | "TK/3" | "K/0" | "K/1" | "K/2" | "K/3";

export interface EmployerContribution {
  jkk: number;
  jkm: number;
  bpjskes: number;
}

export interface EmployeeContribution {
  jht: number;
  jp: number;
  bpjskes: number;
}

export interface MonthlyTaxResult {
  status: TaxpayerStatus;
  category: TaxRateCategory;
  grossSalary: number;
  employerContribution: EmployerContribution;
  employeeContribution: EmployeeContribution;
  employerContributionTotal: number;
  employeeContributionTotal: number;
  taxableMonthlyIncome: number;
  taxRate: number;
  monthlyTax: number;
  monthlyTakeHomePay: number;
}

const maxBpjskesSubscription = 12_000_000;
const maxJpSubscription = 9_559_600;

const taxBrackets: Record<TaxRateCategory, Array<[threshold: number, rate: number]>> = {
  A: [
    [1_400_000_001, 0.34],
    [910_000_001, 0.33],
    [695_000_001, 0.32],
    [550_000_001, 0.31],
    [454_000_001, 0.3],
    [337_000_001, 0.29],
    [206_000_001, 0.28],
    [157_000_001, 0.27],
    [125_000_001, 0.26],
    [103_000_001, 0.25],
    [89_000_001, 0.24],
    [77_500_001, 0.23],
    [68_600_001, 0.22],
    [62_200_001, 0.21],
    [56_300_001, 0.2],
    [51_400_001, 0.19],
    [47_800_001, 0.18],
    [43_850_001, 0.17],
    [39_100_001, 0.16],
    [35_400_001, 0.15],
    [32_400_001, 0.14],
    [30_050_001, 0.13],
    [28_000_001, 0.12],
    [26_450_001, 0.11],
    [24_150_001, 0.1],
    [19_750_001, 0.09],
    [16_950_001, 0.08],
    [15_100_001, 0.07],
    [13_750_001, 0.06],
    [12_500_001, 0.05],
    [11_600_001, 0.04],
    [11_050_001, 0.035],
    [10_700_001, 0.03],
    [10_350_001, 0.025],
    [10_050_001, 0.0225],
    [9_650_001, 0.02],
    [8_550_001, 0.0175],
    [7_500_001, 0.015],
    [6_750_001, 0.0125],
    [6_300_001, 0.01],
    [5_950_001, 0.0075],
    [5_650_001, 0.005],
    [5_400_001, 0.0025],
  ],
  B: [
    [1_405_000_001, 0.34],
    [957_000_001, 0.33],
    [704_000_001, 0.32],
    [555_000_001, 0.31],
    [459_000_001, 0.3],
    [374_000_001, 0.29],
    [211_000_001, 0.28],
    [163_000_001, 0.27],
    [129_000_001, 0.26],
    [109_000_001, 0.25],
    [93_000_001, 0.24],
    [80_000_001, 0.23],
    [71_000_001, 0.22],
    [64_000_001, 0.21],
    [58_500_001, 0.2],
    [53_800_001, 0.19],
    [49_500_001, 0.18],
    [45_800_001, 0.17],
    [41_100_001, 0.16],
    [37_100_001, 0.15],
    [33_950_001, 0.14],
    [31_450_001, 0.13],
    [29_350_001, 0.12],
    [27_700_001, 0.11],
    [26_000_001, 0.1],
    [21_850_001, 0.09],
    [18_450_001, 0.08],
    [16_400_001, 0.07],
    [14_950_001, 0.06],
    [13_600_001, 0.05],
    [12_600_001, 0.04],
    [11_600_001, 0.03],
    [11_250_001, 0.025],
    [10_750_001, 0.02],
    [9_200_001, 0.015],
    [7_300_001, 0.01],
    [6_850_001, 0.0075],
    [6_500_001, 0.005],
    [6_200_001, 0.0025],
  ],
  C: [
    [1_419_000_001, 0.34],
    [965_000_001, 0.33],
    [709_000_001, 0.32],
    [561_000_001, 0.31],
    [463_000_001, 0.3],
    [390_000_001, 0.29],
    [221_000_001, 0.28],
    [169_000_001, 0.27],
    [134_000_001, 0.26],
    [110_000_001, 0.25],
    [95_600_001, 0.24],
    [83_200_001, 0.23],
    [74_500_001, 0.22],
    [66_700_001, 0.21],
    [60_400_001, 0.2],
    [55_800_001, 0.19],
    [51_200_001, 0.18],
    [47_400_001, 0.17],
    [43_000_001, 0.16],
    [38_900_001, 0.15],
    [35_400_001, 0.14],
    [32_600_001, 0.13],
    [30_100_001, 0.12],
    [28_100_001, 0.11],
    [26_600_001, 0.1],
    [22_700_001, 0.09],
    [19_500_001, 0.08],
    [17_050_001, 0.07],
    [15_550_001, 0.06],
    [14_150_001, 0.05],
    [12_950_001, 0.04],
    [12_050_001, 0.03],
    [11_200_001, 0.02],
    [10_950_001, 0.0175],
    [9_800_001, 0.015],
    [8_850_001, 0.0125],
    [7_800_001, 0.01],
    [7_350_001, 0.0075],
    [6_950_001, 0.005],
    [6_600_001, 0.0025],
  ],
};

export function calculateMonthlyTax(grossSalary: number, status: TaxpayerStatus): MonthlyTaxResult {
  const sanitizedGrossSalary = sanitizeGrossSalary(grossSalary);
  const category = getTaxRateCategory(status);
  const employerContribution = calculateEmployerContribution(sanitizedGrossSalary);
  const employeeContribution = calculateEmployeeContribution(sanitizedGrossSalary);

  const employerContributionTotal = sumValues(Object.values(employerContribution));
  const employeeContributionTotal = sumValues(Object.values(employeeContribution));
  const taxableMonthlyIncome = roundMoney(sanitizedGrossSalary + employerContributionTotal);
  const taxRate = getTaxRate(category, taxableMonthlyIncome);
  const monthlyTax = roundMoney(taxableMonthlyIncome * taxRate);
  const monthlyTakeHomePay = roundMoney(
    sanitizedGrossSalary - monthlyTax - employeeContributionTotal,
  );

  return {
    status,
    category,
    grossSalary: sanitizedGrossSalary,
    employerContribution,
    employeeContribution,
    employerContributionTotal,
    employeeContributionTotal,
    taxableMonthlyIncome,
    taxRate,
    monthlyTax,
    monthlyTakeHomePay,
  };
}

function sanitizeGrossSalary(grossSalary: number): number {
  return Number.isFinite(grossSalary) ? Math.max(grossSalary, 0) : 0;
}

function getTaxRateCategory(status: TaxpayerStatus): TaxRateCategory {
  switch (status) {
    case "TK/0":
    case "TK/1":
    case "K/0":
      return "A";
    case "TK/2":
    case "TK/3":
    case "K/1":
    case "K/2":
      return "B";
    case "K/3":
      return "C";
  }
}

function calculateEmployerContribution(salary: number): EmployerContribution {
  return {
    jkk: roundMoney(salary * 0.0024),
    jkm: roundMoney(salary * 0.003),
    bpjskes: roundMoney(Math.min(salary, maxBpjskesSubscription) * 0.04),
  };
}

function calculateEmployeeContribution(salary: number): EmployeeContribution {
  return {
    jht: roundMoney(salary * 0.02),
    jp: roundMoney(Math.min(salary, maxJpSubscription) * 0.01),
    bpjskes: roundMoney(Math.min(salary, maxBpjskesSubscription) * 0.01),
  };
}

function getTaxRate(category: TaxRateCategory, income: number): number {
  for (const [threshold, rate] of taxBrackets[category]) {
    if (income >= threshold) {
      return rate;
    }
  }

  return 0;
}

function sumValues(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function roundMoney(value: number): number {
  return Math.round(value);
}
