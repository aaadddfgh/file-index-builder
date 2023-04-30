# File index builder
Build inverted index for local file. May help you build search system for static site.

## CLI
### example
``` 
npm install -g
build-index-cli build --path ./*.txt --excludePath ./abc.txt 
```
output file("fileIndex.json") may look like this("12ab" in aaa.txt)
``` json
{
    "1": [
        {
            "path": "aaa",
            "near": [
                "12ab"
            ]
        }
    ],
    "2": [
        {
            "path": "aaa",
            "near": [
                "2ab"
            ]
        }
    ],
    "a": [
        {
            "path": "aaa",
            "near": [
                "ab"
            ]
        }
    ],
    "b": [
        {
            "path": "aaa",
            "near": [
                "b"
            ]
        }
    ]
}
```
### usage
```
Usage: build-index-cli build [options] [string]

build index

Arguments:
  string                    out file name, delfult "fileIndex.json" (default: "fileIndex.json")

Options:
  -r, --root                root dir
  -o, --outDir              output dir
  -c, --confirm             need confirm before build
  -e, --excludePath <glob>  path excluded (default: [])
  -p, --path <glob>         path of file you want to build index. (default: [])
  -pr, --printFile          print file built index
  -h, --help                display help for command
```
## License
BSD-3-Clause