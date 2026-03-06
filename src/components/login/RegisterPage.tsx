"use client";
import { useRef, useState } from "react";
import Breadcrumb from "../breadcrumb/Breadcrumb";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { Form } from "react-bootstrap";
import * as formik from "formik";
import * as yup from "yup";
import { login } from "@/store/reducers/registrationSlice";
import { provinces, getDistrictsByProvince, type District } from "@/utility/data/thai-address";

const RegisterPage = () => {
  const { Formik } = formik;
  const formikRef = useRef<any>(null);

  const schema = yup.object().shape({
    firstName: yup.string().required("กรุณากรอกชื่อ"),
    lastName: yup.string().required("กรุณากรอกนามสกุล"),
    email: yup.string().email("รูปแบบอีเมลไม่ถูกต้อง").required("กรุณากรอกอีเมล"),
    phoneNumber: yup.string().matches(/^[0-9]{9,10}$/, "เบอร์โทรศัพท์ต้องเป็นตัวเลข 9-10 หลัก").required("กรุณากรอกเบอร์โทรศัพท์"),
    address: yup.string().required("กรุณากรอกที่อยู่"),
    province: yup.string().required("กรุณาเลือกจังหวัด"),
    district: yup.string().required("กรุณาเลือกอำเภอ/เขต"),
    subDistrict: yup.string().required("กรุณากรอกตำบล/แขวง"),
    postCode: yup.string().matches(/^[0-9]{5}$/, "รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก").required("กรุณากรอกรหัสไปรษณีย์"),
    password: yup.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร").required("กรุณากรอกรหัสผ่าน"),
    confirmPassword: yup.string().required("กรุณายืนยันรหัสผ่าน").oneOf([yup.ref("password")], "รหัสผ่านไม่ตรงกัน"),
  });

  const initialValues = {
    firstName: "", lastName: "", email: "", phoneNumber: "",
    address: "", province: "", district: "", subDistrict: "", postCode: "",
    password: "", confirmPassword: "",
  };

  const router = useRouter();
  const dispatch = useDispatch();
  const [filteredDistricts, setFilteredDistricts] = useState<District[]>([]);

  const handleProvinceChange = (e: any, setFieldValue: any) => {
    const provinceName = e.target.value;
    setFieldValue("province", provinceName);
    setFieldValue("district", "");
    setFieldValue("subDistrict", "");
    const province = provinces.find(p => p.name === provinceName);
    if (province) {
      setFilteredDistricts(getDistrictsByProvince(province.id));
    } else {
      setFilteredDistricts([]);
    }
  };

  const onSubmit = async (values: any) => {
    const uniqueId = `${Date.now()}`;
    const newRegistration = { ...values, uid: uniqueId };
    const existingRegistrations = JSON.parse(localStorage.getItem("registrationData") || "[]");
    if (typeof window !== "undefined") {
      localStorage.setItem("registrationData", JSON.stringify([...existingRegistrations, newRegistration]));
      localStorage.setItem("login_user", JSON.stringify(newRegistration));
      dispatch(login(newRegistration));
      router.push("/");
    }
    if (formikRef.current) formikRef.current.resetForm();
  };

  return (
    <>
      <Breadcrumb title={"สมัครสมาชิก"} />
      <section className="gi-register padding-tb-40">
        <div className="container">
          <div className="section-title-2">
            <h2 className="gi-title">สมัครสมาชิก<span></span></h2>
            <p>แหล่งรวมสินค้าและอาหารสำหรับสัตว์เลี้ยงที่คุณรัก</p>
          </div>
          <div className="row">
            <div className="gi-register-wrapper">
              <div className="gi-register-container">
                <div className="gi-register-form">
                  <Formik
                    innerRef={formikRef}
                    validationSchema={schema}
                    onSubmit={onSubmit}
                    initialValues={initialValues}
                  >
                    {({ handleSubmit, handleChange, setFieldValue, values, touched, errors }) => (
                      <Form noValidate onSubmit={handleSubmit}>

                        {/* ========== Section: ข้อมูลส่วนตัว ========== */}
                        <span className="gi-register-wrap" style={{ marginBottom: "5px" }}>
                          <h5 style={{
                            fontWeight: "600", color: "#1e293b", margin: "0 0 0 0",
                            paddingBottom: "10px", borderBottom: "2px solid #F28C28",
                            fontSize: "17px", width: "100%"
                          }}>
                            📋 ข้อมูลส่วนตัว
                          </h5>
                        </span>

                        <span className="gi-register-wrap gi-register-half">
                          <label>ชื่อ *</label>
                          <Form.Group>
                            <Form.Control type="text" name="firstName" placeholder="กรอกชื่อของคุณ"
                              value={values.firstName} onChange={handleChange}
                              isInvalid={!!errors.firstName && !!touched.firstName} required />
                            {errors.firstName && touched.firstName && typeof errors.firstName === "string" && (
                              <Form.Control.Feedback type="invalid">{errors.firstName}</Form.Control.Feedback>
                            )}
                          </Form.Group>
                        </span>

                        <span className="gi-register-wrap gi-register-half">
                          <label>นามสกุล *</label>
                          <Form.Group>
                            <Form.Control type="text" name="lastName" placeholder="กรอกนามสกุลของคุณ"
                              value={values.lastName} onChange={handleChange}
                              isInvalid={!!errors.lastName && !!touched.lastName} required />
                            {errors.lastName && touched.lastName && typeof errors.lastName === "string" && (
                              <Form.Control.Feedback type="invalid">{errors.lastName}</Form.Control.Feedback>
                            )}
                          </Form.Group>
                        </span>

                        <span className="gi-register-wrap gi-register-half" style={{ marginTop: "10px" }}>
                          <label>อีเมล *</label>
                          <Form.Group>
                            <Form.Control type="email" name="email" placeholder="กรอกอีเมลของคุณ"
                              value={values.email} onChange={handleChange}
                              isInvalid={!!errors.email && !!touched.email} required />
                            {errors.email && touched.email && typeof errors.email === "string" && (
                              <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                            )}
                          </Form.Group>
                        </span>

                        <span className="gi-register-wrap gi-register-half" style={{ marginTop: "10px" }}>
                          <label>เบอร์โทรศัพท์ *</label>
                          <Form.Group>
                            <Form.Control type="text" name="phoneNumber" placeholder="กรอกเบอร์โทรศัพท์"
                              value={values.phoneNumber} onChange={handleChange}
                              isInvalid={!!errors.phoneNumber && !!touched.phoneNumber} required />
                            {errors.phoneNumber && touched.phoneNumber && typeof errors.phoneNumber === "string" && (
                              <Form.Control.Feedback type="invalid">{errors.phoneNumber}</Form.Control.Feedback>
                            )}
                          </Form.Group>
                        </span>

                        {/* ========== Section: ที่อยู่ ========== */}
                        <span className="gi-register-wrap" style={{ marginTop: "20px", marginBottom: "5px" }}>
                          <h5 style={{
                            fontWeight: "600", color: "#1e293b", margin: "0 0 0 0",
                            paddingBottom: "10px", borderBottom: "2px solid #F28C28",
                            fontSize: "17px", width: "100%"
                          }}>
                            📍 ที่อยู่
                          </h5>
                        </span>

                        <span className="gi-register-wrap">
                          <label>ที่อยู่ (บ้านเลขที่ หมู่ ซอย ถนน) *</label>
                          <Form.Group>
                            <Form.Control type="text" name="address"
                              placeholder="เช่น 123/4 หมู่ 5 ซอยสุขสวัสดิ์ 1 ถนนสุขสวัสดิ์"
                              value={values.address} onChange={handleChange}
                              isInvalid={!!errors.address && !!touched.address} required />
                            {errors.address && touched.address && typeof errors.address === "string" && (
                              <Form.Control.Feedback type="invalid">{errors.address}</Form.Control.Feedback>
                            )}
                          </Form.Group>
                        </span>

                        <span className="gi-register-wrap gi-register-half" style={{ marginTop: "10px" }}>
                          <label>จังหวัด *</label>
                          <Form.Group className={`gi-rg-select-inner ${!!errors.province && !!touched.province ? "is-invalid" : ""}`}>
                            <Form.Select size="sm" name="province" className="gi-register-select"
                              value={values.province || ""}
                              onChange={(e) => handleProvinceChange(e, setFieldValue)}
                              required isInvalid={!!errors.province && !!touched.province}>
                              <option value="" disabled>-- เลือกจังหวัด --</option>
                              {provinces.map((prov) => (
                                <option key={prov.id} value={prov.name}>{prov.name}</option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                          {errors.province && touched.province && typeof errors.province === "string" && (
                            <div style={{ color: "#dc3545", fontSize: "12.8px", marginTop: "4px" }}>{errors.province}</div>
                          )}
                        </span>

                        <span className="gi-register-wrap gi-register-half" style={{ marginTop: "10px" }}>
                          <label>อำเภอ/เขต *</label>
                          <Form.Group className={`gi-rg-select-inner ${!!errors.district && !!touched.district ? "is-invalid" : ""}`}>
                            <Form.Select size="sm" name="district" className="gi-register-select"
                              value={values.district || ""} onChange={handleChange}
                              required isInvalid={!!errors.district && !!touched.district}>
                              <option value="" disabled>-- เลือกอำเภอ/เขต --</option>
                              {filteredDistricts.map((dist) => (
                                <option key={dist.id} value={dist.name}>{dist.name}</option>
                              ))}
                            </Form.Select>
                          </Form.Group>
                          {errors.district && touched.district && typeof errors.district === "string" && (
                            <div style={{ color: "#dc3545", fontSize: "12.8px", marginTop: "4px" }}>{errors.district}</div>
                          )}
                        </span>

                        <span className="gi-register-wrap gi-register-half" style={{ marginTop: "10px" }}>
                          <label>ตำบล/แขวง *</label>
                          <Form.Group>
                            <Form.Control type="text" name="subDistrict" placeholder="กรอกตำบล/แขวง"
                              value={values.subDistrict} onChange={handleChange}
                              isInvalid={!!errors.subDistrict && !!touched.subDistrict} required />
                            {errors.subDistrict && touched.subDistrict && typeof errors.subDistrict === "string" && (
                              <Form.Control.Feedback type="invalid">{errors.subDistrict}</Form.Control.Feedback>
                            )}
                          </Form.Group>
                        </span>

                        <span className="gi-register-wrap gi-register-half" style={{ marginTop: "10px" }}>
                          <label>รหัสไปรษณีย์ *</label>
                          <Form.Group>
                            <Form.Control type="text" name="postCode" placeholder="รหัสไปรษณีย์ 5 หลัก"
                              value={values.postCode} onChange={handleChange}
                              isInvalid={!!errors.postCode && !!touched.postCode} required maxLength={5} />
                            {errors.postCode && touched.postCode && typeof errors.postCode === "string" && (
                              <Form.Control.Feedback type="invalid">{errors.postCode}</Form.Control.Feedback>
                            )}
                          </Form.Group>
                        </span>

                        {/* ========== Section: ข้อมูลผู้ใช้ ========== */}
                        <span className="gi-register-wrap" style={{ marginTop: "20px", marginBottom: "5px" }}>
                          <h5 style={{
                            fontWeight: "600", color: "#1e293b", margin: "0 0 0 0",
                            paddingBottom: "10px", borderBottom: "2px solid #F28C28",
                            fontSize: "17px", width: "100%"
                          }}>
                            🔐 ข้อมูลผู้ใช้
                          </h5>
                        </span>

                        <span className="gi-register-wrap gi-register-half">
                          <label>รหัสผ่าน *</label>
                          <Form.Group>
                            <Form.Control type="password" name="password"
                              placeholder="กรอกรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
                              value={values.password} onChange={handleChange}
                              isInvalid={!!errors.password && !!touched.password} required />
                            {errors.password && touched.password && typeof errors.password === "string" && (
                              <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                            )}
                          </Form.Group>
                        </span>

                        <span className="gi-register-wrap gi-register-half">
                          <label>ยืนยันรหัสผ่าน *</label>
                          <Form.Group>
                            <Form.Control type="password" name="confirmPassword"
                              placeholder="กรอกยืนยันรหัสผ่าน"
                              value={values.confirmPassword} onChange={handleChange}
                              isInvalid={!!errors.confirmPassword && !!touched.confirmPassword} required />
                            {errors.confirmPassword && touched.confirmPassword && typeof errors.confirmPassword === "string" && (
                              <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
                            )}
                          </Form.Group>
                        </span>

                        {/* ========== Submit ========== */}
                        <span className="gi-register-wrap gi-register-btn" style={{ marginTop: "20px" }}>
                          <span>
                            มีบัญชีอยู่แล้วใช่ไหม?
                            <a href="/login">&nbsp;เข้าสู่ระบบ</a>
                          </span>
                          <button className="gi-btn-1" type="submit">
                            สมัครสมาชิก
                          </button>
                        </span>

                      </Form>
                    )}
                  </Formik>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default RegisterPage;

export const getRegistrationData = () => {
  if (typeof window !== "undefined") {
    const registrationData = localStorage.getItem("registrationData");
    return registrationData ? JSON.parse(registrationData) : [];
  }
  return [];
};

export const setRegistrationData = (data: any) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("registrationData", JSON.stringify(data));
  }
};
