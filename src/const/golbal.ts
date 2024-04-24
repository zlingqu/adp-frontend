export const Passwd: string = '198538';
export const ServiceBuildStatusSendUrl: string = 'http://service-build-status-send.dm-ai.cn/events';
export const Tmppppp: String = '111111';
export async function sleep(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
  // return new Promise(resolve => {
  //   setTimeout(() => {
  //     resolve('');
  //   }, ms);
  // });
}
export function pythonIn(arr: any[], memvber: any): boolean {
  if (arr.indexOf(memvber) == -1) {
    return false;
  } else {
    return true;
  }
}

export function pythonNotIn(arr: any[], member: any, kong: any = ''): boolean {
  if (!member) return false;
  if (arr.indexOf(member) == -1) {
    return true;
  } else {
    return false;
  }
}
