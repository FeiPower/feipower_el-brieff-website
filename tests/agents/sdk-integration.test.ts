import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

describe('Agents SDK integration', () => {
  it('depends on agents package and EditorialAgent extends Agent', () => {
    const pkg = JSON.parse(
      readFileSync(join(root, 'package.json'), 'utf8'),
    ) as { dependencies: Record<string, string> };
    assert.ok(pkg.dependencies.agents, 'agents dependency required');

    const source = readFileSync(
      join(root, 'src/lib/agents/editorial-agent.ts'),
      'utf8',
    );
    assert.match(source, /from ['"]agents['"]/);
    assert.match(source, /class EditorialAgent extends Agent/);
    assert.match(source, /routeAgentRequest/);
    assert.match(source, /async requestTool\(/);
    assert.match(source, /async approveTool\(/);
    assert.match(source, /this\.setState\(/);
  });

  it('exposes Access-gated admin agent API', () => {
    const source = readFileSync(
      join(root, 'src/pages/api/admin/agent.ts'),
      'utf8',
    );
    assert.match(source, /getAgentByName/);
    assert.match(source, /resolveAccessIdentity/);
    assert.match(source, /approveTool/);
  });
});
