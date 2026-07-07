import { jsPDF } from 'jspdf'
import type { HairstyleRecommendation, AnalysisResult } from '@/lib/types'

export async function exportBarberCardToPDF(
  recommendation: HairstyleRecommendation,
  analysisResult?: AnalysisResult | null
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  let y = margin

  // Background
  doc.setFillColor(28, 25, 23) // dark bg
  doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F')

  // Gold accent bar at top
  doc.setFillColor(212, 168, 83) // gold
  doc.rect(0, 0, pageWidth, 4, 'F')

  // Logo / Brand
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(212, 168, 83)
  doc.text('SCULPT', margin, y + 6)
  y += 12

  // Hairstyle Name
  doc.setFontSize(22)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  const nameLines = doc.splitTextToSize(recommendation.name, contentWidth)
  doc.text(nameLines, margin, y + 2)
  y += nameLines.length * 8 + 4

  // Compatibility Score
  doc.setFontSize(12)
  doc.setTextColor(212, 168, 83)
  doc.setFont('helvetica', 'bold')
  doc.text(`${recommendation.compatibilityScore}% COMPATIBILITY`, margin, y)
  y += 8

  if (recommendation.isSculptPick) {
    doc.setFontSize(9)
    doc.setTextColor(212, 168, 83)
    doc.text('#1 SCULPT PICK', margin, y)
    y += 8
  }

  // Divider
  doc.setDrawColor(212, 168, 83)
  doc.setLineWidth(0.3)
  doc.line(margin, y, pageWidth - margin, y)
  y += 8

  // Description
  doc.setFontSize(10)
  doc.setTextColor(180, 180, 180)
  doc.setFont('helvetica', 'normal')
  const descLines = doc.splitTextToSize(recommendation.description, contentWidth)
  doc.text(descLines, margin, y)
  y += descLines.length * 5 + 8

  // Analysis Section
  if (analysisResult) {
    doc.setFontSize(11)
    doc.setTextColor(212, 168, 83)
    doc.setFont('helvetica', 'bold')
    doc.text('YOUR ANALYSIS', margin, y)
    y += 7

    doc.setFontSize(9)
    doc.setTextColor(200, 200, 200)
    doc.setFont('helvetica', 'normal')

    const analysisItems = [
      `Face Shape: ${analysisResult.faceShape}`,
      `Hair Density: ${analysisResult.densityScore}/100`,
      `Texture: Wavy ${Math.round(analysisResult.textureProfile.waviness * 100)}% / Curly ${Math.round(analysisResult.textureProfile.curliness * 100)}% / Straight ${Math.round(analysisResult.textureProfile.straightness * 100)}%`,
    ]

    for (const item of analysisItems) {
      doc.text(item, margin, y)
      y += 5
    }
    y += 5
  }

  // Metadata Scores
  doc.setFontSize(11)
  doc.setTextColor(212, 168, 83)
  doc.setFont('helvetica', 'bold')
  doc.text('STYLE METRICS', margin, y)
  y += 7

  const metrics = [
    { label: 'Maintenance', value: recommendation.metadata.maintenance },
    { label: 'Styling Effort', value: recommendation.metadata.stylingEffort },
    { label: 'Professionalism', value: recommendation.metadata.professionalism },
    { label: 'Trendiness', value: recommendation.metadata.trendiness },
  ]

  doc.setFontSize(9)
  for (const metric of metrics) {
    doc.setTextColor(200, 200, 200)
    doc.setFont('helvetica', 'normal')
    doc.text(`${metric.label}:`, margin, y)

    doc.setTextColor(212, 168, 83)
    doc.setFont('helvetica', 'bold')
    doc.text(`${metric.value}/100`, margin + 45, y)

    // Bar background
    doc.setFillColor(60, 60, 60)
    doc.roundedRect(margin + 65, y - 3, 80, 3.5, 1, 1, 'F')

    // Bar fill
    doc.setFillColor(212, 168, 83)
    doc.roundedRect(margin + 65, y - 3, (metric.value / 100) * 80, 3.5, 1, 1, 'F')

    y += 7
  }
  y += 5

  // Divider
  doc.setDrawColor(80, 80, 80)
  doc.setLineWidth(0.2)
  doc.line(margin, y, pageWidth - margin, y)
  y += 8

  // Cutting Instructions
  doc.setFontSize(11)
  doc.setTextColor(212, 168, 83)
  doc.setFont('helvetica', 'bold')
  doc.text('BARBER CUTTING INSTRUCTIONS', margin, y)
  y += 7

  doc.setFontSize(9)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text('TOP:', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(200, 200, 200)
  const topLines = doc.splitTextToSize(recommendation.barberCard.cuttingMetrics.top, contentWidth - 12)
  doc.text(topLines, margin + 12, y)
  y += topLines.length * 4.5 + 3

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('SIDES:', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(200, 200, 200)
  const sideLines = doc.splitTextToSize(recommendation.barberCard.cuttingMetrics.sides, contentWidth - 15)
  doc.text(sideLines, margin + 15, y)
  y += sideLines.length * 4.5 + 3

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('BOUNDARY:', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(200, 200, 200)
  const boundLines = doc.splitTextToSize(recommendation.barberCard.cuttingMetrics.boundary, contentWidth - 22)
  doc.text(boundLines, margin + 22, y)
  y += boundLines.length * 4.5 + 6

  // Styling Protocols
  doc.setFontSize(11)
  doc.setTextColor(212, 168, 83)
  doc.setFont('helvetica', 'bold')
  doc.text('STYLING PROTOCOL', margin, y)
  y += 7

  doc.setFontSize(9)
  doc.setTextColor(200, 200, 200)
  doc.setFont('helvetica', 'normal')
  for (const protocol of recommendation.barberCard.stylingProtocols) {
    const protocolLines = doc.splitTextToSize(`• ${protocol}`, contentWidth - 5)
    doc.text(protocolLines, margin + 2, y)
    y += protocolLines.length * 4.5 + 1.5
  }
  y += 4

  // Warnings
  if (recommendation.barberCard.warnings.length > 0) {
    doc.setFontSize(11)
    doc.setTextColor(220, 80, 80)
    doc.setFont('helvetica', 'bold')
    doc.text('WARNINGS', margin, y)
    y += 7

    doc.setFontSize(9)
    doc.setTextColor(200, 200, 200)
    doc.setFont('helvetica', 'normal')
    for (const warning of recommendation.barberCard.warnings) {
      const warnLines = doc.splitTextToSize(`- ${warning}`, contentWidth - 5)
      doc.text(warnLines, margin + 2, y)
      y += warnLines.length * 4.5 + 1.5
    }
  }

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight()
  doc.setFillColor(212, 168, 83)
  doc.rect(0, pageHeight - 4, pageWidth, 4, 'F')

  doc.setFontSize(7)
  doc.setTextColor(150, 150, 150)
  doc.setFont('helvetica', 'normal')
  doc.text(
    'Generated by Sculpt — AI-Powered Grooming Recommendations',
    margin,
    pageHeight - 8
  )
  doc.text(
    new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    pageWidth - margin,
    pageHeight - 8,
    { align: 'right' }
  )

  // Save
  const fileName = `sculpt-${recommendation.name.toLowerCase().replace(/\s+/g, '-')}.pdf`
  doc.save(fileName)
}
