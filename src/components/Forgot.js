/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import {
    MDBContainer,
    MDBRow,
    MDBCol,
    MDBCard,
    MDBCardBody,
    MDBInput
} from 'mdb-react-ui-kit';
import Button from 'react-bootstrap/Button';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';

function Forgot() {
    const navigate = useNavigate();
    const [disabled, setDisabled] = useState(true);
    const [disabledOtp, setDisabledOtp] = useState(false);
    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const sendOTP = async () => {
        try {
            setDisabled(false);
            setDisabledOtp(true);
            const res = await toast.promise(fetch("https://chad-king.glitch.me/auth/send-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                }),
            }), {
                pending: "Sending OTP",
            });
            const data = await res.json();
            setDisabledOtp(false);
            const error = (data.message || data.error);
            toast.info(error);
        } catch (error) {
            toast.error("Error sending OTP");
            throw error;
        }
    };

    const createUser = async () => {
        if (otp !== '' && otp.length === 4) {
            setDisabled(true);
            try {
                const response = await toast.promise(fetch("https://chad-king.glitch.me/auth/forgot-pass", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        otp,
                        password,
                    }),
                }), {
                    pending: "Changing User Details"
                });
                const data = await response.json();
                setDisabled(false);
                if (data.status !== "success") {
                    const error = (data.error[0].msg || data.error);
                    toast.info(error);
                } else {
                    toast.success("Changed successfully, Please login");
                    setTimeout(() => {
                        navigate('/login');
                    }, 500)
                }
            } catch (error) {
                toast.error("Error changing user details");
            }
        } else {
            toast.error("Invalid OTP");
        }
    };
    useEffect(()=>{
        if(Cookies.get('user-name')!==undefined){
          navigate('/room')
        }
      },[])

    return (
        <div className="login">
            <MDBContainer fluid>
                <MDBCard className='text-white m-5 form' style={{ borderRadius: '5px' }}>
                    <MDBCardBody>
                        <MDBRow>
                            <MDBCol md='12' lg='12' className='order-2 order-lg-1 d-flex flex-column align-items-center'>
                                <h2 className='mb-4'>Forgot Password</h2>

                                <div className="verify-otp align-items-center mb-4 d-flex form-control">
                                    <input
                                        onChange={(e) => { setEmail(e.target.value) }}
                                        id='form2'
                                        type="email" placeholder="Enter Mail" />
                                    <button disabled={disabledOtp}  onClick={sendOTP}>Verify</button>
                                </div>
                                <div className="d-flex flex-row align-items-center mb-4">
                                    <MDBInput
                                        placeholder='Enter OTP'
                                        onChange={(e) => { setOtp(e.target.value) }}
                                        id='form4'
                                        type='text'
                                    />
                                </div>
                                <div className="d-flex flex-row align-items-center mb-4">
                                    <MDBInput placeholder='New Password'
                                        autoComplete='password'
                                        onChange={(e) => { setPassword(e.target.value) }}
                                        id='form3' type='password' />
                                </div>

                                <div className='mb-4'>Remember Password? <Link to="/login">Login</Link> here</div>
                                <div className="container">
                                    <Button className='' disabled={disabled} size='md' onClick={createUser}  >Reset</Button>
                                </div>
                            </MDBCol>
                        </MDBRow>

                    </MDBCardBody>
                </MDBCard>

            </MDBContainer>
            <ToastContainer limit={2} theme='dark' />

        </div>
    );
}

export default Forgot;