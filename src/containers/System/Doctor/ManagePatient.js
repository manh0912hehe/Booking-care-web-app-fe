import React, { Component } from "react";
import { connect } from "react-redux";
import { FormattedMessage } from "react-intl";
import "./ManagePatient.scss";
import DatePicker from "../../../components/Input/DatePicker";
import { getAllPatientForDoctor, postSendRemedy } from "../../../services/userService";
import moment from "moment";
import { LANGUAGES } from "../../../utils";
import ModalRemedy from "./ModalRemedy";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingOverlay from "react-loading-overlay";

class ManagePatient extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentDate: moment(new Date()).startOf("day").valueOf(),
      dataPatient: [],
      isOpenRemedyModal: false,
      dataModal: {},
      isShowLoading: false,
    };
  }
  async componentDidMount() {
    this.getDataPatient();
  }
  getDataPatient = async () => {
    let { user } = this.props;
    let { currentDate } = this.state;
    let formatDate = new Date(currentDate).getTime();
    let res = await getAllPatientForDoctor({
      doctorId: user.id,
      date: formatDate,
    });
    if (res && res.errCode === 0) {
      this.setState({
        dataPatient: res.data,
      });
    }
  };

  async componentDidUpdate(prevProps, preState, snapshot) {
    if (this.props.language !== prevProps.language) {
    }
  }
  handleOnchangeDatePicker = (date) => {
    this.setState(
      {
        currentDate: date[0],
      },
      async () => {
        await this.getDataPatient();
      }
    );
  };
  handleBtnConfirm = (item) => {
    let data = {
      doctorId: item.doctorId,
      patientId: item.patientID,
      email: item.patientData.email,
      timeType: item.timeType,
      patientName: item.patientData.firstName,
    };
    this.setState({
      isOpenRemedyModal: true,
      dataModal: data,
    });
  };
  closeRemedyModal = () => {
    this.setState({
      isOpenRemedyModal: false,
      dataModal: {},
    });
  };
  sendRemedy = async (dataChild) => {
    let { dataModal } = this.state;
    this.setState({
      isShowLoading: true,
    });
    // Kiểm tra dữ liệu đầu vào
    if (!dataChild.email) {
      toast.error("Lỗi: Thiếu email của bệnh nhân!");
      this.setState({
        isShowLoading: false,
      });
      return;
    }
    if (!dataChild.imgBase64) {
      toast.error("Lỗi: Vui lòng tải lên hình ảnh đơn thuốc!");
      this.setState({
        isShowLoading: false,
      });
      return;
    }
    let res = await postSendRemedy({
      email: dataChild.email,
      imgBase64: dataChild.imgBase64,
      doctorId: dataModal.doctorId,
      patientId: dataModal.patientId,
      timeType: dataModal.timeType,
      language: this.props.language,
      patientName: dataModal.patientName,
    });
    if (res && res.errCode === 0) {
      this.setState({
        isShowLoading: false,
      });
      toast.success("Gửi đơn thuốc thành công");
      await this.getDataPatient();
      this.closeRemedyModal();
    } else {
      this.setState({
        isShowLoading: false,
      });
      toast.error("Gửi đơn thuốc thất bại");
    }
  };

  render() {
    let { dataPatient, isOpenRemedyModal, dataModal } = this.state;
    let { language } = this.props;

    return (
      <>
        <LoadingOverlay active={this.state.isShowLoading} spinner text="Loading...">
          <div className="manage-patient-container">
            <div className="m-p-title">
              <FormattedMessage id="admin.manage-patient.manage-patient" />
            </div>
            <div className="manage-patient-body row">
              <div className="col-4 form-group">
                <label>
                  <FormattedMessage id="admin.manage-patient.select-date" />
                </label>
                <DatePicker onChange={this.handleOnchangeDatePicker} className="form-control" value={this.state.currentDate} />
              </div>
              <div className="col-12 table-manage-patient">
                <table style={{ width: "100%" }}>
                  <tbody>
                    <tr>
                      <th>#</th>
                      <th>
                        <FormattedMessage id="admin.manage-patient.time" />
                      </th>
                      <th>
                        <FormattedMessage id="admin.manage-patient.fullname" />
                      </th>
                      <th>
                        <FormattedMessage id="admin.manage-patient.address" />
                      </th>
                      <th>
                        <FormattedMessage id="admin.manage-patient.gender" />
                      </th>
                      <th>
                        <FormattedMessage id="admin.manage-patient.action" />
                      </th>
                    </tr>
                    {dataPatient && dataPatient.length > 0 ? (
                      dataPatient.map((item, index) => {
                        let time = language === LANGUAGES.VI ? item.timeTypeDataPatient.valueVi : item.timeTypeDataPatient.valueEn;
                        let gender = language === LANGUAGES.VI ? item.patientData.genderData.valueVi : item.patientData.genderData.valueEn;
                        return (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{time}</td>
                            <td>{item.patientData.firstName}</td>
                            <td>{item.patientData.address}</td>
                            <td>{gender}</td>
                            <td>
                              <button className="btn btn-primary" onClick={() => this.handleBtnConfirm(item)}>
                                <FormattedMessage id="admin.manage-patient.confirm" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6">
                          <FormattedMessage id="admin.manage-patient.no-data" />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <ModalRemedy isOpenModal={isOpenRemedyModal} dataModal={dataModal} closeRemedyModal={this.closeRemedyModal} sendRemedy={this.sendRemedy} />
        </LoadingOverlay>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    language: state.app.language,
    user: state.user.userInfo,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ManagePatient);
