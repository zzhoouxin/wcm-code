export interface ActionList {
    name: string;
    desc: string;
    type: string;
}

export interface Names {
    modelName: string;
    pageName: string;
    searchBtnName: string;
    fileName: string;
}


export interface Columns {
    title: string;
    key: string;
    type?: number;
    width?: string;
    dictionary?: any;
}

export interface Table {
    columns: Columns[];
}


export interface DataJsonType {
    actionList: ActionList[];
    nameList: Names,
    table: Table,
    searchFrom: Array<Search>
    createPageData: CreateProject,
    openPage: boolean
}

export interface Search {
    title: string,
    initialValue: string,
    key: string,
    type: string,
    placeholder: string,
    options?: Array<Options>
}

export interface Options {
    name: number | string,
    value: string | string
}

//创建类型
export interface CreateProject {
    fileName: string;
    formList: FormList[];
    modelName: string;
    pageName: string;
    modalTitle:string
}

export interface FormList {
    title: string;
    required: boolean;
    help: string;
    initialValue: string;
    key: string;
    placeholder: string;
    type: string;
    maxLength: number;
    width: string;
    options: Array<Options>

}
