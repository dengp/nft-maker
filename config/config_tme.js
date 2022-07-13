//模型参数配置
module.exports.base = {
  prop_glasses: {
    x: 0,
    y: 0,
    width: 700,
    height: 530,
    route: 'path_prop_glasses',
    file: 'glasses.png',
    id: 0
  },
  frontprop: {
    x: 0,
    y: 0,
    width: 750,
    height: 1068,
    route: 'path_frontprop',
    file: 'frontprop.png',
    id: 1
  },
  front_hair: {
    x: 0,
    y: 0,
    width: 700,
    height: 530,
    route: 'path_hair',
    file: 'front_hair.png',
    id: 2
  },
  top: {
    x: 0,
    y: 284,
    width: 700,
    height: 600,
    route: 'path_top',
    file: 'top.png',
    id: 3
  },
  pants: {
    x: 0,
    y: 428,
    width: 700,
    height: 600,
    route: 'path_bottom',
    file: 'pants.png',
    id: 4
  },
  shoes: {
    x: 0,
    y: 628,
    width: 700,
    height: 440,
    route: 'path_shoe',
    file: 'shoes.png',
    id: 5
  },
  body: {
    x: 0,
    y: 0,
    width: 700,
    height: 1068,
    route: 'path_body',
    file: 'body.png',
    id: 6
  },
  back_hair: {
    x: 0,
    y: 0,
    width: 700,
    height: 530,
    route: 'path_hair',
    file: 'back_hair.png',
    id: 7
  },
  backprop: {
    x: 0,
    y: 184,
    width: 700,
    height: 700,
    route: 'path_backprop',
    file: 'backprop.png',
    id: 8
  }
}

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
  "背景": {
    x: 0,
    y: 0,
    width: 2000,
    height: 2000,
    route: 'path_bg',
    id: 6
  },
}


//稀有度配置
module.exports.weightConfig = {
  backprop: [5, 5, 5, 5, 80]
}