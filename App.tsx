import React, { useState } from 'react';
import { User, ViewState, Achievement, PlanType, Notification } from './types';
import { MOCK_USER, PLAN_FEATURES } from './constants';
import MathGame from './components/MathGame';
import SocialHub from './components/SocialHub';
import WalletModal from './components/WalletModal';
import SupportBot from './components/SupportBot';
import { TermsPage, PrivacyPage } from './components/LegalPages';
import { playSound } from './services/audioService';
import { 
  HomeIcon, GameIcon, ChatIcon, SupportIcon, ProfileIcon, 
  SettingsIcon, WalletIcon, TrophyIcon, XMarkIcon, CheckIcon,
  BellIcon, FireIcon, StarIcon, MedalIcon, MapPinIcon, ShareIcon
} from './components/Icons';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.LOGIN);
  const [showSettings, setShowSettings] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [hasNotification, setHasNotification] = useState(false);

  // Edit Profile States
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');

  // Notifications - Started Empty/Clean
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Auth States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) return;
    playSound('click');

    // Create FRESH user
    setTimeout(() => {
        const defaultPlan: PlanType = 'free';
        setCurrentUser({
            ...MOCK_USER, // Use the empty template
            id: Date.now().toString(),
            name: regName,
            username: `@${regName.split(' ')[0].toLowerCase()}_${Math.floor(Math.random() * 1000)}`,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${regName}`,
            wins: 0,
            losses: 0,
            level: 1,
            streak: 0,
            xp: 0,
            subscriptionPlan: defaultPlan,
            dailyPostsRemaining: PLAN_FEATURES[defaultPlan].maxPosts,
            dailyGamesRemaining: PLAN_FEATURES[defaultPlan].maxGames,
            achievements: [] // Start with no achievements
        });
        
        playSound('success');

        // Add one welcome notification
        const welcomeNotif: Notification = { 
            id: '1', 
            type: 'system', 
            title: 'مرحباً بك!', 
            message: 'تم إنشاء حسابك بنجاح. ابدأ التحدي الآن!', 
            time: 'الآن', 
            read: false, 
            icon: '👋' 
        };
        setNotifications([welcomeNotif]);
        setHasNotification(true);
        playSound('notification');
        
        setCurrentView(ViewState.HOME);
    }, 800);
  };

  const handleSaveProfile = () => {
      playSound('success');
      if (currentUser) {
          setCurrentUser({
              ...currentUser, 
              name: editName.trim() || currentUser.name,
              location: editLocation.trim() || currentUser.location
          });
      }
      setShowEditProfile(false);
  };

  const handleRandomizeAvatar = () => {
      playSound('pop');
      if (currentUser) {
          const randomSeed = Math.random().toString(36).substring(7);
          setCurrentUser({...currentUser, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`});
      }
  };

  const openEditProfile = () => {
      playSound('click');
      if (currentUser) {
          setEditName(currentUser.name);
          setEditLocation(currentUser.location);
          setShowEditProfile(true);
      }
  }

  const handleGetCurrentLocation = () => {
      playSound('click');
      if (!navigator.geolocation) {
          alert('Geolocation is not supported by your browser');
          return;
      }
      navigator.geolocation.getCurrentPosition((position) => {
          const { latitude, longitude } = position.coords;
          // Simple representation for now since we don't have a paid geocoding API key
          setEditLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
          playSound('success');
      }, (err) => {
          console.error(err);
          playSound('error');
      });
  }

  const handleShareApp = async () => {
      playSound('click');
      const shareData = {
          title: 'Challenges - تحديات',
          text: 'انضم إلي في تطبيق التحديات الرياضية الممتع! تنافس وحل الألغاز.',
          url: 'https://ai.studio/apps/drive/1n2HFmRXFpWVmLwapYQUGvQG0B1eyTFXW?fullscreenApplet=true'
      };

      if (navigator.share) {
          try {
              await navigator.share(shareData);
              playSound('success');
          } catch (err) {
              console.log('Error sharing:', err);
          }
      } else {
          try {
              await navigator.clipboard.writeText(shareData.url);
              alert('تم نسخ رابط التطبيق للحافظة بنجاح!');
              playSound('success');
          } catch (err) {
              console.error('Could not copy text: ', err);
              playSound('error');
          }
      }
  };

  const handleWin = () => {
    if (!currentUser) return;
    setCurrentUser({ 
        ...currentUser, 
        wins: currentUser.wins + 1, 
        streak: currentUser.streak + 1,
        xp: currentUser.xp + 50 
    });
  };

  const handleLoss = () => {
    if (!currentUser) return;
    setCurrentUser({ ...currentUser, losses: currentUser.losses + 1, streak: 0 });
  };

  const handleLevelUp = () => {
    if (!currentUser) return;
    setCurrentUser({ ...currentUser, level: currentUser.level + 1 });
  };
  
  const handleGamePlayed = () => {
    if (!currentUser) return;
    setCurrentUser({ ...currentUser, dailyGamesRemaining: currentUser.dailyGamesRemaining - 1 });
  };

  const handlePostCreated = () => {
    if (!currentUser) return;
    setCurrentUser({ ...currentUser, dailyPostsRemaining: currentUser.dailyPostsRemaining - 1 });
  }

  const handleUpgrade = (plan: PlanType) => {
      if (!currentUser) return;
      setCurrentUser({
          ...currentUser,
          subscriptionPlan: plan,
          dailyPostsRemaining: PLAN_FEATURES[plan].maxPosts,
          dailyGamesRemaining: PLAN_FEATURES[plan].maxGames,
      });
  }

  const markNotificationsRead = () => {
      setNotifications(notifications.map(n => ({...n, read: true})));
      setHasNotification(false);
      playSound('click');
  }

  const handleNavClick = (view: ViewState) => {
      playSound('click');
      setCurrentView(view);
      setShowSettings(false);
  };

  const NavButton: React.FC<{ view: ViewState; icon: React.ReactNode; label: string }> = ({ view, icon, label }) => (
    <button
      onClick={() => handleNavClick(view)}
      className={`relative flex flex-col items-center justify-center w-full py-2 transition-all duration-300 group`}
    >
      <div className={`p-2 rounded-2xl mb-1 transition-all duration-300 ${currentView === view ? 'bg-primary text-white shadow-lg shadow-blue-200 -translate-y-2' : 'text-gray-400 group-hover:text-primary group-hover:bg-blue-50'}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold transition-all ${currentView === view ? 'text-primary opacity-100' : 'text-gray-400 opacity-0 group-hover:opacity-100'}`}>{label}</span>
    </button>
  );

  const NotificationsView = () => (
      <div className="p-6 pb-24 animate-fade-in">
          <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">الإشعارات</h2>
              <button onClick={() => handleNavClick(ViewState.HOME)} className="bg-gray-100 p-2 rounded-full">
                  <XMarkIcon className="w-5 h-5 text-gray-600" />
              </button>
          </div>
          {notifications.length === 0 ? (
              <div className="text-center text-gray-400 mt-20">
                  <p>لا توجد إشعارات جديدة</p>
              </div>
          ) : (
            <div className="space-y-3">
                {notifications.map(notif => (
                    <div key={notif.id} className={`p-4 rounded-2xl flex items-start gap-3 transition-colors ${notif.read ? 'bg-white' : 'bg-blue-50 border border-blue-100'}`}>
                        <div className="text-2xl">{notif.icon}</div>
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-sm mb-0.5">{notif.title}</h4>
                            <p className="text-gray-600 text-xs leading-relaxed">{notif.message}</p>
                            <span className="text-[10px] text-gray-400 mt-2 block">{notif.time}</span>
                        </div>
                        {!notif.read && <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>}
                    </div>
                ))}
            </div>
          )}
      </div>
  );

  const SettingsPanel = () => (
      <div className="p-6 space-y-6 animate-fade-in">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <SettingsIcon className="w-8 h-8 text-primary" />
            الإعدادات
          </h2>
          
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
              <span className="font-bold text-gray-700">الوضع الليلي</span>
              <button 
                onClick={() => { setIsDarkMode(!isDarkMode); playSound('click'); }}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-primary' : 'bg-gray-300'}`}
              >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${isDarkMode ? '-translate-x-6' : 'translate-x-0'}`} />
              </button>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
              <span className="font-bold text-gray-700">اللغة</span>
              <select className="bg-gray-50 border-none rounded-lg text-sm font-bold text-gray-600 p-2 outline-none" onChange={() => playSound('click')}>
                  <option>العربية</option>
                  <option>English</option>
              </select>
          </div>
          
          <button 
            onClick={handleShareApp}
            className="w-full bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center transition hover:shadow-md hover:border-primary/30 group"
          >
              <span className="font-bold text-gray-700 group-hover:text-primary transition-colors">مشاركة التطبيق مع الأصدقاء</span>
              <div className="bg-blue-50 p-2 rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <ShareIcon className="w-5 h-5" />
              </div>
          </button>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-700 mb-3">قانوني</h3>
              <div className="space-y-2">
                <button 
                    onClick={() => { handleNavClick(ViewState.TERMS); }}
                    className="w-full text-right text-sm text-gray-600 hover:text-primary transition py-1"
                >
                    شروط الاستخدام
                </button>
                <div className="h-px bg-gray-50"></div>
                <button 
                    onClick={() => { handleNavClick(ViewState.PRIVACY); }}
                    className="w-full text-right text-sm text-gray-600 hover:text-primary transition py-1"
                >
                    سياسة الخصوصية
                </button>
              </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-700 mb-3">حول التطبيق</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                  نسخة التطبيق: 2.4.0<br/>
                  تم التطوير بواسطة Jacob Alcadi Apps
              </p>
          </div>
          
          <button 
            onClick={() => { playSound('error'); setCurrentUser(null); setCurrentView(ViewState.LOGIN); setShowSettings(false); }}
            className="w-full py-4 bg-red-50 text-red-500 font-bold rounded-xl hover:bg-red-100 transition flex items-center justify-center gap-2"
          >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              تسجيل الخروج
          </button>
      </div>
  );

  const EditProfileModal = () => (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-6 relative">
              <button 
                onClick={() => { playSound('click'); setShowEditProfile(false); }}
                className="absolute top-4 left-4 bg-gray-100 p-2 rounded-full hover:bg-gray-200"
              >
                  <XMarkIcon className="w-5 h-5" />
              </button>
              
              <h3 className="text-xl font-bold text-center mb-6">تعديل الملف الشخصي</h3>
              
              <div className="flex flex-col items-center mb-6">
                  <div className="relative w-24 h-24 mb-3">
                      <img src={currentUser?.avatar} className="w-full h-full rounded-full bg-gray-100 border-4 border-white shadow-lg" />
                      <button 
                        onClick={handleRandomizeAvatar}
                        className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-md hover:scale-110 transition"
                        title="تغيير الصورة عشوائياً"
                      >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      </button>
                  </div>
                  <span className="text-xs text-gray-400 font-bold">اضغط الأيقونة لتغيير الصورة</span>
              </div>

              <div className="space-y-4">
                  <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">الاسم المعروض</label>
                      <input 
                        type="text" 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-primary/30 outline-none transition font-bold"
                      />
                  </div>
                  
                  <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">الموقع</label>
                      <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={editLocation}
                            onChange={(e) => setEditLocation(e.target.value)}
                            className="flex-1 p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-primary/30 outline-none transition font-bold text-sm"
                            placeholder="المدينة، الدولة"
                        />
                        <button 
                            onClick={handleGetCurrentLocation}
                            className="bg-primary/10 text-primary p-3 rounded-xl hover:bg-primary/20 transition"
                            title="تحديد موقعي الحالي"
                        >
                            <MapPinIcon className="w-5 h-5" />
                        </button>
                      </div>
                  </div>

                  <button 
                    onClick={handleSaveProfile}
                    className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 hover:bg-primary-dark transition"
                  >
                      حفظ التغييرات
                  </button>
              </div>
          </div>
      </div>
  );

  const AdBanner = () => (
      <div className="fixed bottom-[80px] left-0 right-0 bg-gray-900 text-white p-2 text-center text-xs z-40 mx-6 rounded-xl flex justify-between items-center shadow-lg">
          <span className="font-bold">إعلان: احصل على اشتراك Pro لإزالة هذا الشريط</span>
          <button onClick={() => handleNavClick(ViewState.WALLET)} className="bg-white text-gray-900 px-3 py-1 rounded-lg text-[10px] font-black">ترقية</button>
      </div>
  );

  // If viewing Legal Pages from Login screen
  if (currentView === ViewState.TERMS && !currentUser) {
      return <TermsPage onBack={() => handleNavClick(ViewState.LOGIN)} />;
  }
  if (currentView === ViewState.PRIVACY && !currentUser) {
      return <PrivacyPage onBack={() => handleNavClick(ViewState.LOGIN)} />;
  }

  if (!currentUser || currentView === ViewState.LOGIN) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

        <div className="bg-white/80 backdrop-blur-xl w-full max-w-md p-8 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white z-10 animate-fade-in">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-2 tracking-tight">إنشاء حساب جديد</h1>
            <p className="text-gray-400 font-medium">انضم إلى مجتمع التحديات والمعرفة</p>
          </div>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
                <input 
                    type="text" 
                    required
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white outline-none transition font-bold text-gray-700 placeholder-gray-300"
                    placeholder="الاسم الكامل"
                />
            </div>
            <div>
                <input 
                    type="email" 
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white outline-none transition font-bold text-gray-700 placeholder-gray-300"
                    placeholder="البريد الإلكتروني"
                />
            </div>
            <div>
                <input 
                    type="password" 
                    required
                    value={regPass}
                    onChange={e => setRegPass(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white outline-none transition font-bold text-gray-700 placeholder-gray-300"
                    placeholder="كلمة المرور"
                />
            </div>
            <button type="submit" className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-200 hover:bg-primary-dark hover:scale-[1.02] active:scale-95 transition-all">
                إنشاء حساب
            </button>
            <p className="text-center text-xs text-gray-400 mt-4 leading-relaxed">
                بالتسجيل، أنت توافق على <button type="button" onClick={() => handleNavClick(ViewState.TERMS)} className="text-primary hover:underline">شروط الاستخدام</button> و <button type="button" onClick={() => handleNavClick(ViewState.PRIVACY)} className="text-primary hover:underline">سياسة الخصوصية</button>
            </p>
          </form>
        </div>
      </div>
    );
  }

  const showAds = currentUser && PLAN_FEATURES[currentUser.subscriptionPlan].showAds && currentView !== ViewState.WALLET;

  return (
    <div className={`min-h-screen flex justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-[#F8FAFC]'}`}>
      <div className={`w-full max-w-lg min-h-screen shadow-2xl relative flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        
        {/* Header */}
        {currentView !== ViewState.TERMS && currentView !== ViewState.PRIVACY && currentView !== ViewState.NOTIFICATIONS && (
            <header className="px-6 pt-6 pb-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 flex justify-between items-center">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleNavClick(ViewState.PROFILE)}>
                <div className="w-12 h-12 rounded-full p-0.5 border-2 border-primary relative">
                    <img src={currentUser.avatar} alt="User" className="w-full h-full rounded-full object-cover" />
                    <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-[10px] w-5 h-5 rounded-full flex items-center justify-center text-white border-2 border-white shadow-sm font-bold">
                        {currentUser.level}
                    </div>
                </div>
                <div>
                    <h3 className="font-extrabold text-gray-800 leading-tight">مرحباً، {currentUser.name.split(' ')[0]} 👋</h3>
                    <p className="text-xs text-gray-400 font-bold mt-0.5">جاهز للتحدي اليوم؟</p>
                </div>
            </div>
            <div className="flex gap-3">
                <button 
                    onClick={() => { handleNavClick(ViewState.NOTIFICATIONS); markNotificationsRead(); }}
                    className="relative bg-gray-50 w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition"
                >
                    <BellIcon className="w-5 h-5" />
                    {hasNotification && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
                </button>
                <button onClick={() => handleNavClick(ViewState.WALLET)} className="bg-primary/10 text-primary w-10 h-10 rounded-full flex items-center justify-center hover:bg-primary/20 transition">
                    <WalletIcon className="w-5 h-5" />
                </button>
            </div>
            </header>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-32">
            
          {showEditProfile && <EditProfileModal />}

          {showSettings ? <SettingsPanel /> : (
              <>
                {currentView === ViewState.NOTIFICATIONS && <NotificationsView />}
                
                {currentView === ViewState.TERMS && (
                    <div className="h-full">
                        <TermsPage onBack={() => { handleNavClick(ViewState.PROFILE); setShowSettings(true); }} />
                    </div>
                )}
                {currentView === ViewState.PRIVACY && (
                    <div className="h-full">
                        <PrivacyPage onBack={() => { handleNavClick(ViewState.PROFILE); setShowSettings(true); }} />
                    </div>
                )}

                {currentView === ViewState.HOME && (
                    <div className="animate-slide-up">
                        
                        {/* Redesigned Hero Stats (No Cards, Floating look) */}
                        <div className="flex justify-around items-center py-8 px-4 bg-gradient-to-b from-white/0 to-gray-50/50">
                           <div className="flex flex-col items-center gap-1">
                              <FireIcon className="w-8 h-8 text-orange-500 drop-shadow-sm mb-1" />
                              <span className="text-2xl font-black text-gray-800 leading-none">{currentUser.streak}</span>
                              <span className="text-[10px] font-bold text-gray-400">أيام</span>
                           </div>
                           <div className="w-px h-10 bg-gray-200"></div>
                           <div className="flex flex-col items-center gap-1">
                              <CheckIcon className="w-8 h-8 text-blue-500 drop-shadow-sm mb-1" />
                              <span className="text-2xl font-black text-gray-800 leading-none">{currentUser.wins}</span>
                              <span className="text-[10px] font-bold text-gray-400">فوز</span>
                           </div>
                           <div className="w-px h-10 bg-gray-200"></div>
                           <div className="flex flex-col items-center gap-1">
                              <StarIcon className="w-8 h-8 text-purple-500 drop-shadow-sm mb-1" />
                              <span className="text-2xl font-black text-gray-800 leading-none">{currentUser.xp}</span>
                              <span className="text-[10px] font-bold text-gray-400">XP</span>
                           </div>
                        </div>

                        {/* Redesigned Actions - List Style (No Boxes) */}
                        <div className="px-6 mt-4">
                          <h3 className="font-bold text-gray-900 text-xl mb-4">القائمة الرئيسية</h3>
                          <div className="flex flex-col">
                            
                            {/* Math Game Item */}
                            <button 
                              onClick={() => handleNavClick(ViewState.GAME)}
                              className="w-full flex items-center gap-4 py-5 border-b border-gray-100 group hover:bg-white/50 transition-colors"
                            >
                                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <GameIcon className="w-6 h-6" />
                                </div>
                                <div className="flex-1 text-right">
                                    <h4 className="font-bold text-gray-800 text-lg">تحدي الرياضيات</h4>
                                    <p className="text-xs text-gray-400 font-medium">ابدأ اللعب الآن</p>
                                </div>
                                <svg className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 rotate-180 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>

                            {/* Social Hub Item */}
                            <button 
                              onClick={() => handleNavClick(ViewState.SOCIAL)}
                              className="w-full flex items-center gap-4 py-5 border-b border-gray-100 group hover:bg-white/50 transition-colors"
                            >
                                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <ChatIcon className="w-6 h-6" />
                                </div>
                                <div className="flex-1 text-right">
                                    <h4 className="font-bold text-gray-800 text-lg">مجتمع اللاعبين</h4>
                                    <p className="text-xs text-gray-400 font-medium">الدردشة والتفاعل</p>
                                </div>
                                <svg className="w-5 h-5 text-gray-300 group-hover:text-green-500 rotate-180 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>

                            {/* Wallet Item */}
                            <button 
                              onClick={() => handleNavClick(ViewState.WALLET)}
                              className="w-full flex items-center gap-4 py-5 border-b border-gray-100 group hover:bg-white/50 transition-colors"
                            >
                                <div className="w-12 h-12 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <WalletIcon className="w-6 h-6" />
                                </div>
                                <div className="flex-1 text-right">
                                    <h4 className="font-bold text-gray-800 text-lg">الاشتراكات</h4>
                                    <p className="text-xs text-gray-400 font-medium">ترقية حسابك</p>
                                </div>
                                <svg className="w-5 h-5 text-gray-300 group-hover:text-gray-700 rotate-180 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>
                            
                            {/* Support Item - Added for quick access */}
                             <button 
                              onClick={() => handleNavClick(ViewState.SUPPORT)}
                              className="w-full flex items-center gap-4 py-5 group hover:bg-white/50 transition-colors"
                            >
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <SupportIcon className="w-6 h-6" />
                                </div>
                                <div className="flex-1 text-right">
                                    <h4 className="font-bold text-gray-800 text-lg">المساعدة</h4>
                                    <p className="text-xs text-gray-400 font-medium">الدعم الذكي</p>
                                </div>
                                <svg className="w-5 h-5 text-gray-300 group-hover:text-blue-500 rotate-180 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </button>

                          </div>
                        </div>
                    </div>
                )}

                {currentView === ViewState.GAME && (
                    <div className="p-4 h-full flex flex-col animate-fade-in">
                        <MathGame 
                            level={currentUser.level}
                            onWin={handleWin}
                            onLoss={handleLoss}
                            onLevelUp={handleLevelUp}
                            dailyGamesRemaining={currentUser.dailyGamesRemaining}
                            onGamePlayed={handleGamePlayed}
                        />
                    </div>
                )}

                {currentView === ViewState.SOCIAL && <SocialHub currentUser={currentUser} onPostCreated={handlePostCreated} />}
                
                {currentView === ViewState.WALLET && <WalletModal onUpgrade={handleUpgrade} />}
                
                {currentView === ViewState.SUPPORT && <SupportBot />}

                {currentView === ViewState.PROFILE && (
                    <div className="animate-slide-up">
                        <div className="relative h-48 bg-gradient-to-r from-primary to-blue-400">
                             <div className="absolute -bottom-12 right-0 left-0 flex justify-center">
                                <div className="w-32 h-32 rounded-full bg-white p-1 shadow-xl relative">
                                    <img src={currentUser.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                                    <button 
                                        onClick={openEditProfile}
                                        className="absolute bottom-2 right-2 bg-gray-900 text-white p-2 rounded-full shadow-lg hover:scale-110 transition"
                                    >
                                        <SettingsIcon className="w-4 h-4" />
                                    </button>
                                </div>
                             </div>
                        </div>
                        <div className="pt-16 text-center px-6 mb-8">
                            <h2 className="text-2xl font-bold text-gray-800">{currentUser.name}</h2>
                            <p className="text-gray-400 dir-ltr font-medium mb-4">{currentUser.username}</p>
                            
                            {/* Current Plan Badge */}
                            <div className="inline-block px-4 py-1 mb-6 rounded-full bg-gray-900 text-white text-xs font-bold uppercase tracking-wider">
                                {currentUser.subscriptionPlan === 'free' ? 'عضوية مجانية' : 
                                 currentUser.subscriptionPlan === 'vip' ? 'عضوية VIP' : 
                                 `عضوية ${currentUser.subscriptionPlan}`}
                            </div>

                            <div className="flex justify-center gap-2 mb-6">
                                <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold flex items-center gap-1">
                                    <MedalIcon className="w-3 h-3" /> المستوى {currentUser.level}
                                </span>
                                <span className="px-4 py-1.5 bg-purple-50 text-purple-600 rounded-full text-xs font-bold flex items-center gap-1">
                                    <StarIcon className="w-3 h-3" /> {currentUser.xp} XP
                                </span>
                            </div>

                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-right">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <TrophyIcon className="w-5 h-5 text-yellow-500" />
                                    الأوسمة والإنجازات
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {currentUser.achievements.length === 0 ? (
                                        <div className="col-span-2 text-center text-gray-400 text-sm py-4">لم تحصل على أي وسام بعد</div>
                                    ) : (
                                        currentUser.achievements.map((ach) => (
                                            <div key={ach.id} className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${ach.unlocked ? 'bg-white border-gray-100' : 'bg-gray-50 border-transparent opacity-60 grayscale'}`}>
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${ach.color}`}>
                                                    {ach.icon}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm text-gray-800">{ach.title}</h4>
                                                    <span className="text-[10px] text-gray-400 font-bold">{ach.unlocked ? 'تم الحصول عليه' : 'مغلق'}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-2xl text-right">
                                    <span className="block text-gray-400 text-xs font-bold mb-1">الموقع</span>
                                    <span className="font-bold text-gray-800 text-sm">{currentUser.location.split('،')[0]}</span>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl text-right">
                                    <span className="block text-gray-400 text-xs font-bold mb-1">الجنس</span>
                                    <span className="font-bold text-gray-800 text-sm">{currentUser.gender === 'Male' ? 'ذكر' : 'أنثى'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
              </>
          )}
        </main>
        
        {/* Ad Banner for Free Users */}
        {showAds && <AdBanner />}

        {/* Floating Bottom Navigation */}
        {currentUser && currentView !== ViewState.TERMS && currentView !== ViewState.PRIVACY && (
            <nav className="fixed bottom-6 left-6 right-6 bg-white/90 backdrop-blur-xl rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 p-2 grid grid-cols-5 gap-1 z-50">
            <NavButton view={ViewState.HOME} icon={<HomeIcon />} label="الرئيسية" />
            <NavButton view={ViewState.GAME} icon={<GameIcon />} label="لعب" />
            <NavButton view={ViewState.SOCIAL} icon={<ChatIcon />} label="دردشة" />
            <NavButton view={ViewState.SUPPORT} icon={<SupportIcon />} label="دعم" />
            <NavButton view={ViewState.PROFILE} icon={<ProfileIcon />} label="ملفي" />
            </nav>
        )}
      </div>
    </div>
  );
};

export default App;