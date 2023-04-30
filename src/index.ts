import * as fs from "fs";

import * as path from "path";

import { Glob } from 'glob';

export async function buildIndex(outFile: string,outDir:string,option:{excludePath:string,printFile:boolean,path:string[],root:string}) {
    const index: any = {};
    const fileList: Promise<unknown>[] = [];
    const root = path.join(path.resolve(option.root));
    //const fileEndWith = [".md"];
    //const excludePath = option.excludePath ||[]
    //fileList.forEach(e => readFile(e))

    // function readDirSync(readPath: string) {
    //     var pa = fs.readdirSync(readPath);
    //     pa.forEach(function (ele, index) {
    //         var info = fs.statSync(readPath + "/" + ele)
    //         if (info.isDirectory()) {
    //             for (const exclude of excludePath) {
    //                 if (ele === exclude) {
    //                     return
    //                 }
    //             }
    //             readDirSync(readPath + "/" + ele);

    //         } else {
    //             if (path.extname(ele) === ".md") {
    //                 fileList.push(readOneFileAndBuildIndex(path.resolve(readPath + "\\" + ele)))
    //                 option.printFile?
    //                 console.log("file: " + ele + " path: " + path.relative(root, readPath).replace("\\", '/')):null;
    //             }
    //             else {
    //                 option.printFile?
    //                 console.log("skip file: " + ele + " path: " + path.relative(root, readPath).replace("\\", '/')):null;
    //             }
    //         }
    //     })
    // }

    const g = new Glob(option.path,{"ignore":option.excludePath})
      // glob objects are async iterators, can also do globIterate() or
      // g.iterate(), same deal
      for await (const file of g) {
        readOneFileAndBuildIndex(path.resolve(root.concat("/",file)))
      }

    function readOneFileAndBuildIndex(filePath: string/*abs */) {
        //console.log(filePath);
        const FIND_DIFF = 8;
        return new Promise(() => {
            const strOfFile = fs.readFileSync(filePath, "utf-8");
            Array.from(strOfFile).forEach(
                (e, ind) => {
                    if (e.match(/\s/g)) {//被抛弃的匹配

                        return
                    }

                    index[e] = index[e] || [];
                    const ppp = path.relative(root, filePath).replaceAll("\\", '/').split(".")[0]
                    type result = {
                        path: string;
                        near: string[];
                        nearLast: Map<number, number>
                    }
                    if (!(index[e] as result[]).find(i => i.path === ppp)) {//初始化
                        (index[e] as result[]).push(
                            { "path": ppp, "near": [strOfFile.slice(ind, ind + FIND_DIFF)], "nearLast": new Map().set(0, ind + FIND_DIFF), }
                        );
                    }
                    else {
                        const inPath = index[e].find(i => i.path === ppp) as result;
                        // for (let str of inPath.near) {

                        //     // const findI=str.indexOf(strOfFile.slice(ind, ind + FIND_DIFF))
                        //     // if (findI !== -1) {
                        //     //     str=str.slice(0,findI).concat(strOfFile.slice(ind, ind + FIND_DIFF))
                        //     //     return;
                        //     // }
                        // }
                        if (ind <= inPath.nearLast.get((inPath.near.length - 1))) {//存在于之前找到的地方
                            const findI = ind + FIND_DIFF - inPath.nearLast.get(inPath.near.length - 1);
                            inPath.nearLast.delete(inPath.near.length - 1);//删除原有键

                            inPath.near[inPath.near.length - 1] = inPath.near[inPath.near.length - 1]
                                .slice(0, findI).concat(strOfFile.slice(ind, ind + FIND_DIFF));//更新存储文字
                            inPath.nearLast.set((inPath.near.length - 1), ind + FIND_DIFF)//更新map
                        }
                        else {
                            inPath.near.push(strOfFile.slice(ind, ind + FIND_DIFF))
                            inPath.nearLast.set((inPath.near.length - 1), ind + FIND_DIFF)
                        }
                    }
                }
            );
        })
    }


    //readDirSync(root)
    await fileList;

    for (const k in index) {
        index[k].forEach((_, i, arr) => { arr[i]["nearLast"] = undefined })
    }

    // console.log(index)

    fs.writeFileSync(path.resolve("") +outDir +outFile, JSON.stringify(index), { flag: "w", mode: 438, "encoding": "utf-8" })
}