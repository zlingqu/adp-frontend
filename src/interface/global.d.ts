interface IWindow extends Window {
  config: {
    server: {
      host: string;
    };
  };
  io: any;
}

interface IMenuItem {
  key: string;
  name: string;
  icon: string;
}
interface ITableColumnFilter {
  text: any;
  value: string | number | boolean;
}

interface IAntTableColumn {
  title?: any;
  dataIndex: string;
  filters?: ITableColumnFilter[];
  key?: string;
  scopedSlots?: any;
  slots?: any;
  sorter?: any;
  width?: string | number;
  onFilter?: any;
  fixed?: any;
  customCell?: any;
}
