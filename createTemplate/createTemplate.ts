import prettier from 'prettier';
import fs from 'fs';
import ora from 'ora';
import { DataJsonType, FormList, Search } from '../data/data';
import { deleteFolderRecursive } from '../utils/fs-utils';
// @ts-ignore
import config from '../utils/config';

const dataJson: DataJsonType = require('../data/data.json');

const createSpinner = ora('新增模块代码生成中...').start();

const { findQueryActionName, singleGetActionName } = require('../listTemplate/modelTemplate');

/**
 * 创建新增代码入口+头部code
 */
const assemblyCreateHomeCode = () => {
  let createCodeResult = `
    import React, { Component } from 'react';
    import { connect } from 'dva';
    import { Button, Form, Input, Select, Spin } from 'antd';
    const Option = Select.Option;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 2 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
    };
    `;

  createCodeResult += assemblyClassCode();
  const data = prettier.format(createCodeResult, {
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
  const insertFile = fs.existsSync(`${config.projectPath}/src/routes/${dataJson.createPageData.fileName}`);
  if (insertFile) {
    const insertChildFile = fs.existsSync(`${config.projectPath}/src/routes/${dataJson.createPageData.fileName}/${dataJson.createPageData.pageName}`);
    if (!insertChildFile) {
      fs.mkdirSync(`${config.projectPath}/src/routes/${dataJson.createPageData.fileName}/${dataJson.createPageData.pageName}`);
    }
  } else {
    fs.mkdirSync(`${config.projectPath}/src/routes/${dataJson.createPageData.fileName}`);
    fs.mkdirSync(`${config.projectPath}/src/routes/${dataJson.createPageData.fileName}/${dataJson.createPageData.pageName}`);
  }
  fs.writeFile(`${config.projectPath}/src/routes/${dataJson.createPageData.fileName}/${dataJson.createPageData.pageName}/index.js`, data, 'utf8', () => {
    createSpinner.stop();
    createSpinner.succeed('新增模块生成中生成成功!');
  });
};

/**
 * class一些基础代码
 */
const assemblyClassCode = () => {
  let classCode = `class ${dataJson.createPageData.pageName} extends Component {
            state={};
            componentDidMount(){};
            componentWillUnmount() {
               const { cleanData } = this.props;
               cleanData();
            }
       
    `;
  classCode += handleSubmitCode();
  classCode += renderCodeFn();
  classCode += '}';
  classCode += mapPropsToFilesFn();
  classCode += reduxCodeFn();
  return classCode;
};

const mapPropsToFilesFn = () => {
  let mapList = '[';
  dataJson.createPageData.formList.map((item:FormList) => {
    mapList += `'${item.key}',`;
  });
  mapList += ']';
  const code = `const mapList = ${mapList};
const new${dataJson.createPageData.pageName} = Form.create({
  name: 'new${dataJson.createPageData.pageName}',
  mapPropsToFields: ({ addAndUpdateInfo }) => mapList.reduce((prev, next) => {
    prev[next] = { value: addAndUpdateInfo[next] };
    return prev;
  }, {}),
})(${dataJson.createPageData.pageName});`;
  return code;
};

/**
 * 提交接口的代码--接口名称什么都没做呢
 */
const handleSubmitCode = () => {
  const updateName = singleGetActionName(findQueryActionName('add'));
  const submitCode = `
     handleSubmit = (e) => {
    const { ${updateName}, isEdit, addAndUpdateInfo } = this.props;
    e.preventDefault();
    this.props.form.validateFields((err, value) => {
      if (!err) {
        if (isEdit) {
          value.id = addAndUpdateInfo.id;
        }
        ${updateName}({ ...value });
      }
    });
  }
    `;
  return submitCode;
};

const renderCodeFn = () => {
  const formItemCode = formItemCodeList();
  const renderCode = `
    render(){
    const { form, isEdit } = this.props;
    const { getFieldDecorator } = form;
    return (
       <div >
        <Form onSubmit={this.handleSubmit}>
        ${formItemCode}
        <div>
           <Button type="primary" htmlType="submit" style={{ marginLeft: 20 }}>
            {isEdit ? '立即更新' : '立即添加'}
          </Button>
          <Button
            type="default" style={{ marginLeft: 20 }} onClick={() => {
              this.props.history.push({ pathname: '/${dataJson.nameList.fileName}/${dataJson.nameList.pageName}' });
            }}
          >
            取消
          </Button>
        </div>
        </Form>
        
        </div>
    )
    }
    `;

  return renderCode;
};

// 生成formList代码
const formItemCodeList = () => {
  let formItemListCode = '';
  dataJson.createPageData.formList.map((item) => {
    formItemListCode += generateItemCode(item);
  });
  return formItemListCode;
};

/**
 * 生成formItem代码
 * @param item
 */
const generateItemCode = (item: FormList) => {
  let code = `<Form.Item
            {...formItemLayout}
            label={'${item.title}'}
            ${item.required ? 'required' : ''}
            ${item.help ? `help={'${item.help}'}` : ''}
          >
            {getFieldDecorator('${item.key}', {
            ${item.initialValue ? `initialValue: '${item.initialValue}',` : ''}
            rules: [
                ${item.required ? `{
                  required: true,
                  whitespace: true,
                  message: '${item.placeholder}',
                },` : ''}
              ],
            })(
`;
  switch (item.type) {
    case 'input':
      code += `<Input placeholder={"${item.placeholder}"} maxlength={"${item.maxLength}"}  style={{width: '${item.width}'}}/>`;
      break;
    case 'textArea':
      code += `<Input.TextArea size={'large'} placeholder={"${item.placeholder}"} maxlength={"${item.maxLength}"}  style={{width: '${item.width}'}}/>`;
      break;
    case 'select':
      code += generateSelectCode(item);
      break;
    default:
      break;
  }
  code += ')}</Form.Item>';
  return code;
};

const generateSelectCode = (data: FormList) => {
  let code = `<Select  style={{width: '${data.width}'}}>`;
  (data.options || []).map((item) => {
    code += `<Option value="${item.value}">${item.name}</Option>`;
  });
  code += '</Select>';
  return code;
};
const reduxCodeFn = () => {
  const updateName = singleGetActionName(findQueryActionName('add'));
  const reduxCode = `
  const mapStateToProps = (state) => {
  return {
    addAndUpdateInfo: state.${dataJson.createPageData.modelName}.addAndUpdateInfo,
    isEdit: state.${dataJson.createPageData.modelName}.isEdit,
  };
};

const mapDispatchToProps = dispatch => ({
  setState: (data) => {
    return dispatch({
      type: '${dataJson.createPageData.modelName}/setState',
      payload: data,
    });
  },
  cleanData: (data) => {
    return dispatch({
      type: '${dataJson.createPageData.modelName}/cleanData',
      payload: data,
    });
  },
  ${updateName}: (data) => {
    return dispatch({
      type: '${dataJson.createPageData.modelName}/${updateName}',
      payload: data,
    });
  },
});
export default connect(mapStateToProps, mapDispatchToProps)(new${dataJson.createPageData.pageName});
  `;
  return reduxCode;
};

module.exports = {
  assemblyCreateHomeCode,

};
