import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

export function exportToPDF(data: any[], type: string, startDate: string, endDate: string) {
  const doc = new jsPDF()
  const title = `${type === 'temperature' ? 'Temperature Logs' : 'Checklist Completions'}`
  doc.text(`${title} — ${startDate} to ${endDate}`, 10, 10)

  autoTable(doc, {
    startY: 20,
    head: [Object.keys(data[0] || {})],
    body: data.map(row => Object.values(row)),
    styles: { fontSize: 8 }
  })

  doc.save(`${type}_${startDate}_to_${endDate}.pdf`)
}

export function exportToExcel(data: any[], type: string, startDate: string, endDate: string) {
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Export')
  XLSX.writeFile(wb, `${type}_${startDate}_to_${endDate}.xlsx`)
}
