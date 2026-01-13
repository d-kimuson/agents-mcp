export type NewSessionResult = {
  sessionId: string;
  message: string;
};

export type ContinueSessionResult = {
  message: string;
};

export type AgentService = {
  newSession: (input: {
    model?: string;
    prompt: string;
  }) => Promise<NewSessionResult> | NewSessionResult;
  continueSession: (input: {
    model?: string;
    prompt: string;
    sessionId: string;
  }) => Promise<ContinueSessionResult> | ContinueSessionResult;
};
