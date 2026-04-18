import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calculateMonthlyTax, type TaxpayerStatus } from "@/lib/tax";

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat("id-ID", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(Math.round(value));
}

function formatPercent(value: number): string {
  return percentFormatter.format(value);
}

export default function App() {
  const [status, setStatus] = useState<TaxpayerStatus>("TK/0");
  const [salaryInput, setSalaryInput] = useState("10000000");

  const grossSalary = Math.max(Number(salaryInput) || 0, 0);
  const result = calculateMonthlyTax(grossSalary, status);

  const rows: Array<{ label: string; value: string; negative?: boolean }> = [
    { label: "Status PTKP", value: result.status },
    { label: "Kategori TER", value: result.category },
    { label: "Gaji gross bulanan", value: formatCurrency(result.grossSalary) },
    { label: "JKK perusahaan", value: formatCurrency(result.employerContribution.jkk) },
    { label: "JKM perusahaan", value: formatCurrency(result.employerContribution.jkm) },
    {
      label: "BPJS kesehatan perusahaan",
      value: formatCurrency(result.employerContribution.bpjskes),
    },
    {
      label: "JHT karyawan",
      value: formatCurrency(result.employeeContribution.jht),
      negative: true,
    },
    {
      label: "JP karyawan",
      value: formatCurrency(result.employeeContribution.jp),
      negative: true,
    },
    {
      label: "BPJS kesehatan karyawan",
      value: formatCurrency(result.employeeContribution.bpjskes),
      negative: true,
    },
    {
      label: "Total kontribusi perusahaan",
      value: formatCurrency(result.employerContributionTotal),
    },
    {
      label: "Total potongan karyawan",
      value: formatCurrency(result.employeeContributionTotal),
      negative: true,
    },
    { label: "Dasar TER bulanan", value: formatCurrency(result.taxableMonthlyIncome) },
    { label: "Tarif efektif", value: formatPercent(result.taxRate) },
    { label: "PPh 21 bulanan", value: formatCurrency(result.monthlyTax) },
    { label: "Take home pay", value: formatCurrency(result.monthlyTakeHomePay) },
  ];

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-6 sm:px-6">
      <Card className="panel-card">
        <CardContent className="space-y-4 p-4">
          <h1 className="text-lg font-medium">Kalkulator PPh 21</h1>

          <div className="grid gap-4 md:grid-cols-2">
            <Select value={status} onValueChange={(value) => setStatus(value as TaxpayerStatus)}>
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="Status PTKP" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TK/0">TK/0</SelectItem>
                <SelectItem value="TK/1">TK/1</SelectItem>
                <SelectItem value="TK/2">TK/2</SelectItem>
                <SelectItem value="TK/3">TK/3</SelectItem>
                <SelectItem value="K/0">K/0</SelectItem>
                <SelectItem value="K/1">K/1</SelectItem>
                <SelectItem value="K/2">K/2</SelectItem>
                <SelectItem value="K/3">K/3</SelectItem>
              </SelectContent>
            </Select>

            <Input
              inputMode="numeric"
              min="0"
              placeholder="Gross salary"
              type="number"
              value={salaryInput}
              onChange={(event) => setSalaryInput(event.target.value)}
              className="bg-background"
            />
          </div>

          <div className="overflow-hidden border border-border">
            <table className="w-full border-collapse text-sm">
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-b border-border last:border-b-0">
                    <td className="bg-muted/30 px-4 py-3 text-left">{row.label}</td>
                    <td
                      className={
                        row.negative
                          ? "px-4 py-3 text-right font-medium text-destructive"
                          : "px-4 py-3 text-right font-medium"
                      }
                    >
                      {row.negative ? `- ${row.value}` : row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
