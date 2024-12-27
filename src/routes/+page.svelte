<script lang="ts">
    import { calculateTax, type TaxpayerStatus } from "$lib/tax";

    function formatIdr(n: number | null): string {
        const value = n ?? 0;
        return value.toLocaleString("id-ID", {
            currency: "IDR",
            maximumFractionDigits: 0,
            style: "currency",
        });
    }

    let salary = 0;
    let bonus = 0;
    let status: TaxpayerStatus = "TK/0";

    let result = calculateTax(salary, bonus, status);
    function onClick() {
        result = calculateTax(salary, bonus, status);
    }
</script>

<svelte:head>
    <title>Kalkulator PPh 21 dengan Tarif Efektif Rata-rata (TER)</title>
    <meta
        name="description"
        content="Kalkulator PPh 21 dengan Tarif Efektif Rata-rata (TER)"
    />
</svelte:head>

<section class="hero">
    <div class="container">
        <div class="hero-body">
            <h1 class="title">
                Kalkulator PPh 21 dengan Tarif Efektif Rata-rata (TER)
            </h1>
        </div>
    </div>
</section>

<section class="section">
    <div class="container">
        <div class="columns">
            <div class="column is-half">
                <div class="box">
                    <div class="field">
                        <label class="label" for="salary"
                            >Gaji bulanan (Gross)</label
                        >
                        <div class="control">
                            <input
                                class="input"
                                id="salary"
                                type="number"
                                bind:value={salary}
                                min="0"
                                placeholder="10000000"
                            />
                        </div>
                    </div>
                    <div class="field">
                        <label class="label" for="bonus"
                            >Bonus tahunan (THR, Jasa produksi, dll)</label
                        >
                        <div class="control">
                            <input
                                class="input"
                                id="bonus"
                                type="number"
                                bind:value={bonus}
                                min="0"
                                placeholder="10000000"
                            />
                        </div>
                    </div>
                    <div class="field">
                        <div class="control">
                            <button class="button" on:click={onClick}
                                >Hitung</button
                            >
                        </div>
                    </div>
                </div>
            </div>

            <div class="column">
                <div class="box">
                    <table class="table is-striped is-bordered is-fullwidth">
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
                            <td>{formatIdr(result.employerContribution.jkk)}</td
                            >
                        </tr>
                        <tr>
                            <td>BPJSTK JKM - Perusahaan (0,3%)</td>
                            <td>{formatIdr(result.employerContribution.jkm)}</td
                            >
                        </tr>
                        <tr>
                            <td>BPJSKES - Perusahaan (4%, maks. Rp480.000)</td>
                            <td
                                >{formatIdr(
                                    result.employerContribution.bpjskes,
                                )}</td
                            >
                        </tr>
                        <tr>
                            <td>BPJSTK JHT - Karyawan (2%)</td>
                            <td
                                >- {formatIdr(
                                    result.employeeContribution.jht,
                                )}</td
                            >
                        </tr>
                        <tr>
                            <td>BPJSTK JP - Karyawan (1%, maks. Rp95.596)</td>
                            <td
                                >- {formatIdr(
                                    result.employeeContribution.jp,
                                )}</td
                            >
                        </tr>
                        <tr>
                            <td>Biaya Jabatan (5%, maks. Rp.500.000)</td>
                            <td>- {formatIdr(result.occupationalExpense)}</td>
                        </tr>
                        <tr>
                            <td>Penghasilan Bruto Bulanan</td>
                            <td>{formatIdr(result.monthlyGrossIncome)}</td>
                        </tr>
                        <tr>
                            <td>Penghasilan Bruto Tahunan</td>
                            <td>{formatIdr(result.yearlyGrossIncome)}</td>
                        </tr>
                        <tr>
                            <td>Penghasilan Neto Tahunan</td>
                            <td>{formatIdr(result.yearlyNetIncome)}</td>
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
                        <tr>
                            <td>Take Home Pay Bulanan</td>
                            <td>{formatIdr(result.regularMonthTakeHomePay)}</td>
                        </tr>
                        <tr>
                            <td>Take Home Pay di Bulan bonus</td>
                            <td>{formatIdr(result.bonusMonthTakeHomePay)}</td>
                        </tr>
                        <tr>
                            <td>Take Home Pay di Bulan Desember</td>
                            <td>{formatIdr(result.decemberTakeHomePay)}</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
    </div>
</section>
