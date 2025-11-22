// Snapshot tests for AI service (Sprint 3.7)
// We mock OpenAI to ensure deterministic output.

jest.mock('openai', () => {
  return {
    chat: {
      completions: {
        create: jest.fn(async ({ messages }) => {
          const userMsg = messages.find((m) => m.role === 'user').content;
          return {
            choices: [
              {
                message: {
                  content: `MOCK_RESPONSE_FOR: ${userMsg.substring(0, 50)}`,
                },
              },
            ],
            model: 'mock-model-1',
          };
        }),
      },
    },
  };
});

const aiService = require('../src/services/aiService');

describe('AI Service Snapshots', () => {
  test('generateChallenge snapshot', async () => {
    const result = await aiService.generateChallenge({
      subject: 'algorithms',
      difficulty: 'medium',
      userId: 1,
    });
    expect(result).toMatchSnapshot();
  });

  test('generateFeedback snapshot', async () => {
    const result = await aiService.generateFeedback({
      submissionText: 'My solution code',
      challengeContext: { id: 10 },
      userId: 1,
    });
    expect(result).toMatchSnapshot();
  });
});
