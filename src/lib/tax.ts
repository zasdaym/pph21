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
  const employerContribution = calculateEmployerContribution(salary);
  const employerContributionSum = Object.values(employerContribution).reduce(
    (accumulator, value) => accumulator + value,
  );

  const employeeContribution = calculateEmployeeContribution(salary);
  const employeeContributionSum = Object.values(employeeContribution).reduce(
    (accumulator, value) => accumulator + value,
  );

  const taxRateCategory = getTaxRateCategory(status);

  const monthlyGrossIncome = salary + employerContributionSum;
  const regularMonthTaxRate = getTaxRate(taxRateCategory, monthlyGrossIncome);
  const regularMonthTax = monthlyGrossIncome * regularMonthTaxRate;
  const regularMonthTakeHomePay =
    salary - regularMonthTax - employeeContributionSum;

  const bonusMonthIncome = monthlyGrossIncome + bonus;
  const bonusMonthTaxRate = getTaxRate(taxRateCategory, bonusMonthIncome);
  const bonusMonthTax = bonusMonthIncome * bonusMonthTaxRate;

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

function getTaxRate(category: TaxRateCategory, income: number): number {
  switch (category) {
    case "A": {
      if (income >= 1_400_000_001) return 34;
      if (income >= 910_000_001) return 0.33;
      if (income >= 695_000_001) return 0.32;
      if (income >= 550_000_001) return 0.31;
      if (income >= 454_000_001) return 0.3;
      if (income >= 337_000_001) return 0.29;
      if (income >= 206_000_001) return 0.28;
      if (income >= 157_000_001) return 0.27;
      if (income >= 125_000_001) return 0.26;
      if (income >= 103_000_001) return 0.25;
      if (income >= 89_000_001) return 0.24;
      if (income >= 77_500_001) return 0.23;
      if (income >= 68_600_001) return 0.22;
      if (income >= 62_200_001) return 0.21;
      if (income >= 56_300_001) return 0.2;
      if (income >= 51_400_001) return 0.19;
      if (income >= 47_800_001) return 0.18;
      if (income >= 43_850_001) return 0.17;
      if (income >= 39_100_001) return 0.16;
      if (income >= 35_400_001) return 0.15;
      if (income >= 32_400_001) return 0.14;
      if (income >= 30_050_001) return 0.13;
      if (income >= 28_000_001) return 0.12;
      if (income >= 26_450_001) return 0.11;
      if (income >= 24_150_001) return 0.1;
      if (income >= 19_750_001) return 0.09;
      if (income >= 16_950_001) return 0.08;
      if (income >= 15_100_001) return 0.07;
      if (income >= 13_750_001) return 0.06;
      if (income >= 12_500_001) return 0.05;
      if (income >= 11_600_001) return 0.04;
      if (income >= 11_050_001) return 0.035;
      if (income >= 10_700_001) return 0.03;
      if (income >= 10_350_001) return 0.025;
      if (income >= 10_050_001) return 0.0225;
      if (income >= 9_650_001) return 0.02;
      if (income >= 8_550_001) return 0.0175;
      if (income >= 7_500_001) return 0.015;
      if (income >= 6_750_001) return 0.0125;
      if (income >= 6_300_001) return 0.01;
      if (income >= 5_950_001) return 0.0075;
      if (income >= 5_650_001) return 0.005;
      if (income >= 5_400_001) return 0.0025;
      return 0;
    }
    case "B": {
      if (income >= 1_405_000_001) return 0.34;
      if (income >= 957_000_001) return 0.33;
      if (income >= 704_000_001) return 0.32;
      if (income >= 555_000_001) return 0.31;
      if (income >= 459_000_001) return 0.3;
      if (income >= 374_000_001) return 0.29;
      if (income >= 211_000_001) return 0.28;
      if (income >= 163_000_001) return 0.27;
      if (income >= 129_000_001) return 0.26;
      if (income >= 109_000_001) return 0.25;
      if (income >= 93_000_001) return 0.24;
      if (income >= 80_000_001) return 0.23;
      if (income >= 71_000_001) return 0.22;
      if (income >= 64_000_001) return 0.21;
      if (income >= 58_500_001) return 0.21;
      if (income >= 53_800_001) return 0.19;
      if (income >= 49_500_001) return 0.18;
      if (income >= 45_800_001) return 0.17;
      if (income >= 41_100_001) return 0.16;
      if (income >= 37_100_001) return 0.15;
      if (income >= 33_950_001) return 0.14;
      if (income >= 31_450_001) return 0.13;
      if (income >= 29_350_001) return 0.12;
      if (income >= 27_700_001) return 0.11;
      if (income >= 26_000_001) return 0.1;
      if (income >= 21_850_001) return 0.09;
      if (income >= 18_450_001) return 0.08;
      if (income >= 16_400_001) return 0.07;
      if (income >= 14_950_001) return 0.06;
      if (income >= 13_600_001) return 0.05;
      if (income >= 12_600_001) return 0.04;
      if (income >= 11_600_001) return 0.03;
      if (income >= 11_250_001) return 0.025;
      if (income >= 10_750_001) return 0.02;
      if (income >= 9_200_001) return 0.015;
      if (income >= 7_300_001) return 0.01;
      if (income >= 6_850_001) return 0.0075;
      if (income >= 6_500_001) return 0.005;
      if (income >= 6_200_001) return 0.0025;
      return 0;
    }
    case "C": {
      if (income >= 1_419_000_001) return 0.34;
      if (income >= 965_000_001) return 0.33;
      if (income >= 709_000_001) return 0.32;
      if (income >= 561_000_001) return 0.31;
      if (income >= 463_000_001) return 0.3;
      if (income >= 390_000_001) return 0.29;
      if (income >= 221_000_001) return 0.28;
      if (income >= 169_000_001) return 0.27;
      if (income >= 134_000_001) return 0.26;
      if (income >= 110_000_001) return 0.25;
      if (income >= 95_600_001) return 0.24;
      if (income >= 83_200_001) return 0.23;
      if (income >= 74_500_001) return 0.22;
      if (income >= 66_700_001) return 0.21;
      if (income >= 60_400_001) return 0.2;
      if (income >= 55_800_001) return 0.19;
      if (income >= 51_200_001) return 0.18;
      if (income >= 47_400_001) return 0.17;
      if (income >= 43_000_001) return 0.16;
      if (income >= 38_900_001) return 0.15;
      if (income >= 35_400_001) return 0.14;
      if (income >= 32_600_001) return 0.13;
      if (income >= 30_100_001) return 0.12;
      if (income >= 28_100_001) return 0.11;
      if (income >= 26_600_001) return 0.1;
      if (income >= 22_700_001) return 0.09;
      if (income >= 19_500_001) return 0.08;
      if (income >= 17_050_001) return 0.07;
      if (income >= 15_550_001) return 0.06;
      if (income >= 14_150_001) return 0.05;
      if (income >= 12_950_001) return 0.04;
      if (income >= 12_050_001) return 0.03;
      if (income >= 11_200_001) return 0.02;
      if (income >= 10_950_001) return 0.0175;
      if (income >= 9_800_001) return 0.015;
      if (income >= 8_850_001) return 0.0125;
      if (income >= 7_800_001) return 0.01;
      if (income >= 7_350_001) return 0.0075;
      if (income >= 6_950_001) return 0.005;
      if (income >= 6_600_001) return 0.0025;
      return 0;
    }
  }
}
