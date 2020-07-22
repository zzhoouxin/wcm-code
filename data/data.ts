export interface ActionList {
  name: string;
  desc: string;
  type: string;
}

export interface Model {
  namespace: string;
}

export interface DataJsonType {
  actionList: ActionList[];
  model: Model;
}
