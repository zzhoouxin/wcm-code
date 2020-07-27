/**
 * 创建头部搜索功能
 */
import prettier from 'prettier';
import fs from 'fs';
import { DataJsonType, Search, Options } from '../data/data';

const dataJson: DataJsonType = require('../data/data.json');

const assemblySearchCode = () => {
  let searchCode = '';
  searchCode += assemblyImportCode();
  searchCode += assemblyRenderCode();
  const modelCode = prettier.format(searchCode, {
    semi: false,
    parser: 'babel',
  });
  console.log('modelCode====>', modelCode);
  // fs.writeFile('Page/head.js', modelCode, 'utf8', () => {
  //   console.log('完成了么');
  // });
  // console.log('searchCode: ', searchCode);
};

/**
 * 组装import代码
 */
const assemblyImportCode = () => {
  // 这边是否需要处理antd引入的类型判断呢？
  const importCode = `
    import React ,{Component}from 'react';
    import PropTypes from 'prop-types';
    import { Form, Row, Col, Input, Select, Button, Icon } from 'antd';
    const FormItem = Form.Item;
    const layout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
      style: {
        marginBottom: 0,
      },
    };
    class Header extends Component {
    `;
  return importCode;
};

const assemblyRenderCode = () => {
  let renderCode = `render() {
    const {form} = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form>`;
  dataJson.searchFrom.map((data: Search, _i: number) => {
    if (_i % 4 === 0) {
      renderCode += '<Row gutter={12}>';
    }
    renderCode += generateOptionCodeByType(data);
    if (_i % 3 === 0) {
      renderCode += '</Row>';
    }
  });

  renderCode += '</Form>)}';
  renderCode += '} export default Header;';
  return renderCode;
};

/**
 * 根据类型生成输入框
 */
const generateOptionCodeByType = (data: Search) => {
  console.log('data: ', data);

  let code = `<Col span={6}><Form.Item {...layout} label={"${data.title}"}>
  {getFieldDecorator("${data.key}", {
    initialValue: "${data.initialValue || ''}",
  })(`;

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

  code += ')}</Form.Item></Col>';
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

assemblySearchCode();
