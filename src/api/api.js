import axios from "axios";
import store from "@/store/index.js";
import router from "@/router/index.js";
import { messageType } from "@/utils/constant";

const apiUrl = process.env.VUE_APP_API_URL;

// api
const apiRequest = axios.create({
  baseURL: apiUrl,
  timeout: 60000,
});

// request 攔截器
apiRequest.interceptors.request.use(
  (request) => {
    store.dispatch("setLoading", true);
    if (localStorage.getItem("jwtToken")) {
      request.headers.Authorization = `Bearer ${localStorage.getItem(
        "jwtToken"
      )}`;
    }
    return request;
  },
  (error) => {
    store.dispatch("setLoading", false);
    return Promise.reject(error);
  }
);

// response 攔截器
apiRequest.interceptors.response.use(
  (response) => {
    store.dispatch("setLoading", false);
    return response.data;
  },
  (error) => {
    store.dispatch("setLoading", false);
    if (
      error.response.status === 401 &&
      router.app._route.name === "ResetPassword"
    ) {
      return error.response.data;
    } else if (error.response.status === 401) {
      localStorage.setItem("jwtToken", "");
      store.dispatch("setAccount", {});
      window.location.assign("/");
    } else {
      store.dispatch("setMessageBar", {
        message: error.message,
        type: messageType.ERROR,
      });
      return error;
    }
  }
);

//- Common
export const apiGetDepts = () => {
  return apiRequest.get("Common/Depts");
};
export const apiGetCampaignConfig = () => {
  return apiRequest.get("Common/CampaignConfig");
};
export const apiGetEmployeeListConfig = () => {
  return apiRequest.get("Common/EmployeeListConfig");
};
export const apiGetCalendarApproeListConfig = () => {
  return apiRequest.get("Common/CalendarApproeListConfig");
};
export const apiGetCalendarManagerListConfig = () => {
  return apiRequest.get("Common/CalendarManagerListConfig");
};

//- Auth
export const apiLoginCaptcha = (captchaID) => {
  return apiRequest.get(`Auth/Captcha/${captchaID}`);
};
export const apiLogin = (data) => {
  return apiRequest.post("Auth/Login", data);
};
export const apiSignup = (data) => {
  return apiRequest.put("Auth/Signup", data);
};
export const apiForgetPassword = (email) => {
  return apiRequest.get(`Auth/ForgetPwd/${email}`);
};
export const apiResetPasswordValidateToken = () => {
  return apiRequest.get("Auth/ValidateToken");
};
export const apiResetPassword = (data) => {
  return apiRequest.put("Auth/ResetPwd", data);
};

//- System Config
export const apiSystemCheckoutDates = (year) => {
  return apiRequest.get(`SystemConfig/CheckoutDates?year=${year}`);
};
export const apiSystemSaveCheckoutDates = (data) => {
  return apiRequest.post("SystemConfig/CheckoutDates", data);
};
// export const apiSystemScheduleToSendEmail = () => {
//   return apiRequest.get("SystemConfig/scheduleToSendEmail");
// };
export const apiSystemCheckOutDateByYear = (year) => {
  return apiRequest.get(`SystemConfig/CheckOutDateByYear?year=${year}`);
};
export const apiSystemUploadExcel = (year, data) => {
  return apiRequest.post(`SystemConfig/UploadExcel?year=${year}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const apiSystemDept = () => {
  return apiRequest.get("SystemConfig/Dept");
};
export const apiSystemDeptAdd = (data) => {
  return apiRequest.post("SystemConfig/Dept", data);
};
export const apiSystemDeptUpdate = (data) => {
  return apiRequest.put("SystemConfig/Dept", data);
};
export const apiSystemAllDeptEmployees = () => {
  return apiRequest.get("SystemConfig/AllDeptEmployees");
};
export const apiSystemDeptPageOptions = () => {
  return apiRequest.get("SystemConfig/DeptPageOptions");
};

//- Employee
export const apiEmployeeProfile = () => {
  return apiRequest.get("Employee");
};
export const apiEmployeeEditName = (data) => {
  return apiRequest.put("Employee/Name", data);
};
export const apiEmployeeEditPassword = (data) => {
  return apiRequest.put("Employee/Pwd", data);
};
export const apiEmployeeApproveList = () => {
  return apiRequest.get("Employee/ApproveList");
};
export const apiEmployeeApproveUpdate = (data) => {
  return apiRequest.put("Employee/Approve/Account", data);
};
export const apiEmployeeApprove = (data) => {
  return apiRequest.put("Employee/Approve", data);
};
export const apiEmployeeReject = (data) => {
  return apiRequest.put("Employee/Reject", data);
};
export const apiEmployeeUserList = (data) => {
  return apiRequest.post("Employee/List", data);
};
export const apiEmployeeUsersDepts = (data) => {
  return apiRequest.put("Employee/Depts", data);
};
export const apiEmployeeUserUpdate = (data) => {
  return apiRequest.put("Employee", data);
};
export const apiEmployeeUserAdd = (data) => {
  return apiRequest.post("Employee", data);
};

//- Campaign
export const apiCampaignAttachment = (data) => {
  return apiRequest.post("Campaign/Attachment", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const apiCampaignContent = (campaignId) => {
  return apiRequest.post(`Campaign/${campaignId}`);
};
export const apiCampaignAdd = (data) => {
  return apiRequest.post("Campaign", data);
};
export const apiCampaignUpdate = (data) => {
  return apiRequest.put("Campaign", data);
};
export const apiCampaignList = (data) => {
  return apiRequest.post("Campaign/List", data);
};

//- Calendar
export const apiCalendar = (year, month) => {
  return apiRequest.get(`Calendar/Employee/${year}/${month}`);
};
export const apiCalendarSendToVerify = (data) => {
  return apiRequest.post("Calendar/SendToVerify", data);
};
export const apiCalendarApplyReject = (data) => {
  return apiRequest.post("Calendar/ApplyReject", data);
};
export const apiCalendarReverse = (employeeCalendarId) => {
  return apiRequest.post(`Calendar/Reverse/${employeeCalendarId}`);
};
export const apiCampaignDetail = (
  campaignId,
  campaignDate,
  employeeCalendarCampaignId
) => {
  return apiRequest.get(
    `Calendar/CampaignDetail/${campaignId}/${campaignDate}/${employeeCalendarCampaignId}`
  );
};
export const apiCalendarRegisterCampaign = (data) => {
  return apiRequest.post("Calendar/RegisterCampaign", data);
};
export const apiCalendarCancelCampaign = (employeeCalendarCampaignId) => {
  return apiRequest.post(
    `Calendar/CancleCampaign/${employeeCalendarCampaignId}`
  );
};
export const apiCalendarApproveList = (data) => {
  return apiRequest.post("Calendar/ApproveList", data);
};
export const apiCalendarEmployee = (employeeCalendarId) => {
  return apiRequest.get(`Calendar/Employee/${employeeCalendarId}`);
};
export const apiCalendarApprove = (data) => {
  return apiRequest.post("Calendar/Approve", data);
};
export const apiCalendarReject = (data) => {
  return apiRequest.post("Calendar/Reject", data);
};
export const apiCalendarManagerList = (data) => {
  return apiRequest.post("Calendar/ManagerList", data);
};
export const apiCalendarManagerApprove = (data) => {
  return apiRequest.post("Calendar/Manager/Approve", data);
};
export const apiExportCalendar = (data) => {
  return apiRequest.post("Calendar/Manager/ExportCalendar", data, {
    responseType: "blob",
  });
};
export const apiExportOverTimeCalendar = (data) => {
  return apiRequest.post("Calendar/Manager/ExportOverTimeCalendar", data, {
    responseType: "blob",
  });
};