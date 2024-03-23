<script lang="ts">
    import {
        calculateTax,
        taxpayerStatuses,
        type TaxpayerStatus,
    } from "$lib/tax";

    function formatIdr(n: number | null): string {
        if (n === null) {
            n = 0;
        }
        return n.toLocaleString("id-ID", {
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

<header>
    <h1>Kalkulator PPh 21 dengan Tarif Efektif Rata-rata (TER)</h1>
</header>
<main>
    <section>
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
            {#each taxpayerStatuses as taxpayerStatus}
                <option value={taxpayerStatus}>{taxpayerStatus}</option>
            {/each}
        </select>
        <button
            data-umami-event="calculate-salary"
            data-umami-event-salary={salary}
            data-umami-event-bonus={bonus}
            data-umami-event-status={status}
            on:click={onClick}
        >
            Hitung
        </button>
    </section>
    <section>
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
                <td>{formatIdr(result.employerContribution.jkk)}</td>
            </tr>
            <tr>
                <td>BPJSTK JKM - Perusahaan (0,3%)</td>
                <td>{formatIdr(result.employerContribution.jkm)}</td>
            </tr>
            <tr>
                <td>BPJSKES - Perusahaan (4%, maks. Rp480.000)</td>
                <td>{formatIdr(result.employerContribution.bpjskes)}</td>
            </tr>
            <tr>
                <td>BPJSTK JHT - Karyawan (2%)</td>
                <td>- {formatIdr(result.employeeContribution.jht)}</td>
            </tr>
            <tr>
                <td>BPJSTK JP - Karyawan (1%, maks. Rp95.596)</td>
                <td>- {formatIdr(result.employeeContribution.jp)}</td>
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
        </table>
    </section>
</main>
