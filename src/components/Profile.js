/* eslint-disable react-hooks/exhaustive-deps */

import React, { useContext, useEffect, useRef, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import './profile.scss'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import socketContext from '../context/SocketContext';
import Cookies from 'js-cookie';

const Profile = () => {
    const [user, setUser] = useState({
        name: Cookies.get('user-name'),
        username: Cookies.get('user-Id'),
        email: Cookies.get('user-email'),
    })
    const nameRef=useRef()
    const userNameRef=useRef()
    const oldPassRef=useRef()
    const newPassRef=useRef()
    const confirmPassRef=useRef()
    const socket = useContext(socketContext).socket
    const navigate = useNavigate()
    useEffect(() => {
        socket.on('user-details', (data) => {
            setUser(data)
        })
        socket.on('dup-value',(data)=>{
            toast.error(data)
        })
        socket.on('success-msg', (data) => {
            toast.success(data)
        })
        socket.on('log-out',()=>{
            toast.error('Session Expired, Please Login Again')
            Logout();
        })
    }, [socket])
    const changeName=()=>{
        let name=nameRef.current.value
        nameRef.current.value=''
        const id=toast.loading('Changing Name')
        Cookies.set('user-name',name,{ expires: 7 , secure: true})
        socket.emit('change-name',user.username,name)
        toast.dismiss(id);
    }
    const changeUserName=()=>{
        toast.info('This feature is not available right now😁')
        // let userName=userNameRef.current.value
        // userName=userName.trim().toLowerCase();
        // userNameRef.current.value=''
        // const id=toast.loading('Changing username')
        // socket.emit('change-username',user.username,userName)
        // if(Cookies.set('user-Id')!==user.username){
        //     Cookies.set('user-Id',userName)
        // }
        // toast.dismiss(id);
    }
    const profileComponent = () => {
        socket.emit('get-user',Cookies.get('token'))
        return (
            <div className='profile-comp'>
                <div className='profile-details'>
                    <h1>Profile Details</h1>
                    <div className='profile-info'>
                        <p>Name: <span className="value">

                            {user.name}
                            <span className='name-input i-field'>
                                <input type="text" 
                                ref={nameRef}
                                placeholder=' Want new name?' />
                            </span>
                            <button onClick={changeName}  className="submit">
                                Change
                            </button>


                        </span></p>
                        <p>Username: <span className="value">
                            {user.username}
                            <span className='name-input i-field'>
                                <input type="text" 
                                ref={userNameRef}
                                placeholder='Wanna change username?' />
                            </span>
                            <button onClick={changeUserName}  className="submit ">
                                Change
                            </button>
                        </span></p>
                        <p>Email: <span className="value">{user.email}</span></p>
                    </div>
                </div>

            </div>
        )
    }

    const passwordComponent = () => {
        return (
            <div className='password-form'>
                    <h1>Change Password</h1>
                    <p>
                    Enter your old password to change the password.
                    </p>
                <div className="p-field">
                    <input
                        type='password'
                        ref={oldPassRef}
                        placeholder='Enter Old Password'
                    />
                </div>
                <div className="p-field">
                  
                 <input
                        type='password'
                        ref={newPassRef}
                        placeholder='Enter New Password'
                    />
                </div>
                <div className="p-field">
                    <input
                        type='password'
                        ref={confirmPassRef}
                        placeholder='Confirm Password'
                    />
                </div>
                <button className='submit' onClick={changePassword}>Change Password</button>
            </div>
        )
    }
    const changePassword = () => {
        const password = oldPassRef.current.value
        const newPassword = newPassRef.current.value
        const confirmPassword = confirmPassRef.current.value
        oldPassRef.current.value = ''
        newPassRef.current.value = ''
        confirmPassRef.current.value = ''
        if (newPassword !== confirmPassword) {
            toast.error('Passwords did not match')
        } else {
            const id = toast.loading('Changing Password')
            socket.emit('change-password', user.username, password, newPassword)
            toast.dismiss(id)
        }
    }
    const Logout = () => {
        Cookies.remove('token');
        Cookies.remove('user-name');
        Cookies.remove('user-Id');
        Cookies.remove('user-email');
        Cookies.remove('room');
        Cookies.remove('room-Id');
        navigate('/login')
    }




    return (
        <div className='profile-tab'>
            <div className="sidebar left-sidebar" >
                <Link to={'/profile/profile-settings'}>Profile Settings</Link>
                <Link to='/profile/password-settings'>Password Settings</Link>
                <button  onClick={Logout}>Logout</button>
            </div>
            <div className="sidebar-options main-page" >
                <Routes>
                    <Route path='/profile-settings' element={profileComponent()} />
                    <Route path='/' element={profileComponent()} />
                    <Route path='/password-settings' element={passwordComponent()} />
                </Routes>
            </div>
            <ToastContainer limit={2} theme='dark' />
        </div>
    )
}

export default Profile
