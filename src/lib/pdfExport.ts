// PDF Export - Generate practice reports

export interface ReportData {
  studentName: string;
  instrument: string;
  gradeLevel: number;
  dateRange: string;
  streakDays: number;
  totalXP: number;
  level: number;
  levelTitle: string;
  weeklyData: { day: string; exercises: number; xp: number }[];
  totalExercises: number;
  totalPracticeDays: number;
}

export function generateReportHTML(data: ReportData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Practice Report - ${data.studentName}</title>
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          margin: 0;
          padding: 40px;
          background: #f5f5f5;
        }
        .report-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }
        h1 {
          color: #7c3aed;
          font-size: 28px;
          margin-bottom: 10px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 3px solid #7c3aed;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-bottom: 30px;
        }
        .stat-card {
          background: linear-gradient(135deg, #f3e8ff, #e9d5ff);
          padding: 20px;
          border-radius: 15px;
          text-align: center;
        }
        .stat-value {
          font-size: 32px;
          font-weight: bold;
          color: #7c3aed;
        }
        .stat-label {
          font-size: 12px;
          color: #6b21a5;
          margin-top: 5px;
        }
        .section-title {
          font-size: 20px;
          font-weight: bold;
          color: #333;
          margin: 25px 0 15px 0;
          border-left: 4px solid #7c3aed;
          padding-left: 12px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 10px;
          text-align: center;
          border-bottom: 1px solid #ddd;
        }
        th {
          background: #f3e8ff;
          color: #7c3aed;
        }
        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
        }
        .badge-gold {
          background: #fef3c7;
          color: #d97706;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #999;
        }
      </style>
    </head>
    <body>
      <div class="report-container">
        <div class="header">
          <h1>🎵 MadJo AI Practice Report</h1>
          <p>${data.studentName} • ${data.instrument} • Grade ${data.gradeLevel}</p>
          <p>${data.dateRange}</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${data.streakDays}</div>
            <div class="stat-label">Day Streak</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.totalXP}</div>
            <div class="stat-label">Total XP</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.levelTitle}</div>
            <div class="stat-label">Level ${data.level}</div>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${data.totalExercises}</div>
            <div class="stat-label">Exercises Completed</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${data.totalPracticeDays}</div>
            <div class="stat-label">Practice Days</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${Math.round((data.totalPracticeDays / 30) * 100)}%</div>
            <div class="stat-label">Completion Rate</div>
          </div>
        </div>

        <div class="section-title">📊 Weekly Activity</div>
        <table>
          <thead>
            <tr><th>Day</th><th>Exercises</th><th>XP Earned</th></tr>
          </thead>
          <tbody>
            ${data.weeklyData.map(day => `
              <tr>
                <td>${day.day}</td>
                <td><span class="badge badge-gold">${day.exercises}</span></td>
                <td>${day.xp}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="section-title">💡 Practice Insights</div>
        <ul style="color: #555; line-height: 1.8;">
          <li>🎯 ${data.totalPracticeDays} days practiced - ${Math.round((data.totalPracticeDays / 30) * 100)}% consistency rate</li>
          <li>🔥 ${data.streakDays} day active streak - keep it going!</li>
          <li>⭐ ${data.totalXP} total XP earned - ${data.levelTitle} level achieved</li>
          <li>📈 ${data.totalExercises} exercises completed this period</li>
        </ul>

        <div class="footer">
          Generated by MadJo AI Music Learning • ${new Date().toLocaleDateString()}
        </div>
      </div>
    </body>
    </html>
  `;
}

export function downloadPDF(html: string, filename: string): void {
  // Create a Blob with the HTML content
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  // Create download link
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}