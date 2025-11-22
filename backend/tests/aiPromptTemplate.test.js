const templateService = require('../src/services/aiPromptTemplateService');

describe('AI Prompt Template Service', () => {
  test('renders challenge template with placeholders', () => {
    const output = templateService.render('challenge', {
      subject: 'databases',
      difficulty: 'hard',
    });
    expect(output).toMatch(/databases/);
    expect(output).toMatch(/hard/);
    expect(output).toMatch(/## Objectives/);
  });

  test('renders feedback template with placeholders', () => {
    const output = templateService.render('feedback', {
      submission: 'function test(){}',
      context: '{"difficulty":"easy"}',
    });
    expect(output).toMatch(/function test/);
    expect(output).toMatch(/easy/);
    expect(output).toMatch(/JSON/); // basic sanity
  });
});
