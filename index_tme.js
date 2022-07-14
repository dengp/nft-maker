import { writeFileSync } from 'fs';
import os from 'os';
import { basename, join } from 'path';
import workerpool from 'workerpool';
import { getWeightRandom, getRandom, getDirectories, mkdirsSync, deleteFolder } from './lib/tools';
const pool = workerpool.pool(__dirname + '/worker/NFTWorker_tme.js');

const { inputConfig, weightConfig } = require('./config/config_tme');

const xlsx = require('node-xlsx');

Array.prototype.mySort = function() {
  return this.sort((a, b) => basename(a).split('.')[0] - basename(b).split('.')[0]);
}

//脚本配置命令参数
const workerNum = +process.argv[2] || os.cpus().length || 5; //开启多线程数量

const outputDir = 'output';
const targetDir = `${outputDir}/${inputConfig.projectName}`;
deleteFolder(targetDir);
mkdirsSync(targetDir);
;(async () => {
  for (let i = 0; i < inputConfig.part.length; i++) {
    const eleObj = inputConfig.part[i];
    const { path, times } = eleObj;
    await toMakeNft(join('./', inputConfig.basePath, path), times);
  }
})();

async function toMakeNft(otherPath, times) {
  return new Promise(async (resolve, reject) => {
    try {
      //互斥目录
      const data_bg = getDirectories(`./layers/${inputConfig.projectName}/bg`, false).mySort();
      const data_face = getDirectories(`./layers/${inputConfig.projectName}/face`, false).mySort();
      const data_glasses = getDirectories(`./layers/${inputConfig.projectName}/glasses`, false).mySort();
      const data_main = getDirectories(`./layers/${inputConfig.projectName}/main`, false).mySort();
      const data_other = getDirectories(otherPath).mySort();
      // 配饰
      const data_other_data = {};
      const otherKeys = [];
      data_other.forEach((item) => {
        const key = basename(item);
        otherKeys.push(key)
        data_other_data[key] = getDirectories(item, false).mySort();
      });

      const otherIndex = basename(otherPath);
      //计时器
      const time_s = Date.now();
      console.log(`${otherPath} start`, time_s);
  
      //特征纪录
      let XY = {
        bg: {},
        face: {},
        glasses: {},
        main: {},
      }
      let curIndex = 0;
      const dataResIds = {};
  
      //生成采样数据
      while(curIndex < times) {
        let a = getWeightRandom(weightConfig.bg, times);
        let b = getWeightRandom(weightConfig.face, times)
        let c = getWeightRandom(weightConfig.glasses, times);
        let d = getWeightRandom(weightConfig.main, times);
        let id = `${a}_${b}_${c}_${d}_${otherIndex}`;
        const otherRandomArr = [];
        for (let key in data_other_data) {
          const random = getWeightRandom(weightConfig[`other${otherIndex}`][key], times);
          otherRandomArr.push(random);
          id += `_${random}`;
        }
        // 防止重复
        if(dataResIds[id]) continue;
        // 稀有度次数控制
        if (XY.bg[a] >= weightConfig.bg[a] * times) continue;
        if (XY.face[b] >= weightConfig.face[b] * times) continue;
        if (XY.glasses[c] >= weightConfig.glasses[c] * times) continue;
        if (XY.main[d] >= weightConfig.main[d] * times) continue;
        if (XY['other']) {
          let flag = false;
          for (let i = 0; i < otherRandomArr.length; i++) {
            const ele = otherRandomArr[i];
            if(XY['other'][`${otherKeys[i]}${ele}`] >= weightConfig[`other${otherIndex}`][otherKeys[i]][ele] * times) {
              flag = true;
              break;
            }
          }
          if (flag) continue;
        }
        // 图片名
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
        if(!XY['other']) XY['other'] = {};
        otherRandomArr.forEach((ele, index) => {
          if(!XY['other'][`${otherKeys[index]}${ele}`]) XY['other'][`${otherKeys[index]}${ele}`] = 1;
          else XY['other'][`${otherKeys[index]}${ele}`] += 1;
        })
        ++curIndex;
      }
      //生成NFT素材
      let runIndex = 0;
      const resultArr = Object.keys(dataResIds).map(item => item.split('_'));
      while(resultArr.length) {
        await Promise.all(resultArr.splice(0, workerNum).map(async item => await run(item))); //多线程渲染
      }
  
      //记录采样
      createDoc(times, XY, dataResIds);
      
      // 结束线程
      pool.terminate(); 
      const time_e0 = Date.now();
      console.log(`${otherPath} end`, time_e0);
      console.log(`${otherPath} 生成总耗时：${(time_e0 - time_s) / 1000}秒`);
      console.log('');
      resolve();

      //执行入口
      async function run(item) {
        const [a, b, c, d, e, f, g, h] = item;
        const {hat, underwear, coat} = data_other_data;
        const id = item.join('_');
        console.log(`正在生成${id}.png`);
        await new Promise(resolve => {
          pool.exec('createNFT', ['base_yx', {
            path_bg: data_bg[a],
            path_face: data_face[b],
            path_glasses: data_glasses[c],
            path_main: data_main[d],
            path_other_hat: hat[g],
            path_other_underwear: underwear[h],
            path_other_coat: coat[f],
          }, `./${targetDir}/other${otherIndex}/nft/${id}.png`])
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
        writeFileSync(`./${targetDir}/other${otherIndex}/times.json`, JSON.stringify(XY));
        writeFileSync(`./${targetDir}/other${otherIndex}/names.json`, JSON.stringify(dataResIds));
        const textArr = [];
        textArr.push(
          `【素材总数】：${total}`,
          `【bg特征】：`,
          `${data_bg.map((item, index) => `${index + 1}）${item.split('.')[0]}：${XY.bg[index]}`).join('\n')}`,
          `【脸部特征】：`,
          `${data_face.map((item, index) => `${index + 1}）${item.split('.')[0]}：${XY.face[index]}`).join('\n')}`,
          `【眼镜特征】：`,
          `${data_glasses.map((item, index) => `${index + 1}）${item.split('.')[0]}：${XY.glasses[index]}`).join('\n')}`,
          `【身体特征】：`,
          `${data_main.map((item, index) => `${index + 1}）${item.split('.')[0]}：${XY.main[index]}`).join('\n')}`,
          `【帽子特征】：`,
          `${data_other_data.hat.map((item, index) => `${index + 1}）${item.split('.')[0]}：${XY.other[`hat${index}`]}`).join('\n')}`,
          `【衣服特征】：`,
          `${data_other_data.underwear.map((item, index) => `${index + 1}）${item.split('.')[0]}：${XY.other[`underwear${index}`]}`).join('\n')}`,
          `【外套特征】：`,
          `${data_other_data.coat.map((item, index) => `${index + 1}）${item.split('.')[0]}：${XY.other[`coat${index}`]}`).join('\n')}`,
        );
        writeFileSync(`./${targetDir}/other${otherIndex}/times.txt`, textArr.join('\n'));
      }
    } catch(e) {
      console.log('nft-creator error', e);
      reject();
    }
  })
}