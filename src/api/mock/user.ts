const mockUser = num => {
  const res: IUser[] = [];
  for (let i = 0; i < num; i++) {
    res.push({
      name: 'zuosheng' + (i + 1),
      key: i + 1 + '',
      status: i < 6 ? '正常' : '停止',
      role: '空间所有者',
      belongSpace: 'xmc2',
      belongSpaceId: 'id-xmc2',
    });
  }
  return { data: res };
};
const mockUserList = mockUser(12);

export default mockUserList;
