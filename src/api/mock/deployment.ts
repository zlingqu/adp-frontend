const mockDeploymentList = [
  {
    name: '上线一号',
    key: 'id-1',
    project: 'xmc-backend',
    user: 'zuosheng',
    branch: 'dev',
    environment: 'dev',
    updateTime: '2019-07-23 11:29:06',
    status: '等待审核',
  },
  {
    name: '上线二号',
    key: 'id-2',
    project: 'xmc-frontend',
    user: 'yejun',
    branch: 'test',
    environment: 'test',
    updateTime: '2019-07-28 11:29:06',
    status: '等待审核',
  },
];

export default { data: mockDeploymentList };
