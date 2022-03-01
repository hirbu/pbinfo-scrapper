# pbinfo-scrapper

Scrapper to download all your solutions out of [pbinfo.ro](https://www.pbinfo.ro/).

#### How to run 
1. Git clone this repo, run `npm i` to install dependencies.
2. Input your pbinfo's username and password on line `27`, respectively `28` in the `index.js` file.
3. Make `cli.sh` executable by running `chmod 777 cli.sh`.
4. Be patient! pbinfo's DNS is weird AF. It will randomly close the connection, that's the issue that `cli.sh` solves: restarts the app and tries again with a random assortment of files. The execution will likely take a few hours: I left it running overnight for my 500+ problems, finished in about 4-5 hours.
5. Profit: you now have a `solutions` folder ready for you to use!
