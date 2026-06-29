export interface PrescriptionData {
  patientName: string;
  patientDNI: string;
  patientAge: number | null;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  diagnosis: string;
  medications: string;
  observations: string;
  nextAppointment: string;
}

export function printPrescription(data: PrescriptionData): void {
  const win = window.open('', '_blank');
  if (!win) return;

  const content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Receta Médica - CLINIX</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      color: #1a1a1a;
      background: #fff;
      padding: 40px;
      font-size: 14px;
      line-height: 1.5;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #1a1a1a;
      padding-bottom: 15px;
      margin-bottom: 25px;
    }
    .clinic-name {
      font-size: 28px;
      font-weight: bold;
      letter-spacing: 2px;
    }
    .doctor-info {
      text-align: right;
      font-size: 13px;
    }
    .doctor-info .name {
      font-weight: bold;
      font-size: 15px;
    }
    .patient-section {
      display: flex;
      flex-wrap: wrap;
      gap: 20px 40px;
      border: 1px solid #ccc;
      padding: 15px;
      margin-bottom: 25px;
      background: #fafafa;
    }
    .patient-section .field {
      min-width: 160px;
    }
    .patient-section .label {
      font-size: 11px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .patient-section .value {
      font-size: 15px;
      font-weight: bold;
      margin-top: 2px;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      font-size: 13px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #444;
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
      margin-bottom: 10px;
    }
    .section-content {
      padding-left: 10px;
      white-space: pre-wrap;
      font-size: 14px;
    }
    .medications-content {
      padding-left: 10px;
      white-space: pre-wrap;
      font-size: 14px;
      line-height: 1.8;
    }
    .signature-area {
      margin-top: 50px;
      display: flex;
      justify-content: space-between;
      align-items: end;
    }
    .signature-line {
      width: 300px;
      border-top: 1px solid #1a1a1a;
      padding-top: 8px;
      text-align: center;
      font-size: 13px;
      color: #555;
    }
    .footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      text-align: center;
      padding: 15px;
      font-size: 11px;
      color: #888;
      border-top: 1px solid #ddd;
      background: #fff;
    }
    @media print {
      body { padding: 30px; }
      .footer { position: fixed; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="clinic-name">CLINIX</div>
    <div class="doctor-info">
      <div class="name">${escapeHtml(data.doctorName)}</div>
      <div>${escapeHtml(data.doctorSpecialty)}</div>
    </div>
  </div>

  <div class="patient-section">
    <div class="field">
      <div class="label">Paciente</div>
      <div class="value">${escapeHtml(data.patientName)}</div>
    </div>
    <div class="field">
      <div class="label">DNI</div>
      <div class="value">${escapeHtml(data.patientDNI)}</div>
    </div>
    <div class="field">
      <div class="label">Edad</div>
      <div class="value">${data.patientAge !== null ? data.patientAge : '—'}</div>
    </div>
    <div class="field">
      <div class="label">Fecha</div>
      <div class="value">${escapeHtml(data.date)}</div>
    </div>
  </div>

  ${data.diagnosis ? `
  <div class="section">
    <div class="section-title">Diagnóstico</div>
    <div class="section-content">${escapeHtml(data.diagnosis)}</div>
  </div>` : ''}

  ${data.medications ? `
  <div class="section">
    <div class="section-title">Medicamentos Prescritos</div>
    <div class="medications-content">${escapeHtml(data.medications)}</div>
  </div>` : ''}

  ${data.observations ? `
  <div class="section">
    <div class="section-title">Observaciones</div>
    <div class="section-content">${escapeHtml(data.observations)}</div>
  </div>` : ''}

  ${data.nextAppointment ? `
  <div class="section">
    <div class="section-title">Próxima Cita</div>
    <div class="section-content">${escapeHtml(data.nextAppointment)}</div>
  </div>` : ''}

  <div class="signature-area">
    <div></div>
    <div class="signature-line">
      Firma del Médico<br>
      ${escapeHtml(data.doctorName)}
    </div>
  </div>

  <div class="footer">
    Esta receta es válida solo con la firma del médico
  </div>

  <script>
    window.onload = function() { window.print(); window.close(); };
  <\/script>
</body>
</html>`;

  win.document.write(content);
  win.document.close();
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, c => map[c] ?? c);
}
