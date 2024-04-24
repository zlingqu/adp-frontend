interface IUser {
  name: string;
  status: string;
  role?: string;
  belongSpace?: string;
  belongSpaceId?: string;
  key: string;
}

interface IUserV1 {
  cn: string;
  displayName: string;
  // code: string;
  // data: {
  //   cn?: string;
  //   displayName?: string;
  // }[];
  // error?: any;
}

interface IUserV2 {
  owner_english_name: string;
  owner_china_name: string;
  // code: string;
  // data: {
  //   cn?: string;
  //   displayName?: string;
  // }[];
  // error?: any;
}
