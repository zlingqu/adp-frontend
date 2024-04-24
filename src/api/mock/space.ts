import Mock from 'mockjs';

const mockSpaceList = Mock.mock({
  'data|100-120': [
    {
      'key|+1': 1,
      id: 'id-@key',
      name: '@string(`lower`, 5)',
      owner: '@first',
      createdAt: '@datetime',
    },
  ],
});
mockSpaceList.data.push({
  key: 200,
  id: 'id-xmc2',
  name: 'xmc2',
  owner: 'zuosheng0',
  createdAt: '1988-06-24 08:55',
});

export default mockSpaceList;
