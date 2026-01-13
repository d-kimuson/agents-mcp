import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import type { Config } from './config/schema';
import packageJson from '../package.json' with { type: 'json' };
import { createAgentService } from './agents/factory';
import { composePrompt } from './utils/prompt';

const agentTaskArgsSchema = z.object({
  agent: z.string(),
  prompt: z.string(),
  sessionId: z.string().optional(),
});

export const createServer = (config: Config) => {
  // eslint-disable-next-line no-deprecated -- Server is alive for advanced usecase
  const server = new Server(
    {
      name: packageJson.name,
      version: packageJson.version,
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  const agentNames = config.agents.map((agent) => agent.name);

  server.setRequestHandler(ListToolsRequestSchema, () => {
    const agentDescriptions = config.agents
      .map((agent) => {
        const primaryAgentConfig = agent.agents[0];
        if (primaryAgentConfig === undefined) {
          return undefined;
        }
        const modelInfo =
          primaryAgentConfig.model !== undefined ? ` (${primaryAgentConfig.model})` : '';
        return `- ${agent.name}: ${agent.description} [${primaryAgentConfig.type}${modelInfo}]`;
      })
      .filter((desc): desc is string => desc !== undefined)
      .join('\n');

    return {
      tools: [
        {
          name: 'agent-task',
          description: `Execute a task using a configured AI agent.\n\nAvailable agents:\n${agentDescriptions}\n\nThe agent will execute the prompt and return the result. If sessionId is provided, it will continue from the previous session.`,
          inputSchema: {
            type: 'object',
            properties: {
              agent: {
                type: 'string',
                description: 'The agent to use for this task',
                enum: agentNames,
              },
              prompt: {
                type: 'string',
                description: 'The instruction/prompt for the agent',
              },
              sessionId: {
                type: 'string',
                description: 'Optional session ID to continue from a previous conversation',
              },
            },
            required: ['agent', 'prompt'],
          },
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name !== 'agent-task') {
      throw new Error(`Unknown tool: ${name}`);
    }

    const parsedArgs = agentTaskArgsSchema.parse(args);
    const agentConfig = config.agents.find((agent) => agent.name === parsedArgs.agent);

    if (agentConfig === undefined) {
      throw new Error(`Agent not found: ${parsedArgs.agent}`);
    }

    // 優先順位順に取得（現状はフォールバック未実装）
    const agentConfigItem = agentConfig.agents[0];
    if (agentConfigItem === undefined) {
      throw new Error(`No agent configuration found for: ${parsedArgs.agent}`);
    }

    const agentService = createAgentService(agentConfigItem);

    const composedPrompt = composePrompt(agentConfig.prompt, parsedArgs.prompt);

    const result =
      parsedArgs.sessionId !== undefined && parsedArgs.sessionId.length > 0
        ? await agentService.continueSession({
            model: agentConfigItem.model,
            prompt: composedPrompt,
            sessionId: parsedArgs.sessionId,
          })
        : await agentService.newSession({
            model: agentConfigItem.model,
            prompt: composedPrompt,
          });

    const responseText =
      'sessionId' in result
        ? `Session ID: ${String(result.sessionId)}\n\n${result.message}`
        : result.message;

    return {
      content: [
        {
          type: 'text',
          text: responseText,
        },
      ],
    };
  });

  return server;
};

export const startServer = async (config: Config) => {
  const server = createServer(config);
  const transport = new StdioServerTransport();
  await server.connect(transport);
};
