import axios from "@/utils/request.js";
export default {
  namespaced: true,
  state: {
    configs: {
      tabs: {
        left: [{
          name: 'debug',
          label: '任务调试',
          icon: 'code'
        }, {
          name: 'myJob',
          label: '我的任务',
          icon: 'my',
        },
        {
          name: 'allJob',
          label: '全部任务',
          icon: 'all'
        }],
        right: [{
          name: 'B',
          label: '基本信息',
          icon: 'info'
        },
        {
          name: 'dependency',
          label: "任务依赖",
          icon: 'dependency'
        },
        {
          name: 'A',
          label: '任务配置',
          icon: 'config'
        },
        {
          name: 'C',
          label: '告警配置',
          icon: 'alarm'
        }],
        bottom: [{
          name: 'B',
          label: '运行日志',
          icon: 'runlog'
        },
        {
          name: 'A',
          label: '操作记录',
          icon: 'oplog'
        }]
      },
      editorBottomTabs: [{
        name: 'text',
        label: '文本',
      }, {
        name: 'config',
        label: '配置项'
      }]
    },
    treeCaches: {
      debug: { expandedKeys: [], selectedKeys: [], selectedTabs: [] },
      allJob: { expandedKeys: [], selectedKeys: [], selectedTabs: [] },
      myJob: { expandedKeys: [], selectedKeys: [], selectedTabs: [] }
    },
    layoutConfig: {
      tab: {
        configs: { left: [], right: [], bottom: [] },
        actives: { left: null, right: null, bottom: null },
      },
      leftTab: '',
      jobTabKeys: {
        debug: '',
        allJob: '',
        myJob: ''
      },
      onlyCenter: false,
      editorBottom: 'text'
    },
    jobTrees: {
      debug: [],
      allJob: [],
      myJob: []
    },
    jobList: []
  },
  getters: {
    tabs: state => state.configs.tabs,
    tab: state => state.layoutConfig.tab,
    tabConfgs: (state, getters) => getters.tab.configs,
    tabActive: (state, getters) => type => getters.tabConfgs[type].find(i => i.name === getters.tab.actives[type]),

    treeCache: (state) => state.treeCaches[state.layoutConfig.leftTab],

    flatAllTreeNodes: (state) => type => {
      const jobsTree = state.jobTrees[type]
      const res = []
      if (jobsTree) {
        flatNodes(jobsTree, res)
      }
      return res
    },
    flatJobsTrees: (state, getters) => type => getters.flatAllTreeNodes(type).filter(i => !i.dic),
    // {
    // const jobsTree = state.jobTrees[type]
    // const res = []
    // if (jobsTree) {
    //   flatNodes(jobsTree, res)
    // }
    // return res.filter(i => !i.dic)
    // },
    flatJobsTree: (state, getters) => getters.flatJobsTrees(state.layoutConfig.leftTab),
    // 用于展示tab
    selectedJobNodes: (state, getters) => getters.treeCache?.selectedTabs.map(i => getters.flatJobsTree.find(j => j.key === i)),
    selectedJobNode: (state, getters) => getters.selectedJobNodes.find(i => i?.key === getters.selectedJobNodeKey),
    selectedJobNodeKey: state => state.layoutConfig.jobTabKeys[state.layoutConfig.leftTab],


    editorBottomTabs: state => state.configs.editorBottomTabs
  },
  mutations: {
    toggleOnlyCenter(state) {
      state.layoutConfig.onlyCenter = !state.layoutConfig.onlyCenter
      this.commit('develop/saveLocalLayout')
    },
    setEditorBottom(state, name) {
      state.layoutConfig.editorBottom = name
    },
    updateSelectedjobNodeKey(state, key) {
      state.layoutConfig.jobTabKeys[state.layoutConfig.leftTab] = key
    },
    saveLocalLayout(state) {
      console.log('save layout')
      setLocal(STORAGE_KEY_LAYOUT_INFO, state.layoutConfig)
    },
    saveTreeCache(state) {
      console.log('save treeCaches')
      setLocal(STORAGE_KEY_TREE_INFO, state.treeCaches)
    },
  },
  actions: {
    initLocalInfo({ state, getters, dispatch }) {
      initLocal(STORAGE_KEY_LAYOUT_INFO, info => {
        state.layoutConfig = info
      })
      initLocal(STORAGE_KEY_TREE_INFO, info => {
        state.treeCaches = info
      })
      // 初始化打开的任务
      const id = getters.selectedJobNodeKey?.split('_')[1]
      if (id) {
        dispatch('getJob', { id })
      }

    },
    initJobs({ state }) {
      return axios.post("/scheduleCenter/init.do", {})
        .then((data) => {
          const allJob = [getTreeData(data.allJob)]
          const myJob = [getTreeData(data.myJob)]
          state.jobTrees.allJob = allJob
          state.jobTrees.myJob = myJob

          const jobTrees = state.jobTrees
          const treeCaches = state.treeCaches
          setTreeCache(treeCaches, jobTrees, 'allJob')
          setTreeCache(treeCaches, jobTrees, 'myJob')
        });
    },
    getScheduleJobs() {

    },
    getDevelopJobs() {

    },
    setTab({ state, getters, commit, dispatch }, { name, type }) {
      if (type == 'left') {
        state.layoutConfig.leftTab = name
        dispatch('getJob', { id: getters.selectedJobNode?.id, check: true })
      }
      const tab = state.layoutConfig.tab
      const tabConfigs = tab.configs[type]
      let config = tabConfigs.find(i => i.name === name)
      if (!config) {
        config = { name, width: { right: 28, left: 20, bottom: 20 }[type] }
        tabConfigs.push(config)
      }
      const onlyCenter = state.layoutConfig.onlyCenter

      const activeTabName = tab.actives[type]
      const isClose = !onlyCenter && activeTabName != null && activeTabName === name
      tab.actives[type] = isClose ? null : name
      if (onlyCenter) {
        commit('toggleOnlyCenter')
      }
      commit('saveLocalLayout')
    },
    setTabResize({ getters, commit }, { width, type }) {
      getters.tabActive(type).width = width
      commit('saveLocalLayout')
    },
    expanedTreeNode({ getters, commit }, keys) {
      getters.treeCache.expandedKeys = keys
      commit('saveTreeCache')
    },
    selectTreeNode({ getters, commit, dispatch }, { key, selected, dic, id }) {
      console.log('selectNode', key)
      if (dic) {
        return
      }
      commit('updateSelectedjobNodeKey', key)
      const treeCache = getters.treeCache
      treeCache.selectedKeys = [key]
      if (selected) {
        return
      }
      if (!treeCache.selectedTabs.includes(key)) {
        treeCache.selectedTabs.push(key)
      }
      commit('saveTreeCache')
      commit('saveLocalLayout')
      dispatch('getJob', { id })
    },
    changeSelectedTab({ getters, commit, dispatch }, { key, id }) {
      if (key && getters.treeCache.selectedTabs.includes(key)) {
        console.log('changeTab', key)
        commit('updateSelectedjobNodeKey', key)
        commit('saveLocalLayout')
        return dispatch('getJob', { id, check: true }).then(() => {
          getters.treeCache.selectedKeys = [key]
          commit('saveTreeCache')
        })
      }
    },
    closeSelectedTab({ getters, commit, dispatch }, key) {
      const tabs = getters.treeCache.selectedTabs
      let index = tabs.findIndex(i => i === key)
      if (index !== -1) {
        tabs.splice(index, 1)
        if (getters.selectedJobNodeKey === key) {
          index = index < tabs.length ? index : index - 1;
          const lastKey = tabs[index];
          const lastNode = getters.selectedJobNodes.find(i => i.key === lastKey)
          if (lastNode) {
            dispatch('changeSelectedTab', { key: lastKey, id: lastNode.id })
          } else {
            getters.treeCache.selectedKeys = []
            commit('updateSelectedjobNodeKey', null)
            commit('saveTreeCache')
            commit('saveLocalLayout')
          }
        } else {
          commit('saveTreeCache')
        }
      }
    },
    getJob({ state, getters }, { id, check }) {
      if (!id) {
        return new Promise((resolve) => { resolve() })
      }
      if (check) {
        if (state.jobList.findIndex(i => i.id === id) !== -1) {
          return new Promise((resolve) => { resolve() })
        }
      }
      return axios.get(`/scheduleCenter/getJobMessage.do?jobId=${id}`).then(data => {
        // 处理一下后端null。。
        data.script = data.script == null ? '' : data.script
        const job = state.jobList.find(i => i.id === id)
        if (job !== null) {
          state.jobList.push(data)
          leftTabs.forEach(type => {
            const node = getters.flatJobsTrees(type).find(i => i.id === data.id);
            if (node) {
              node.origin = { ...data }
            }
          })
        } else {
          Object.assign(job, data)
        }
      })
    }
  }
}

const leftTabs = ['allJob', 'myJob', 'debug']

// 扁平化树节点
function flatNodes(nodes, arr) {
  nodes.forEach(node => {
    arr.push(node)
    flatNodes(node.children, arr)
  })
}
function setTreeCache(caches, jobTrees, type) {
  const treeCache = caches[type]
  if (treeCache.expandedKeys.length === 0) {
    treeCache.expandedKeys = [jobTrees[type][0].key]
  }
}

function getTreeData(jobs) {
  return setUpJobs(jobs).find(i => i.origin.parent === 'group_0')
}

function setUpJobs(jobs) {
  jobs.forEach(job => {
    job.children = jobs.filter(i => i.parent === job.id)
  })
  return jobs.map(job => setUpJobNode(job))
}

function setUpJobNode(job) {
  const isDic = job.directory !== null
  const type = !isDic ? 'job' : (job.directory === 0 ? 'big_dic' : 'small_dic')
  return {
    id: job.jobId,
    isLeaf: !job.isParent || job.children.length === 0,
    key: 'node_' + job.id,
    title: job.jobName,
    origin: job,
    type,
    dic: isDic,
    children: job.children.map(i => setUpJobNode(i)),
    scopedSlots: {
      icon: isDic ? 'dic' : 'job',
      title: 'title'
    }
  }
}

const STORAGE_KEY_LAYOUT_INFO = "layout"
const STORAGE_KEY_TREE_INFO = "tree"
const STORAGE_KEY_PREFIX = "hera_"

function setLocal(key, value) {
  localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value))
}
function initLocal(key, callback) {
  const v = localStorage.getItem(STORAGE_KEY_PREFIX + key)
  if (v != null) {
    callback(JSON.parse(v))
  }
}