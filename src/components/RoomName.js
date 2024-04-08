/* eslint-disable react-hooks/exhaustive-deps */
import Cookies from 'js-cookie'
import React, { useContext, useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import socketContext from '../context/SocketContext';
import { toast } from 'react-toastify';
import messaging from './Chad-notify-firebase';
import { useNavigate } from 'react-router';
import { getToken } from 'firebase/messaging';

const RoomName = ({ type }) => {
  const soc = useContext(socketContext);
  const socket = soc.socket
  const [notification, setNotification] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const navigate = useNavigate();
  const [typing, setTyping] = useState(false);
  const [typer, setTyper] = useState('');
  const [userShow, setUserShow] = useState(false);
  const [usersList, setUsers] = useState([])
  const [deleteShow, setDeleteShow] = useState(false);
  const [showButtons, setShowButtons] = useState(false);



  const showUsers = () => {
    setUserShow(!userShow);
  }
  const showDelete = () => {
    setDeleteShow(!deleteShow);
  }

  const handleNotify = async () => {
    setNotification(!notification);
    toast("Notifications turned " + (!notification ? "on" : "off"));
    if (notification) {
      Notification.requestPermission();
      getToken(messaging, {
        vapidKey: "BEUMsiTmdQwloRT2EuaaIkLFMXXSvWTZxZTtPCorT64tuUL4de1Dh_sCaLd-ATz-SpW7TBARO-LeDZTav4uzb1I"
      }).then((currentToken) => {
        socket.emit('subscribe', currentToken, Cookies.get('room'), Cookies.get('room-pass'), Cookies.get('user-Id'))
      })
    }
    else {
      socket.emit('subscribe', Cookies.get('token'), Cookies.get('room'), Cookies.get('room-pass'), Cookies.get('user-Id'))
    }
  }

  const handleRemove = () => {
    socket.emit('leave-room', Cookies.get('room'))
    toast(`left ${Cookies.get('room-Id')} successfullyy`)
    socket.emit('user-left', Cookies.get('user-name'), Cookies.get('room'))
    Cookies.remove('room')
    socket.emit('clear-chat');
    soc.roomChatFetched = false;
    navigate('/room')

  }
  useEffect(() => {
    socket.on('usersTot', (room, totalUsers, users) => {
      if (Cookies.get('room') === room)
        setOnlineUsers(totalUsers);
      setUsers(users);
    })
    socket.on('show-typing', (name) => {
      setTimeout(() => {
        setTyping(false);
        setTyper('');
      }, 100);
      setTyping(true);
      setTyper(name);
    })
  }, [socket])
  useEffect(() => {
    getSubData();
  }, [])
  const getSubData = async () => {

    socket.emit('sub-users', Cookies.get('room'), Cookies.get('room-pass'));
    socket.on('sub-data', (data) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i] === Cookies.get('user-Id')) {
          setNotification(true);
          if (notification) {
            Notification.requestPermission();
            getToken(messaging, {
              vapidKey: "BEUMsiTmdQwloRT2EuaaIkLFMXXSvWTZxZTtPCorT64tuUL4de1Dh_sCaLd-ATz-SpW7TBARO-LeDZTav4uzb1I"
            }).then((currentToken) => {
              socket.emit('subscribe', currentToken, Cookies.get('room'), Cookies.get('room-pass'), Cookies.get('user-Id'))
            })
          }
          break;
        }
      }
    })
  }
  const handleDeleteRoom = () => {
    socket.emit('delete-room', Cookies.get('room'), Cookies.get('room-pass'), Cookies.get('user-Id'))
    showDelete();
  }
  return (
    <div className='contactCard'>
      {<h6> <span className='highlight'> {Cookies.get('room-Id')}</span></h6>}
      <div className='removeRoom'> {
        typing &&
        <div className="typing text-wrap">
          {window.screen.width > 760 && <i className="text-danger fa-solid fa-keyboard"></i>}
          {window.screen.width < 760 && <i className="text-danger fa-solid fa-mobile"></i>}
          <span>&nbsp;{typer} is typing...</span>

        </div>}

        {
          <button onClick={showUsers} className='users-button'>
            <i className="fa-solid fa-user-secret"></i>{onlineUsers}
          </button>
        }
        {userShow && <div className="user-list">
          {usersList.map((user, index) => {
            return <div key={index} className="user"><i className="fa-solid fa-user-secret"></i>&nbsp;{user}</div>
          })}
        </div>}
        {deleteShow &&
          <div className="modal delete-pop" data-backdrop="static" id='modal'>
            <div className="delete-pop-content">
              <div className="delete-pop-header">
                <h5>Are you sure you want to delete this room?</h5>
                <p className='text-danger'>
                  This action is irreversible.The chats and the room will be deleted permanently.
                </p>
              </div>
              <div className="delete-pop-body">
                <Button onClick={handleDeleteRoom} variant='danger'>Yes</Button>
                <Button onClick={showDelete} variant='success'>No</Button>
              </div>
            </div>

          </div>}
        {showButtons && <div className='btns-list'>
          {
            <button style={{ color: "red" }} onClick={showDelete} className='btn send users-button'>
              <i className="fa-solid fa-trash"></i>
            </button>
          }
          {
            <button className='btn send' title='bell' onClick={handleNotify}  >
              <i className={`${notification ? "fa-solid fa-bell" : "fa-solid fa-bell-slash"}`}></i>
            </button>
          }
          {
            <Button onClick={handleRemove} variant='light' className='btn send'>
              <i className="fa-solid fa-right-from-bracket"></i>
            </Button>
          }
        </div>}
        <button className='send ' onClick={() => { setShowButtons(!showButtons) }}>
          <i className="fa-solid fa-ellipsis-vertical"></i>
        </button>

      </div>
    </div>
  )

}

export default RoomName
