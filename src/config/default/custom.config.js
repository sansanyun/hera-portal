const map = {
  'active-bg-color': ['#BDBDBD', '#2C2E2F'],
  'hover-bg-color': ['#D9D9D9', '#353739'],

  'editor-border-color': ['#D1D1D1', '#323232'],
  'editor-bg-color': ['#F2F2F2', '#3C3F41'],
  // 灰色
  'editor-tree-icon1-color': ['#AFB9C0', '#88939A'],
  // 蓝色
  'editor-tree-icon2-color': ['#91D3EE', '#4586A2'],
  // 灰色选中
  'editor-tree-icon3-color': ['#859DB4', '#859AB6'],
  // 蓝色选中
  'editor-tree-icon4-color': ['#4EB6E3', '#4396DA'],
  // 选中
  'editor-tree-active-color': ['#2F76C2', '#3467CE'],
  'editor-tree-hover-color': ['#D5D5D5', '#10293F'],
  'editor-tree-title-color': ['#0F0F0F', '#BBBBBB'],
  'editor-button-hover-color': ['#DFDFDF', '#4C5052']
}

function getRes() {
  const res = { light: [], night: [] }
  Object.keys(map).forEach(key => {
    const arr = map[key]
    res.light.push(arr[0])
    res.night.push(arr[1])
  })
  return res
}

module.exports = getRes()

// custom.config.js ==> custom.less
// '(.+?)': \['(.+?)', '(.+')\],? ==> @$1: $2; //$3