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
import remarkGfm from 'remark-gfm';
import { calculateSaju, SajuData, ELEMENT_COLORS, ELEMENT_NAMES } from './lib/saju';
import { getSajuInterpretation, getNameReading, getDailyHoroscope } from './services/geminiService';
import { GUIDE_POSTS, GuidePost } from './constants/guides';

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

const LoadingOverlay = ({ message }: { message: string }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-traditional-paper p-6 overflow-hidden"
  >
    <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center select-none overflow-hidden">
      <div className="text-[400px] font-serif leading-none rotate-12">命</div>
    </div>
    
    <div className="relative mb-12">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="w-48 h-48 rounded-full border border-dashed border-traditional-gold/40 flex items-center justify-center"
      >
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="w-40 h-40 rounded-full border border-dotted border-traditional-red/20"
        />
      </motion.div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-traditional-red/10 border-t-traditional-red animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center font-serif text-3xl font-bold text-traditional-red">命</div>
        </div>
      </div>
    </div>
    
    <div className="h-20 flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.p 
          key={message}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-serif text-traditional-ink text-center font-medium"
        >
          {message}
        </motion.p>
      </AnimatePresence>
    </div>
    
    <div className="mt-12 w-64 h-1.5 bg-zinc-200 rounded-full overflow-hidden shadow-inner relative">
      <motion.div 
        initial={{ width: "0%" }}
        animate={{ width: "90%" }}
        transition={{ duration: 15, ease: "easeOut" }}
        className="h-full bg-traditional-red shadow-[0_0_10px_rgba(139,0,0,0.5)]"
      />
    </div>
    
    <p className="mt-4 text-xs font-mono text-zinc-400 uppercase tracking-[0.2em] animate-pulse">
      AI Engine Analyzing Destiny...
    </p>
    
    <div className="absolute bottom-12 left-0 right-0 px-8 text-center">
      <div className="max-w-md mx-auto p-4 bg-traditional-gold/5 rounded-2xl border border-traditional-gold/10">
        <p className="text-[11px] leading-relaxed text-zinc-500 italic">
          "사주는 정해진 결론이 아닌 당신 삶의 지도입니다. AI가 그 길을 세밀하게 읽어내고 있습니다."
        </p>
      </div>
    </div>
  </motion.div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<'saju' | 'naming' | 'horoscope' | 'policy' | 'contact' | 'guide'>('saju');
  const [policyType, setPolicyType] = useState<'privacy' | 'terms'>('privacy');
  const [selectedGuide, setSelectedGuide] = useState<GuidePost | null>(null);
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

  const [loadingMessage, setLoadingMessage] = useState('천기를 읽고 있습니다...');

  const loadingMessages = [
    '천기를 읽고 있습니다...',
    '오행의 기운을 분석하는 중입니다...',
    '사주 팔자의 균형을 맞추고 있습니다...',
    '당신의 대운을 살피는 중입니다...',
    'AI가 명리학 비책을 정리하고 있습니다...',
    '잠시만 기다려 주십시오. 운명의 지도가 그려지고 있습니다.'
  ];

  useEffect(() => {
    let interval: any;
    if (loading) {
      let idx = 0;
      interval = setInterval(() => {
        idx = (idx + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[idx]);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleCalculate = async () => {
    if (!formData.name) {
      alert('이름을 입력해주세요.');
      return;
    }
    
    setLoading(true);
    try {
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
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      // Smooth scroll to result
      setTimeout(() => {
        document.getElementById('result')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
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

  const openContact = () => {
    setActiveTab('contact');
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-traditional-red/20 selection:text-traditional-red">
      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && <LoadingOverlay message={loadingMessage} />}
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
            <button 
              onClick={() => { setSelectedGuide(null); setActiveTab('guide'); }}
              className={`text-sm font-medium transition-colors ${activeTab === 'guide' ? 'text-traditional-red border-b-2 border-traditional-red pb-1' : 'text-zinc-500 hover:text-traditional-red'}`}
            >
              사주 가이드
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

        {activeTab === 'contact' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-traditional-gold/10 markdown-body"
          >
            <h1>문의하기</h1>
            <p>궁금하신 점이나 제안 사항이 있으시면 아래 이메일로 연락 주세요. 영업일 기준 1~3일 내에 답변 드립니다.</p>
            
            <h2>연락처 정보</h2>
            <p>
              <a href="mailto:apark12321@gmail.com" className="text-traditional-red font-bold text-lg hover:underline">
                apark12321@gmail.com
              </a>
            </p>

            <h2>문의 가능한 내용</h2>
            <ul>
              <li>운세 분석 결과에 대한 질문</li>
              <li>사이트 사용 중 발생하는 오류 신고</li>
              <li>오타 또는 잘못된 정보 제보</li>
              <li>광고 또는 협업 제안</li>
              <li>기타 사이트 관련 문의</li>
            </ul>

            <h2>자주 묻는 질문</h2>
            <h3>모든 서비스가 정말 무료인가요?</h3>
            <p>네, 명리 AI의 모든 사주 분석, 오늘의 운세, 성명 감명 서비스는 완전 무료입니다. 회원가입도 필요하지 않으며, 결제 정보를 요구하지 않습니다. 사이트는 광고 수익(Google AdSense)으로 운영됩니다.</p>

            <h3>분석 결과가 얼마나 정확한가요?</h3>
            <p>본 서비스는 정통 명리학 이론을 충실히 반영하고 있으며, 최신 AI 기술을 통해 이를 현대적으로 해석합니다. 다만, 운세는 삶의 참고 지표일 뿐이며 절대적인 결과는 아닙니다.</p>

            <button 
              onClick={() => setActiveTab('saju')}
              className="mt-12 bg-traditional-ink text-white px-8 py-3 rounded-xl font-medium"
            >
              홈으로 돌아가기
            </button>
          </motion.div>
        )}

        {activeTab === 'policy' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-traditional-gold/10 markdown-body"
          >
            {policyType === 'privacy' ? (
              <>
                <h1>개인정보 처리방침</h1>
                <p>명리 AI는 사용자의 개인정보를 소중히 다룹니다.</p>
                
                <h2>제1조 (개인정보의 처리 목적)</h2>
                <p>명리 AI(이하 '서비스')는 다음의 목적을 위하여 개인정보를 처리합니다. 처리한 개인정보는 다음의 목적 이외의 용도로는 이용되지 않습니다.</p>
                <ul>
                  <li>서비스 제공 및 운영</li>
                  <li>서비스 개선 및 통계 분석</li>
                  <li>고객 문의 응대</li>
                </ul>

                <h2>제2조 (수집하는 개인정보 항목)</h2>
                <p>본 서비스는 회원가입 없이 이용 가능합니다. 다만 다음과 같은 정보가 자동으로 수집될 수 있습니다.</p>
                <ul>
                  <li>접속 IP 정보, 쿠키, 접속 기록, 브라우저 정보</li>
                  <li>localStorage 기반의 사용자 선택 정보 (사주 입력 데이터 등)</li>
                </ul>

                <h2>제3조 (개인정보의 보유 및 이용기간)</h2>
                <p>서비스 이용 통계 분석을 위한 데이터는 익명화되어 1년간 보관됩니다. 사용자가 입력한 사주 정보 등은 사용자의 브라우저에만 저장되거나 분석 즉시 사용되며, 서버에 영구적으로 저장되지 않습니다.</p>

                <h2>제4조 (광고 및 분석 도구)</h2>
                <p>본 서비스는 다음과 같은 제3자 광고 및 분석 도구를 사용할 수 있습니다.</p>
                <ul>
                  <li>Google AdSense - 광고 게재</li>
                  <li>Google Analytics - 사용자 통계 분석</li>
                </ul>
                <p>이러한 도구들은 쿠키를 사용하여 사용자 활동을 분석합니다. 사용자는 브라우저 설정에서 쿠키를 비활성화할 수 있습니다.</p>

                <h2>제5조 (정보주체의 권리)</h2>
                <p>이용자는 언제든지 개인정보 열람, 정정·삭제, 처리정지 요구 등의 권리를 행사할 수 있습니다.</p>

                <h2>제6조 (개인정보 보호 책임자)</h2>
                <p>책임 부서: 알고파트너스 개인정보보호 담당<br/>이메일: apark12321@gmail.com</p>

                <h2>제7조 (개정)</h2>
                <p>본 개인정보 처리방침은 2026년 5월 5일부터 시행됩니다.</p>
              </>
            ) : (
              <>
                <h1>이용약관</h1>
                <p>명리 AI 서지스 이용약관입니다.</p>

                <h2>제1조 (목적)</h2>
                <p>본 약관은 알고파트너스(이하 '회사')가 제공하는 명리 AI 서비스(이하 '서비스')의 이용 조건 및 절차를 규정함을 목적으로 합니다.</p>

                <h2>제2조 (서비스의 내용)</h2>
                <p>회사가 제공하는 서비스는 다음과 같습니다.</p>
                <ul>
                  <li>AI 기반 사주 및 명리학적 운세 해석</li>
                  <li>성명학 기반 이름 감명 및 분석</li>
                  <li>일일 띠별 운세 제공</li>
                </ul>

                <h2>제3조 (이용료)</h2>
                <p>본 서비스는 완전 무료로 제공됩니다. 회원가입이나 결제가 필요 없으며, 서비스 운영은 광고 수익으로 충당됩니다.</p>

                <h2>제4조 (이용자의 의무)</h2>
                <p>이용자는 본인의 명의로 서비스를 이용해야 하며, 타인의 권리를 침해하거나 서비스의 안정적 운영을 방해해서는 안 됩니다.</p>

                <h2>제5조 (저작권)</h2>
                <p>본 서비스에서 AI가 생성한 해석 결과는 사용자가 자유롭게 활용할 수 있습니다. 다만 결과물의 사용으로 인한 책임은 사용자에게 있습니다.</p>

                <h2>제6조 (면책 조항)</h2>
                <ul>
                  <li>회사는 AI 추천 결과의 정확성을 보장하지 않습니다.</li>
                  <li>운세 결과는 참고용이며, 실제 삶의 성과나 미래를 보장하지 않습니다.</li>
                  <li>서비스 이용으로 발생한 손해에 대해 회사는 법적 책임을 지지 않습니다.</li>
                </ul>

                <h2>제7조 (분쟁 해결)</h2>
                <p>본 약관에 관한 분쟁은 대한민국 법령에 따르며, 회사 본사 소재지 관할 법원에서 해결합니다.</p>

                <h2>부칙</h2>
                <p>본 약관은 2026년 5월 5일부터 시행됩니다.</p>
              </>
            )}
            <div className="flex gap-4">
              <button 
                onClick={() => setActiveTab('saju')}
                className="mt-12 bg-traditional-ink text-white px-8 py-3 rounded-xl font-medium"
              >
                홈으로 돌아가기
              </button>
            </div>
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
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{interpretation}</ReactMarkdown>
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
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{horoscopeOutput}</ReactMarkdown>
                <AdPlaceholder type="square" />
              </motion.div>
            )}
          </div>
        )}

        {activeTab === 'naming' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-serif font-bold text-traditional-ink">성명학 이름 감명</h2>
              <p className="text-zinc-500">당신의 이름에 담긴 기운과 사주와의 조화를 인공지능이 분석해 드립니다.</p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-lg border border-traditional-gold/10 space-y-6">
              <div className="p-4 bg-traditional-paper rounded-xl border-l-4 border-traditional-red text-sm text-zinc-600 mb-6">
                정확한 성명 감명을 위해서는 타고난 사주 정보가 필수입니다. <br/>
                <strong>성함과 함께 생년월일시를 정확히 입력해 주세요.</strong>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">분석할 성함</label>
                  <input 
                    type="text" 
                    placeholder="이름을 입력하세요"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl border border-traditional-gold/20 focus:outline-none focus:ring-2 focus:ring-traditional-red/20 text-lg transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">성별</label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setFormData({...formData, gender: 'male'})}
                      className={`flex-1 py-4 rounded-2xl border transition-all font-medium ${formData.gender === 'male' ? 'bg-traditional-red text-white border-traditional-red' : 'bg-zinc-50 text-zinc-500 border-traditional-gold/20 hover:border-traditional-gold'}`}
                    >
                      남성
                    </button>
                    <button 
                      onClick={() => setFormData({...formData, gender: 'female'})}
                      className={`flex-1 py-4 rounded-2xl border transition-all font-medium ${formData.gender === 'female' ? 'bg-traditional-red text-white border-traditional-red' : 'bg-zinc-50 text-zinc-500 border-traditional-gold/20 hover:border-traditional-gold'}`}
                    >
                      여성
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-zinc-50">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">태어난 정보 (사주 연계)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="grid grid-cols-3 gap-2">
                    <select 
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: Number(e.target.value)})}
                      className="px-4 py-4 rounded-2xl border border-traditional-gold/20 focus:outline-none bg-zinc-50 transition-all focus:bg-white"
                    >
                      {Array.from({length: 100}, (_, i) => 2025 - i).map(y => <option key={y} value={y}>{y}년</option>)}
                    </select>
                    <select 
                      value={formData.month}
                      onChange={(e) => setFormData({...formData, month: Number(e.target.value)})}
                      className="px-4 py-4 rounded-2xl border border-traditional-gold/20 focus:outline-none bg-zinc-50 transition-all focus:bg-white"
                    >
                      {Array.from({length: 12}, (_, i) => i + 1).map(m => <option key={m} value={m}>{m}월</option>)}
                    </select>
                    <select 
                      value={formData.day}
                      onChange={(e) => setFormData({...formData, day: Number(e.target.value)})}
                      className="px-4 py-4 rounded-2xl border border-traditional-gold/20 focus:outline-none bg-zinc-50 transition-all focus:bg-white"
                    >
                      {Array.from({length: 31}, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}일</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select 
                      value={formData.hour}
                      onChange={(e) => setFormData({...formData, hour: Number(e.target.value)})}
                      className="px-4 py-4 rounded-2xl border border-traditional-gold/20 focus:outline-none bg-zinc-50 transition-all focus:bg-white"
                    >
                      {Array.from({length: 24}, (_, i) => i).map(h => <option key={h} value={h}>{h}시</option>)}
                    </select>
                    <select 
                      value={formData.minute}
                      onChange={(e) => setFormData({...formData, minute: Number(e.target.value)})}
                      className="px-4 py-4 rounded-2xl border border-traditional-gold/20 focus:outline-none bg-zinc-50 transition-all focus:bg-white"
                    >
                      {Array.from({length: 60}, (_, i) => i).map(m => <option key={m} value={m}>{m}분</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={formData.isLunar} 
                      onChange={(e) => setFormData({...formData, isLunar: e.target.checked})} 
                      className="w-5 h-5 rounded border-traditional-gold/20 accent-traditional-red cursor-pointer"
                    />
                    <span className="text-sm text-zinc-500 group-hover:text-traditional-red transition-all">음력(Lunar) 필수 체크</span>
                  </label>
                </div>
              </div>

              <button 
                onClick={async () => {
                  if (!formData.name) { alert('성함을 입력해주세요.'); return; }
                  setLoading(true);
                  const result = calculateSaju(formData.year, formData.month, formData.day, formData.hour, formData.minute, formData.isLunar);
                  setSajuResult(result);
                  const text = await getNameReading(formData.name, result);
                  setNamingOutput(text || '');
                  setLoading(false);
                  setTimeout(() => {
                    document.getElementById('naming-result')?.scrollIntoView({ behavior: 'smooth' });
                  }, 150);
                }}
                disabled={loading}
                className="w-full bg-traditional-red text-white py-5 rounded-2xl font-serif font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2 text-xl shadow-lg shadow-traditional-red/20 disabled:opacity-70"
              >
                {loading ? <RefreshCw className="animate-spin" size={24} /> : <>이름 분석 및 사주 조화 확인 <ChevronRight size={24} /></>}
              </button>
            </div>

            {namingOutput && (
              <motion.div 
                id="naming-result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-traditional-gold/10 markdown-body"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{namingOutput}</ReactMarkdown>
                <AdPlaceholder type="banner" />
              </motion.div>
            )}
          </div>
        )}

        {/* Square Ad for some layout variation */}
        {/* Only show this preview on the home/saju tab when no specific guide is selected */}
        {activeTab === 'saju' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="md:col-span-2 space-y-8">
              <h3 className="text-xl font-serif font-bold border-l-4 border-traditional-red pl-3">사주 상식 & 가이드</h3>
              <div className="space-y-4">
                {GUIDE_POSTS.slice(0, 5).map((post) => (
                  <div 
                    key={post.id} 
                    onClick={() => { setSelectedGuide(post); setActiveTab('guide'); window.scrollTo(0, 0); }}
                    className="p-4 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors cursor-pointer group flex justify-between items-center border border-zinc-100 hover:border-traditional-gold/30"
                  >
                    <div>
                      <h4 className="font-semibold text-zinc-700 mb-1 group-hover:text-traditional-red transition-all">{post.title}</h4>
                      <p className="text-xs text-zinc-400">{post.excerpt}</p>
                    </div>
                    <ChevronRight size={16} className="text-zinc-300 group-hover:text-traditional-red group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
                <button 
                  onClick={() => { setSelectedGuide(null); setActiveTab('guide'); window.scrollTo(0, 0); }}
                  className="w-full py-3 text-sm font-medium text-zinc-500 hover:text-traditional-red transition-colors flex items-center justify-center gap-1"
                >
                  전체 가이드 보기 <Search size={14} />
                </button>
              </div>
            </div>
            <div>
              <AdPlaceholder type="square" />
            </div>
          </div>
        )}

        {activeTab === 'guide' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {!selectedGuide ? (
              <div className="space-y-8">
                <h2 className="text-3xl font-serif font-bold text-center">명리 지식 창고</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {GUIDE_POSTS.map((post) => (
                    <div 
                      key={post.id}
                      onClick={() => { setSelectedGuide(post); window.scrollTo(0, 0); }}
                      className="bg-white p-6 rounded-2xl shadow-sm border border-traditional-gold/10 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-traditional-gold bg-traditional-gold/5 px-2 py-1 rounded">
                          {post.category === 'saju' ? '사주명리' : post.category === 'naming' ? '성명학' : '생활상식'}
                        </span>
                        <span className="text-[10px] text-zinc-300 italic font-serif">{post.date}</span>
                      </div>
                      <h3 className="text-xl font-serif font-bold mb-3 group-hover:text-traditional-red transition-colors">{post.title}</h3>
                      <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-traditional-gold/10">
                <button 
                  onClick={() => setSelectedGuide(null)}
                  className="mb-8 text-zinc-400 hover:text-traditional-red flex items-center gap-1 text-sm transition-colors"
                >
                  <X size={16} /> 전체 목록으로
                </button>
                <div className="markdown-body">
                  <h1 className="text-3xl font-serif font-bold text-traditional-ink mb-2">{selectedGuide.title}</h1>
                  <div className="flex items-center gap-4 text-xs text-zinc-400 mb-8 border-b border-zinc-100 pb-4">
                    <span>분류: {selectedGuide.category === 'saju' ? '사주명리' : selectedGuide.category === 'naming' ? '성명학' : '생활상식'}</span>
                    <span>작성일: {selectedGuide.date}</span>
                  </div>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedGuide.content}</ReactMarkdown>
                </div>
                
                <AdPlaceholder type="banner" />
                
                <button 
                  onClick={() => { setSelectedGuide(null); setActiveTab('guide'); }}
                  className="mt-12 bg-traditional-ink text-white px-8 py-3 rounded-xl font-medium hover:bg-traditional-red transition-all shadow-lg"
                >
                  다른 가이드 더 읽어보기
                </button>
              </div>
            )}
          </motion.div>
        )}
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
              <li><button onClick={() => { setActiveTab('saju'); window.scrollTo(0,0); }} className="hover:text-white">정통 사주 분석</button></li>
              <li><button onClick={() => { setActiveTab('horoscope'); window.scrollTo(0,0); }} className="hover:text-white">오늘의 띠별 운세</button></li>
              <li><button onClick={() => { setActiveTab('naming'); window.scrollTo(0,0); }} className="hover:text-white">AI 이름 감명</button></li>
              <li><button onClick={() => { setSelectedGuide(null); setActiveTab('guide'); window.scrollTo(0,0); }} className="hover:text-white">사주 상식 가이드</button></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-serif font-bold">Legal</h4>
            <ul className="text-xs space-y-2">
              <li><button onClick={() => openPolicy('privacy')} className="hover:text-white">개인정보 처리방침</button></li>
              <li><button onClick={() => openPolicy('terms')} className="hover:text-white">이용약관</button></li>
              <li><button onClick={openContact} className="hover:text-white">문의하기 (Contact Us)</button></li>
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

