import type { Context } from "@stricjs/app"
import { routes } from "@stricjs/app"
import Mustache from "mustache"
import { calculateTax, stringToTaxpayerStatus, type TaxpayerStatus } from "./tax"

export default routes()
  .get('/', getHandler)
  .post('/', postHandler)

const template = await Bun.file(import.meta.dir + "/index.html").text()

function getHandler(_: Context) {
  return new Response(Mustache.render(template, {}), {
    headers: {
      "content-type": "text/html",
    },
  })
}

async function postHandler(context: Context) {
  const formData = await context.req.formData()
  const rawStatus = formData.get("status")
  const rawSalary = formData.get("salary")
  const rawBonus = formData.get("bonus")

  let status: TaxpayerStatus
  let salary: number
  let bonus: number
  try {
    status = stringToTaxpayerStatus(rawStatus?.toString()!)
    salary = Number(rawSalary)
    bonus = Number(rawBonus)
  } catch {
    return new Response(null, { status: 400 })
  }

  const result = calculateTax(salary, bonus, status)
  const templateData = {
    salary: salary.toLocaleString("id-ID", { style: "currency", currency: "IDR" }),
    bonus: bonus.toLocaleString("id-ID", { style: "currency", currency: "IDR" }),
    taxRateCategory: result.taxRateCategory,
    employerInsuranceContributionJkk: result.employerInsuranceContribution.jkk.toLocaleString("id-ID", { style: "currency", currency: "IDR" }),
    employerInsuranceContributionJkm: result.employerInsuranceContribution.jkm.toLocaleString("id-ID", { style: "currency", currency: "IDR" }),
    employeeInsuranceContributionJht: result.employeeInsuranceContribution.jht.toLocaleString("id-ID", { style: "currency", currency: "IDR" }),
    employeeInsuranceContributionJp: result.employeeInsuranceContribution.jp.toLocaleString("id-ID", { style: "currency", currency: "IDR" }),
    employerInsuranceContributionBpjskes: result.employerInsuranceContribution.bpjskes.toLocaleString("id-ID", { style: "currency", currency: "IDR" }),
    occupationalExpense: result.occupationalExpense.toLocaleString("id-ID", { style: "currency", currency: "IDR" }),
    netMonthlyIncome: result.netMonthlyIncome.toLocaleString("id-ID", { style: "currency", currency: "IDR" }),
    netYearlyIncome: result.netYearlyIncome.toLocaleString("id-ID", { style: "currency", currency: "IDR" }),
    nonTaxableIncome: result.nonTaxableIncome.toLocaleString("id-ID", { style: "currency", currency: "IDR" }),
    taxableIncome: result.taxableIncome.toLocaleString("id-ID", { style: "currency", currency: "IDR" }),
    regularMonthTax: result.regularMonthTax.toLocaleString("id-ID", { style: "currency", currency: "IDR" }),
    bonusMonthTax: result.bonusMonthTax.toLocaleString("id-ID", { style: "currency", currency: "IDR" }),
    decemberMonthTax: result.decemberMonthTax.toLocaleString("id-ID", { style: "currency", currency: "IDR" }),
    totalTax: result.totalTax.toLocaleString("id-ID", { style: "currency", currency: "IDR" }),
  }

  return new Response(Mustache.render(template, templateData), {
    headers: {
      "content-type": "text/html",
    },
  })
}
