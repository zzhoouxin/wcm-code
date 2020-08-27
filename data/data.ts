export interface ActionList {
  name: string;
  desc: string;
  type: string;
}

export interface Names {
  modelName: string;
  pageName:string;
}

export interface Page{
  pageName: string
}

export interface Columns {
  title: string;
  key: string;
  type?:number;
  width?:string;
  dictionary?:any;
}

export interface Table {
  columns: Columns[];
}



export interface DataJsonType {
  actionList: ActionList[];
  nameList:Names,
  table:Table,
  searchFrom:Array<Search>
}
export interface Search{
  title:string,
  initialValue:string,
  key:string,
  type:string,
  placeholder:string,
  options?:Array<Options>
}

export interface Options{
  name:number|string,
  value:string|string
}
