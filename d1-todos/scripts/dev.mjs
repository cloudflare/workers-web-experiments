import inquirer from 'inquirer';
import { spawn } from 'child_process';
import openBrowser from 'open';

import { appNames, appsDetails } from './apps.config.mjs';

inquirer
  .prompt([
    {
      type: 'list',
      name: 'app',
      message: 'Which app do you want to start?',
      choices: appNames,
    },
    {
      type: 'confirm',
      name: 'open',
      message: 'Open a browser tab?',
      default: true,
    },
  ])
  .then(({ app, open }) => {
    const appDetails = appsDetails[app];
    const scriptName = appDetails.devScript;
    const directory = appDetails.path;
    spawn("npm", ["run", scriptName], {
      cwd: directory,
      stdio: "inherit",
    });
    if(open) {
      setTimeout(
        () => openBrowser(`http://localhost:${appDetails.port}/`),
        5000
      );
    }
  });