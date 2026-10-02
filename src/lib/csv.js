/*
  CSV export without a library. Every value is quoted and inner quotes are
  doubled, so commas and quotes inside names can't break the columns.
  The BOM at the start tells Excel the file is UTF-8 (otherwise ₦ shows as junk).
*/
const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`

/** columns: [{ header, value: (row) => any }] */
export function toCSV(rows, columns) {
  const lines = [columns.map((column) => escape(column.header)).join(',')]
  for (const row of rows) lines.push(columns.map((column) => escape(column.value(row))).join(','))
  return lines.join('\r\n')
}

export function downloadCSV(filename, csv) {
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
