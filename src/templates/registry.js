import os from 'os';
import path from 'path';

export const TEMPLATE_REGISTRY = {
  githubRepo: 'https://github.com/Ennygabby01/launchstack-templates',
  branch: 'main',
  cacheDir: path.join(os.homedir(), '.launchstack', 'templates'),
};
