import React, { Component } from 'react';
import { Modal, Table } from 'antd';
import { connect } from 'dva';
import moment from 'moment';

class groupingPage extends Component {
  componentDidMount() {
    const { queryMessageListByParam } = this.props;
    queryMessageListByParam();
  }

  columns = []

  render() {
    const {
      list, pageNo, total, history,
    } = this.props;
    return (
      <div>
        {/* <Heard history={history} /> */}
        <div style={{ background: '#fff' }}>
          <Table
            rowKey={(record) => record.id}
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
    const { setState, queryMessageListByParam } = this.props;
    setState({ pageNo, pageSize });
    queryMessageListByParam();
  }

  /**
   * 删除事件
   */

  remove = (item) => {
    const { deleteMessageListById } = this.props;
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
        deleteMessageListById(item.id);
      },
    });
  }
}
const mapStateToProps = (state) => ({
  list: state.templateList.list,
  total: state.templateList.total,
  pageNo: state.templateList.pageNo,
});

const mapDispatchToProps = (dispatch) => ({
  setState: (data) => dispatch({
    type: 'templateList/setState',
    payload: data,
  }),
  queryMessageListByParam: () => dispatch({
    type: 'templateList/queryRouteConfigGroupByParams',
    payload: {},
  }),
  deleteMessageListById: (data) => dispatch({
    type: 'templateList/deleteGroup',
    payload: data,
  }),
});
export default connect(mapStateToProps, mapDispatchToProps)(groupingPage);
