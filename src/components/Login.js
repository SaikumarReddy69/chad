/* eslint-disable react-hooks/exhaustive-deps */
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {   useState } from 'react';
import Cookies from 'js-cookie';
import { toast,ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login() {
  let navigate=useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [disabled, setDisabled] = useState(false);

  const handleLogin = async () => {
    try {
      setDisabled(true);
      const response = await toast.promise(fetch('https://chad-king.glitch.me/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
           email:email.toLowerCase()
           ,password }),
      }),
      {
        pending:"🏎️Revving the engine... ",
        error:"Please try again later..."
      });

      const data = await response.json();
      if (response.status === 200) {
        setDisabled(true)
        toast.success("Redirecting....",{
          progressStyle: { background: "white"},
          theme:"dark"
      })
        const token = data.authToken;
        Cookies.set('token', token,{ expires: 7 , secure: true}); 
        Cookies.set('user-name', data.name,{ expires: 7 , secure: true});
        Cookies.set('user-Id', data.userid,{ expires: 7 , secure: true});
        Cookies.set('user-email', email,{ expires: 7 , secure: true, httpOnly: false });
        navigate('/room')
      }
      else{
        setDisabled(false)
        toast.error(data.error,{
          progressStyle: { background: "white"},
          theme:"dark"
      })
      
    }
  }catch(data) {
    setDisabled(false)
    toast.error(data)      
  }
  }


  return (
<div className='login'>
<Form>
    <h2 style={{textAlign:"center"}}>Login</h2>
      <Form.Group className="mb-3" controlId="formBasicEmail">
        <Form.Control type="email" placeholder="Enter email" autoComplete='on'  onChange={(e)=>{setEmail(e.target.value)}}/>
      </Form.Group>
      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Control autoComplete='password' onKeyDown={(e)=>{
          if(e.key==='Enter')
          {
            handleLogin()
          }
        
        }}   type="password" onChange={(e)=>{setPassword(e.target.value)}}  placeholder="Password" />
      </Form.Group>
      <Form.Group className="mb-3" controlId="formBasicCheckbox">
         <Link to="/forgot-pass">
            Forgot Password
         </Link>
         <br />
    New User? <Link to="/register">Register</Link> Here
      </Form.Group>
      <Button disabled={disabled} variant="primary" type="button" onClick={handleLogin}>
        Submit
      </Button>
      <br />
      <br />


    </Form>
    <ToastContainer limit={2} theme='dark' />

</div>

  );
}

export default Login;