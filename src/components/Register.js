/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBInput
}
  from 'mdb-react-ui-kit';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Register() {
  const navigate = useNavigate();
  Cookies.get('userId') && navigate('/')
  const url = "https://chad-king.glitch.me/auth/create-user";
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cPassword, setCPassword] = useState('');
  const [id, setId] = useState('');
  const [disabled, setDisabled] = useState(true);
  const [otp, setOtp] = useState('');
  const [disabledOtp, setDisabledOtp] = useState(false);
  useEffect(() => {
    if (Cookies.get('user-name') !== undefined) {
      navigate('/room')
    }
  }, [])
  const verifyOTP = async () => {
    setDisabledOtp(true)
    const res = await toast.promise(fetch("https://chad-king.glitch.me/auth/verify-email", {
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

    if (data.message) {
      setDisabledOtp(false)
      if(res.status===500){
        toast.error(data.message) 
      }
      else{
      setDisabled(false)
        toast.success(data.message)
      }
      
    }
    else {
      setDisabledOtp(false)
      const error = (data.error);
      toast.error(error)
    }
  }
  const createUser = async () => {
    setDisabled(true)
    await toast.promise(fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name,
        email: email.toLowerCase(),
        userid: id,
        otp: otp,
        password: password,
        cpassword: cPassword
      })
    })
      .then(response => {

        return response.json();
      })
      .then(data => {
        setDisabled(false)
        if (data.status === "success") {
          fetch('https://chad-king.glitch.me/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          })
            .then(response => response.json())
            .then(data => {
              const token = data.authToken;
              Cookies.set('token', token,{ expires: 7 , secure: true});
              Cookies.set('user-name', name, { expires: 7, secure: true });
              Cookies.set('user-Id', id, { expires: 7, secure: true });
              Cookies.set('user-email', email, { expires: 7, secure: true, httpOnly: false });
              toast.success("Redirecting...")
              navigate('/room')

            })
            .catch(data => {
              toast.error(data.error)
            });
        }
        else {
          toast.info(data.error[0].msg || data.error, {
            progressStyle: { background: "white" },
            theme: "dark"
          })
        }
      })
      .catch(error => {
        toast(error);
      }), {
      pending: "🏎️Revving the engine...",
      error: "Please try again later..."
    })
  }
  return (
    <div className="login">
      <MDBContainer fluid>
        <MDBCard className='text-white m-5 form' style={{ borderRadius: '5px' }}>
          <MDBCardBody>
            <MDBRow>
              <MDBCol md='12' lg='12' className='order-2 order-lg-1 d-flex flex-column align-items-center'>
                <h2 className='mb-4'>Sign Up</h2>

                <div className="d-flex flex-row align-items-center mb-4 ">
                  <MDBInput autoComplete='name' placeholder='Your Name' onChange={(e) => { setName(e.target.value) }} id='form1' type='text' className='w-200' />
                </div>

                <div className="verify-otp align-items-center mb-4 d-flex form-control">
                  <input
                    onChange={(e) => { setEmail(e.target.value) }}
                    id='form2'
                    type="email" placeholder="Enter Mail" />
                  <button disabled={disabledOtp}  onClick={verifyOTP}>Verify</button>
                </div>
                <div className="d-flex flex-row align-items-center mb-4">
                  <MDBInput placeholder='OTP'
                    autoComplete='on'
                    onChange={(e) => { setOtp(e.target.value) }}
                    id='otp'
                    type='text' />
                </div>

                <div className="d-flex flex-row align-items-center mb-4">
                  <MDBInput placeholder='Username'
                    autoComplete='username'
                    onChange={(e) => { setId(e.target.value) }}
                    id='userId' type='text' />
                </div>

                <div className="d-flex flex-row align-items-center mb-4">
                  <MDBInput placeholder='Password'
                    autoComplete='password'
                    onChange={(e) => { setPassword(e.target.value) }}
                    id='form3' type='password' />
                </div>

                <div className="d-flex flex-row align-items-center mb-4">
                  <MDBInput
                    onChange={(e) => { setCPassword(e.target.value) }}
                    autoComplete='password'
                    placeholder='Repeat your password' id='form4' type='password' />
                </div>
                <div className='mb-4'>Already Registered? <Link to="/login">Login</Link> here</div>
                <Button className='mb-4' onKeyDown={(e) => {
                  e.target.value === 'Enter' && createUser()
                }} size='md' onClick={createUser} disabled={disabled}  >Register</Button>

              </MDBCol>
            </MDBRow>

          </MDBCardBody>
        </MDBCard>

      </MDBContainer>
      <ToastContainer limit={2} theme='dark' />

    </div>
  );
}

export default Register;