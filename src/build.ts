// BSD 3-Clause License
//
// Copyright (c) 2023, aaadddfgh (https://github.com/aaadddfgh)
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this
//    list of conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its
//    contributors may be used to endorse or promote products derived from
//    this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
// FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
// DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
// OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

import { Command } from 'commander';


import { buildIndex } from "./index.js";

import * as readline from "readline";
import { Glob, glob } from 'glob';

const program = new Command();
program
  .name('build-index-cli')
  .description('CLI to build JSON format file full-text index')

program.command('build')
  .description('build index')
  .argument('[string]', 'out file name, delfult \"fileIndex.json\"', "fileIndex.json")
  .option('-r, --root',"root dir","./")
  .option('-o, --outDir', 'output dir', "/")
  .option('-c, --confirm', 'need confirm before build')
  .option("-e, --excludePath <glob>", 'path excluded', (value, previous: any) => {
    return previous.concat([value]);
  }, [])
  .option("-p, --path <glob>", "path of file you want to build index.", (value, previous: any) => {
    return previous.concat([value]);
  }, [])
  .option("-pr, --printFile", 'print file built index')
  .action(async (str, options) => {

    if (options.path.length == 0) {
      console.error("no path")
      return;
    }
    if (options.confirm) {
      const g = new Glob(options.path, { "ignore": options.excludePath })
      // glob objects are async iterators, can also do globIterate() or
      // g.iterate(), same deal
      for await (const file of g) {
        console.log(file)
      }

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      rl.question("Y/N ? ", function (char) {
        if (char === 'Y' || char === 'y') {
          buildIndex(str, options.outDir, options /*"excludePath":options.excludePath,"printFile": options.printFile*/);
          rl.close()
        }
        else {
          console.log("Not confirm")
          rl.close();
          process.exit(1)
        }
      });
    }
    else
      buildIndex(str, options.outDir, options /*"excludePath":options.excludePath,"printFile": options.printFile*/);
    
  });;

program.parse()