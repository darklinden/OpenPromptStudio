<!-- Created on 2023/03/31 - 12:10 -->
<template>
    <div class="PromptDict">

        <div class="dict-search-bar" v-if="dict">
            <input v-model="searchText" type="text" placeholder="搜索" @paste="doSearchWithKeyword"
                @input="doSearchWithKeyword" @keydown.enter="doSearchWithKeyword" @change="doSearchWithKeyword"
                spellcheck="false" />
        </div>

        <div class="dict-search-list" v-if="searchDict && searchText.length">
            <div class="item" v-for="searchWord in searchDict">
                <PromptItem :item="searchWord" @click="doApplyWord(searchWord)" class="dict-word" />
            </div>
        </div>

        <div class="dir-buttons" v-if="dict && !searchText.length">
            <button v-for="dir in dict" :class="{ active: dir == activeDir }" @click="doChangeActiveDir(dir)">
                {{ dir.name }}
            </button>
        </div>

        <div class="active-dir" v-if="activeDir && !searchText.length">
            <details class="sub-dir" v-for="subDir in activeSubDirs" open :key="subDir.name">
                <summary class="name" v-show="subDir.name != activeDir.name">
                    <span class="title">{{ subDir.name }}</span>
                    <span class="len">{{ subDir.words.length }}</span>
                </summary>
                <div class="list">
                    <div class="item" v-for="word in subDir.words">
                        <PromptItem :item="word" @click="doApplyWord(word)" class="dict-word" />
                    </div>
                </div>
            </details>
        </div>
    </div>
</template>
<style lang="scss">
.PromptDict {
    padding: 0 20px;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .dir-buttons {
        display: flex;
        flex-wrap: wrap;
        margin: 0 4px;
        margin-bottom: 12px;
        padding: 0;
        border-radius: 4px;
        overflow: hidden;
        height: auto;
        flex: none;
        width: auto;
        background: #d5d7ef;

        button {
            background: #d5d7ef;
            color: #4545b2;
            border-radius: 0;
            flex: auto;
            min-width: 72px;
            white-space: nowrap;
            place-content: center;

            &.active {
                background: #4545b2;
                color: #d5d7ef;
                text-shadow: 0 1px 1px rgb(49 52 88);
            }
        }
    }

    .active-dir {
        height: auto;
        overflow-y: scroll;

        .sub-dir>.name {
            padding: 12px 0;
            font-size: 14px;
            font-weight: bold;
            color: #7e7e7e;
            text-shadow: 0 1px rgba(255, 255, 255, 0.4901960784);
            cursor: pointer;
            user-select: none;

            >.title {
                padding-left: 6px;
            }

            >.len {
                background: #e6e6e6;
                color: #7e7e7eb0;
                border-radius: 4px;
                padding: 1px 8px;
                margin-left: 4px;
                text-align: center;
                display: inline-flex;
                place-content: center;
                font-size: 12px;
                font-weight: normal;
                font-family: "JetBrains Mono";
            }

            &::marker {
                color: rgba(126, 126, 126, 0.5);
            }
        }

        .list {
            display: flex;
            flex-wrap: wrap;
        }

        &::-webkit-scrollbar {
            width: 12px;
            height: 12px;
            background-color: #aaa0;
        }

        &::-webkit-scrollbar-thumb {
            background: #838383;
            border-radius: 29px;
            border: 2px solid #e9e9e9;
        }
    }

    .dict-search-bar {

        width: auto;
        height: 40px;
        background: #ffffff00;
        padding: 10px;

        input {
            background: #e9e9e975;
            width: 96%;
        }
    }

    .dict-search-list {
        height: auto;
        overflow-y: scroll;
        display: flex;
        flex-wrap: wrap;
    }

    .notion-settings {
        .notion-me {
            position: absolute;
            right: 57px;
            top: 14px;
            font-size: 13px;
            z-index: 222;
            height: 32px;
        }

        .notion-config {
            opacity: 0;
            right: 54px;
            top: 11px;
            /* padding-top: 100px; */
            width: 420px;
            height: auto;
            background: #ffffff;
            position: absolute;
            z-index: 100;
            padding: 20px;
            padding-top: 49px;
            border-radius: 4px;
            box-shadow: -2px 0 64px rgba(6, 5, 73, 0.1215686275);
            transition: all 0.2s ease;
            pointer-events: none;

            .line:not(:last-child) {
                margin-bottom: 8px;
            }

            .help {
                color: #4b4894;
                position: absolute;
                top: 12px;
                display: flex;
                place-items: center;

                .iconify {
                    margin-right: 4px;
                }

                a {
                    font-weight: bold;
                }
            }

            a {
                font-size: 13px;
                color: #4b4894;
                text-decoration: none;

                &:hover {
                    color: #4545b2;
                    text-decoration: underline;
                }
            }

            label {
                display: inline-flex;
                font-size: 13px;
                color: #5a5a5a;
                width: 140px;
                place-content: flex-end;
                white-space: nowrap;
                margin-right: 12px;
            }

            input {
                background: #e9e9e975;
                width: auto;
                flex: auto;
            }

            .full {
                width: auto;
                flex: auto;
                place-content: center;
            }

            .line {
                display: flex;
                place-items: center;
                place-content: flex-start;
            }

            .line.checkbox {
                input {
                    flex: none;
                }
            }

            .desc {
                flex: auto;
                font-size: 13px;
                color: #c9c9c9;
                text-align: right;
            }

            .buttons {
                place-content: center;

                button.disabled {
                    pointer-events: none;
                    opacity: 0.5;
                }
            }
        }

        &.isHoverButton:hover .notion-config,
        .notion-config:hover {
            transition: all 0.2s ease;
            opacity: 1;
            pointer-events: auto;
        }
    }
}
</style>
<script>
import { getDictData } from "./getDictData"
import vPromptItem from "../../Compoents/PromptEditor/Components/PromptItem/PromptItem.vue"
import { useDatabaseServer } from "../PromptEditor/Lib/DatabaseServer/DatabaseServer"

export default {
    data() {
        return {
            dict: null,
            activeDir: null,
            loading: false,
            searchText: "",
            searchDict: null,
        }
    },
    created() {
        this.loadData()
        let databaseServer = useDatabaseServer()
        console.log("[PromptDict]", this, databaseServer)
    },
    methods: {

        loadData() {
            getDictData().then((dict) => {
                this.dict = dict
                this.activeDir = dict[0]
            })
        },

        doChangeActiveDir(dir) {
            this.activeDir = dir
        },

        async doApplyWord(item) {
            let activeInputEl = document.body.querySelector(".PromptWork.active")
            if (!activeInputEl) activeInputEl = document.body.querySelector(".PromptWork")
            // console.log("activeInputEl", activeInputEl)

            if (activeInputEl) {
                let insertText = item.data.word.rawText ?? item.data.word.text
                let vueIns = activeInputEl.__vue__
                await vueIns.promptWork.reflowPrompts(insertText)
                vueIns.doExportPrompt()
            }
        },

        recursiveSearch(searchText, searchDict, subDict) {
            for (let i = 0; i < subDict.length; i++) {
                const item = subDict[i];

                if (item?.children?.length) {
                    this.recursiveSearch(searchText, searchDict, item.children)
                }

                if (item?.words?.length) {
                    for (let j = 0; j < item.words.length; j++) {
                        const w = item.words[j];
                        // console.log(w)

                        const d = w?.data?.word;
                        if (!d) console.error(w)
                        else {
                            if (d.langText?.includes(this.searchText)
                                || d.rawText?.includes(this.searchText)
                                || d.text?.includes(this.searchText)
                            ) {
                                this.searchDict.push(w)
                            }
                        }
                    }
                }
            }
        },

        doSearchWithKeyword() {
            console.log("doSearchWithKeyword", this.searchText, this.dict)
            this.searchDict = Object.values({});

            this.recursiveSearch(this.searchText, this.searchDict, this.dict)
            console.log("searchDict", this.searchDict)
        },
    },

    components: { PromptItem: vPromptItem },

    computed: {
        activeSubDirs() {
            if (this.activeDir) {
                return [this.activeDir, ...this.activeDir.children]
            }
        },
    },
}
</script>
