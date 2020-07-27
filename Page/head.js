import React, { Component } from 'react';
import {
  Form, Row, Col, Input, Select, Button, Icon,
} from 'antd';

const FormItem = Form.Item;
const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
  style: {
    marginBottom: 0,
  },
};
class Header extends Component {
  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form>
        <Row gutter={12}>
          <Col span={6}>
            <FormItem {...layout} label={'名称'}>
              {getFieldDecorator('name', {
                initialValue: '',
              })(<Input placeholder={'请输入描述吧'} />)}
            </FormItem>
          </Col>
        </Row>
        <Col span={6}>
          <FormItem {...layout} label={'创建时间'}>
            {getFieldDecorator('createTime', {
              initialValue: '',
            })(<RangePicker />)}
          </FormItem>
        </Col>
        <Col span={6}>
          <FormItem {...layout} label={'状态'}>
            {getFieldDecorator('status', {
              initialValue: '',
            })(
              <Select>
                <Option value="">请选择状态</Option>
                <Option value="0">下架</Option>
                <Option value="1">上架</Option>
              </Select>,
            )}
          </FormItem>
        </Col>
      </Form>
    );
  }
}
const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => ({
  setState: (data) => dispatch({
    type: 'templateList/setState',
    payload: data,
  }),
  queryMessageListByParam: () => dispatch({
    type: 'templateList/queryMessageListByParam',
    payload: {},
  }),
});
const FormHeader = Form.create()(Header);
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withRouter(FormHeader));
