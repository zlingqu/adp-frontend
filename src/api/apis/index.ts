import space from '@/api/apis/space';
import user from '@/api/apis/user';
import environment from '@/api/apis/environment';
import project from '@/api/apis/project';
import deployment from '@/api/apis/deployment';

export default {
  ...space,
  ...user,
  ...environment,
  ...project,
  ...deployment,
};
