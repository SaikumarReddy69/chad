/* eslint-disable react-hooks/exhaustive-deps */
import NavBar from './components/NavBar';
import "./App.css"
import Login from './components/Login';
import Register from './components/Register';
import {  Route, Routes } from 'react-router-dom';
import SocketState from './context/SocketState';
import Forgot from './components/Forgot';
import RoomChat from './components/RoomChat';
import Profile from './components/Profile';
import RoomInput from './components/RoomInput';
import SkeletonComponent from './components/SkeletonComponent';


function App() {
  return (
    <div className="App">
      <SocketState>

          <Routes>
        <Route exact path="/*" element={<>
            <NavBar/>
              <RoomInput />
            </>} />
            <Route exact path="/login" element={<Login />} />
            <Route exact path="/loading" element={<SkeletonComponent />} />
            <Route exact path="/register" element={<Register />} />
            <Route exact path="/forgot-pass/" element={<Forgot />} />
            <Route exact path="/profile/*" element={
              <>
            <NavBar/>
            <Profile />
            </>
            
            } />
            <Route exact path="/room/" element={<>
            <NavBar/>
              <RoomInput />
            </>} />
            <Route exact path="/room/joined" element={<RoomChat />} />


          </Routes>
      </SocketState>



    </div>
  );
}

export default App;
