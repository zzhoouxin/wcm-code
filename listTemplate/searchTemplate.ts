/**
 * 创建头部搜索功能
 */
import prettier from 'prettier';
import fs from 'fs';
import ora from 'ora';
import { DataJsonType, Search } from '../data/data';
// @ts-ignore
import config from '../utils/config';
// @ts-ignore
import { deleteFolderRecursive } from '../utils/fs-utils';

const searchSpinner = ora('搜索模块代码生成中...').start();

const { findQueryActionName, singleGetActionName } = require('./modelTemplate');

const dataJson: DataJsonType = require('../data/data.json');

const assemblySearchCode = () => {
  let searchCode = '';
  searchCode += assemblyImportCode();
  searchCode += assemblyFormSubmitCode();
  searchCode += generateInsertBtnFn();
  searchCode += assemblyRenderCode();
  searchCode += generateReduxCode();
  const modelCode = prettier.format(searchCode, {
    semi: false,
    parser: 'babel',
  });
  writeServiceFileCode(modelCode);
};

/**
 * 写入基本文件
 * @param data
 */
const writeServiceFileCode = (data:string) => {
  fs.writeFile(`${config.projectPath}/src/routes/${dataJson.nameList.fileName}/${dataJson.nameList.pageName}/header.js`, data, 'utf8', () => {
    searchSpinner.stop();
    searchSpinner.succeed('搜索模块代码生成成功!!');
  });
};

/**
 * 组装import代码
 */
const assemblyImportCode = () => {
  // 这边是否需要处理antd引入的类型判断呢？
  const importCode = `
    import React ,{Component}from 'react';
    import { Form, Row, Col, Input, Select, Button, Icon } from 'antd';
    import { withRouter } from 'dva/router';
    import { connect } from 'dva';
    const Option = Select.Option;
    class Header extends Component {
    `;
  return importCode;
};

/**
 * 渲染form提交代码
 */
const assemblyFormSubmitCode = () => {
  const queryName = singleGetActionName(findQueryActionName());
  const code = `handleSubmit = (e) => {
    const { setState, ${queryName} } = this.props;
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      const searchData = { ...values };
      setState({ searchData });
      ${queryName}();
    });
  };

  clean = () => {
    this.props.form.resetFields();
  };`;
  return code;
};

/**
 * 渲染选择宽-input框-时间选择框code
 */
const assemblyRenderCode = () => {
  let renderCode = `render() {
    const {form} = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form onSubmit={this.handleSubmit} style={{ background: 'white', padding: 10 }}>`;
  dataJson.searchFrom.map((data: Search, _i: number) => {
    if ((_i < 4 && _i === 0) || (_i % 4 === 0)) {
      renderCode += '<Row gutter={12} style={{padding: 5 }}>';
    }
    renderCode += generateOptionCodeByType(data);
    if ((_i < 4 && _i === dataJson.searchFrom.length - 1) || (_i % 4 === 3)) {
      renderCode += '</Row>';
    }
  });
  renderCode += generateBottomBtn();
  renderCode += '</Form>)}}';
  return renderCode;
};

/**
 * 生成新增按钮跳转代码
 */
const generateInsertBtnFn = () => {
  const isOpenPage = dataJson.openPage;
  let contentCode = '';
  if (isOpenPage) {
    contentCode = ` this.props.router.push({ pathname: '/${dataJson.createPageData.fileName}/${dataJson.createPageData.pageName}' });`;
  }

  const insertBtnFnCode = `
    add = () => {
      ${contentCode}
   }
    `;
  return insertBtnFnCode;
};

/**
 * 生成搜索框的底部按钮
 */
const generateBottomBtn = () => {
  const { searchBtnName } = dataJson.nameList;
  const code = `<Row gutter={12}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop:10
            }}
          >
            <Button
              type="primary" style={{ marginTop: 10 }} onClick={() => {
              this.add();
            }}
            >
              ${searchBtnName}
            </Button>

            <div>
              <Button type="primary" htmlType="submit" style={{ marginTop: 10 }}>
                搜索
              </Button>
              <Button
                style={{ marginLeft: 10 }} onClick={() => {
                this.clean();
              }}
              >重置</Button>
            </div>
          </div>
        </Row>`;
  return code;
};
/**
 * 根据类型生成输入框
 */
const generateOptionCodeByType = (data: Search) => {
  let code = `<Col span={6}>
<div> 
 <span>${data.title}:</span>{getFieldDecorator("${data.key}", {
                initialValue:"${data.initialValue}",
              })(

`;

  switch (data.type) {
    case 'input':
      code += `<Input placeholder={"${data.placeholder}"} />`;
      break;
    case 'select':
      code += generateSelectCode(data);
      break;
    case 'date':
      code += '<RangePicker/>';
      break;
    default:
      break;
  }
  code += ')}</div></Col>';
  return code;
};

const generateSelectCode = (data: Search) => {
  let code = '<Select>';
  (data.options || []).map((item) => {
    code += `<Option value="${item.value}">${item.name}</Option>`;
  });
  code += '</Select>';
  return code;
};

const generateReduxCode = () => {
  const nameSpace = dataJson.nameList.modelName;
  const queryName = singleGetActionName(findQueryActionName());
  const reduxCode = `
    const mapStateToProps = (state) => {
        return {
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
      });
      const FormHeader = Form.create()(Header);
      export default connect(mapStateToProps, mapDispatchToProps)(withRouter(FormHeader));
    `;
  return reduxCode;
};

module.exports = {
  assemblySearchCode,

};
