const { execSync } = require('child_process');

const args = process.argv.slice(2);
const flags = {
  debug: args.includes('--debug'),
  stepdebug: args.includes('--stepdebug'),
};

const env = {
    ...process.env,
    ...(flags.debug && { NEXT_PUBLIC_DEBUG: 'true' }),
    ...(flags.stepdebug && { NEXT_PUBLIC_DEBUG: 'true', NEXT_PUBLIC_STEPDEBUG: 'true' }),
  };

execSync('next dev', { stdio: 'inherit', env });