import { Drawer } from './Drawer';
import { FieldBuilder } from './Builders/FieldBuilder';
import { Position } from './Positioning';

import { AssetStorage } from './Storage';

const canvas = <HTMLCanvasElement>document.getElementById('canvas');

let builder = new FieldBuilder();
let assets = new AssetStorage();
let drawer = new Drawer();

assets.readTilesheets();

let f = builder.getPresetMap('map1', assets);
f.log();

const resize = () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
};
resize();
window.addEventListener('resize', resize, false);

const step = (timestamp: number) => {
	drawer.clear();
	drawer.drawField(f);
	window.requestAnimationFrame(step);
};
window.requestAnimationFrame(step);
