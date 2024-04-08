/* eslint-disable react-hooks/exhaustive-deps */
import Navbar from 'react-bootstrap/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import Cookies from 'js-cookie';
import {   useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useContext, useEffect} from 'react';
import socketContext from '../context/SocketContext';


function NavBar() {
  const navigate=useNavigate();
  const soc=useContext(socketContext);
  const socket=soc.socket
  useEffect(()=>{
  socket.on('log-out',()=>{
    Cookies.remove('token');
    Cookies.remove('user-name');
    Cookies.remove('user-Id');
    Cookies.remove('user-email');
    navigate('/login')
})},[socket,navigate])
  const handleRemove=()=>{
if(Cookies.get('room'))
    { socket.emit('leave-room',Cookies.get('room'))
    socket.emit('user-left', Cookies.get('user-name'),Cookies.get('room'))
    Cookies.remove('room')
    Cookies.remove('room-Id')
    Cookies.remove('room-Pass')
    socket.emit('clear-chat');}
    navigate('/room')
  }
  const history = useNavigate();

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('user-name');
    Cookies.remove('user-Id');
    Cookies.remove('user-email');
    history('/login')
  };
  useEffect(()=>{ 
    if(!Cookies.get('token'))
    {
      history('/login')
    }
  },[])
  return (
    <nav>
      <Navbar className="md-body-tertiary" >
        <Navbar.Brand >
          <Link to="/room">
          <div className="logo"></div>
          </Link>
        </Navbar.Brand>
            <div className='nav-options'>
              <Link to="/room" onClick={handleRemove} >
              <i className="fa-solid fa-person-booth"></i> &nbsp;Room
            </Link>     
            <Link to='/profile'>
            <i className="fa-regular fa-user"></i> &nbsp;{Cookies.get('user-name')}
            </Link>
                <Link onClick={handleLogout} to="/login">
                <i className="fa-solid fa-right-from-bracket"></i>&nbsp;
                Logout
                </Link>
                </div>
      </Navbar>
    </nav>
  );
}

export default NavBar;