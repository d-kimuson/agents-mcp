import { execSync } from 'node:child_process';

export const executeShellCommand = (command: string): string => {
  return execSync(command, { encoding: 'utf-8', shell: '/bin/sh' });
};

export const parseShellJsonOutput = (output: string): unknown => {
  const start = output.indexOf('{');
  const end = output.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error(`Failed to extract JSON from output: ${output}`);
  }

  const jsonText = output.slice(start, end + 1);
  return JSON.parse(jsonText);
};

export const parseShellJsonlOutput = (output: string): unknown[] => {
  const lines = output.split('\n');
  return lines
    .filter((line) => line.startsWith('{') && line.endsWith('}'))
    .flatMap((line) => {
      try {
        const parsed: unknown = JSON.parse(line);
        return [parsed];
      } catch {
        return [];
      }
    });
};
