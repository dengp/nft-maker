
const fs = require('fs');
const path = require('path');

function getDirectories(srcpath, filterDir = true){
  let result = fs.readdirSync(srcpath).map(file => path.join(srcpath, file)).filter(path => path.indexOf('.DS_Store') < 0);
  if (filterDir) {
    result = result.filter(path => fs.statSync(path).isDirectory() && path.indexOf('.DS_Store') < 0);
  }
  return result;
}

function getRandom(minNum, maxNum) {
  return parseInt(Math.random()*(maxNum - minNum + 1) + minNum, 10);
}

function getArrayRandom(arr) {
  const num = Math.random() * arr.length;
  console.log('sssss', num, arr.length)
  return arr[parseInt(num, 10)];
}

//权重随机
function getWeightRandom(weights) {
  var totalWeight = 0, i, random;
  for(i = 0; i < weights.length; i++) {
    totalWeight += weights[i];
  }
  random = Math.random() * totalWeight;
  for(i = 0; i < weights.length; i++) {
    if(random < weights[i]) return i;
    random -= weights[i];
  }
  return -1;
}

function mkdirsSync(dirname) {  
  // console.log(dirname);  
  if(fs.existsSync(dirname)) {  
      return true;  
  }else if(mkdirsSync(path.dirname(dirname))){  
    fs.mkdirSync(dirname);  
    return true;  
  }  
  return false;
}

function deleteFolder(dir) {
  var files = [];
  if(fs.existsSync(dir)) {
    files = fs.readdirSync(dir);
    files.forEach(function(file,index){
        var curDir = path.join(dir, file);
        if(fs.statSync(curDir).isDirectory()) { // recurse
            deleteFolder(curDir);
        } else { // delete file
            fs.unlinkSync(curDir);
        }
    });
    fs.rmdirSync(dir);
  }
}

module.exports.getDirectories = getDirectories;
module.exports.getRandom = getRandom;
module.exports.getArrayRandom = getArrayRandom;
module.exports.getWeightRandom = getWeightRandom;
module.exports.mkdirsSync = mkdirsSync;
module.exports.deleteFolder = deleteFolder;