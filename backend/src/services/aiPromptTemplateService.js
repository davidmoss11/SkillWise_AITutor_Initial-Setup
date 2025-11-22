// Reusable AI prompt template service (Sprint 3.3)
// Provides simple templating with named placeholders.

const templates = {
  challenge: `You are an AI tutor. Generate a concise, well-structured learning challenge.
Subject: {{subject}}
Difficulty: {{difficulty}}
Format: Provide a title, a short description, clear objectives (bullet list), and an evaluation criteria section.
Output strictly in Markdown with sections: \n## Title\n## Description\n## Objectives\n- ...\n## Evaluation Criteria\n- ...`,
  feedback: `You are an AI tutor. Provide constructive feedback.
Submission: {{submission}}
Context: {{context}}
Respond with JSON containing keys: strengths (array), improvements (array), summary (string). Keep arrays to max 5 items.`,
};

function render(templateName, variables) {
  const raw = templates[templateName];
  if (!raw) throw new Error(`Template '${templateName}' not found`);
  return Object.keys(variables).reduce((acc, key) => {
    const value = String(variables[key]);
    return acc.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }, raw);
}

module.exports = { render, templates };
