interface IProject {
  name: string;
  key: string;
  status: string;
  description?: string;
  gitRepository: string;
  languageType: string;
  serverType: string;
  ifUseDomain: boolean;
  domainName?: string;
  ifCompile: boolean;
  ifUseAutoDeployFile: boolean;
  ifDeploy: boolean;
  copyCount: number;
  ifUseCustomDockerfile: boolean;
  cpuMinRequire: string;
  cpuMaxRequire: string;
  memoryMinRequire: string;
  memoryMaxRequire: string;
  ifStorageLocale: boolean;
  storageSize?: string;
  ifUseGpu: boolean;
  gpuCardCount?: number;
  ifNeedCheck: boolean;
}

interface IProjectV1 {
  id: number;
  name: string;
}

interface IProjectV2 {
  id: number;
  name: string;
  git_repository: string;
  language_type: string;
  owned_product: string;
}
