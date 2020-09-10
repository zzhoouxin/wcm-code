import prettier from 'prettier';
import fs from 'fs';
import ora from 'ora';
import {Columns, DataJsonType} from '../data/data';
// @ts-ignore
import config from '../utils/config';
// @ts-ignore
import { deleteFolderRecursive } from '../utils/fs-utils';

const { findQueryActionName, singleGetActionName } = require('./modelTemplate');

const pageSpinner = ora('Page模块代码生成中...').start();

const dataJson: DataJsonType = require('../data/data.json');

/**
 * 组装页面import代码
 */
const assemblyHomeImportCode = () => {
  let homeCodeResult = `
    import React, { Component } from 'react';
    import { Modal, Table } from 'antd';
    import { connect } from 'dva';
    import Header from './header';
    import moment from 'moment';
    `;
  homeCodeResult += assemblyDictionaryCode();
  homeCodeResult += assemblyPageCode();
  homeCodeResult += assemblyColumnsCode();
  homeCodeResult += assemblyRenderCode();

  homeCodeResult += '}';
  homeCodeResult += assemblyReduxCode();
  const data = prettier.format(homeCodeResult, {
    semi: false,
    parser: 'babel',
  });

  writeServiceFileCode(data);
};

/**
 * 写入基本文件
 * @param data
 */
const writeServiceFileCode = (data:string) => {
  deleteFolderRecursive(`${config.projectPath}/src/routes/${dataJson.nameList.fileName}`);
  fs.mkdirSync(`${config.projectPath}/src/routes/${dataJson.nameList.fileName}`);
  fs.mkdirSync(`${config.projectPath}/src/routes/${dataJson.nameList.fileName}/${dataJson.nameList.pageName}`);
  fs.writeFile(`${config.projectPath}/src/routes/${dataJson.nameList.fileName}/${dataJson.nameList.pageName}/index.js`, data, 'utf8', () => {
    pageSpinner.stop();
    pageSpinner.succeed('Page模块代码生成中生成成功!');
  });
};


/**
 * 生成翻译字段的数据
 */
const assemblyDictionaryCode = ()=>{
  let code ='';
  dataJson.table.columns.map((item:Columns)=>{
    if(item.dictionary){
      code += `const ${item.key}DictionAry = ${JSON.stringify(item.dictionary)};`
    }
  })
  return code;


}
/**
 * 组装pageClass头部代码
 */
const assemblyPageCode = () => {
  const findQueryName = findQueryActionName();
  const queryName = singleGetActionName(findQueryName);
  const pageCode = `
    class ${dataJson.nameList.pageName} extends Component {
        componentDidMount() {
            const { ${queryName} } = this.props;
            ${queryName}();
          }

    
    `;
  return pageCode;
};

const assemblyColumnsCode = () => {
  const { columns } = dataJson.table;
  let columnsCode = 'columns = [';
  columns.map((column) => {
    columnsCode += `
            {
                title:"${column.title}",
                key:"${column.key}",
                dataIndex:"${column.key}"
                 ${column.width ? `,width:"${column.width}"` : ''}
                ${column.type ? renderColumnByType(column) : ''}
            },
    `;
  });
  columnsCode += `{
      title: '操作',
      key: 'operation',
      render: (text, record) => {
        return (
          <div>
            <a
             style={{marginLeft:5}}
              onClick={() => {
                this.remove(record);
              }}
            >删除</a>
          </div>);
      },
    },`;

  columnsCode += ']';
  return columnsCode;
};

const renderColumnByType = (columns: Columns) => {

  let code = ',render:(text,record) =>{ return ';
  switch (columns.type) {
    // 时间格式
    case 1:
      code += ' <p>{moment(text).format("YYYY-MM-DD HH:mm:ss")}</p>;';
      break;
      // 普通格式-需要翻译的那种
    case 2:
      code += `<p>{${columns.key}DictionAry[text]}</p>;`;
      break;
      // 图片类型
    case 3:
      code += ' <img style={{ width: 50, height: 50 }} src={text} />;';
      break;
    default:
      code += ' <img style={{ width: 50, height: 50 }} src={text} />;';
      break;
  }
  code += '}';
  return code;
};

/**
 * 组装render代码
 */
const assemblyRenderCode = () => {
  const queryName = singleGetActionName(findQueryActionName());
  const deleteName = singleGetActionName(findQueryActionName('delete'));
  const renderCode = `

    render() {
        const { list, pageNo, total, history } = this.props;
        return (
        <div>
            <Header history={history} />
            <div style={{ background: '#fff' }}>
            <Table
                rowKey={record => record.id}
                pagination={{
                current: pageNo,
                defaultPageSize: 10,
                total,
                showTotal: () => <span>共{total}条</span>,
                onChange: this.onChange,
                }}
                dataSource={list} 
                columns={this.columns}
            />
            </div>
            {/* <AddOrUpdateModal /> */}
        </div>
        );
    }

    /**
     * table分页事件
     */ 
    onChange = (pageNo, pageSize) => {
        const {setState,${queryName}} = this.props;
        setState({ pageNo, pageSize });
        ${queryName}();
    };

    /**
     * 删除事件
     */ 
    remove = (item) => {
        const {${deleteName}} = this.props;
        const modal = Modal.confirm({
          title: '删除后无法恢复，是否确认删除',
          cancelText: '取消',
          okText: '确定',
          style: { width: '400px' },
          width: '400px',
          onCancel: () => {
            modal.destroy();
          },
          onOk: () => {
            ${deleteName}(item.id);
          },
        });
      }
      `;

  return renderCode;
};

/**
 * 整合修改的代码-这边分2种场景；
 * 1.跳到新页面 2、在当前页编辑
 */
const assemblyRenderEditCode = () => {
  const type = 1;
  let code = '';
  if (type === 1) {
    code += ` edit = async (data) => {
    const { createSetState } = this.props;
    await createSetState({
      addAndUpdateInfo: {
        ...data
      },
      isEdit: true,
    });
    this.props.history.push({ pathname: '/project/createProject' });
  }`;
  }
  return code;
};

/**
 * 底部redux基础代码
 */
const assemblyReduxCode = () => {
  const nameSpace = dataJson.nameList.modelName;
  const queryName = singleGetActionName(findQueryActionName());
  const deleteName = singleGetActionName(findQueryActionName('delete'));

  const reduxCode = `
    const mapStateToProps = (state) => {
        return {
          list: state.${nameSpace}.list,
          total: state.${nameSpace}.total,
          pageNo: state.${nameSpace}.pageNo,
        };
      };
      
      const mapDispatchToProps = dispatch => ({
        setState: (data) => {
          return dispatch({
            type: '${nameSpace}/setState',
            payload: data,
          });
        },
        ${queryName}: () => {
          return dispatch({
            type: '${nameSpace}/${queryName}',
            payload: {},
      
          });
        },
        ${deleteName}: (data) => {
          return dispatch({
            type: '${nameSpace}/${deleteName}',
            payload: data,
          });
        },
      
      });
      export default connect(mapStateToProps, mapDispatchToProps)(${dataJson.nameList.pageName});
    `;
  return reduxCode;
};

module.exports = {
  assemblyHomeImportCode,
};
