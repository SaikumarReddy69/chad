/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useRef, useState } from 'react'
import { Button} from 'react-bootstrap'
import socketContext from '../context/SocketContext';
import Cookies from 'js-cookie';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router';

const RoomInput = () => {
  const soc=useContext(socketContext);
  const socket=soc.socket
  const [roomid,setRoomId]=useState("")
  const [roomPass,setRoomPass]=useState("")
  const roomRef=useRef();
  const passRef=useRef();
  const navigate=useNavigate();

  const roomJoin=()=>{
    if(roomid==="" || roomPass==="")
    {
      toast("Enter Room id and Password correctly...")
      return;
    }else{
        setRoomId(roomid.toLowerCase())
        setRoomPass(roomPass.toLowerCase())
        
        roomRef.current.value="";
        passRef.current.value="";
        Cookies.set('room',roomid+roomPass,{expires:1});
        Cookies.set('room-pass',roomPass,{expires:1});
        Cookies.set('room-Id',roomid,{expires:1});
        socket.emit('room-join',roomid+roomPass)
        socket.emit('clear-chat');
        toast(`Joined ${roomid} successfully`)
        socket.emit('chat-room-message')
        soc.roomChatFetched=false;
        setRoomId("")
        setRoomPass("")
        navigate('/room/joined')
      }
   
  }
  useEffect(()=>{
    if(Cookies.get('room') && Cookies.get('room-pass') && Cookies.get('room-Id'))
    {
      setRoomId(Cookies.get('room-Id'))
      setRoomPass(Cookies.get('room-pass'))
      socket.emit('room-join',Cookies.get('room'))
      socket.emit('clear-chat');
      toast(`Joined ${Cookies.get('room-Id')} successfully`)
      socket.emit('chat-room-message')
      soc.roomChatFetched=false;
      navigate('/room/joined')
    }
  },[])
  return (
<div className='id-pass-fields'>
<div className='contacts ' data-backdrop="static" id='modal'>
      <div className="room">
        <input ref={roomRef} type="text"
autoComplete='off' 

        onChange={(e)=>{
          setRoomId(e.target.value);
        }}
        placeholder='Enter Room-id' name="room-id" id="room-id" />

      </div>
<div className="room">
<input ref={passRef} type="password"
autoComplete='off' 
        onKeyDown={
          (e)=>{
          if(e.key==='Enter')
          roomJoin();
        }}  
        onChange={(e)=>{
          setRoomPass(e.target.value);
          
        }}
        placeholder='Enter Room-Password' name="room-id" id="room-pass" />
  </div>
    <div className="border-0  d-flex  justify-content-center">
    <Button variant='light'  onClick={roomJoin}>Join</Button>
    </div>
    </div>
    <ToastContainer theme='dark'/>

    </div>
  )
}

export default RoomInput
