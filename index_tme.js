import { writeFileSync } from 'fs';
import os from 'os';
import { basename } from 'path';
import workerpool from 'workerpool';
import { getRandom, getDirectories, mkdirsSync, deleteFolder } from './lib/tools';
const pool = workerpool.pool(__dirname + '/worker/NFTWorker_tme.js');

Array.prototype.mySort = function() {
  return this.sort((a, b) => basename(a).localeCompare(basename(b)));
}

//脚本配置命令参数
const total = +process.argv[2] || 500; //生成NFT总量
const projectName = process.argv[3] || 'yx_xm'; //项目名字
const waterMark = +process.argv[4] || 0; //是否加测试水印
const workerNum = +process.argv[5] || os.cpus().length || 5; //开启多线程数量

const outputDir = 'output';
const targetDir = `${outputDir}/${projectName}`;
deleteFolder(targetDir);
mkdirsSync(targetDir);
;(async () => {
  try {
    //互斥目录
    const data_bg = getDirectories(`./layers/${projectName}/背景`, false).mySort();
    const data_face = getDirectories(`./layers/${projectName}/face`, false).mySort();
    const data_glasses = getDirectories(`./layers/${projectName}/glasses`, false).mySort();
    const data_main = getDirectories(`./layers/${projectName}/main`, false).mySort();
    const data_other = getDirectories(`./layers/${projectName}/other`).mySort();
    // 配饰（帽子 衣服 外套）
    const data_other_data = [];
    data_other.forEach((item) => {
      const {data_other_hat, data_other_underwear, data_other_coat} = getOtherFiles(item);
      data_other_data.push({
        data_other_hat,
        data_other_underwear,
        data_other_coat
      })
    });

    //计时器
    const time_s = Date.now();
    console.log('start', time_s);

    //特征纪录
    let XY = {
      bg: {},
      face: {},
      glasses: {},
      main: {},
      other: {},
    }
    let curIndex = 0;
    const dataResIds = {};

    //生成采样数据
    while(curIndex < total) {
      let a = getRandom(0, data_bg.length - 1);
      let b = getRandom(0, data_face.length - 1);
      let c = getRandom(0, data_glasses.length - 1); 
      let d = getRandom(0, data_main.length - 1); 
      let e = getRandom(0, data_other.length - 1); 
      const {data_other_hat, data_other_underwear, data_other_coat} = data_other_data[e];
      let f = getRandom(0, data_other_hat.length - 1); 
      let g = getRandom(0, data_other_underwear.length - 1); 
      let h = getRandom(0, data_other_coat.length - 1);
      const id = `${a}_${b}_${c}_${d}_${e}_${f}_${g}_${h}`;
      // 防止重复
      if(dataResIds[id]) continue;
      // 稀有度控制
      if (data_bg[a] === 'layers/yx_xm/背景/圆形.png' && XY.bg[a] >= 1) continue;
      
      dataResIds[id] = true;
      //特征数量纪录
      if(!XY.bg[a]) XY.bg[a] = 1;
      else XY.bg[a] += 1;
      if(!XY.face[b]) XY.face[b] = 1;
      else XY.face[b] += 1;
      if(!XY.glasses[c]) XY.glasses[c] = 1;
      else XY.glasses[c] += 1;
      if(!XY.main[d]) XY.main[d] = 1;
      else XY.main[d] += 1;
      if(!XY.other[e]) XY.other[e] = { times: 1 };
      else XY.other[e]['times'] += 1;
      if(!XY.other[e][`hat${f}`]) XY.other[e][`hat${f}`] = 1;
      else XY.other[e][`hat${f}`] += 1;
      if(!XY.other[e][`underwear${g}`]) XY.other[e][`underwear${g}`] = 1;
      else XY.other[e][`underwear${g}`] += 1;
      if(!XY.other[e][`coat${h}`]) XY.other[e][`coat${h}`] = 1;
      else XY.other[e][`coat${h}`] += 1;
      ++curIndex;
    }

    //生成NFT素材
    let runIndex = 0;
    const resultArr = Object.keys(dataResIds).map(item => item.split('_'));
    while(resultArr.length) {
      await Promise.all(resultArr.splice(0, workerNum).map(async item => await run(item))); //多线程渲染
    }

    //记录采样
    createDoc(total, XY, dataResIds);
    
    pool.terminate(); 
    const time_e0 = Date.now();
    console.log('end', time_e0);
    console.log(`生成总耗时：${(time_e0 - time_s) / 1000}秒`);
    //执行入口
    async function run(item) {
      const [a, b, c, d, e, f, g, h] = item;
      const {data_other_hat, data_other_underwear, data_other_coat} = data_other_data[e];
      const id = item.join('_');
      console.log(`正在生成${id}.png`);
      await new Promise(resolve => {
        pool.exec('createNFT', ['base_yx', {
          path_bg: data_bg[a],
          path_face: data_face[b],
          path_glasses: data_glasses[c],
          path_main: data_main[d],
          path_other_hat: data_other_hat[f],
          path_other_underwear: data_other_underwear[g],
          path_other_coat: data_other_coat[h],
        }, `./${targetDir}/${id}.png`, waterMark])
        .then(function (result) {
          ++runIndex;
          console.log(`渲染${id}.png完毕...`, runIndex);
          resolve();
        })
        .catch(function (err) {
          console.log('NFT 生成错误：', err);
          resolve();
        });
      });
    }

    //生成文档
    function createDoc(total, XY, dataResIds) {
      // console.log('XY', XY)
      writeFileSync(`./${outputDir}/${projectName}.json`, JSON.stringify(XY));
      writeFileSync(`./${outputDir}/${projectName}-data.json`, JSON.stringify(dataResIds));
      const textArr = [];
      textArr.push(
        `【素材总数】：${total}`,
        `【背景特征】：`,
        `${data_bg.map((item, index) => `${index + 1}）${item.split('.')[0]}：${XY.bg[index]}`).join('\n')}`,
        `【脸部特征】：`,
        `${data_face.map((item, index) => `${index + 1}）${item.split('.')[0]}：${XY.face[index]}`).join('\n')}`,
        `【眼镜特征】：`,
        `${data_glasses.map((item, index) => `${index + 1}）${item.split('.')[0]}：${XY.glasses[index]}`).join('\n')}`,
        `【身体特征】：`,
        `${data_main.map((item, index) => `${index + 1}）${item.split('.')[0]}：${XY.main[index]}`).join('\n')}`,
        `【配饰特征】：`,
        `${data_other.map((item, index) => `${index + 1}）${item.split('.')[0]}：${XY.other[index] ? XY.other[index].times : 0}\n\t[帽子特征]：\n\t\t${data_other_data[index].data_other_hat.map((ele, j) => `(${j}) ${ele.split('.')[0]}：${XY.other[index][`hat${j}`]}`).join('\n\t\t')}\n\t[衣服特征]：\n\t\t${data_other_data[index].data_other_underwear.map((ele, j) => `(${j}) ${ele.split('.')[0]}：${XY.other[index][`underwear${j}`]}`).join('\n\t\t')}\n\t[外套特征]：\n\t\t${data_other_data[index].data_other_coat.map((ele, j) => `(${j}) ${ele.split('.')[0]}：${XY.other[index][`coat${j}`]}`).join('\n\t\t')}`).join('\n')}`,
      );
      writeFileSync(`./${outputDir}/${projectName}.txt`, textArr.join('\n'));
    }

    // 获取配饰path
    function getOtherFiles(path) {
      const data_other_hat = getDirectories(`./${path}/hat`, false).mySort();
      const data_other_underwear = getDirectories(`./${path}/underwear`, false).mySort();
      const data_other_coat = getDirectories(`./${path}/coat`, false).mySort();
      return {
        data_other_hat,
        data_other_underwear,
        data_other_coat
      }
    }
  } catch(e) {
    console.log('nft-creator error', e);
  }
})();