
const workerpool = require('workerpool');
const { create, read } = require('jimp');
const config_tme = require('../config/config_tme');

//创建NFT
async function createNFT(config, nftParm, filePathSimple, waterMark) {
  const renderList = Object.keys(config_tme[config]).map(x => config_tme[config][x]).sort((a, b) => b.id - a.id);
  //创建一个空
  const baseImage = await create(2000, 2000);
  //身体部位渲染
  for(let i = 0; i < renderList.length; i++) {
    if(!renderList[i]) continue;
    const param = nftParm[renderList[i].route];
    const file = renderList[i].file;
    let listItem = await read(file ? `${param}/${file}` : param);
    baseImage.composite(listItem, renderList[i].x, renderList[i].y);
  }
  if(waterMark) {
    const waterMarkSmall =  await read(`./extra/watermark.png`);
    waterMarkSmall.resize(2000, 2000);
    baseImage.composite(waterMarkSmall, 0, 0);
  }
  await baseImage.writeAsync(filePathSimple)
}

workerpool.worker({
  createNFT: createNFT
});