import prettier from 'prettier';
import fs from 'fs';
import {DataJsonType, FormList, Search} from '../data/data';

const dataJson: DataJsonType = require('../data/data.json');

const {findQueryActionName, singleGetActionName} = require('../listTemplate/modelTemplate');

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
    fs.writeFile('../Page/index.js', data, 'utf8', () => {
        console.log('写入成功');
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
              
              //回到列表页面
              goToList = () => {
                setTimeout(() => {
                this.props.history.push({ pathname: '/${dataJson.nameList.fileName}/${dataJson.nameList.pageName}' });
              }, 1000);
            }
    `;
    classCode += handleSubmitCode();
    classCode += renderCodeFn();
    classCode += '}';
    classCode += reduxCodeFn();
    return classCode;
};

/**
 * 提交接口的代码--接口名称什么都没做呢
 */
const handleSubmitCode = () => {
    const updateName = singleGetActionName(findQueryActionName('update'));
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
        </Form>
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
    const updateName = singleGetActionName(findQueryActionName('update'));
    const reduxCode = `
  const mapStateToProps = (state) => {
  return {
    addAndUpdateInfo: state.project.addAndUpdateInfo,
    isEdit: state.project.isEdit,
  };
};

const mapDispatchToProps = dispatch => ({
  setState: (data) => {
    return dispatch({
      type: '${dataJson.createPageData.fileName}/setState',
      payload: data,
    });
  },
  cleanData: (data) => {
    return dispatch({
      type: '${dataJson.createPageData.fileName}/cleanData',
      payload: data,
    });
  },
  ${updateName}: (data) => {
    return dispatch({
      type: '${dataJson.createPageData.fileName}/${updateName}',
      payload: data,
    });
  },
});
export default connect(mapStateToProps, mapDispatchToProps)(${dataJson.createPageData.pageName});
  `;
    return reduxCode;
};

assemblyCreateHomeCode();
// module.exports = {
//   assemblyCreateHomeCode,
// };
