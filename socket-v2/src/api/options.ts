import type { CompanyOptions } from '@/config/types'

/** Fetch a company's display options before the widget config is fully resolved. */
export async function getCompanyOptions(
  publicKey: string,
  apiRoot: string,
): Promise<CompanyOptions> {
  const url = `${apiRoot}/${publicKey}/options`
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (res.status !== 200) {
    const body = await res.text().catch(() => '')
    throw new Error(`wrong response code ${res.status}, Response: ${body.substring(0, 500)}`)
  }
  return (await res.json()) as CompanyOptions
}
