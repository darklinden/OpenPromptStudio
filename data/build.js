import csv from "csvtojson"
import fs from "fs"
import * as path from "path"
// import { fromNotion } from "./src/notion/fromNotion.js"
import localCommandDesc from "./src/localCommandDesc.js"

const __dirname = new URL(".", import.meta.url).pathname

let localPromptDefineMap = {}

// Add notion database https://www.notion.so/moonvy/5ac19c115d11488f95847c9e2d789dff?v=5ce9b783b4504c23bb7b492aa70c1cfc
let notionPromptDescMap = JSON.parse(fs.readFileSync(path.resolve(__dirname, "src/notion/notionPromptDescMap.json"), "utf-8"))
Object.assign(localPromptDefineMap, notionPromptDescMap)

// Add src/dict/*.csv
let pathLang = `${__dirname}src/dict`
for (let file of fs.readdirSync(pathLang, { withFileTypes: true })) {
    if (file.isFile() && file.name.toLowerCase().endsWith(".csv")) {
        let re = await csv().fromFile(`${pathLang}/${file.name}`)
        re.forEach((item) => addToMap(item))
        console.log(`Add src/dict/${file.name}`)
    }
}
console.log(`Add src/dict/*.csv`)

// src/localCommandDesc.js
localCommandDesc().forEach((item) => addToMap(item))
console.log(`Add src/localCommandDesc.js`)

// ------------------------------------

Object.values(localPromptDefineMap).forEach((item) => {
    if (item?.tags?.length == 0) delete item.tags
})

let jsonText = JSON.stringify(localPromptDefineMap, null, 1)
fs.writeFileSync(__dirname + "localPromptDefineMap.json", jsonText)
fs.writeFileSync(__dirname + "../web/public/localPromptDefineMap.json", jsonText)

let finSize = fs.statSync(__dirname + "/localPromptDefineMap.json").size
let itemsLength = Object.keys(localPromptDefineMap).length

console.log(`[generated] localPromptDescMap.json ( ${itemsLength} items | ${(finSize / 1024).toFixed(1)}KB )`)

// --------------------------

function addToMap(item) {
    const subTypeMap = {
        普通: "normal",
        风格: "style",
        质量: "quality",
        命令: "command",
        负面: "eg",
    }
    const subTypeDIRMap = {
        视角: { subType: "style", dir: "构图/视角" },
        镜头: { subType: "style", dir: "构图/镜头" },
        背景: { subType: "style", dir: "构图/背景" },
        画面: { subType: "style", dir: "构图/画面效果" },
        画面效果: { subType: "style", dir: "构图/画面效果" },
        背景建筑: { subType: "style", dir: "构图/背景建筑" },
        风格: { subType: "style", dir: "风格" },
        媒体: { subType: "style", dir: "媒体" },
        头发: { subType: "normal", dir: "容貌/头发" },
        颜色: { subType: "normal", dir: "容貌/颜色" },
        头部: { subType: "normal", dir: "容貌/头部" },
        姿势: { subType: "normal", dir: "姿势" },
        手: { subType: "normal", dir: "手" },
        腿: { subType: "normal", dir: "腿" },
        脸: { subType: "normal", dir: "脸" },
        眼: { subType: "normal", dir: "容貌/眼睛" },
        衣服: { subType: "normal", dir: "衣服" },
        裤子: { subType: "normal", dir: "裤子" },
        裙子: { subType: "normal", dir: "裙子" },
        袜子: { subType: "normal", dir: "袜子" },
        鞋子: { subType: "normal", dir: "鞋子" },
        手套: { subType: "normal", dir: "手套" },
        配饰: { subType: "normal", dir: "配饰" },
        胸部: { subType: "normal", dir: "胸部" },
        饰品: { subType: "normal", dir: "配饰" },
        二次元: { subType: "normal", dir: "二次元" },
        反向关键词: { subType: "eg", dir: "反向关键词" },
        NSFW: { subType: "normal", dir: "NSFW" },
    }
    // console.log("item", item)
    let key = item.text.toLowerCase()
    if (item.subType) {
        if (subTypeMap[item.subType])
            item.subType = subTypeMap[item.subType]
        else if (subTypeDIRMap[item.subType]) {
            const s = subTypeDIRMap[item.subType]
            item.subType = s.subType
            item.dir = s.dir
        }
        else {
            if (item.subType != "command") console.log("subType No Map", item.subType)
        }
    }

    if (localPromptDefineMap[key]) {
        Object.assign(localPromptDefineMap[key], item)
    } else {
        localPromptDefineMap[key] = item
    }
}
