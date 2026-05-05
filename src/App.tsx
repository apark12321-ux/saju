import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  User, 
  Clock, 
  Sparkles, 
  BookOpen, 
  Star, 
  Menu, 
  X,
  ChevronRight,
  TrendingUp,
  Heart,
  Briefcase,
  ShieldCheck,
  RefreshCw,
  Search
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { calculateSaju, SajuData, ELEMENT_COLORS, ELEMENT_NAMES } from './lib/saju';
import { getSajuInterpretation, getNameReading, getDailyHoroscope } from './services/geminiService';

// Ad Placeholder component
const AdPlaceholder = ({ type = 'banner' }: { type?: 'banner' | 'square' | 'sidebar' }) => {
  const height = type === 'banner' ? 'h-24 md:h-28' : type === 'square' ? 'h-64' : 'h-[600px]';
  return (
    <div className={`ad-placeholder w-full ${height} my-8 flex items-center justify-center bg-zinc-100 border border-dashed border-zinc-300 rounded shadow-sm overflow-hidden`}>
      <div className="text-center px-4">
        <p className="text-[10px] font-medium text-zinc-400 tracking-widest mb-1">ADVERTISEMENT</p>
        <p className="text-sm font-serif italic text-zinc-300">구글 애드센스 광고 영역</p>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'saju' | 'naming' | 'horoscope' | 'policy'>('saju');
  const [policyType, setPolicyType] = useState<'privacy' | 'terms'>('privacy');
  const [formData, setFormData] = useState({
    name: '',
    gender: 'male',
    year: 1990,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    isLunar: false
  });
  const [sajuResult, setSajuResult] = useState<SajuData | null>(null);
  const [interpretation, setInterpretation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showNav, setShowNav] = useState(false);

  // For Naming Tab
  const [namingOutput, setNamingOutput] = useState('');
  
  // For Horoscope Tab
  const [horoscopeOutput, setHoroscopeOutput] = useState('');

  const handleCalculate = async () => {
    if (!formData.name) {
      alert('이름을 입력해주세요.');
      return;
    }
    
    setLoading(true);
    const result = calculateSaju(
      formData.year,
      formData.month,
      formData.day,
      formData.hour,
      formData.minute,
      formData.isLunar
    );
    setSajuResult(result);
    
    const text = await getSajuInterpretation(result, formData.name, formData.gender === 'male' ? '남성' : '여성');
    setInterpretation(text || '');
    setLoading(false);
    
    // Smooth scroll to result
    setTimeout(() => {
      document.getElementById('result')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleNameReading = async () => {
    if (!formData.name || !sajuResult) {
      alert('이름과 사주 정보를 먼저 입력해주세요.');
      return;
    }
    setLoading(true);
    const text = await getNameReading(formData.name, sajuResult);
    setNamingOutput(text || '');
    setLoading(false);
  };

  const handleHoroscope = async (zodiac: string) => {
    setLoading(true);
    const text = await getDailyHoroscope(zodiac);
    setHoroscopeOutput(text || '');
    setLoading(false);
  };

  const openPolicy = (type: 'privacy' | 'terms') => {
    setPolicyType(type);
    setActiveTab('policy');
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-traditional-red/20 selection:text-traditional-red">
      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-traditional-paper flex flex-col items-center justify-center p-6"
          >
            <div className="relative w-48 h-48 mb-8">
              {/* Spinning traditional pattern */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-dashed border-traditional-gold/30 rounded-full"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-4 border-2 border-traditional-red/20 rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-traditional-red rounded-full flex items-center justify-center text-white font-serif text-3xl shadow-xl shadow-traditional-red/20">
                  運
                </div>
              </div>
              {/* Small floating particles */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    y: [0, -20, 0],
                    opacity: [0.2, 0.5, 0.2]
                  }}
                  transition={{ 
                    duration: 2 + Math.random() * 2, 
                    repeat: Infinity,
                    delay: i * 0.5
                  }}
                  className="absolute w-2 h-2 bg-traditional-gold rounded-full"
                  style={{ 
                    left: `${50 + Math.cos(i * Math.PI / 4) * 60}%`,
                    top: `${50 + Math.sin(i * Math.PI / 4) * 60}%`
                  }}
                />
              ))}
            </div>
            
            <div className="text-center max-w-md">
              <h3 className="text-2xl font-serif font-bold text-traditional-ink mb-2">당신의 운명을 분석 중입니다</h3>
              <p className="text-traditional-red font-medium italic min-h-[1.5rem]">{loadingMessage}</p>
            </div>

            {/* In-loading Ad - High visibility */}
            <div className="mt-12 w-full max-w-lg">
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-center">
                <p className="text-[10px] text-zinc-400 tracking-widest mb-3 uppercase font-bold">Waiting for your destiny</p>
                <div className="ad-placeholder h-64 bg-white border-dashed border-zinc-300 flex items-center justify-center">
                  <p className="text-sm font-serif italic text-zinc-400">분석 대기 중 광고</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-traditional-paper/80 backdrop-blur-md border-b border-traditional-gold/20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('saju')}>
            <div className="w-8 h-8 bg-traditional-red rounded-full flex items-center justify-center text-white font-serif font-bold text-lg">
              命
            </div>
            <h1 className="text-xl font-serif font-bold tracking-tight text-traditional-ink block sm:hidden">명리 AI</h1>
            <h1 className="text-xl font-serif font-bold tracking-tight text-traditional-ink hidden sm:block">명리 AI - 프리미엄 사주 운세</h1>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => setActiveTab('saju')}
              className={`text-sm font-medium transition-colors ${activeTab === 'saju' ? 'text-traditional-red border-b-2 border-traditional-red pb-1' : 'text-zinc-500 hover:text-traditional-red'}`}
            >
              사주 분석
            </button>
            <button 
              onClick={() => setActiveTab('horoscope')}
              className={`text-sm font-medium transition-colors ${activeTab === 'horoscope' ? 'text-traditional-red border-b-2 border-traditional-red pb-1' : 'text-zinc-500 hover:text-traditional-red'}`}
            >
              오늘의 운세
            </button>
            <button 
              onClick={() => setActiveTab('naming')}
              className={`text-sm font-medium transition-colors ${activeTab === 'naming' ? 'text-traditional-red border-b-2 border-traditional-red pb-1' : 'text-zinc-500 hover:text-traditional-red'}`}
            >
              성명 분석
            </button>
          </nav>

          <button className="md:hidden p-2 text-zinc-600" onClick={() => setShowNav(!showNav)}>
            {showNav ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile Nav */}
        <AnimatePresence>
          {showNav && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden bg-traditional-paper border-b border-traditional-gold/20 px-4 py-4 space-y-4"
            >
              <button 
                onClick={() => { setActiveTab('saju'); setShowNav(false); }}
                className="block w-full text-left font-medium text-zinc-600 hover:text-traditional-red py-2"
              >
                사주 분석
              </button>
              <button 
                onClick={() => { setActiveTab('horoscope'); setShowNav(false); }}
                className="block w-full text-left font-medium text-zinc-600 hover:text-traditional-red py-2"
              >
                오늘의 운세
              </button>
              <button 
                onClick={() => { setActiveTab('naming'); setShowNav(false); }}
                className="block w-full text-left font-medium text-zinc-600 hover:text-traditional-red py-2"
              >
                성명 분석
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
        {/* Hero Banner Ad */}
        <AdPlaceholder type="banner" />

        {activeTab === 'policy' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-traditional-gold/10 markdown-body"
          >
            {policyType === 'privacy' ? (
              <>
                <h1>개인정보 처리방침</h1>
                <p>본 사이트('명리 AI')는 사용자의 개인정보를 소중하게 보호합니다.</p>
                <h2>1. 수집하는 정보</h2>
                <p>사주 분석을 위해 이름, 성별, 생년월일시 정보를 입력받으나, 이는 분석 즉시 사용되며 별도의 서버 데이터베이스에 사용자를 식별할 수 있는 형태로 저장되지 않습니다.</p>
                <h2>2. 정보의 이용 목적</h2>
                <p>수집된 정보는 오직 인공지능을 통한 명리학적 운세 해석 서비스 제공을 위해서만 활용됩니다.</p>
                <h2>3. 제3자 제공 및 위탁</h2>
                <p>사용자의 입력값은 운세 해석을 위해 Google Gemini API로 전송될 수 있으나, 이 과정에서 개인을 식별할 수 있는 정보는 포함되지 않도록 관리합니다.</p>
                <h2>4. 이용자의 권리</h2>
                <p>이용자는 언제든지 사이트를 이탈함으로써 자신의 데이터 처리를 중단할 권리가 있습니다.</p>
              </>
            ) : (
              <>
                <h1>이용약관</h1>
                <p>본 사이트의 서비스 이용과 관련하여 필요한 사항을 규정합니다.</p>
                <h2>1. 서비스의 목적</h2>
                <p>본 서비스는 명리학과 AI 기술을 결합하여 정보 및 오락 목적의 운세 분석 결과를 제공합니다.</p>
                <h2>2. 책임의 한계</h2>
                <p>본 서비스가 제공하는 결과는 참고용이며, 이용자가 이를 근거로 내린 결정에 대하여 당사는 어떠한 법적 책임도 지지 않습니다. 인생의 중요한 결정은 본인의 판단하에 실행하시기 바랍니다.</p>
                <h2>3. 서비스 변경 및 중단</h2>
                <p>당사는 사전 고지 없이 서비스의 일부 또는 전부를 변경하거나 중단할 수 있습니다.</p>
              </>
            )}
            <button 
              onClick={() => setActiveTab('saju')}
              className="mt-12 bg-traditional-ink text-white px-8 py-3 rounded-xl font-medium"
            >
              홈으로 돌아가기
            </button>
          </motion.div>
        )}

        {activeTab === 'saju' && (
          <div className="space-y-12">
            {/* Input Section */}
            <section className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-traditional-gold/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <div className="text-[120px] font-serif leading-none">運</div>
              </div>
              
              <div className="max-w-2xl">
                <h2 className="text-3xl font-serif font-bold text-traditional-red mb-4">정통 사주 분석</h2>
                <p className="text-zinc-600 mb-8 leading-relaxed">
                  생년월일시 정보를 바탕으로 동양 철학의 정수인 명리학적 관점에서 당신의 운명을 세밀하게 분석합니다. 
                  전문 AI 명리학자가 당신의 삶을 안내해 드립니다.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-600 flex items-center gap-1.5">
                      <User size={16} className="text-traditional-gold" /> 성함
                    </label>
                    <input 
                      type="text" 
                      placeholder="이름을 입력하세요"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-traditional-gold/20 focus:outline-none focus:ring-2 focus:ring-traditional-red/20 focus:border-traditional-red transition-all"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-600 flex items-center gap-1.5">
                      <Sparkles size={16} className="text-traditional-gold" /> 성별
                    </label>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setFormData({...formData, gender: 'male'})}
                        className={`flex-1 py-3 rounded-xl border transition-all text-sm font-medium ${formData.gender === 'male' ? 'bg-traditional-red text-white border-traditional-red' : 'bg-zinc-50 text-zinc-500 border-traditional-gold/20 hover:border-traditional-gold'}`}
                      >
                        남성
                      </button>
                      <button 
                        onClick={() => setFormData({...formData, gender: 'female'})}
                        className={`flex-1 py-3 rounded-xl border transition-all text-sm font-medium ${formData.gender === 'female' ? 'bg-traditional-red text-white border-traditional-red' : 'bg-zinc-50 text-zinc-500 border-traditional-gold/20 hover:border-traditional-gold'}`}
                      >
                        여성
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-600 flex items-center gap-1.5">
                      <Calendar size={16} className="text-traditional-gold" /> 생년월일
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <select 
                        value={formData.year}
                        onChange={(e) => setFormData({...formData, year: Number(e.target.value)})}
                        className="px-2 py-3 rounded-xl border border-traditional-gold/20 focus:outline-none text-sm bg-white"
                      >
                        {Array.from({length: 100}, (_, i) => 2025 - i).map(y => (
                          <option key={y} value={y}>{y}년</option>
                        ))}
                      </select>
                      <select 
                        value={formData.month}
                        onChange={(e) => setFormData({...formData, month: Number(e.target.value)})}
                        className="px-2 py-3 rounded-xl border border-traditional-gold/20 focus:outline-none text-sm bg-white"
                      >
                        {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                          <option key={m} value={m}>{m}월</option>
                        ))}
                      </select>
                      <select 
                        value={formData.day}
                        onChange={(e) => setFormData({...formData, day: Number(e.target.value)})}
                        className="px-2 py-3 rounded-xl border border-traditional-gold/20 focus:outline-none text-sm bg-white"
                      >
                        {Array.from({length: 31}, (_, i) => i + 1).map(d => (
                          <option key={d} value={d}>{d}일</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-600 flex items-center gap-1.5">
                      <Clock size={16} className="text-traditional-gold" /> 태어난 시각
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <select 
                        value={formData.hour}
                        onChange={(e) => setFormData({...formData, hour: Number(e.target.value)})}
                        className="px-2 py-3 rounded-xl border border-traditional-gold/20 focus:outline-none text-sm bg-white"
                      >
                        {Array.from({length: 24}, (_, i) => i).map(h => (
                          <option key={h} value={h}>{h}시</option>
                        ))}
                      </select>
                      <select 
                        value={formData.minute}
                        onChange={(e) => setFormData({...formData, minute: Number(e.target.value)})}
                        className="px-2 py-3 rounded-xl border border-traditional-gold/20 focus:outline-none text-sm bg-white"
                      >
                        {Array.from({length: 60}, (_, i) => i).map(m => (
                          <option key={m} value={m}>{m}분</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-2 flex items-center gap-4 py-2 border-t border-zinc-100 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${formData.isLunar ? 'bg-traditional-red border-traditional-red' : 'bg-white border-zinc-300'}`}>
                        {formData.isLunar && <X size={14} className="text-white rotate-45" />}
                        <input 
                          type="checkbox" 
                          hidden 
                          checked={formData.isLunar} 
                          onChange={(e) => setFormData({...formData, isLunar: e.target.checked})} 
                        />
                      </div>
                      <span className="text-sm text-zinc-600 font-medium group-hover:text-traditional-red transition-colors">음력으로 계산하기</span>
                    </label>
                    <div className="ml-auto text-[10px] text-zinc-400 font-serif italic">AI Myungli Professional</div>
                  </div>
                </div>

                <button 
                  onClick={handleCalculate}
                  disabled={loading}
                  className="w-full mt-8 bg-traditional-ink text-white py-4 rounded-xl font-serif text-lg font-bold hover:bg-traditional-red transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  {loading ? (
                    <RefreshCw className="animate-spin" size={20} />
                  ) : (
                    <>사주 분석하기 <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" /></>
                  )}
                </button>
              </div>
            </section>

            <AnimatePresence>
              {sajuResult && (
                <motion.div 
                  id="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  {/* Results Ad */}
                  <AdPlaceholder type="banner" />

                  {/* Saju Pillars Table */}
                  <section className="bg-white rounded-3xl p-6 md:p-10 shadow-lg border border-traditional-gold/10">
                    <h3 className="text-2xl font-serif font-bold text-traditional-ink mb-8 flex items-center gap-2">
                      <BookOpen className="text-traditional-gold" /> 사주 팔자 (四柱八字)
                    </h3>
                    
                    <div className="grid grid-cols-4 gap-2 md:gap-4 mb-10 overflow-x-auto pb-4">
                      {/* Pillars */}
                      {[
                        { label: '시주(時柱)', stem: sajuResult.hourStem, branch: sajuResult.hourBranch },
                        { label: '일주(日柱)', stem: sajuResult.dayStem, branch: sajuResult.dayBranch },
                        { label: '월주(月柱)', stem: sajuResult.monthStem, branch: sajuResult.monthBranch },
                        { label: '연주(年柱)', stem: sajuResult.yearStem, branch: sajuResult.yearBranch }
                      ].map((pillar, idx) => (
                        <div key={idx} className="flex flex-col items-center min-w-[80px]">
                          <div className="text-xs font-medium text-zinc-400 mb-2">{pillar.label}</div>
                          <div className="w-full h-full flex flex-col gap-1">
                            <div className="saju-cell bg-zinc-50 rounded-t-xl group hover:bg-zinc-100 transition-colors">
                              <span className="saju-stem" style={{ color: ELEMENT_COLORS[Object.keys(ELEMENT_NAMES).find(k => k === 'wood') || 'wood'] }}>
                                {pillar.stem}
                              </span>
                            </div>
                            <div className="saju-cell bg-zinc-50 rounded-b-xl group hover:bg-zinc-100 transition-colors">
                              <span className="saju-branch">
                                {pillar.branch}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Element Distribution */}
                    <div className="bg-zinc-50 rounded-2xl p-6">
                      <h4 className="text-sm font-semibold text-zinc-500 mb-6 text-center uppercase tracking-widest">오행 에너지 분포</h4>
                      <div className="flex flex-wrap justify-around gap-6">
                        {Object.entries(sajuResult.fiveElements).map(([key, value]) => (
                          <div key={key} className="flex flex-col items-center gap-2">
                            <div 
                              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-inner"
                              style={{ backgroundColor: ELEMENT_COLORS[key] }}
                            >
                              {value}
                            </div>
                            <span className="text-xs font-medium text-zinc-600">{ELEMENT_NAMES[key]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* AI Interpretation */}
                  <section className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-traditional-gold/10 leading-relaxed overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-2 h-full bg-traditional-gold/20"></div>
                    <h3 className="text-2xl font-serif font-bold text-traditional-red mb-10 border-b border-traditional-gold/20 pb-4 flex items-center gap-2">
                       <Sparkles /> 신년 종합 운세 감명
                    </h3>
                    
                    {loading ? (
                      <div className="flex flex-col items-center py-20 gap-4">
                        <RefreshCw className="animate-spin text-traditional-gold" size={40} />
                        <p className="text-zinc-500 font-serif italic">인간의 지혜와 AI의 지능을 모아 운명을 해석하고 있습니다...</p>
                      </div>
                    ) : (
                      <div className="markdown-body text-zinc-700">
                        <ReactMarkdown>{interpretation}</ReactMarkdown>
                      </div>
                    )}

                    {/* Side Sidebar Ad Container */}
                    <AdPlaceholder type="banner" />
                  </section>

                  {/* Recommendation Grid */}
                  <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-3xl shadow flex flex-col items-center text-center gap-3 border border-traditional-gold/10 group cursor-pointer hover:shadow-lg transition-all" onClick={() => setActiveTab('naming')}>
                      <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform">
                        <TrendingUp size={24} />
                      </div>
                      <h4 className="font-serif font-bold">성명 분석 받기</h4>
                      <p className="text-xs text-zinc-500">부족한 오행을 채워주는 이름인지 확인해보세요.</p>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow flex flex-col items-center text-center gap-3 border border-traditional-gold/10 group cursor-pointer hover:shadow-lg transition-all" onClick={() => setActiveTab('horoscope')}>
                      <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform">
                        <Star size={24} />
                      </div>
                      <h4 className="font-serif font-bold">오늘의 띠별 운세</h4>
                      <p className="text-xs text-zinc-500">매일 아침 확인하는 행운의 등대.</p>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow flex flex-col items-center text-center gap-3 border border-traditional-gold/10 group cursor-pointer hover:shadow-lg transition-all">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform">
                        <ShieldCheck size={24} />
                      </div>
                      <h4 className="font-serif font-bold">액운 방지 비책</h4>
                      <p className="text-xs text-zinc-500">AI가 제안하는 개운법으로 행운을 부르세요.</p>
                    </div>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {activeTab === 'horoscope' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-serif font-bold text-center mb-8">오늘의 띠별 운세</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'].map((z, i) => (
                <button 
                  key={i}
                  onClick={() => handleHoroscope(z)}
                  className="aspect-square flex flex-col items-center justify-center bg-white rounded-2xl shadow hover:shadow-md border border-traditional-gold/10 hover:border-traditional-red/30 transition-all gap-1 group"
                >
                  <span className="text-2xl transform group-hover:scale-110 transition-transform">{['🐭', '🐮', '🐯', '🐰', '🐲', '🐍', '🐴', '🐑', '🐵', '🐔', '🐶', '🐷'][i]}</span>
                  <span className="text-sm font-medium">{z}띠</span>
                </button>
              ))}
            </div>

            {loading && activeTab === 'horoscope' && (
              <div className="flex justify-center py-20">
                <RefreshCw className="animate-spin text-traditional-gold" />
              </div>
            )}

            {horoscopeOutput && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-3xl p-8 shadow-lg border border-traditional-gold/10 markdown-body"
              >
                <ReactMarkdown>{horoscopeOutput}</ReactMarkdown>
                <AdPlaceholder type="square" />
              </motion.div>
            )}
          </div>
        )}

        {activeTab === 'naming' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-serif font-bold text-center mb-8">성명학 감명 (이름 풀이)</h2>
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-traditional-gold/10 space-y-6">
              <p className="text-center text-zinc-500 mb-4 font-serif italic">
                사주 분석 후 감명을 받으시면 더욱 정확한 오행 보완 관계를 분석할 수 있습니다.
              </p>
              <div className="flex flex-col md:flex-row gap-4">
                <input 
                  type="text" 
                  placeholder="감명받을 이름을 입력하세요"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="flex-1 px-6 py-4 rounded-2xl border border-traditional-gold/20 focus:outline-none focus:ring-2 focus:ring-traditional-red/20 text-lg"
                />
                <button 
                  onClick={handleNameReading}
                  disabled={loading}
                  className="bg-traditional-red text-white px-10 py-4 rounded-2xl font-serif font-bold hover:shadow-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw className="animate-spin" /> : '이름 분석하기'}
                </button>
              </div>
            </div>

            {namingOutput && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-traditional-gold/10 markdown-body"
              >
                <ReactMarkdown>{namingOutput}</ReactMarkdown>
                <AdPlaceholder type="banner" />
              </motion.div>
            )}
          </div>
        )}

        {/* Square Ad for some layout variation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="md:col-span-2 space-y-8">
            <h3 className="text-xl font-serif font-bold border-l-4 border-traditional-red pl-3">사주 상식 & 가이드</h3>
            <div className="space-y-4">
              {[
                { title: '사주에서 오행이 중요한 이유', desc: '목, 화, 토, 금, 수의 균형이 인생의 안정을 결정합니다.' },
                { title: '좋은 이름을 짓기 위한 필수 조건', desc: '소리 오행과 자명 오행의 조화가 핵심입니다.' },
                { title: '용신과 기신: 나에게 도움이 되는 기운', desc: '나의 사주에서 가장 필요한 글자를 찾는 법을 알아봅니다.' }
              ].map((item, i) => (
                <div key={i} className="p-4 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors cursor-pointer group flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-zinc-700 mb-1 group-hover:text-traditional-red transition-all">{item.title}</h4>
                    <p className="text-xs text-zinc-400">{item.desc}</p>
                  </div>
                  <ChevronRight size={16} className="text-zinc-300" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <AdPlaceholder type="square" />
          </div>
        </div>
      </main>

      <footer className="bg-zinc-900 text-zinc-400 py-12 px-4 mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-zinc-700 rounded-full flex items-center justify-center text-white text-[10px] font-serif">命</div>
              <span className="text-white font-serif font-bold">명리 AI</span>
            </div>
            <p className="text-xs leading-relaxed">
              본 서비스는 정통 명리학 이론을 바탕으로 하며 인공지능 기술을 통해 최적의 해석을 제공합니다. 
              분석 결과는 참고용이며 인생의 중요한 결정은 스스로의 지혜를 믿으시기 바랍니다.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-serif font-bold">주요 메뉴</h4>
            <ul className="text-xs space-y-2">
              <li><button onClick={() => setActiveTab('saju')} className="hover:text-white">정통 사주 분석</button></li>
              <li><button onClick={() => setActiveTab('horoscope')} className="hover:text-white">오늘의 띠별 운세</button></li>
              <li><button onClick={() => setActiveTab('naming')} className="hover:text-white">AI 이름 감명</button></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-serif font-bold">Legal</h4>
            <ul className="text-xs space-y-2">
              <li><button onClick={() => openPolicy('privacy')} className="hover:text-white">개인정보 처리방침</button></li>
              <li><button onClick={() => openPolicy('terms')} className="hover:text-white">이용약관</button></li>
              <li><a href="#" className="hover:text-white">Contact Us</a></li>
            </ul>
          </div>
        </div>
        
        {/* Additional SEO Content Section */}
        <div className="max-w-7xl mx-auto mt-16 text-zinc-500 text-[11px] leading-loose border-t border-zinc-800 pt-8">
          <h5 className="text-zinc-300 font-bold mb-2">명리학과 운세 분석에 대하여</h5>
          <p>
            사주팔자(四柱八字)는 사람이 태어난 연(年), 월(月), 일(日), 시(時)의 네 기둥과 그에 따른 여덟 글자를 의미합니다. 
            이는 단순한 미신이 아닌, 우주와 자연의 변화 원리를 인간의 삶에 대입하여 분석하는 동양 최고의 통계학이자 철학입니다. 
            명리 AI는 전통적인 자평진전(子平眞詮), 적천수(滴天髓)의 이론을 현대적 인공지능 알고리즘으로 재해석하여 
            사용자분들께 가장 정교하고 깊이 있는 인생의 지도를 제공하고자 노력합니다. 
            목(木), 화(火), 토(土), 금(金), 수(水) 오행의 조화와 균형을 통해 당신의 강점을 극대화하고 약점을 보완하는 개운(開運)의 지혜를 얻으시길 바랍니다.
          </p>
        </div>

        <div className="max-w-7xl mx-auto mt-8 text-center text-[10px] uppercase tracking-widest">
          © 2026 MYUNGLI AI. ALL RIGHTS RESERVED. POWERED BY GOOGLE GEMINI.
        </div>
      </footer>
    </div>
  );
}

