import Mock from 'mockjs';
import spaceList from '@/api/mock/space';
import userList from '@/api/mock/user';
import environmentList from '@/api/mock/environment';
import projectList from '@/api/mock/project';
import deploymentList from '@/api/mock/deployment';

Mock.mock('http://dmai/adp/api/space', 'get', () => spaceList.data);

Mock.mock('http://dmai/adp/api/user', 'get', () => userList.data);

Mock.mock('http://dmai/adp/api/environment', 'get', () => environmentList.data);

Mock.mock('http://dmai/adp/api/project', 'get', () => projectList.data);

Mock.mock('http://dmai/adp/api/deployment', 'get', () => deploymentList.data);
