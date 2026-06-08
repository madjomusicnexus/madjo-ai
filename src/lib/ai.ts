export type AIProvider = 'claude' | 'groq' | 'openai';

const PROVIDERS = {
  claude: {
    url: 'https://api.anthropic.com/v1/messages',
    key: import.meta.env.VITE_ANTHROPIC_API_KEY as string,
  },
  groq: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    key: import.meta.env.VITE_GROQ_API_KEY as string,
  },
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    key: import.meta.env.VITE_OPENAI_API_KEY as string,
  },
};

// ============================================
// NEW FUNCTION: Get difficulty adjustment from student feedback
// ============================================
function getDifficultyAdjustment(): string {
  try {
    // Get saved feedback from localStorage
    const existing = localStorage.getItem('exercise_feedback');
    if (!existing) return '';
    
    const feedbacks = JSON.parse(existing);
    
    // Only look at last 7 days of feedback
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    const recentFeedback = feedbacks.filter((f: any) => 
      new Date(f.timestamp) > last7Days
    );
    
    if (recentFeedback.length === 0) return '';
    
    // Count easy vs hard clicks
    const easyCount = recentFeedback.filter((f: any) => f.difficulty === 'easy').length;
    const hardCount = recentFeedback.filter((f: any) => f.difficulty === 'hard').length;
    
    console.log(`📊 Feedback stats: ${easyCount} easy, ${hardCount} hard`);
    
    // Return adjustment instruction for the AI
    if (easyCount > hardCount + 2) {
      return `🎯 DIFFICULTY ADJUSTMENT: The student found recent exercises TOO EASY (${easyCount} easy, ${hardCount} hard). 
      Please make ALL exercises in this routine 25% MORE CHALLENGING:
      - Add more complex rhythms and patterns
      - Increase tempo suggestions
      - Add advanced variations to basic exercises
      - Include 1-2 extra challenging tasks per exercise`;
    } 
    
    if (hardCount > easyCount + 2) {
      return `🎯 DIFFICULTY ADJUSTMENT: The student found recent exercises TOO HARD (${hardCount} hard, ${easyCount} easy). 
      Please make ALL exercises in this routine 25% EASIER:
      - Simplify instructions (break into smaller steps)
      - Suggest slower tempos
      - Focus on fundamentals before adding complexity
      - Add more encouragement and supportive language`;
    }
    
    if (easyCount > hardCount) {
      return `📈 Note: Student slightly prefers harder material (${easyCount} easy vs ${hardCount} hard). Add 1-2 challenging variations where appropriate.`;
    }
    
    if (hardCount > easyCount) {
      return `📉 Note: Student slightly prefers easier material (${hardCount} hard vs ${easyCount} easy). Keep instructions very clear and tempos moderate.`;
    }
    
    return '';
  } catch (error) {
    console.error('Failed to read feedback:', error);
    return '';
  }
}

async function callAI(
  provider: AIProvider,
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 1000
): Promise<string> {
  const p = PROVIDERS[provider];

  if (!p.key) throw new Error(`${provider} API key not set`);

  let body: object;
  let headers: Record<string, string>;

  if (provider === 'claude') {
    headers = {
      'Content-Type': 'application/json',
      'x-api-key': p.key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    };
    body = {
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    };
  } else {
    headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${p.key}`,
    };
    const model = provider === 'groq' ? 'llama-3.1-8b-instant' : 'gpt-4o-mini';
    body = {
      model,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    };
  }

  const res = await fetch(p.url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`${provider} error: ${res.status}`);

  const data = await res.json();

  if (provider === 'claude') return data.content[0].text;
  return data.choices[0].message.content;
}

export async function callAIWithFallback(
  providers: AIProvider[],
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 1000
): Promise<string> {
  // Get difficulty adjustment from feedback
  const adjustment = getDifficultyAdjustment();
  
  // Add adjustment to the system prompt if it exists
  let finalSystemPrompt = systemPrompt;
  if (adjustment) {
    finalSystemPrompt = `${systemPrompt}\n\n${adjustment}`;
  }
  
  for (const provider of providers) {
    try {
      return await callAI(provider, finalSystemPrompt, userPrompt, maxTokens);
    } catch (e) {
      console.warn(`${provider} failed, trying next...`, e);
    }
  }
  throw new Error('All AI providers failed');
}