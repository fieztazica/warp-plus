import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { callCloudFlareApi } from './lib/call-api';

async function exec(referrer_id: string, debug = false) {
  try {
    if (referrer_id.length < 30) {
      console.error('Client ID is not valid');
      process.exit(1);
    }

    console.log(`Adding 1 GB to ${referrer_id}`);
    const res = await callCloudFlareApi(referrer_id);
    if (res.ok) {
      console.log(`Successfully added 1 GB to ${referrer_id}`);
    } else {
      console.log(`Failed to add 1 GB to ${referrer_id}`);
    }
  } catch (error) {
    if (debug) {
      console.error(error);
    }
    console.error(
      `Failed to add 1 GB to ${referrer_id}: ${
        (error as unknown as any).message
      }`
    );
  }
}

yargs(hideBin(process.argv))
  .scriptName('warp-plus')
  .alias('warp-plus', 'wp')
  .option('debug', {
    alias: 'd',
    description: 'Debug mode',
    type: 'boolean',
    default: false,
    global: true,
  })
  .command(
    'add <id>',
    'Add 1 GB to Client ID',
    (yargs) =>
      yargs.positional('id', {
        description: 'CloudFlare Warp Client ID',
        type: 'string',
      }),
    (argv) => exec(argv.id!, argv.debug)
  )
  .command(
    'run <id>',
    'Add 1 GB to Client ID',
    (yargs) =>
      yargs
        .positional('id', {
          description: 'CloudFlare Warp Client ID',
          type: 'string',
        })
        .option('interval', {
          alias: 'i',
          description: 'Interval in seconds',
          type: 'number',
          default: 20,
        })
        .option('loop', {
          alias: 'l',
          description: 'How many times to loop? (Negative number for infinite)',
          type: 'number',
          default: -1,
        }),
    async (argv) => {
      console.log(
        `[${argv.loop < 0 ? 'Non-stop' : `${argv.loop} times`}] Starting...`
      );
      const referrer_id = argv.id!;
      await exec(referrer_id, argv.debug);
      const times = argv.loop < 0 ? -1 : argv.loop;
      let count = 0;
      if (times === count) {
        console.log(`Done.`);
        return;
      }
      console.log(`Execution count: ${count + 1}`);
      const callInterval = setInterval(async () => {
        await exec(referrer_id);
        count++;
        if (count === times) {
          clearInterval(callInterval);
          console.log(`Done.`);
        } else {
          console.log(`Execution count: ${count + 1}`);
        }
      }, argv.interval * 1000);
    }
  )
  .fail((msg, err) => {
    if (err) {
      console.error(err);
    }
    console.error(msg);
  })
  .help()
  .alias('help', 'h')
  .showVersion(() => {
    return require('../package.json').version;
  })
  .alias('version', 'v')
  .demandCommand(1, 'You need to specify at least one command before moving on')
  .recommendCommands()
  .parse();
