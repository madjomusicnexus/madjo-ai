// Email report generator for daily practice summaries

export interface PracticeReportData {
  studentName: string;
  studentEmail: string;
  date: string;
  instruments: Array<{
    name: string;
    exercises: Array<{
      title: string;
      description: string;
      category: string;
      duration: number;
    }>;
  }>;
  totalDuration: number;
  totalExercises: number;
  xpEarned: number;
  streakDays: number;
  level: number;
  levelTitle: string;
  xpToNextLevel: number;
  singingWhilePlaying: boolean;
}

export function generatePracticeReportHTML(data: PracticeReportData): string {
  const instrumentsHtml = data.instruments.map(inst => `
    <div style="margin-bottom: 25px; padding: 15px; background: #f8fafc; border-radius: 12px; border-left: 4px solid #7c3aed;">
      <h3 style="margin: 0 0 10px 0; color: #7c3aed; font-size: 18px;">
        🎵 ${inst.name.toUpperCase()} (${inst.exercises.length} exercises)
      </h3>
      <ul style="margin: 0; padding-left: 20px;">
        ${inst.exercises.map(ex => `
          <li style="margin-bottom: 8px;">
            <strong>${ex.title}</strong> – ${ex.description.substring(0, 100)}${ex.description.length > 100 ? '...' : ''}
            <span style="color: #64748b; font-size: 12px;"> (${ex.duration} min)</span>
          </li>
        `).join('')}
      </ul>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Practice Report - ${data.studentName}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #1e293b;
          margin: 0;
          padding: 0;
          background-color: #f1f5f9;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .card {
          background: white;
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #7c3aed;
          padding-bottom: 20px;
          margin-bottom: 20px;
        }
        .logo {
          font-size: 40px;
          margin-bottom: 10px;
        }
        h1 {
          color: #7c3aed;
          margin: 0 0 5px 0;
          font-size: 28px;
        }
        .subtitle {
          color: #64748b;
          font-size: 14px;
          margin: 0;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 25px;
        }
        .stat-card {
          background: linear-gradient(135deg, #f3e8ff, #e9d5ff);
          padding: 15px;
          border-radius: 12px;
          text-align: center;
        }
        .stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #7c3aed;
        }
        .stat-label {
          font-size: 11px;
          color: #6b21a5;
          margin-top: 5px;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          margin: 20px 0 15px 0;
          color: #1e293b;
          border-left: 4px solid #7c3aed;
          padding-left: 12px;
        }
        .footer {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          font-size: 12px;
          color: #94a3b8;
        }
        .badge {
          display: inline-block;
          background: #e9d5ff;
          color: #7c3aed;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
        .motivation {
          background: linear-gradient(135deg, #dbeafe, #eff6ff);
          padding: 15px;
          border-radius: 12px;
          text-align: center;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            <div class="logo">🎵</div>
            <h1>MadJo AI Practice Report</h1>
            <p class="subtitle">${data.date} • ${data.singingWhilePlaying ? '🎤 Singing & Playing Mode' : ''}</p>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">${data.totalExercises}</div>
              <div class="stat-label">Exercises</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${data.totalDuration}</div>
              <div class="stat-label">Minutes</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">+${data.xpEarned}</div>
              <div class="stat-label">XP Earned</div>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">${data.streakDays}</div>
              <div class="stat-label">Day Streak</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">Level ${data.level}</div>
              <div class="stat-label">${data.levelTitle}</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${data.xpToNextLevel}</div>
              <div class="stat-label">XP to Next Level</div>
            </div>
          </div>

          <div class="section-title">📋 Exercises Completed</div>
          ${instrumentsHtml}

          <div class="motivation">
            <p style="margin: 0; font-weight: 600; color: #1e40af;">🎉 Great job, ${data.studentName}!</p>
            <p style="margin: 5px 0 0 0; font-size: 13px; color: #3b82f6;">Keep practicing daily to maintain your streak and level up!</p>
          </div>

          <div class="footer">
            <p>Generated by MadJo AI Music Learning Agent</p>
            <p>Powered by Gemini AI • ${new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}