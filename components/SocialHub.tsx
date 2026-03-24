import React, { useState, useRef, useEffect } from 'react';
import { Post, ChatMessage, User, PlanType, Comment, Contact } from '../types';
import { PLAN_FEATURES } from '../constants';
import { HeartIcon, ChatIcon, ShareIcon, CameraIcon, VideoIcon, SendIcon, CheckIcon, MapPinIcon } from './Icons';
import { playSound } from '../services/audioService';

// --- Icons specific to this component ---
const MicIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
  </svg>
);

const StopIcon = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" />
  </svg>
);

const AddUserIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
    </svg>
);

interface SocialHubProps {
  currentUser: User;
  onPostCreated: () => void;
}

const PlanBadge: React.FC<{ plan?: PlanType }> = ({ plan }) => {
    if (!plan || plan === 'free') return null;
    const badge = PLAN_FEATURES[plan]?.badge;
    if (!badge) return null;
    return <span className="mr-1 text-sm" title={plan}>{badge}</span>;
};

const SocialHub: React.FC<SocialHubProps> = ({ currentUser, onPostCreated }) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'public_chat' | 'private_chat'>('feed');
  
  // --- Feed State (Starts Empty) ---
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');

  // --- Public Chat State (Starts Empty) ---
  const [publicMessages, setPublicMessages] = useState<ChatMessage[]>([]);
  const [publicInputMsg, setPublicInputMsg] = useState('');

  // --- Private Chat State (Starts Empty) ---
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [privateInputMsg, setPrivateInputMsg] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [privateMessages, setPrivateMessages] = useState<Record<string, ChatMessage[]>>({});

  // --- Media Refs ---
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // --- Helpers for Media ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
      const file = e.target.files?.[0];
      if (!file) return;

      const url = URL.createObjectURL(file);
      
      const newMsg: ChatMessage = {
          id: Date.now().toString(),
          sender: currentUser.name,
          senderId: currentUser.id,
          text: '',
          mediaUrl: url,
          timestamp: new Date(),
          isMe: true,
          type: type,
          plan: currentUser.subscriptionPlan
      };

      playSound('send');

      if (activeTab === 'public_chat') {
          setPublicMessages(prev => [...prev, newMsg]);
      } else if (activeTab === 'private_chat' && selectedContact) {
          sendPrivateMsgObj(newMsg, selectedContact.id);
      }
      
      // Reset input
      e.target.value = '';
  };

  const startRecording = async () => {
    playSound('click');
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            
            const newMsg: ChatMessage = {
                id: Date.now().toString(),
                sender: currentUser.name,
                senderId: currentUser.id,
                text: '',
                mediaUrl: audioUrl,
                timestamp: new Date(),
                isMe: true,
                type: 'audio',
                plan: currentUser.subscriptionPlan
            };

            playSound('send');
            if (activeTab === 'public_chat') {
                setPublicMessages(prev => [...prev, newMsg]);
            } else if (activeTab === 'private_chat' && selectedContact) {
                sendPrivateMsgObj(newMsg, selectedContact.id);
            }
        };

        mediaRecorder.start();
        setIsRecording(true);
    } catch (err) {
        console.error("Error accessing microphone:", err);
        alert("لا يمكن الوصول للميكروفون. تأكد من الصلاحيات.");
    }
  };

  const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
          // Stop all tracks
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
  };

  const handleLocationShare = () => {
      playSound('click');
      if (!navigator.geolocation) {
          alert('خدمة تحديد الموقع غير مدعومة في متصفحك.');
          return;
      }
      
      navigator.geolocation.getCurrentPosition(
          (position) => {
              const { latitude, longitude } = position.coords;
              const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
              const textDisplay = `موقعي: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
              
              const newMsg: ChatMessage = {
                  id: Date.now().toString(),
                  sender: currentUser.name,
                  senderId: currentUser.id,
                  text: textDisplay,
                  mediaUrl: mapUrl,
                  timestamp: new Date(),
                  isMe: true,
                  type: 'location',
                  plan: currentUser.subscriptionPlan
              };

              playSound('success');
              setTimeout(() => playSound('send'), 400);

              if (activeTab === 'public_chat') {
                  setPublicMessages(prev => [...prev, newMsg]);
              } else if (activeTab === 'private_chat' && selectedContact) {
                  sendPrivateMsgObj(newMsg, selectedContact.id);
              }
          },
          (error) => {
              console.error("Error getting location", error);
              playSound('error');
              alert('تعذر تحديد الموقع. يرجى التحقق من الصلاحيات.');
          }
      );
  };

  // --- Logic ---

  const handlePostSubmit = () => {
    if (!newPostContent.trim()) return;
    if (currentUser.dailyPostsRemaining <= 0) {
        playSound('error');
        alert("تجاوزت الحد اليومي للنشر. يرجى الاشتراك لزيادة الحد.");
        return;
    }
    const newPost: Post = {
        id: Date.now().toString(),
        author: currentUser.name,
        authorHandle: currentUser.username,
        content: newPostContent,
        likes: 0,
        isLiked: false,
        commentsCount: 0,
        commentsList: [],
        avatar: currentUser.avatar,
        timeAgo: 'الآن',
        plan: currentUser.subscriptionPlan
    };
    setPosts([newPost, ...posts]);
    setNewPostContent('');
    playSound('send');
    onPostCreated();
  };

  const handleLike = (postId: string) => {
    playSound('pop');
    setPosts(posts.map(post => post.id === postId ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked } : post));
  };

  const handleCommentSubmit = (postId: string) => {
    if (!newCommentText.trim()) return;
    setPosts(posts.map(post => {
        if (post.id === postId) {
            const newComment: Comment = {
                id: Date.now().toString(),
                author: currentUser.name,
                text: newCommentText,
                timestamp: new Date()
            };
            return { ...post, commentsCount: post.commentsCount + 1, commentsList: [newComment, ...(post.commentsList || [])] };
        }
        return post;
    }));
    setNewCommentText('');
    playSound('send');
  };

  const handleSendPublicMessage = () => {
    if (!publicInputMsg.trim()) return;
    const newMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: currentUser.name,
        text: publicInputMsg,
        timestamp: new Date(),
        isMe: true,
        type: 'text',
        plan: currentUser.subscriptionPlan
    };
    setPublicMessages([...publicMessages, newMsg]);
    setPublicInputMsg('');
    playSound('send');
  };

  // Helper to send message in private chat
  const sendPrivateMsgObj = (msg: ChatMessage, contactId: string) => {
      setPrivateMessages(prev => ({
          ...prev,
          [contactId]: [...(prev[contactId] || []), msg]
      }));
      
      const lastMsgText = msg.type === 'text' ? (msg.text || '') : 
                          msg.type === 'image' ? '📷 صورة' :
                          msg.type === 'video' ? '🎥 فيديو' : 
                          msg.type === 'location' ? '📍 موقع' : '🎤 رسالة صوتية';

      setContacts(prev => prev.map(c => c.id === contactId ? { ...c, lastMessage: 'أنت: ' + lastMsgText, time: 'الآن' } : c));
  }

  const handleSendPrivateMessage = () => {
      if (!privateInputMsg.trim() || !selectedContact) return;
      
      const newMsg: ChatMessage = {
          id: Date.now().toString(),
          sender: currentUser.name,
          senderId: currentUser.id,
          text: privateInputMsg,
          timestamp: new Date(),
          isMe: true,
          type: 'text'
      };

      sendPrivateMsgObj(newMsg, selectedContact.id);
      setPrivateInputMsg('');
      playSound('send');

      // Simulate Reply from random user
      setTimeout(() => {
          const replyText = "أهلاً! وصلتني رسالتك.";
          const replyMsg: ChatMessage = {
              id: Date.now().toString(),
              sender: selectedContact.name,
              senderId: selectedContact.id,
              text: replyText,
              timestamp: new Date(),
              isMe: false,
              type: 'text'
          };
          setPrivateMessages(prev => ({
            ...prev,
            [selectedContact.id]: [...(prev[selectedContact.id] || []), replyMsg]
          }));
           setContacts(prev => prev.map(c => c.id === selectedContact.id ? { ...c, lastMessage: replyText, time: 'الآن' } : c));
           playSound('notification');
      }, 2000);
  };

  // Simulate finding a friend
  const findFriend = () => {
      playSound('click');
      const names = ["أحمد", "منى", "زياد", "ليلى", "عمر"];
      const randName = names[Math.floor(Math.random() * names.length)];
      const newContact: Contact = {
          id: Date.now().toString(),
          name: `${randName}_${Math.floor(Math.random() * 100)}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${randName + Date.now()}`,
          lastMessage: 'انضم للمحادثة',
          time: 'الآن',
          unread: 0,
          isOnline: true
      };
      setContacts([...contacts, newContact]);
      // Auto select to start chatting
      setSelectedContact(newContact);
      playSound('success');
  };

  const renderMessageContent = (msg: ChatMessage) => {
      switch(msg.type) {
          case 'image':
              return <img src={msg.mediaUrl} alt="sent" className="rounded-lg max-w-full max-h-64 object-cover border border-gray-200" />;
          case 'video':
              return <video src={msg.mediaUrl} controls className="rounded-lg max-w-full max-h-64 border border-gray-200" />;
          case 'audio':
              return <audio src={msg.mediaUrl} controls className="max-w-full h-10 mt-1" />;
          case 'location':
              return (
                  <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors no-underline">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                          <MapPinIcon className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-800">موقع جغرافي</span>
                          <span className="text-[10px] text-gray-500 underline">عرض على الخريطة</span>
                      </div>
                  </a>
              );
          default:
              return <span>{msg.text}</span>;
      }
  };

  const handleTabChange = (tab: 'feed' | 'public_chat' | 'private_chat') => {
      playSound('click');
      setActiveTab(tab);
      setSelectedContact(null);
  };

  // --- Render ---

  return (
    <div className="h-full flex flex-col bg-secondary">
        
      {/* Hidden Inputs for Media */}
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={imageInputRef} 
        onChange={(e) => handleFileSelect(e, 'image')}
      />
      <input 
        type="file" 
        accept="video/*" 
        className="hidden" 
        ref={videoInputRef} 
        onChange={(e) => handleFileSelect(e, 'video')}
      />

      {/* Top Tabs */}
      <div className="flex bg-white sticky top-0 z-20 shadow-sm px-2 pt-2">
        <button 
            onClick={() => handleTabChange('feed')}
            className={`flex-1 pb-3 text-sm font-bold text-center transition border-b-2 ${activeTab === 'feed' ? 'text-primary border-primary' : 'text-gray-400 border-transparent'}`}
        >
            المنشورات
        </button>
        <button 
            onClick={() => handleTabChange('public_chat')}
            className={`flex-1 pb-3 text-sm font-bold text-center transition border-b-2 ${activeTab === 'public_chat' ? 'text-primary border-primary' : 'text-gray-400 border-transparent'}`}
        >
            العامة
        </button>
        <button 
            onClick={() => handleTabChange('private_chat')}
            className={`flex-1 pb-3 text-sm font-bold text-center transition border-b-2 ${activeTab === 'private_chat' ? 'text-primary border-primary' : 'text-gray-400 border-transparent'}`}
        >
            الخاص
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar relative">
        
        {/* --- FEED TAB --- */}
        {activeTab === 'feed' && (
            <div className="p-4 space-y-6">
                {/* Create Post */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex gap-3 mb-3">
                        <img src={currentUser.avatar} className="w-10 h-10 rounded-full bg-gray-100" />
                        <textarea 
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            placeholder={`شارك أفكارك...`}
                            className="flex-1 bg-gray-50 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none h-12 transition-all focus:h-24"
                        />
                    </div>
                    <div className="flex justify-end items-center px-1">
                        <button 
                            onClick={handlePostSubmit}
                            className="bg-primary text-white px-5 py-1.5 rounded-full text-xs font-bold hover:bg-primary-dark transition shadow-lg shadow-blue-100 flex items-center gap-1"
                        >
                            <SendIcon className="w-3 h-3 rotate-180" />
                            نشر
                        </button>
                    </div>
                </div>

                {posts.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <SendIcon className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="font-bold">لا توجد منشورات حتى الآن</p>
                        <p className="text-xs mt-1">كن أول من يشارك!</p>
                    </div>
                ) : (
                    posts.map(post => (
                        <div key={post.id} className="bg-white p-5 rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-gray-50 animate-fade-in">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <img src={post.avatar} alt="author" className="w-10 h-10 rounded-full bg-gray-100" />
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-900 flex items-center">
                                            {post.author}
                                            <PlanBadge plan={post.plan} />
                                        </h4>
                                        <span className="text-xs text-gray-400 block">{post.authorHandle} • {post.timeAgo}</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-700 mb-4 text-sm leading-relaxed">{post.content}</p>
                            
                            <div className="flex gap-6 border-t border-gray-50 pt-3">
                                <button onClick={() => handleLike(post.id)} className={`flex items-center gap-2 transition text-xs font-bold ${post.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}>
                                    <HeartIcon className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} /> {post.likes}
                                </button>
                                <button onClick={() => { playSound('click'); setExpandedPostId(expandedPostId === post.id ? null : post.id); }} className={`flex items-center gap-2 transition text-xs font-bold ${expandedPostId === post.id ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}>
                                    <ChatIcon className="w-4 h-4" /> {post.commentsCount}
                                </button>
                            </div>

                            {expandedPostId === post.id && (
                                <div className="mt-4 pt-4 border-t border-gray-50 animate-fade-in">
                                    <div className="space-y-3 mb-4">
                                        {post.commentsList && post.commentsList.map(comment => (
                                            <div key={comment.id} className="bg-gray-50 p-3 rounded-xl">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-bold text-xs text-gray-900">{comment.author}</span>
                                                    <span className="text-[10px] text-gray-400">الآن</span>
                                                </div>
                                                <p className="text-sm text-gray-700">{comment.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <input type="text" value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} placeholder="اكتب تعليقاً..." className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary" onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(post.id)} />
                                        <button onClick={() => handleCommentSubmit(post.id)} className="text-primary font-bold text-xs hover:bg-blue-50 px-3 rounded-lg">إرسال</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        )}

        {/* --- PUBLIC CHAT TAB --- */}
        {activeTab === 'public_chat' && (
            <div className="flex flex-col h-full bg-slate-50">
                <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                    {publicMessages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-50">
                            <ChatIcon className="w-12 h-12 mb-2" />
                            <p className="text-sm font-bold">ابدأ الدردشة مع الجميع!</p>
                        </div>
                    )}
                    {publicMessages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.isMe ? 'justify-start' : 'justify-end'}`}>
                            {!msg.isMe && (
                                <div className="ml-2 flex-shrink-0">
                                     <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                         {msg.sender[0]}
                                     </div>
                                </div>
                            )}
                            <div className={`max-w-[80%] p-3 shadow-sm text-sm ${
                                msg.isMe 
                                    ? 'bg-primary text-white rounded-2xl rounded-tr-none' 
                                    : 'bg-white text-gray-800 rounded-2xl rounded-tl-none border border-gray-100'
                                }`}>
                                {!msg.isMe && (
                                    <p className="text-[10px] font-bold opacity-70 mb-1 text-primary flex items-center">
                                        {msg.sender}
                                        <PlanBadge plan={msg.plan} />
                                    </p>
                                )}
                                {renderMessageContent(msg)}
                                <div className={`text-[9px] mt-1 text-right ${msg.isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                    {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Public Chat Input Area with Media */}
                <div className="p-3 bg-white border-t border-gray-100 flex gap-2 sticky bottom-0 items-center">
                    <button onClick={() => { playSound('click'); imageInputRef.current?.click(); }} className="p-2 text-gray-400 hover:text-primary transition rounded-full hover:bg-gray-50">
                        <CameraIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => { playSound('click'); videoInputRef.current?.click(); }} className="p-2 text-gray-400 hover:text-primary transition rounded-full hover:bg-gray-50">
                        <VideoIcon className="w-5 h-5" />
                    </button>
                    <button onClick={handleLocationShare} className="p-2 text-gray-400 hover:text-primary transition rounded-full hover:bg-gray-50">
                        <MapPinIcon className="w-5 h-5" />
                    </button>
                    <button onClick={isRecording ? stopRecording : startRecording} className={`p-2 transition rounded-full ${isRecording ? 'text-red-500 animate-pulse bg-red-50' : 'text-gray-400 hover:text-primary hover:bg-gray-50'}`}>
                        {isRecording ? <StopIcon className="w-5 h-5" /> : <MicIcon className="w-5 h-5" />}
                    </button>

                    <input 
                        type="text" 
                        value={publicInputMsg}
                        onChange={(e) => setPublicInputMsg(e.target.value)}
                        placeholder="اكتب رسالة عامة..."
                        className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                        onKeyDown={(e) => e.key === 'Enter' && handleSendPublicMessage()}
                    />
                    <button onClick={handleSendPublicMessage} className="p-3 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition shadow-md">
                        <SendIcon className="w-4 h-4 rotate-180" />
                    </button>
                </div>
            </div>
        )}

        {/* --- PRIVATE CHAT TAB --- */}
        {activeTab === 'private_chat' && (
            <div className="h-full bg-white">
                {!selectedContact ? (
                    // Contact List View
                    <div className="p-4 animate-fade-in flex flex-col h-full">
                        <div className="flex justify-between items-center mb-4 px-2">
                             <h3 className="font-bold text-gray-800">الرسائل</h3>
                             <button onClick={findFriend} className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-bold hover:bg-primary/20 transition">
                                <AddUserIcon className="w-4 h-4" />
                                بحث عن أصدقاء
                             </button>
                        </div>
                        
                        {contacts.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 opacity-60">
                                <ChatIcon className="w-16 h-16 mb-4 text-gray-300" />
                                <p className="font-bold mb-2">قائمة الرسائل فارغة</p>
                                <p className="text-xs text-center max-w-[200px]">اضغط على "بحث عن أصدقاء" للبدء في محادثة جديدة</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {contacts.map(contact => (
                                    <div 
                                        key={contact.id} 
                                        onClick={() => { playSound('click'); setSelectedContact(contact); }}
                                        className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 cursor-pointer transition border border-transparent hover:border-gray-100"
                                    >
                                        <div className="relative">
                                            <img src={contact.avatar} className="w-14 h-14 rounded-full bg-gray-100 object-cover" />
                                            {contact.isOnline && <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <h4 className="font-bold text-gray-900 flex items-center gap-1">
                                                    {contact.name}
                                                    {contact.role === 'support' && <CheckIcon className="w-3 h-3 text-blue-500" />}
                                                </h4>
                                                <span className="text-[10px] text-gray-400">{contact.time}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className={`text-xs truncate ${contact.unread > 0 ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>
                                                    {contact.lastMessage}
                                                </p>
                                                {contact.unread > 0 && (
                                                    <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                                                        {contact.unread}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    // Chat Conversation View
                    <div className="flex flex-col h-full animate-slide-up">
                        {/* Chat Header */}
                        <div className="p-3 border-b border-gray-100 flex items-center gap-3 bg-white shadow-sm z-10">
                            <button onClick={() => { playSound('click'); setSelectedContact(null); }} className="p-2 hover:bg-gray-100 rounded-full">
                                <SendIcon className="w-5 h-5 text-gray-600 rotate-0" />
                            </button>
                            <img src={selectedContact.avatar} className="w-10 h-10 rounded-full" />
                            <div>
                                <h4 className="font-bold text-sm text-gray-900">{selectedContact.name}</h4>
                                <span className="text-[10px] text-green-500 font-medium">متصل الآن</span>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                            {(privateMessages[selectedContact.id] || []).map(msg => (
                                <div key={msg.id} className={`flex ${msg.isMe ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`max-w-[75%] p-3 shadow-sm text-sm leading-relaxed ${
                                        msg.isMe 
                                            ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none' 
                                            : 'bg-white text-gray-800 rounded-2xl rounded-tl-none border border-gray-100'
                                        }`}>
                                        {renderMessageContent(msg)}
                                        <div className={`text-[9px] mt-1 text-right ${msg.isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                                            {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Private Input Area with Media */}
                        <div className="p-3 bg-white border-t border-gray-100 flex gap-2 sticky bottom-0 items-center">
                            <button onClick={() => { playSound('click'); imageInputRef.current?.click(); }} className="p-2 text-gray-400 hover:text-primary transition rounded-full hover:bg-gray-50">
                                <CameraIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => { playSound('click'); videoInputRef.current?.click(); }} className="p-2 text-gray-400 hover:text-primary transition rounded-full hover:bg-gray-50">
                                <VideoIcon className="w-5 h-5" />
                            </button>
                            <button onClick={handleLocationShare} className="p-2 text-gray-400 hover:text-primary transition rounded-full hover:bg-gray-50">
                                <MapPinIcon className="w-5 h-5" />
                            </button>
                            <button onClick={isRecording ? stopRecording : startRecording} className={`p-2 transition rounded-full ${isRecording ? 'text-red-500 animate-pulse bg-red-50' : 'text-gray-400 hover:text-primary hover:bg-gray-50'}`}>
                                {isRecording ? <StopIcon className="w-5 h-5" /> : <MicIcon className="w-5 h-5" />}
                            </button>

                            <input 
                                type="text" 
                                value={privateInputMsg}
                                onChange={(e) => setPrivateInputMsg(e.target.value)}
                                placeholder="اكتب رسالة..."
                                className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                                onKeyDown={(e) => e.key === 'Enter' && handleSendPrivateMessage()}
                            />
                            <button onClick={handleSendPrivateMessage} className="p-3 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition shadow-md">
                                <SendIcon className="w-4 h-4 rotate-180" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )}

      </div>
    </div>
  );
};

export default SocialHub;