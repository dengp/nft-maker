const width = 2000; 
const height = 2000;


// 入口配置
module.exports.inputConfig = {
  projectName: 'gogopand',
  basePath: './layers',
  baseDir: ['bg', 'face', 'glasses', 'main'],
  decorationDir: 'other',
  width,
  height,
  part: [
    {
      path: 'other/0',
      times: 39
    }
  ]
}

// 稀有度配置
module.exports.weightConfig = {
  bg: [0.05, 0.05, 0.05, 0.05, 0.05, 0.5, 0.05, 0.05, 0.05, 0.05, 0.05],
  face: [0.7, 0.3],
  glasses: [0.2, 0.8],
  main: [1],
  other0: {
    coat: [0.3, 0.7],
    hat: [0.4, 0.6],
    underwear: [0.3, 0.2, 0.5],
  }
}

module.exports.xlsxConfig = {
  desc: 'pandaman永不为奴',
  title: ['序号', '名称', '描述', '发行量', '背景', '表情', '眼镜', '身体', '外套', '头饰', '内衫']
}

// 索引名称映射
module.exports.indexToName = [
  ['背景-0', '背景-1', '背景-2', '背景-3', '背景-4', '背景-5', '背景-6', '背景-7', '背景-8', '背景-9', '背景-10'],
  ['表情-默认', '表情-调皮'],
  ['眼镜-墨镜', '眼镜-平光镜'],
  ['身体-0'],
  ['外套-帽衫', '外套-西服'],
  ['头饰-耳机', '头饰-鸭舌帽'],
  ['内衫-领带衬衣款', '内衫-卫衣竹叶款', '内衫-字母款']
]

// 模型参数配置
module.exports.base_yx = {
  other_hat: {
    x: 0,
    y: 0,
    width,
    height,
    route: 'path_other_hat',
    id: 0
  },
  other_coat: {
    x: 0,
    y: 0,
    width,
    height,
    route: 'path_other_coat',
    id: 1
  },
  other_underwear: {
    x: 0,
    y: 0,
    width,
    height,
    route: 'path_other_underwear',
    id: 2
  },
  glasses: {
    x: 0,
    y: 0,
    width,
    height,
    route: 'path_glasses',
    id: 3
  },
  face: {
    x: 0,
    y: 0,
    width,
    height,
    route: 'path_face',
    id: 4
  },
  main: {
    x: 0,
    y: 0,
    width,
    height,
    route: 'path_main',
    id: 5
  },
  bg: {
    x: 0,
    y: 0,
    width,
    height,
    route: 'path_bg',
    id: 6
  },
}