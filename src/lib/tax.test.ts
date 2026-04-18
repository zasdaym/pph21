import { describe, expect, test } from "bun:test";

import { calculateMonthlyTax } from "@/lib/tax";

describe("calculateMonthlyTax", () => {
  test("clamps negative gross salary to zero", () => {
    const result = calculateMonthlyTax(-1_000_000, "TK/0");

    expect(result.grossSalary).toBe(0);
    expect(result.employerContributionTotal).toBe(0);
    expect(result.employeeContributionTotal).toBe(0);
    expect(result.taxableMonthlyIncome).toBe(0);
    expect(result.monthlyTax).toBe(0);
    expect(result.monthlyTakeHomePay).toBe(0);
  });

  test("maps taxpayer status to TER category and rounds monetary values", () => {
    const result = calculateMonthlyTax(10_000_000, "K/3");

    expect(result.status).toBe("K/3");
    expect(result.category).toBe("C");
    expect(result.employerContribution).toEqual({
      jkk: 24_000,
      jkm: 30_000,
      bpjskes: 400_000,
    });
    expect(result.employeeContribution).toEqual({
      jht: 200_000,
      jp: 95_596,
      bpjskes: 100_000,
    });
    expect(result.employerContributionTotal).toBe(454_000);
    expect(result.employeeContributionTotal).toBe(395_596);
    expect(result.taxableMonthlyIncome).toBe(10_454_000);
    expect(result.taxRate).toBe(0.015);
    expect(result.monthlyTax).toBe(156_810);
    expect(result.monthlyTakeHomePay).toBe(9_447_594);
  });

  test("maps TK/0 to category A", () => {
    const result = calculateMonthlyTax(10_000_000, "TK/0");

    expect(result.status).toBe("TK/0");
    expect(result.category).toBe("A");
    expect(result.taxRate).toBe(0.025);
    expect(result.monthlyTax).toBe(261_350);
    expect(result.monthlyTakeHomePay).toBe(9_343_054);
  });
});
