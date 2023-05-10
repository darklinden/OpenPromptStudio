import request from "request";
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadRemote() {
    return new Promise((resolve, reject) => {
        request.get({
            url: 'http://tag.zoos.life/prod-api/prompt/tag/all',
            headers: {
                Host: 'tag.zoos.life',
                Refer: 'http://tag.zoos.life/',
                Accept: 'application/json, text/plain, */*',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36'
            }
        },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    resolve(JSON.parse(body));
                }
                else {
                    reject(error);
                }
            }
        );
    });
}

function deal_with_key(s) {
    s = s.replace(/\r\n/g, ',');
    s = s.replace(/\n/g, ',');
    s = s.replace(/，/g, ',');
    s = s.replace(/,,/g, ',');
    s = s.trim();
    while (s.startsWith(',')) s = s.substr(1);
    while (s.endsWith(',')) s = s.substr(0, s.length - 1);
    return s;
}

async function main() {

    const file_path = path.resolve(__dirname, 'stolen_keys.json');
    if (!fs.existsSync(file_path)) {
        console.log('stolen_keys.json not exists, download from remote.');
        const remote = await loadRemote();
        if (remote.data) {
            fs.writeFileSync(file_path, JSON.stringify(remote.data, null, 1));
        }
    }
    else {
        console.log('stolen_keys.json already exists, skip download.');
    }

    const stolen_keys = JSON.parse(fs.readFileSync(file_path, 'utf-8'));

    let content = '';
    let wtf = '';

    content += `"text","lang_zh","subType","dir"\n`;

    for (let i = 0; i < stolen_keys.length; i++) {
        const item = stolen_keys[i];

        const type_name = item.sub;
        const prompt = deal_with_key(item.tagName);
        const name = deal_with_key(item.description);

        // text,lang_zh,subType,dir

        // 默认超过 6 个字的，都是奇怪的东西 ...
        if (prompt.split(',').length > 6 || prompt.split(' ').length > 6) {
            wtf += `"${name}","${prompt}"\n`;
        }
        else {
            content += `"${prompt}","${name}",${type_name},\n`;
        }
    }

    fs.writeFileSync(path.resolve(__dirname, 'dict/stolen_keys.csv'), content);
    fs.writeFileSync(path.resolve(__dirname, 'stolen_keys_wtf.csv'), wtf);


};

main();

