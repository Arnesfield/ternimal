import chalk from 'chalk';
import inquirer from 'inquirer';
import { oraPromise } from 'ora';
import readline from 'readline';
import create from '../lib/index.js';

// create terminal
const term = create((terminal, context) => {
  const rl = readline.createInterface(process.stdin, process.stdout);
  // preserve previous readline history
  if (terminal && context.reinit) {
    rl.history = terminal.rl.history.slice();
  }
  return {
    rl,
    stdin: process.stdin,
    stdout: process.stdout,
    stderr: process.stderr
  };
});

function getTime() {
  const date = new Date();
  const time = [date.getHours(), date.getMinutes(), date.getSeconds()]
    .map(value => value.toString().padStart(2, '0'))
    .join(':');
  return chalk.gray(time);
}

// keep nth outside of .use() to persist between terminal close and reinit
const prompt = (() => {
  let nth = 0;
  const prompt = {
    type: 'short',
    get(diff = 0) {
      nth += diff;
      const time = `[${getTime()}]`;
      const input = `${chalk.cyan(nth)}> `;
      return this.type === 'short'
        ? `${time} ${input}`
        : [
            `\n${time}`,
            chalk.green('user@host'),
            chalk.yellow('directory'),
            chalk.cyan('branch')
          ].join(' ') + `\n${input}`;
    }
  };
  return prompt;
})();

// mock ping dirty example
// persist interval outside to allow login command with ongoing ping
/** @type {NodeJS.Timeout | undefined} */
let pingInterval;
function ping(max = 10) {
  // clear existing if any
  clearInterval(pingInterval);
  let count = 1;
  pingInterval = setInterval(() => {
    term.console.log(
      'Ping %s: 64 bytes from localhost (127.0.0.1): icmp_seq=5 ttl=64 time=0.055 ms',
      count
    );
    if (++count > max) {
      clearInterval(pingInterval);
    }
  }, 1000);
  return pingInterval;
}

// ora spinner
async function load() {
  const max = 5;
  for (let count = 1; count <= max; count++) {
    // delay spinner
    const delay = new Promise(resolve => setTimeout(resolve, 300));
    await oraPromise(delay, { text: `Loading task ${count} of ${max}` });
  }
}

// hide prompt and close terminal for graceful exit
function exit() {
  clearInterval(pingInterval);
  term.setPrompt('').deinit();
}

// lazy command map
const command = {
  clear: 'clear',
  toggle: 'toggle',
  question: 'question',
  ping: 'ping',
  load: 'load',
  login: 'login',
  help: 'help',
  exit: 'exit'
};

// setup line event
term.use(() => {
  term.rl.on('line', async line => {
    // exit: return to skip prompt
    if (line === command.exit) {
      return exit();
    }
    // clear screen
    else if (line === command.clear) {
      term.raw.stdout.write('\x1Bc');
    }
    // help
    else if (line === command.help) {
      term.console.log(
        'Commands:',
        Object.values(command)
          .map(cmd => chalk.bold(cmd))
          .join(', ')
      );
    }
    // toggle prompt
    else if (line === command.toggle) {
      prompt.type = prompt.type === 'short' ? 'long' : 'short';
    }
    // question using default readline
    else if (line === command.question) {
      // the prompt state is already inactive here because we're in a line event
      // but when outside a line event make sure to set the prompt state to inactive
      // term.active(false);
      // pause only write streams
      term.pause({ stdout: true, stderr: true });
      // show questions in callback hell fashion (consider readline.promises.Interface)
      term.rl.question('1. Question using readline: ', line => {
        // use console directly since term.console is paused
        console.log('Answer:', line);
        term.rl.question('2. Another question using readline: ', line => {
          console.log('Answer:', line);
          // once all are answered, show prompt to set active state
          term.resume().prompt(true);
        });
      });
      // return to skip prompt
      return;
    }
    // ping
    else if (line === command.ping) {
      ping();
    }
    // ora spinner
    else if (line === command.load) {
      // allow mocked ping logging while spinner loads
      term.deinit();
      await load();
      term.reinit();
    }
    // inquirer login
    else if (line === command.login) {
      // pause write streams to pause mocked ping then close the terminal
      term.pause().deinit();
      try {
        const answers = await inquirer.prompt([
          { name: 'username', message: 'Username:' },
          { name: 'password', type: 'password', message: 'Password:' }
        ]);
        term.console.log('Login:', answers);
      } catch (error) {
        term.console.error(error);
      } finally {
        // resume write streams and reinitialize the terminal
        term.resume().reinit();
      }
    }
    // basic logging
    else if (line.trim()) {
      term.console.log('Line:', line);
    }

    term.setPrompt(prompt.get(1));
    term.prompt(true);
  });
});

// setup sigint event (ctrl+c)
term.use(terminal => {
  term === terminal; // true
  term.rl.on('SIGINT', () => {
    // clear line or exit
    if (term.rl.line) {
      term.setLine('');
    } else {
      exit();
      process.exitCode = 130;
    }
  });
});

// setup time interval prompt
term.use(() => {
  // example only, not accurate time interval
  const interval = setInterval(() => {
    // only update prompt when active
    if (term.status.active()) {
      term.setPrompt(prompt.get());
    }
  }, 1000);
  // make sure to clear interval when closed
  return () => clearInterval(interval);
});

// use rl and console after .use() to make sure eveything is setup
term.setPrompt(prompt.get());
term.prompt();
term.console.log(
  'Enter %s to show list of commands. Enter %s or %s to quit.',
  chalk.bold(command.help),
  chalk.bold(command.exit),
  chalk.bold('Ctrl+C')
);

// exit ad :)
function ad() {
  // use default console
  console.log();
  console.log('Exited with code:', process.exitCode ?? 0);
  console.log(
    'Liked this example? Consider trying out %s.',
    chalk.bold('ternimal')
  );
  console.log();
  console.log('  %s', chalk.bold('npm install ternimal'));
  console.log();
  console.log(
    '%s: %s',
    chalk.bold('npm'),
    chalk.underline('https://www.npmjs.com/package/ternimal')
  );
  console.log(
    '%s: %s',
    chalk.bold('GitHub'),
    chalk.underline('https://github.com/Arnesfield/ternimal')
  );
}

// somehow handling sigint changes inquirer behavior
process.on('SIGINT', () => process.exit());
process.on('exit', ad);
