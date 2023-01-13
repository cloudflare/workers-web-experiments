import inquirer from 'inquirer';
import { appNames, appsDetails } from './apps.config.mjs';
// import { spawnSync } from 'child_process';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

inquirer
  .prompt([
    {
        type: 'input',
        name: 'cfId',
        message: 'What is your Cloudflare account ID?',
    },
    {
        type: 'input',
        name: 'pagesPrefix',
        message: 'How do you want to prefix your pages applications?',
    },
  ])
  .then(({ cfId, pagesPrefix }) => {
    console.log(`The provided Cloudflare ID is: ${cfId}\n` +
        'and your pages applications will be named: \n' +
        appNames.map(camelCaseToKebabCase).map(
            name => `  - ${pagesPrefix}-${name}`
        ).join('\n'));
    inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirmation',
            message: 'Do you want to proceed?',
            default: true,
          },
    ]).then(async ({ confirmation }) => {
        console.log('\n');
        if(!confirmation) {
            console.log('Operation cancelled');
            return;
        }

        await updateAppsPackageJsons(cfId, pagesPrefix);
        console.log('Package.json files updated, you\'re ready to run `npm run deploy`!')
    })
  });

async function updateAppsPackageJsons(cfId, pagesPrefix) {

    for (const [camelAppName, appDetail] of Object.entries(appsDetails)) {
        const packageJsonPath = path.join(appDetail.path, 'package.json');
        const appName = camelCaseToKebabCase(camelAppName);
        const data = await readFile(packageJsonPath, 'utf8');
        const updatedData = data.replace(
            /"deploy": "CLOUDFLARE_ACCOUNT_ID=.* npx (.*) --project-name d1-todos-.*"/,
            `"deploy": "CLOUDFLARE_ACCOUNT_ID=${cfId} npx $1 --project-name ${pagesPrefix}-${appName}"`
        );
        await writeFile(packageJsonPath, updatedData, 'utf-8');
    }
}

function camelCaseToKebabCase(str) {
    return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}