import chalk from 'chalk';

/** Simple colored logger for CLI output. */
export const logger = {
  info: (msg: string): void => console.log(chalk.blue('ℹ'), msg),
  success: (msg: string): void => console.log(chalk.green('✔'), msg),
  warn: (msg: string): void => console.log(chalk.yellow('⚠'), msg),
  error: (msg: string): void => console.log(chalk.red('✖'), msg),
  step: (msg: string): void => console.log(chalk.cyan('→'), chalk.cyan(msg)),
  divider: (): void => console.log(chalk.gray('─'.repeat(50))),
};
