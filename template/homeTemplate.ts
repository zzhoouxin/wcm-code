import prettier from 'prettier';
import fs from 'fs';
import ora from 'ora';
import { DataJsonType } from '../data/data';

const { findQuertActionName, singleGetActionName } = require('./modelTemplate');

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
    import moment from 'moment';
    `;
  homeCodeResult += assemblyPageCode();
  homeCodeResult += assemblyColumnsCode();
  homeCodeResult += assemblyRenderCode();
  homeCodeResult += '}';
  homeCodeResult += assemblyReduxCode();
  const data = prettier.format(homeCodeResult, {
    semi: false,
    parser: 'babel',
  });
  fs.writeFile('Page/page.js', data, 'utf8', () => {
    setTimeout(() => {
      pageSpinner.stop();
      pageSpinner.succeed('Page模块代码生成中生成成功!');
    }, 1500);
  });
};

/**
 * 组装pageClass头部代码
 */
const assemblyPageCode = () => {
  const findQueryName = findQuertActionName();
  const queryName = singleGetActionName(findQueryName);
  const pageCode = `
    class ${dataJson.page.pageName} extends Component {
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
                ${column.type ? renderColumnByType(column.type) : ''}
            },
    `;
  });

  columnsCode += ']';
  return columnsCode;
};

const renderColumnByType = (type: number) => {
  let code = ',render:(text,record) =>{ return ';
  switch (type) {
    // 时间格式
    case 1:
      code += ' <p>{moment(text).format("YYYY-MM-DD HH:mm:ss")}</p>;';
      break;
    // 普通格式-需要翻译的那种
    case 2:
      code += ' <p>{text}</p>;';
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
  const queryName = singleGetActionName(findQuertActionName());
  const deleteName = singleGetActionName(findQuertActionName('delete'));
  const renderCode = `

    render() {
        const { list, pageNo, total, history } = this.props;
        return (
        <div>
            {/* <Heard history={history} /> */}
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
 * 底部redux基础代码
 */
const assemblyReduxCode = () => {
  const nameSpace = dataJson.model.namespace;
  const queryName = singleGetActionName(findQuertActionName());
  const deleteName = singleGetActionName(findQuertActionName('delete'));

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
            type: '${nameSpace}/deleteGroup',
            payload: data,
          });
        },
      
      });
      export default connect(mapStateToProps, mapDispatchToProps)(${dataJson.page.pageName});
    `;
  return reduxCode;
};

module.exports = {
  assemblyHomeImportCode,
};
