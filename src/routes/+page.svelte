<script lang="ts">
  import { calculateTax, type TaxpayerStatus } from "$lib/tax";

  function formatIdr(n: number | null): string {
    if (n === null) {
      n = 0;
    }
    return n.toLocaleString("id-ID", { style: "currency", currency: "IDR" });
  }

  let salary = 0;
  let bonus = 0;
  let status = "TK/0";

  $: result = calculateTax(salary, bonus, status as TaxpayerStatus);
</script>

<svelte:head>
  <title>Kalkulator PPh 21 dengan Tarif Efektif Rata-rata (TER)</title>
  <meta
    name="description"
    content="Kalkulator PPh 21 dengan Tarif Efektif Rata-rata (TER)"
  />
</svelte:head>

<h1>Kalkulator PPh 21 dengan Tarif Efektif Rata-rata (TER)</h1>
<label for="salary">Gaji bulanan</label>
<input
  id="salary"
  type="number"
  bind:value={salary}
  min="0"
  placeholder="10000000"
/>
<label for="bonus">Bonus tahunan (THR, Jasa produksi, dll)</label>
<input
  id="bonus"
  type="number"
  bind:value={bonus}
  min="0"
  placeholder="10000000"
/>
<label for="status">Status PTKP</label>
<select id="status" bind:value={status}>
  <option value="TK/0">Tidak Kawin | 0 Tanggungan</option>
  <option value="TK/1">Tidak Kawin | 1 Tanggungan</option>
  <option value="TK/2">Tidak Kawin | 2 Tanggungan</option>
  <option value="TK/2">Tidak Kawin | 3 Tanggungan</option>
  <option value="K/0">Kawin | 0 Tanggungan</option>
  <option value="K/1">Kawin | 1 Tanggungan</option>
  <option value="K/2">Kawin | 2 Tanggungan</option>
  <option value="K/3">Kawin | 3 Tanggungan</option>
</select>
<table>
  <thead>
    <tr>
      <th>Komponen</th>
      <th>Nominal</th>
    </tr>
  </thead>
  <tr>
    <td>Gaji Bulanan</td>
    <td>{formatIdr(salary)}</td>
  </tr>
  <tr>
    <td>Bonus</td>
    <td>{formatIdr(bonus)}</td>
  </tr>
  <tr>
    <td>BPJSTK JKK - Perusahaan (0,24%)</td>
    <td>{formatIdr(result.employerInsuranceContribution.jkk)}</td>
  </tr>
  <tr>
    <td>BPJSTK JKM - Perusahaan (0,3%)</td>
    <td>{formatIdr(result.employerInsuranceContribution.jkm)}</td>
  </tr>
  <tr>
    <td>BPJSKES - Perusahaan (4%, maks. Rp480.000)</td>
    <td>{formatIdr(result.employerInsuranceContribution.bpjskes)}</td>
  </tr>
  <tr>
    <td>BPJSTK JHT - Karyawan (2%)</td>
    <td>- {formatIdr(result.employeeInsuranceContribution.jht)}</td>
  </tr>
  <tr>
    <td>BPJSTK JP - Karyawan (1%, maks. Rp95.596)</td>
    <td>- {formatIdr(result.employeeInsuranceContribution.jp)}</td>
  </tr>
  <tr>
    <td>Biaya Jabatan</td>
    <td>- {formatIdr(result.occupationalExpense)}</td>
  </tr>
  <tr>
    <td>Penghasilan Neto Bulanan</td>
    <td>{formatIdr(result.netMonthlyIncome)}</td>
  </tr>
  <tr>
    <td>Penghasilan Neto Tahunan</td>
    <td>{formatIdr(result.netYearlyIncome)}</td>
  </tr>
  <tr>
    <td>Penghasilan Tidak Kena Pajak</td>
    <td>- {formatIdr(result.nonTaxableIncome)}</td>
  </tr>
  <tr>
    <td>Penghasilan Kena Pajak</td>
    <td>{formatIdr(result.taxableIncome)}</td>
  </tr>
  <tr>
    <td>Pajak Bulanan</td>
    <td>{formatIdr(result.regularMonthTax)}</td>
  </tr>
  <tr>
    <td>Pajak di Bulan Bonus</td>
    <td>{formatIdr(result.bonusMonthTax)}</td>
  </tr>
  <tr>
    <td>Pajak di Bulan Desember</td>
    <td>{formatIdr(result.decemberMonthTax)}</td>
  </tr>
  <tr>
    <td>Total Pajak Setahun</td>
    <td>{formatIdr(result.totalTax)}</td>
  </tr>
</table>
