import inquirer from 'inquirer';
import { spawnSync } from 'child_process';

import { appNames, appsDetails } from './apps.config.mjs';

inquirer
  .prompt([
    {
      type: 'list',
      name: 'app',
      message: 'Which app do you want to deploy?',
      choices: [...appNames, new inquirer.Separator(), 'all', new inquirer.Separator(),],
    },
  ])
  .then(({ app }) => {
    if ( app !== 'all' ) {
      deployApp(appsDetails[app]);
    } else {
      appNames.forEach(app => {
        const appMessage = `========    Deploying ${app}    ========`;
        const decoration = new Array(appMessage.length).fill('=').join('');

        console.log(`\x1b[36m\x1b[44m ${decoration} \x1b[0m`);
        console.log(`\x1b[36m\x1b[44m ${appMessage} \x1b[0m`);
        console.log(`\x1b[36m\x1b[44m ${decoration} \x1b[0m`);

        deployApp(appsDetails[app]);

        console.log('\n\n\n\n\n');
      });
    }
  });

function deployApp(appDetails) {
  const scriptName = appDetails.deployScript;
  const directory = appDetails.path;
  spawnSync("npm", ["run", scriptName], {
    cwd: directory,
    stdio: "inherit",
  });
}