const { execSync } = require('child_process');

const commits = ['8106d6a', '5568a08', 'c4d9be2', '20fe42f', '42656cb', '8eab11d', '9473bca', 'd19488a', '4832eb5', '1a2b3c4'];

for (const c of commits) {
    try {
        const html = execSync(`git show ${c}:index.html`, { encoding: 'utf8' });
        const count = (html.match(/id="screen-catalog"/g) || []).length;
        console.log(`${c} - screen-catalog count: ${count}`);
    } catch (e) {
        console.log(`Could not get ${c}`);
    }
}
