// 入口配置
module.exports.inputConfig = {
  projectName: 'yx_xm',
  basePath: 'layers/yx_xm',
  width: 2000,
  height: 2000,
  part: [
    {
      path: 'other/0',
      times: 20
    },
    {
      path: 'other/1',
      times: 10
    }
  ]
}

// 稀有度配置
module.exports.weightConfig = {
  bg: [0.05, 0.05, 0.05, 0.05, 0.05, 0.5, 0.05, 0.05, 0.05, 0.05, 0.05],
  face: [0.1, 0.5, 0.2, 0.2],
  glasses: [0.2, 0.8],
  main: [1],
  other0: {
    hat: [0.5, 0.25, 0.25],
    underwear: [0.7, 0.3],
    coat: [1],
  },
  other1: {
    coat: [0.02, 0.03, 0.02, 0.02, 0.01, 0.03, 0.02, 0.05, 0.5, 0.3],
    hat: [0.1, 0.1, 0.1, 0.1, 0.1, 0.5],
    underwear: [0.1, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.5, 0.1],
  }
}

// 模型参数配置
module.exports.base_yx = {
  other_hat: {
    x: 0,
    y: 0,
    width: 2000,
    height: 2000,
    route: 'path_other_hat',
    id: 0
  },
  other_coat: {
    x: 0,
    y: 0,
    width: 2000,
    height: 2000,
    route: 'path_other_coat',
    id: 1
  },
  other_underwear: {
    x: 0,
    y: 0,
    width: 2000,
    height: 2000,
    route: 'path_other_underwear',
    id: 2
  },
  glasses: {
    x: 0,
    y: 0,
    width: 2000,
    height: 2000,
    route: 'path_glasses',
    id: 3
  },
  face: {
    x: 0,
    y: 0,
    width: 2000,
    height: 2000,
    route: 'path_face',
    id: 4
  },
  main: {
    x: 0,
    y: 0,
    width: 2000,
    height: 2000,
    route: 'path_main',
    id: 5
  },
  bg: {
    x: 0,
    y: 0,
    width: 2000,
    height: 2000,
    route: 'path_bg',
    id: 6
  },
}