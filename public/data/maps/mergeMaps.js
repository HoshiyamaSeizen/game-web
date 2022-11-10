const fs = require('fs');
const path = require('path');

const maps = [];

const jsonsInDir = fs
	.readdirSync('./public/data/maps/')
	.filter((file) => path.extname(file) === '.json');

jsonsInDir.forEach((file) => {
	const map = JSON.parse(fs.readFileSync(path.join('./public/data/maps/', file)));
	map.name = file.slice(0, -5);
	maps.push(map);
});

fs.writeFileSync('./public/data/maps.json', JSON.stringify(maps, null, 0));
