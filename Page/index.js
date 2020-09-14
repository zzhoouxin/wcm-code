import React, { Component } from "react"
import { Button, Form, Input, Modal, Select } from "antd"
import { connect } from "dva"
const Option = Select.Option
const Item = Form.Item
class createProject extends Component {
  handleSubmit = (e) => {
    const { addOrUpdateDissertation, isEdit, addAndUpdateInfo } = this.props
    e.preventDefault()
    this.props.form.validateFields((err, value) => {
      if (!err) {
        if (isEdit) {
          value.id = addAndUpdateInfo.id
        }
        addOrUpdateDissertation({ ...value })
        this.props.form.resetFields()
      }
    })
  }

  onCancel = () => {
    const { setState } = this.props
    setState({ isShowModal: false })
  }

  render() {
    const { form, isShowModal } = this.props
    const { getFieldDecorator } = form
    return (
      <Modal
        onCancel={this.onCancel}
        visible={isShowModal}
        title={"新增专题"}
        footer={
          <Button type={"primary"} onClick={this.handleSubmit}>
            确定
          </Button>
        }
      >
        <Form>
          <Form.Item label={"专题名称"} required help={"15字以内"}>
            {getFieldDecorator("name", {
              rules: [
                {
                  required: true,
                  whitespace: true,
                  message: "请输入描述吧",
                },
              ],
            })(
              <Input
                placeholder={"请输入描述吧"}
                maxlength={"100"}
                style={{ width: "30%" }}
              />
            )}
          </Form.Item>
          <Form.Item label={"专题描述"} required help={"200字以内"}>
            {getFieldDecorator("desc", {
              rules: [
                {
                  required: true,
                  whitespace: true,
                  message: "请输入专题描述",
                },
              ],
            })(
              <Input.TextArea
                size={"large"}
                placeholder={"请输入专题描述"}
                maxlength={"200"}
                style={{ width: "70%" }}
              />
            )}
          </Form.Item>
          <Form.Item label={"专题标签"} required help={"200字以内"}>
            {getFieldDecorator("label", {
              rules: [
                {
                  required: true,
                  whitespace: true,
                  message: "请输入专题标签",
                },
              ],
            })(
              <Input
                placeholder={"请输入专题标签"}
                maxlength={"200"}
                style={{ width: "70%" }}
              />
            )}
          </Form.Item>
          <Form.Item label={"专题头图"} required help={"200字以内"}>
            {getFieldDecorator("headImage", {
              rules: [
                {
                  required: true,
                  whitespace: true,
                  message: "请输入专题头图",
                },
              ],
            })(
              <Input
                placeholder={"请输入专题头图"}
                maxlength={"200"}
                style={{ width: "70%" }}
              />
            )}
          </Form.Item>
          <Form.Item label={"内容类型"}>
            {getFieldDecorator("type", {
              initialValue: "1",
              rules: [],
            })(
              <Select style={{ width: "10%" }}>
                <Option value="">全部</Option>
                <Option value="1">文章</Option>
                <Option value="2">DNA</Option>
              </Select>
            )}
          </Form.Item>
          <Form.Item label={"专题内容"} required help={"200字以内"}>
            {getFieldDecorator("contentList", {
              rules: [
                {
                  required: true,
                  whitespace: true,
                  message: "请输入专题内容",
                },
              ],
            })(
              <Input
                placeholder={"请输入专题内容"}
                maxlength={"200"}
                style={{ width: "70%" }}
              />
            )}
          </Form.Item>
        </Form>
      </Modal>
    )
  }
}
const mapList = ["name", "desc", "label", "headImage", "type", "contentList"]
const newcreateProject = Form.create({
  name: "newcreateProject",
  mapPropsToFields: ({ addAndUpdateInfo }) =>
    mapList.reduce((prev, next) => {
      prev[next] = { value: addAndUpdateInfo[next] }
      return prev
    }, {}),
})(createProject)
const mapStateToProps = (state) => {
  return {
    addAndUpdateInfo: state.createProjectModel.addAndUpdateInfo,
    isEdit: state.createProjectModel.isEdit,
  }
}

const mapDispatchToProps = (dispatch) => ({
  setState: (data) => {
    return dispatch({
      type: "createProjectModel/setState",
      payload: data,
    })
  },
  cleanData: (data) => {
    return dispatch({
      type: "createProjectModel/cleanData",
      payload: data,
    })
  },
  addOrUpdateDissertation: (data) => {
    return dispatch({
      type: "createProjectModel/addOrUpdateDissertation",
      payload: data,
    })
  },
})
export default connect(mapStateToProps, mapDispatchToProps)(newcreateProject)
