import { writeFileSync } from 'fs';
import os from 'os';
import { basename, join } from 'path';
import workerpool from 'workerpool';
import { getWeightRandom, getRandom, getDirectories, mkdirsSync, deleteFolder } from './lib/tools';
const pool = workerpool.pool(__dirname + '/worker/NFTWorker_tme.js');

const { inputConfig, weightConfig, indexToName, xlsxConfig } = require('./config/config_tme');
const { projectName, basePath, baseDir, decorationDir, part } = inputConfig;

const xlsx = require('node-xlsx');

Array.prototype.mySort = function() {
  return this.sort((a, b) => basename(a).split('.')[0] - basename(b).split('.')[0]);
}

//脚本配置命令参数
const hasWeight = +process.argv[2] || 0; //是否有权重
const hasTimes = +process.argv[3] || 0; //是否有出现次数限制
const workerNum = +process.argv[4] || os.cpus().length || 5; //开启多线程数量

const outputDir = 'output';
const targetDir = `${outputDir}/${projectName}`;
deleteFolder(targetDir);
mkdirsSync(targetDir);
;(async () => {
  for (let i = 0; i < part.length; i++) {
    const eleObj = part[i];
    const { path, times } = eleObj;
    await toMakeNft(join('./', basePath, projectName), path, times);
  }
})();

async function toMakeNft(path, otherPath, times) {
  return new Promise(async (resolve, reject) => {
    try {
      //互斥目录
      const data = {};
      baseDir.forEach(ele => {
        data[ele] = getDirectories(`${path}/${ele}`, false).mySort();
      });
      data.other = getDirectories(join(path, otherPath)).sort();
      // 配饰
      const data_other_data = {};
      const otherKeys = [];
      data.other.forEach((item) => {
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
      const ids = [];
  
      //生成采样数据
      while(curIndex < times) {
        const randomArr = baseDir.map((ele) => hasWeight ? getWeightRandom(weightConfig[ele]) : getRandom(0, data[ele].length - 1))
        let id = randomArr.join('_');
        let [a, b, c, d] = randomArr;
        const otherRandomArr = [];
        for (let key in data_other_data) {
          const random = hasWeight ? getWeightRandom(weightConfig[`${decorationDir}${otherIndex}`][key]) : getRandom(0, data_other_data[key].length - 1);
          otherRandomArr.push(random);
          id += `_${random}`;
        }
        // 防止重复
        if(dataResIds[id]) continue;
        // 稀有度次数控制
        if (hasTimes) {
          // 基础部件
          let baseFlag = false;
          for (let i = 0; i < baseDir.length; i++) {
            const key = baseDir[i];
            const ele = randomArr[i];
            const maxTimes = weightConfig[key][ele] * times;
            if (XY[key][ele] === Math.ceil(maxTimes)) {
              baseFlag = true;
              weightConfig[key].splice(ele, 1, 0);
              break;
            }
          }
          if (baseFlag) continue;
          // 配饰部件
          if (XY[decorationDir]) {
            let flag = false;
            for (let i = 0; i < otherRandomArr.length; i++) {
              const ele = otherRandomArr[i];
              const key = otherKeys[i];
              const maxTimes = weightConfig[`${decorationDir}${otherIndex}`][key][ele] * times;
              if(XY[decorationDir][`${key}${ele}`] === Math.ceil(maxTimes)) {
                flag = true;
                weightConfig[`${decorationDir}${otherIndex}`][key].splice(ele, 1, 0);
                break;
              }
            }
            if (flag) continue;
          }
        }
        ids.push(id);
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
        if(!XY[decorationDir]) XY[decorationDir] = {};
        otherRandomArr.forEach((ele, index) => {
          if(!XY[decorationDir][`${otherKeys[index]}${ele}`]) XY[decorationDir][`${otherKeys[index]}${ele}`] = 1;
          else XY[decorationDir][`${otherKeys[index]}${ele}`] += 1;
        })
        ++curIndex;
      }
      //生成NFT素材
      let runIndex = 0;
      let workerIndex = 0;
      const resultArr = Object.keys(dataResIds).map(item => item.split('_'));
      while(workerIndex < resultArr.length) {
        await Promise.all(resultArr.splice(0, workerNum).map(async (item, index) => await run(item, index + 1 + workerIndex * workerNum))); //多线程渲染
        workerIndex++;
      }
  
      //记录采样
      createDoc(times, XY, dataResIds, ids);
      
      // 结束线程
      pool.terminate(); 
      const time_e0 = Date.now();
      console.log(`${otherPath} end`, time_e0);
      console.log(`${otherPath} 生成总耗时：${(time_e0 - time_s) / 1000}秒`);
      console.log('');
      resolve();

      //执行入口
      async function run(item, index) {
        const [a, b, c, d, f, g, h] = item;
        const {hat, underwear, coat} = data_other_data;
        const id = item.join('_');
        console.log(`正在生成${id}.png`);
        await new Promise(resolve => {
          pool.exec('createNFT', ['base_yx', {
            path_bg: data['bg'][a],
            path_face: data['face'][b],
            path_glasses: data['glasses'][c],
            path_main: data['main'][d],
            path_other_hat: hat[g],
            path_other_underwear: underwear[h],
            path_other_coat: coat[f],
          }, `./${targetDir}/other${otherIndex}/nft/${projectName} #${index}.png`])
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
      function createDoc(total, XY, dataResIds, ids) {
        // console.log('XY', XY) 
        const { desc, title } = xlsxConfig;
        const xlsxData = [
          title
        ];  
        let index = 0;
        let itemNames = [];
        while(index < total) {
          index++;
          itemNames = ids[index - 1].split('_').map((el, i) => {
            const names = indexToName[i] || [];
            return names[el] || ''
          });
          xlsxData.push([`${index}`, `${projectName} #${index}`, desc, '1', ...itemNames])
        }      
        const buffer = xlsx.build([
          {
            name: `${projectName}-nftInfo`,
            data: xlsxData
          }
        ]);
        // xlsx
        writeFileSync(`./${targetDir}/other${otherIndex}/${projectName}-nftInfo.xlsx`, buffer, {'flag':'w'});
        // name json
        writeFileSync(`./${targetDir}/other${otherIndex}/${projectName}-names.json`, JSON.stringify(dataResIds));
        // 各部位出现次数json
        writeFileSync(`./${targetDir}/other${otherIndex}/${projectName}-times.json`, JSON.stringify(XY));
        const textArr = [];
        textArr.push(
          `【素材总数】：${total}`,
          `【bg特征】：`,
          `${data.bg.map((item, index) => `${index + 1}）${item.split('.')[0]}：${XY.bg[index]}`).join('\n')}`,
          `【脸部特征】：`,
          `${data.face.map((item, index) => `${index + 1}）${item.split('.')[0]}：${XY.face[index]}`).join('\n')}`,
          `【眼镜特征】：`,
          `${data.glasses.map((item, index) => `${index + 1}）${item.split('.')[0]}：${XY.glasses[index]}`).join('\n')}`,
          `【身体特征】：`,
          `${data.main.map((item, index) => `${index + 1}）${item.split('.')[0]}：${XY.main[index]}`).join('\n')}`,
          `【帽子特征】：`,
          `${data_other_data.hat.map((item, index) => `${index + 1}）${item.split('.')[0]}：${XY.other[`hat${index}`]}`).join('\n')}`,
          `【衣服特征】：`,
          `${data_other_data.underwear.map((item, index) => `${index + 1}）${item.split('.')[0]}：${XY.other[`underwear${index}`]}`).join('\n')}`,
          `【外套特征】：`,
          `${data_other_data.coat.map((item, index) => `${index + 1}）${item.split('.')[0]}：${XY.other[`coat${index}`]}`).join('\n')}`,
        );
        writeFileSync(`./${targetDir}/other${otherIndex}/${projectName}-times.txt`, textArr.join('\n'));
      }
    } catch(e) {
      console.log('nft-creator error', e);
      reject();
    }
  })
}