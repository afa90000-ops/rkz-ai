export function exportCSV(
  filename: string,
  rows: Record<string, unknown>[],
  columns: { key: string; label: string }[]
) {
  if (!rows.length) return

  const header = columns.map(c => `"${c.label}"`).join(',')
  const body = rows.map(row =>
    columns.map(c => {
      const val = row[c.key]
      if (val == null) return '""'
      const str = String(val).replace(/"/g, '""')
      return `"${str}"`
    }).join(',')
  ).join('\n')

  const bom = '﻿' // UTF-8 BOM for Arabic Excel compatibility
  const blob = new Blob([bom + header + '\n' + body], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export async function exportXLSX(
  filename: string,
  rows: Record<string, unknown>[],
  columns: { key: string; label: string }[],
  sheetName = 'البيانات'
) {
  if (!rows.length) return

  const XLSX = await import('xlsx')

  const header = columns.map(c => c.label)
  const data = rows.map(row =>
    columns.map(c => {
      const val = row[c.key]
      return val == null ? '' : String(val)
    })
  )

  const ws = XLSX.utils.aoa_to_sheet([header, ...data])

  // Column widths
  ws['!cols'] = columns.map(() => ({ wch: 20 }))

  // RTL sheet view
  if (!ws['!sheetView']) ws['!sheetView'] = {}
  ws['!sheetView'] = { rightToLeft: true }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)

  XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`)
}
