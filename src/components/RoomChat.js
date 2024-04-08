/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useContext } from 'react';
import RoomName from './RoomName';
import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { toast, ToastContainer } from 'react-toastify';
import socketContext from '../context/SocketContext';
import AWS from 'aws-sdk';
import { useNavigate } from 'react-router';
import SkeletonComponent from './SkeletonComponent';
import 'react-loading-skeleton/dist/skeleton.css'
const RoomChat = () => {

  const REGION = process.env.REACT_APP_AWS_REGION;
  const navigate = useNavigate();
  const S3_BUCKET = process.env.REACT_APP_AWS_BUCKET;
  const text = "Load previous messages?";
  const [loading, setLoading] = useState(false);
  const currentTime = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata',
    hour12: false,
  });
  const hours = new Date(currentTime).getHours();
  const minutes = new Date(currentTime).getMinutes();
  const [replyingTo, setReplyingTo] = useState({ message: "", index: -1 });
  const [loaded, setLoaded] = useState(20);
  let tot = 20;
  const [allChat, setAllChat] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [roomDeleted, setRoomDeleted] = useState(false);
  const [deletedBy,setDeletedBy]=useState("");
  const loadRef = useRef(null);
  const showToast = (message) => {
    const id = toast.loading(message, {
      autoClose: false,
    });
    return id;
  }
  const removeToast = (id) => {
    toast.dismiss(id);
  }
  const [showtimer, setShowTimer] = useState(0);
  useEffect(() => {
    if (roomDeleted) {
      const interval = setInterval(() => {
        setShowTimer(showtimer - 1);
      }, 1000);
      if (showtimer <= 0) {
        setRoomDeleted(false);
        Cookies.remove('room')
        Cookies.remove('room-pass')
        Cookies.remove('room-Id')
        navigate('/');
      }
      return () => clearInterval(interval);
    }
  }, [showtimer]);
  const updateNameChat = () => {
    const now = new Date();
    const options = { timeZone: 'Asia/Kolkata' };
    const currentTimeIndia = now.toLocaleTimeString('en-US', options);
    const currentDateIndia=now.toLocaleDateString('en-US',options)
    try {
      socket.emit('room-chat', Cookies.get('room'), Cookies.get('room-pass'),("--- " + Cookies.get('user-name') + " joined at " + currentTimeIndia).toString() + ", "+currentDateIndia,name)
    } catch (error) {
      console.error("Error fetching chat data:", error);
    }
  }
  useEffect(() => {
    if (Cookies.get('room') && messages.length === 0) {
      socket.emit('room-join', Cookies.get('room-Id') + Cookies.get('room-pass'));
      setMessages([])
      setAllChat([])
      setLoaded(20);
      setHasMore(false);
      toast(`Joined ${Cookies.get('room-Id')} successfully`)
      socket.emit('chat-room-message')
      soc.roomChatFetched = false;
      socket.emit('user-joined-room', Cookies.get('user-Id'), Cookies.get('room-Id') + Cookies.get('room-pass'))
      updateNameChat()
    }
  }, [])
  const loadPrev = () => {
    let id = showToast("Loading previous messages...");
    if (loaded >= allChat.length) {
      setHasMore(false);
    }
    if (hasMore) {
      setLoaded(loaded + tot);
      setMessages((prev) => [...allChat.slice(Math.max(allChat.length - loaded - tot, 0), allChat.length - loaded), ...prev]);
    }
    removeToast(id);


  }

  AWS.config.update({
    accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
    region: REGION,
  });
  const s3 = new AWS.S3();
  const soc = useContext(socketContext);
  const socket = soc.socket
  const name = Cookies.get('user-Id');
  let [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const chatInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isReplying, setIsReplying] = useState(false);

  const handleIconClick = () => {
    if (Cookies.get('room'))
      fileInputRef.current.click();
  };
  const handleFileChange = async (event) => {
    const files = event.target.files;
    for (const file of files) {
      if (file) {
        const id = showToast("Uploading file...");
        const date = new Date().toISOString().replace(/:/g, '-');
        const params = {
          Bucket: S3_BUCKET,
          Key: date + '-' + file.name,
          Body: file,
          ContentType: file.type,
        };
        s3.upload(params, async (err, data) => {
          if (err) {
            toast.dismiss(id);
            socket.emit('grab',err)            
            return toast.error('Error uploading file to S3 ', err);
            
          }
          let type = data.Location.split('.').pop();
          let img = false;
          let vid = false;
          if (type === "mp4" || type === "webm" || type === "ogg") {
            img = true;
            socket.emit('chat-room-message', name + ":***vido", data.Location, Cookies.get('room'));
          }
          else if (type === "jpg" || type === "jpeg" || type === "png" || type === "gif") {
            vid = true;
            socket.emit('chat-room-message', name + ":***foto", data.Location, Cookies.get('room'));
          }
            let uptype=img ? "vid" : vid ? "img" : "text"
            let res=socket.emit('upload',Cookies.get('room'),Cookies.get('room-pass'),uptype,name,data.Location,);
            if(res.connected){
              socket.emit('scroll-message', "room", Cookies.get('room'));
              socket.emit('send-notification', Cookies.get('room'), Cookies.get('room-pass'), Cookies.get('room-Id'));
              removeToast(id);
              setMessage('');
            }
            else{
              toast.error("Failed to send message.");
            }

        });
      };
    }
  }
  let users = 0;

  useEffect(() => {
    socket.on('clear-all', () => {
      setMessages([])
      setAllChat([])
      setLoaded(20);
      setHasMore(false);
    })
    socket.on('send-message', async (receivedMessage, type) => {
      if (type === "room") {
        setMessages((prevMessages) => [...prevMessages, receivedMessage]);
        socket.emit('scroll-message', "room", Cookies.get('room'));

        socket.emit('scroll-message', "room", Cookies.get('room'));
      }
    });
    soc.roomChatFetched = false;
    socket.on('room-deleted', (user) => {
      setRoomDeleted(true);
      Cookies.remove('room')
      Cookies.remove('room-pass')
      Cookies.remove('room-Id')
      roomDelete();
      setDeletedBy(user);
      setShowTimer(5);
    });
    socket.on('user-success', async (uname, totalUsers) => {
      toast(uname + " has joined the chat")
      users = totalUsers
    })
    socket.on('user-left', (uname, totalUsers) => {
      toast(uname + " has left the chat")
      users = totalUsers
    })
    socket.on('chat-scroll', () => {
      const elem = document.querySelector(".chat .messageOut:last-child");
      if (elem)
        elem.scrollIntoView({ behavior: 'smooth' });

    });
    if (!soc.roomChatFetched) {
      try {
        setLoading(true);

        socket.emit('get-room-chat', Cookies.get('room'), Cookies.get('room-pass'),Cookies.get('user-Id'));
        socket.on('recieved-room-chat', (response) => {
            const data = response;
            setAllChat(data.chat)

            setMessages(data.chat.slice(Math.max(data.chat?.length - tot, 0), 
            data.chat?.length));
            setLoading(false);
            if (tot <= data.chat?.length) {
              setHasMore(true);
            }
            if (data?.chat?.length <= 1) {
              toast.warn("No chat found. Start chatting...")
            }
            socket.emit('scroll-message', "room", Cookies.get('room'));
        })
      } catch (error) {
        console.error("Error fetching chat data:", error);
      }
    }
    soc.roomChatFetched = true;
    return () => {
      socket.off('send-message');
      socket.off('room-chat');
      socket.off('user-success');
      socket.off('user-left');
      socket.off('chat-scroll');
    }
  }, []);
  const updateChat = async () => {
    try {
      const res=socket.emit('room-chat', Cookies.get('room'), Cookies.get('room-pass'),(name + ": " + message + `|${hours}:${minutes}`).toString(),name)
      if (res.connected) {
        setMessage('');
      } else {
        toast.error("Failed to send message.");
      }
    } catch (error) {
      toast.error("Failed to send message. ");
      console.error("Error fetching chat data:", error);
    }
  }
  const sendMessage = async () => {

    chatInputRef.current.value = "";
    if (Cookies.get('room')) {
      if (message) {
        let room = Cookies.get('room');
        if (isReplying) {
          if (getReplyObject(replyingTo.message) === null)
            message = "|$reply$|---|to|" + replyingTo.message + "|is| " + message;
          else
            message = "|$reply$|---|to|" + getMessageUsername(replyingTo.message) + ": " + getReplyObject(replyingTo.message).repliedMessage + "|" + getReplyObject(replyingTo.message).messageTime + "|is| " + message;
          setIsReplying(false);
        }
        socket.emit('chat-room-message', name, message + `|${hours}:${minutes}`, room
        );

        socket.emit('send-notification', Cookies.get('room'), Cookies.get('room-pass'), Cookies.get('room-Id'));
        setMessage('');
        updateChat();
      }
    }
    else {
      toast.info('Join a room first');
      chatInputRef.current.value = "";
    }
  };
  const getMessageUsername = (message) => {
    const colonIndex = message.indexOf(':');
    return colonIndex !== -1 ? message.substring(0, colonIndex) : '';
  };

  const getMessageText = (message) => {

    const colonIndex = message.indexOf(':');
    const pipeIndex = message.lastIndexOf('|');
    const trimmedMessage = pipeIndex !== -1 ? message.substring(0, pipeIndex) : message;
    let msg = colonIndex !== -1 ? trimmedMessage.substring(colonIndex + 1) : trimmedMessage;
    return msg;
  };
  const getMessageTime = (message) => {
    const pipeIndex = message.lastIndexOf('|');
    return pipeIndex !== -1 ? message.substring(pipeIndex + 1) : '';
  };

  const replyTo = (message, index) => () => {
    isReplying ? setIsReplying(false) : setIsReplying(true);
    chatInputRef.current.focus();
    
    setReplyingTo({ message: message, index: index });
  }

  const getReplyComponent = (message) => {
    let obj = getReplyObject(message)
    if(obj.message.startsWith("***foto")||obj.message.startsWith("***vido")
    ){
      return (
        <div className='reply-message'>
            <div className='msg'>
              <div className="username">
                <p><i className='fa-solid fa-reply'></i> &nbsp; Replied to<b>&nbsp;{obj.username}</b></p>
              </div>
              {getMediaComponent(obj.username+":"+obj.message)}
            </div>
          <div className='reply'>
            {obj.repliedMessage}
          </div>
        </div>
      )
    }
    else if(message.includes('***foto')||message.includes('***vido')){
      return(
        <div className='reply-message'>
          <div>
            <div className='msg'>
              <div className="username">
               <p> <i className='fa-solid fa-reply'></i> &nbsp; Replied to<b>&nbsp;{obj.username}</b></p>
              </div>
              {obj.message.substring(0,obj.message.indexOf('|'))}
            </div>
  
          </div>
          <div className='reply'>
            {obj.repliedMessage}
          </div>
        </div>
      )
    }
    return (
      <div className='reply-message'>
        <div>
          <div className='msg'>
            <div className="username">
              <p><i className='fa-solid fa-reply'></i> &nbsp; Replied to<b>&nbsp;{obj.username===name?"you":obj.username}</b></p>
            </div>
            {obj.message}
          </div>

        </div>
        <div className='reply'>
          {obj.repliedMessage}
        </div>
      </div>
    )

  }

  const getUserReplyComponent = (message) => {
    let obj = getReplyObject(message)
    if(obj.message.startsWith("***foto")||obj.message.startsWith("***vido")
    ){
      return (
        <div className='reply-message'>
          <div>
            <div className='msg'>
              <div className="username">
               <p> <i className='fa-solid fa-reply'></i> &nbsp; Replied to<b>&nbsp;{obj.username===name?"you":obj.username}</b></p>
              </div>
              {getMediaComponent(obj.username+":"+obj.message)}
              
              
            </div>
  
          </div>
          <div className='reply'>
            {obj.repliedMessage}
          </div>
        </div>
      )
    }
    else if(message.includes('***foto')||message.includes('***vido')){
      return(
        <div className='reply-message'>
          <div>
            <div className='msg'>
              <div className="username">
                <p><i className='fa-solid fa-reply'></i> &nbsp; Replied to<b>&nbsp;{obj.username}</b></p>
              </div>
              {obj.repliedMessage.substring(0,obj.repliedMessage.indexOf('|'))}
            </div>
  
          </div>
          <div className='reply'>
            {obj.repliedMessage}
          </div>
        </div>
      )
    }

    return (
      <div className='reply-message reply-user-message'>
        <div className='msg'>
          {obj.message}
        </div>
        <div className='reply'>
          {obj.repliedMessage}
        </div>
        <div className="username">
          <p><i className='fa-solid fa-reply'></i> &nbsp; replied to {obj.username===name?"you":obj.username}&nbsp;</p>
        </div>
      </div>
    )
  }

  function getReplyObject(inputString) {
    const regex = /\|\$reply\$\|---\|to\|(\w+): (.+)\|(\d+:\d+)\|is\| (.+)\|(\d+:\d+)/;
    let example=inputString;
    let match = inputString.match(regex)
    if(match===null){
      let user=example.substring(example.indexOf('|$reply$|---|to|')+16,example.indexOf('***')-1);
      let media=example.substring(example.indexOf('***'),example.indexOf('|is|'));

      if(media.startsWith("***foto")||media.startsWith("***vido")){
        let obj={
          username:user,
          message:media,
          repliedMessage:example.substring(example.indexOf('|is|')+4,example.lastIndexOf('|')),
          messageTime:example.substring(example.indexOf('|12:12')+1)
        }
        return obj
      }
      
    }
    if (match) {
      const [, username, message, messageTime, repliedMessage, repliedTime] = match;
      return {
        username,
        message,
        messageTime,
        repliedMessage,
        repliedTime
      };
    } else {
      return null;
    }
  }

  const getMediaComponent = (message) => {
    let user = message.substring(0, message.indexOf(':'));
    let media = message.substring(message.indexOf(':') + 1);
    if (media.startsWith("***foto")) {
      return (<div>
        <div className="attachment-send">
          {user}
        </div>
        <img
         src={media.substring(8)}
          className={`${String(user).startsWith(Cookies.get('user-Id')) ? "myAttachment" : "attachment"} d-block`} 
          alt="img" width={200} />
        <span className='attachment-send'>
        </span>
      </div>)
    }
    else if (media.startsWith("***vido")) {
      return (<div>
        <div className="attachment-send">
          {user}
        </div>
        <video height={160} width={200} className={`${String(user).startsWith(Cookies.get('user-Id')) ? "myAttachment" : "attachment"} d-block`} controls src={media.substring(8)}></video>
      </div>)
    }
    return (<>
    </>)
  }
  const getTypeOfMesage = (message) => {
    const msg = message.substring(message.indexOf(':') + 1);
    if (msg.startsWith("***foto") || msg.startsWith("***vido")) {
      return "media";
    }
    else if (message.startsWith("---")) {
      return "special";
    }
    else if (getReplyObject(message) !== null) {
      return "reply";
    }
    else {
      return "text";
    }
  }
  const showReply = (message) => {
    const type = getTypeOfMesage(message);
    if ( type === 'special' || message.startsWith(name)) {
      return false;
    }
    return true

  }
  const roomDelete=()=>{
    setRoomDeleted(!roomDeleted)
  }
  const getReplyContent = (message) => {
    const msg=(getReplyObject(message) == null) ? getMessageText(replyingTo.message) : getReplyObject(message).repliedMessage;
    if(msg.startsWith("***foto") || msg.startsWith("***vido")){
      return(
        <span>
          {getMediaComponent(message)}
        </span>
      )
    }



return(<>
{msg}
</>)
  }
  const inputComp=(      <div className="input">
  <textarea
    ref={chatInputRef}
    id="textFeld"
    rows={1}
    placeholder="Enter a message"
    onKeyDown={(e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    }}
    onChange={(e) => {
      setMessage(e.target.value)
      socket.emit('typing', name, Cookies.get('room'))
    }}
  />

  <input
    type="file"
    accept="image/*,video/*"
    ref={fileInputRef}
    style={{ display: 'none' }}
    onChange={handleFileChange}
    multiple
  />

  <button onClick={handleIconClick} className="btn send btn-dark">
    <i className="fa-solid fa-paperclip"></i>
  </button>
  <button onClick={sendMessage} className="btn send btn-dark">
    <i className="fa-solid fa-paper-plane"></i>
  </button>
</div>)

const messagesComp=(      <div className="messages">
{hasMore && (<div className="load-prev d-flex justify-content-center">
  <i onClick={loadPrev} ref={loadRef} className="border  fa-solid fa-plus"></i>
  {text}
</div>)}

<div className="chat"
>
  {
    messages.map((message, index) => (
      <div
        key={index}
        className='messageOut'
      >
        <div
          className={`${message.startsWith("---") ? "specialMessage" : "message"} ${message.startsWith(name) || messages[index - 1] === name ? "message-Out" : "message-In"}`}
        >
          {
            ((getTypeOfMesage(message) === 'media') &&
              getMediaComponent(message)) ||
            (message.startsWith("---") ? message.replace("---", "") :
              message === name + ":" || (message.endsWith(':') && messages[index + 1] && messages[index + 1].startsWith("***")) ? <span className='hide-this'></span> :
                message.startsWith(name) ?
                  ((
                    getReplyObject(message) !== null ?
                      getReplyComponent(message) :
                      <span className="message-text">
                        {getMessageText(message)}
                      </span>
                  )) : (
                    <div>
                      <div className="user-mess attachment-send">
                        <span className='username'>
                          {getMessageUsername(message)}
                        </span>
                      </div>
                      {
                        getReplyObject(message) !== null ?
                          getUserReplyComponent(message) :
                          <span className="message-text">{getMessageText(message)}</span>

                      }

                    </div>
                  )
            )
          }
        </div>
        {
          (showReply(message) && <button onClick={replyTo(message, index)} className='reply-button'>
            <i className="fa fa-reply " aria-hidden="true"></i>
          </button>)}

        {!message.startsWith(name) && <span className="time-mess">
          {getMessageTime(message)}
        </span>}
      </div>
    ))


  }

</div>
</div>)

const RoomDeleteComp=(
<div className="modal delete-pop" data-backdrop="static" id='modal'>
  <div className="delete-pop-content">
    <div className="delete-pop-header">
      <div className="timer d-flex justify-content-center m-4">
        <div className="time">
          {showtimer}
        </div>
      </div>
      <p className='text-danger'>
        This room was Deleted by {deletedBy}. You will be redirected to the home page in 5 seconds.
      </p>
    </div>
  </div>

</div>)
  return (
    <div className={`RoomChat ${!Cookies.get('room')?'room-joined':"not-joined"}`} >
      <RoomName type="room" users={users} />      
      {loading && <SkeletonComponent/>}
      {messagesComp}
      {roomDeleted && RoomDeleteComp}

      {isReplying &&
        <div className="replying-to">
          <span className="badge badge-info user-name-badge">
            {getMessageUsername(replyingTo.message)}
          </span>
          <span>
            {getReplyContent(replyingTo.message)}
          </span>
          <button onClick={() => setIsReplying(false)} className="btn-cancel-reply">
            X
          </button>
        </div>}
        {inputComp}  
      <ToastContainer limit={3} theme='dark' />

    </div>

  );
};
export default RoomChat;