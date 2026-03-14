import chalk from 'chalk';

export const logger = {
  info(message) {
    console.log(chalk.cyan(`ℹ ${message}`));
  },

  success(message) {
    console.log(chalk.green(`✔ ${message}`));
  },

  error(message) {
    console.log(chalk.red(`✖ ${message}`));
  },

  warn(message) {
    console.log(chalk.yellow(`⚠ ${message}`));
  },

  dim(message) {
    console.log(chalk.dim(message));
  },

  blank() {
    console.log('');
  },

  header(message) {
    console.log(chalk.bold.magenta(message));
  },

  detected(tool) {
    console.log(chalk.green(`✔ ${tool} detected`));
  },

  notDetected(tool) {
    console.log(chalk.red(`✖ ${tool} not detected`));
  },
};
