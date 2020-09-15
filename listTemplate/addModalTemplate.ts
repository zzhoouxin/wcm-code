import prettier from 'prettier';
import fs from 'fs';
import ora from 'ora';
import { DataJsonType, FormList, Search } from '../data/data';
import { deleteFolderRecursive } from '../utils/fs-utils';
// @ts-ignore
import config from '../utils/config';

const addOrUpdate = ora('弹窗模块代码生成中...').start();
const dataJson: DataJsonType = require('../data/data.json');
const { findQueryActionName, singleGetActionName } = require('../listTemplate/modelTemplate');

const assemblyAddModalCode = () => {
  let addModalCoderResult = `
    import React, { Component } from 'react';
    import { Button, Form, Input, Modal, Select,InputNumber } from 'antd';
    import { connect } from 'dva';
    const Option = Select.Option;
    const itemStyle={marginBottom:0}
    class ${dataJson.createPageData.pageName} extends Component {
    `;

  addModalCoderResult += handleSubmitCode();
  addModalCoderResult += assemblyContentCode();
  addModalCoderResult += '}';
  addModalCoderResult += mapPropsToFilesFn();
  addModalCoderResult += reduxCodeFn();
  const data = prettier.format(addModalCoderResult, {
    semi: false,
    parser: 'babel',
  });

  writeServiceFileCode(data);
};

const writeServiceFileCode = (data:string) => {
  fs.writeFile(`${config.projectPath}/src/routes/${dataJson.nameList.fileName}/${dataJson.nameList.pageName}/addOrUpdateModal.js`, data, 'utf8', () => {
    addOrUpdate.stop();
    addOrUpdate.succeed('弹窗模块代码生成中生成成功!');
  });
};

const assemblyContentCode = () => {
  const formItemCode = formItemCodeList();
  const code = `
    render() {
    const { form, isShowModal } = this.props;
    const { getFieldDecorator } = form;
    return (<Modal
      onCancel={this.onCancel}
      visible={isShowModal}
      title={"${dataJson.createPageData.modalTitle}"}
      footer={<Button type={'primary'} onClick={this.handleSubmit}>确定</Button>}
    >
     <Form>
     ${formItemCode}
     </Form>
     </Modal>
     );
     }
    `;
  return code;
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
            label={'${item.title}'}
            ${item.required ? 'required' : ''}
            ${item.help ? `help={'${item.help}'}` : ''}
            style={itemStyle}
          >
            {getFieldDecorator('${item.key}', {
            ${item.initialValue ? `initialValue: '${item.initialValue}',` : ''}
            rules: [
                ${item.required ? `{
                  required: true,
                  ${item.type === 'input' ? 'whitespace: true,' : ''}
                 
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
    case 'inputNumber':
      code += `<InputNumber placeholder={"${item.placeholder}"} min={${item.min}}  max={${item.max}} style={{width: '${item.width}'}}/>`;
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
/**
 * 提交接口的代码--接口名称什么都没做呢
 */
const handleSubmitCode = () => {
  const updateName = singleGetActionName(findQueryActionName('add'));
  let initValue = '';
  dataJson.createPageData.formList.map((item) => {
    if (item.initialValue) {
      initValue += `${item.key}:"${item.initialValue}",`;
    }
  });

  const nowPageParams = `isShowModal:false,
     addAndUpdateInfo: {
      ${initValue}
      }`;

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
            this.props.form.resetFields();
          }
        });
      }
  
     onCancel = () => {
        const { setState } = this.props;
        setState({ ${nowPageParams}});
     }
    `;
  return submitCode;
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

const reduxCodeFn = () => {
  const updateName = singleGetActionName(findQueryActionName('add'));
  const reduxCode = `
  const mapStateToProps = (state) => {
  return {
    addAndUpdateInfo: state.${dataJson.nameList.modelName}.addAndUpdateInfo,
    isEdit: state.${dataJson.nameList.modelName}.isEdit,
    isShowModal: state.${dataJson.nameList.modelName}.isShowModal,
  };
};

const mapDispatchToProps = dispatch => ({
  setState: (data) => {
    return dispatch({
      type: '${dataJson.nameList.modelName}/setState',
      payload: data,
    });
  },
  cleanData: (data) => {
    return dispatch({
      type: '${dataJson.nameList.modelName}/cleanData',
      payload: data,
    });
  },
  ${updateName}: (data) => {
    return dispatch({
      type: '${dataJson.nameList.modelName}/${updateName}',
      payload: data,
    });
  },
});
export default connect(mapStateToProps, mapDispatchToProps)(new${dataJson.createPageData.pageName});
  `;
  return reduxCode;
};

module.exports = {
  assemblyAddModalCode,
};
