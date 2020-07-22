export interface ActionList {
  name: string;
  desc: string;
  type: string;
}

export interface Model {
  namespace: string;
}

export interface Page{
  pageName: string
}

export interface Columns {
  title: string;
  key: string;
  type?:number
}

export interface Table {
  columns: Columns[];
}

export interface DataJsonType {
  actionList: ActionList[];
  model: Model;
  page:Page
  table:Table
}
