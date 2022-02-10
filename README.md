#

## Description

This is a simple web browser game built with HTML, CSS and pure JavaScript. NodeJS and WebPack were only used for development purposes: compiling TypeScript and JSON files into a single JS file.

Game assets and maps can be modified. Current version in this repository serves as an example for testing most of the game mechanics and therefore does not have any specific storylines or balanced character, enemies and items stats.

## Launching

To run this game, you can either open index.html in the public folder or serve it through the server.

NB: _Running the game on localhost will probably cause favicon issues in some browsers (like Chrome) so it won't display._

## Editing

If you want to edit the game, whether you want to add more assets, change maps, or change the code, you will need to recompile the JS bundle.

**The next steps assume you have [NodeJS](https://nodejs.org/en/ 'NodeJS Download Page') installed.**

Type `npm i` in a terminal to instal _node_modules_ folder with libraries. This step is only necessary after you have cloned or downloaded the code.

Once you have made the changes you needed, type `npm run build` to build the JS bundle.

If you want to know where to drop new sprites, you can look at the file locations in this example.
