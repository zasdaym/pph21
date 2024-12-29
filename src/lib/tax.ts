type CalculateTaxResult = {
  taxRateCategory: TaxRateCategory;
  employerContribution: EmployerContribution;
  employeeContribution: EmployeeContribution;
  occupationalExpense: number;
  monthlyGrossIncome: number;
  yearlyGrossIncome: number;
  yearlyNetIncome: number;
  nonTaxableIncome: number;
  taxableIncome: number;
  regularMonthTax: number;
  decemberMonthTax: number;
  totalTax: number;
  regularMonthTakeHomePay: number;
  decemberTakeHomePay: number;
};

export type TaxpayerStatus =
  | "TK/0"
  | "TK/1"
  | "TK/2"
  | "TK/3"
  | "K/0"
  | "K/1"
  | "K/2"
  | "K/3";

// Calculate PPh21 based on PP 58/2023. Only covers January-December simulation.
export function calculateTax(
  salary: number,
  bonus: number,
  status: TaxpayerStatus,
): CalculateTaxResult {
  const taxRateCategory = getTaxRateCategoryByStatus(status);
  const taxRates = getTaxRatesByCategory(taxRateCategory);

  const employerContribution = calculateEmployerContribution(salary);
  const employerContributionSum = Object.values(employerContribution).reduce(
    (accumulator, value) => accumulator + value,
  );

  const employeeContribution = calculateEmployeeContribution(salary);
  const employeeContributionSum = Object.values(employeeContribution).reduce(
    (accumulator, value) => accumulator + value,
  );

  const monthlyGrossIncome = salary + employerContributionSum;
  const regularMonthTaxRate =
    taxRates.find((taxRate) => taxRate.minAmount <= monthlyGrossIncome) ??
    taxRates[taxRates.length - 1];
  const regularMonthTax = monthlyGrossIncome * regularMonthTaxRate.rate;
  const regularMonthTakeHomePay =
    salary - regularMonthTax - employeeContributionSum;

  const bonusMonthIncome = monthlyGrossIncome + bonus;
  const bonusMonthTaxRate =
    taxRates.find((taxRate) => taxRate.minAmount <= bonusMonthIncome) ??
    taxRates[taxRates.length - 1];
  const bonusMonthTax = bonusMonthIncome * bonusMonthTaxRate.rate;
  const bonusMonthTakeHomePay =
    salary + bonus - bonusMonthTax - employeeContributionSum;

  const yearlyGrossIncome = monthlyGrossIncome * 11 + bonusMonthIncome;
  const occupationalExpense = Math.min(monthlyGrossIncome * 0.05, 500_000);
  const yearlyNetIncome =
    yearlyGrossIncome -
    (employeeContribution.jht + employeeContribution.jp) * 12 -
    occupationalExpense * 12;

  const nonTaxableIncome = getNonTaxableIncomeByStatus(status);
  const taxableIncome = Math.max(yearlyNetIncome - nonTaxableIncome, 0);

  const totalTax = calculateYearlyTax(taxableIncome);
  const decemberMonthTax = totalTax - regularMonthTax * 10 - bonusMonthTax;
  const decemberTakeHomePay = monthlyGrossIncome - decemberMonthTax;

  return {
    taxRateCategory,
    employerContribution,
    employeeContribution,
    occupationalExpense,
    monthlyGrossIncome,
    yearlyGrossIncome,
    yearlyNetIncome,
    nonTaxableIncome,
    taxableIncome,
    regularMonthTax,
    decemberMonthTax,
    totalTax,
    regularMonthTakeHomePay,
    decemberTakeHomePay,
  };
}

const maxBpjskesSubscription = 12_000_000;
const maxJpSubscription = 9_559_600;

interface EmployerContribution {
  jkk: number;
  jkm: number;
  bpjskes: number;
}

function calculateEmployerContribution(salary: number): EmployerContribution {
  const jkk = salary * 0.0024;
  const jkm = salary * 0.003;
  const bpjskes = Math.min(salary, maxBpjskesSubscription) * 0.04;

  return {
    jkk,
    jkm,
    bpjskes,
  };
}

type EmployeeContribution = {
  jht: number;
  jp: number;
  bpjskes: number;
};

function calculateEmployeeContribution(salary: number): EmployeeContribution {
  const jht = salary * 0.02;
  const jp = Math.min(salary, maxJpSubscription) * 0.01;
  const bpjskes = Math.min(salary, maxBpjskesSubscription) * 0.01;

  return {
    jht,
    jp,
    bpjskes,
  };
}

// Calculate PPh21 based on UU 7/2021 given a TAXABLE INCOME, WHICH MEANS IT'S ALREADY DEDUCTED BY PTKP.
function calculateYearlyTax(taxableIncome: number): number {
  const brackets = [
    { limit: 60_000_000, rate: 0.05 },
    { limit: 250_000_000, rate: 0.15 },
    { limit: 500_000_000, rate: 0.25 },
    { limit: 5_000_000_000, rate: 0.3 },
    { limit: Number.POSITIVE_INFINITY, rate: 0.35 },
  ];

  let processed = 0;
  let result = 0;

  for (const { limit, rate } of brackets) {
    const current = Math.min(taxableIncome, limit) - processed;
    processed += current;

    const tax = current * rate;
    result += tax;
  }

  return result;
}

function getNonTaxableIncomeByStatus(status: TaxpayerStatus): number {
  switch (status) {
    case "TK/0":
      return 54_000_000;
    case "TK/1":
      return 58_500_000;
    case "TK/2":
      return 63_000_000;
    case "TK/3":
      return 67_500_000;
    case "K/0":
      return 58_500_000;
    case "K/1":
      return 63_000_000;
    case "K/2":
      return 67_500_000;
    case "K/3":
      return 72_000_000;
  }
}

type TaxRateCategory = "A" | "B" | "C";

function getTaxRateCategoryByStatus(status: TaxpayerStatus): TaxRateCategory {
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

interface TaxRate {
  minAmount: number;
  rate: number;
}

function getTaxRatesByCategory(category: TaxRateCategory): TaxRate[] {
  switch (category) {
    case "A":
      return [
        { minAmount: 1_400_000_001, rate: 34 },
        { minAmount: 910_000_001, rate: 0.33 },
        { minAmount: 695_000_001, rate: 0.32 },
        { minAmount: 550_000_001, rate: 0.31 },
        { minAmount: 454_000_001, rate: 0.3 },
        { minAmount: 337_000_001, rate: 0.29 },
        { minAmount: 206_000_001, rate: 0.28 },
        { minAmount: 157_000_001, rate: 0.27 },
        { minAmount: 125_000_001, rate: 0.26 },
        { minAmount: 103_000_001, rate: 0.25 },
        { minAmount: 89_000_001, rate: 0.24 },
        { minAmount: 77_500_001, rate: 0.23 },
        { minAmount: 68_600_001, rate: 0.22 },
        { minAmount: 62_200_001, rate: 0.21 },
        { minAmount: 56_300_001, rate: 0.2 },
        { minAmount: 51_400_001, rate: 0.19 },
        { minAmount: 47_800_001, rate: 0.18 },
        { minAmount: 43_850_001, rate: 0.17 },
        { minAmount: 39_100_001, rate: 0.16 },
        { minAmount: 35_400_001, rate: 0.15 },
        { minAmount: 32_400_001, rate: 0.14 },
        { minAmount: 30_050_001, rate: 0.13 },
        { minAmount: 28_000_001, rate: 0.12 },
        { minAmount: 26_450_001, rate: 0.11 },
        { minAmount: 24_150_001, rate: 0.1 },
        { minAmount: 19_750_001, rate: 0.09 },
        { minAmount: 16_950_001, rate: 0.08 },
        { minAmount: 15_100_001, rate: 0.07 },
        { minAmount: 13_750_001, rate: 0.06 },
        { minAmount: 12_500_001, rate: 0.05 },
        { minAmount: 11_600_001, rate: 0.04 },
        { minAmount: 11_050_001, rate: 0.035 },
        { minAmount: 10_700_001, rate: 0.03 },
        { minAmount: 10_350_001, rate: 0.025 },
        { minAmount: 10_050_001, rate: 0.0225 },
        { minAmount: 9_650_001, rate: 0.02 },
        { minAmount: 8_550_001, rate: 0.0175 },
        { minAmount: 7_500_001, rate: 0.015 },
        { minAmount: 6_750_001, rate: 0.0125 },
        { minAmount: 6_300_001, rate: 0.01 },
        { minAmount: 5_950_001, rate: 0.0075 },
        { minAmount: 5_650_001, rate: 0.005 },
        { minAmount: 5_400_001, rate: 0.0025 },
        { minAmount: 0, rate: 0 },
      ];
    case "B":
      return [
        { minAmount: 1_405_000_001, rate: 0.34 },
        { minAmount: 957_000_001, rate: 0.33 },
        { minAmount: 704_000_001, rate: 0.32 },
        { minAmount: 555_000_001, rate: 0.31 },
        { minAmount: 459_000_001, rate: 0.3 },
        { minAmount: 374_000_001, rate: 0.29 },
        { minAmount: 211_000_001, rate: 0.28 },
        { minAmount: 163_000_001, rate: 0.27 },
        { minAmount: 129_000_001, rate: 0.26 },
        { minAmount: 109_000_001, rate: 0.25 },
        { minAmount: 93_000_001, rate: 0.24 },
        { minAmount: 80_000_001, rate: 0.23 },
        { minAmount: 71_000_001, rate: 0.22 },
        { minAmount: 64_000_001, rate: 0.21 },
        { minAmount: 58_500_001, rate: 0.21 },
        { minAmount: 53_800_001, rate: 0.19 },
        { minAmount: 49_500_001, rate: 0.18 },
        { minAmount: 45_800_001, rate: 0.17 },
        { minAmount: 41_100_001, rate: 0.16 },
        { minAmount: 37_100_001, rate: 0.15 },
        { minAmount: 33_950_001, rate: 0.14 },
        { minAmount: 31_450_001, rate: 0.13 },
        { minAmount: 29_350_001, rate: 0.12 },
        { minAmount: 27_700_001, rate: 0.11 },
        { minAmount: 26_000_001, rate: 0.1 },
        { minAmount: 21_850_001, rate: 0.09 },
        { minAmount: 18_450_001, rate: 0.08 },
        { minAmount: 16_400_001, rate: 0.07 },
        { minAmount: 14_950_001, rate: 0.06 },
        { minAmount: 13_600_001, rate: 0.05 },
        { minAmount: 12_600_001, rate: 0.04 },
        { minAmount: 11_600_001, rate: 0.03 },
        { minAmount: 11_250_001, rate: 0.025 },
        { minAmount: 10_750_001, rate: 0.02 },
        { minAmount: 9_200_001, rate: 0.015 },
        { minAmount: 7_300_001, rate: 0.01 },
        { minAmount: 6_850_001, rate: 0.0075 },
        { minAmount: 6_500_001, rate: 0.005 },
        { minAmount: 6_200_001, rate: 0.0025 },
        { minAmount: 0, rate: 0 },
      ];
    case "C":
      return [
        { minAmount: 1_419_000_001, rate: 0.34 },
        { minAmount: 965_000_001, rate: 0.33 },
        { minAmount: 709_000_001, rate: 0.32 },
        { minAmount: 561_000_001, rate: 0.31 },
        { minAmount: 463_000_001, rate: 0.3 },
        { minAmount: 390_000_001, rate: 0.29 },
        { minAmount: 221_000_001, rate: 0.28 },
        { minAmount: 169_000_001, rate: 0.27 },
        { minAmount: 134_000_001, rate: 0.26 },
        { minAmount: 110_000_001, rate: 0.25 },
        { minAmount: 95_600_001, rate: 0.24 },
        { minAmount: 83_200_001, rate: 0.23 },
        { minAmount: 74_500_001, rate: 0.22 },
        { minAmount: 66_700_001, rate: 0.21 },
        { minAmount: 60_400_001, rate: 0.2 },
        { minAmount: 55_800_001, rate: 0.19 },
        { minAmount: 51_200_001, rate: 0.18 },
        { minAmount: 47_400_001, rate: 0.17 },
        { minAmount: 43_000_001, rate: 0.16 },
        { minAmount: 38_900_001, rate: 0.15 },
        { minAmount: 35_400_001, rate: 0.14 },
        { minAmount: 32_600_001, rate: 0.13 },
        { minAmount: 30_100_001, rate: 0.12 },
        { minAmount: 28_100_001, rate: 0.11 },
        { minAmount: 26_600_001, rate: 0.1 },
        { minAmount: 22_700_001, rate: 0.09 },
        { minAmount: 19_500_001, rate: 0.08 },
        { minAmount: 17_050_001, rate: 0.07 },
        { minAmount: 15_550_001, rate: 0.06 },
        { minAmount: 14_150_001, rate: 0.05 },
        { minAmount: 12_950_001, rate: 0.04 },
        { minAmount: 12_050_001, rate: 0.03 },
        { minAmount: 11_200_001, rate: 0.02 },
        { minAmount: 10_950_001, rate: 0.0175 },
        { minAmount: 9_800_001, rate: 0.015 },
        { minAmount: 8_850_001, rate: 0.0125 },
        { minAmount: 7_800_001, rate: 0.01 },
        { minAmount: 7_350_001, rate: 0.0075 },
        { minAmount: 6_950_001, rate: 0.005 },
        { minAmount: 6_600_001, rate: 0.0025 },
        { minAmount: 0, rate: 0 },
      ];
  }
}
