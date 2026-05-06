import { useState, useEffect, useRef } from 'react';
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
  ChevronLeft,
  TrendingUp,
  Heart,
  Briefcase,
  ShieldCheck,
  RefreshCw,
  Search,
  Printer,
  Download,
  LayoutDashboard,
  Layers,
  ArrowRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { calculateSaju, SajuData, ELEMENT_COLORS, ELEMENT_NAMES } from './lib/saju';
import { getSajuInterpretation, getNameReading, getDailyHoroscope } from './services/geminiService';
import { GUIDE_POSTS, GuidePost } from './constants/guides';
import { ElementRadarChart, DestinyNetwork } from './components/SajuVisuals';

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
    
    <div className="h-20 flex items-center justify-center px-6">
      <AnimatePresence mode="wait">
        <motion.p 
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="text-xl md:text-2xl font-serif text-traditional-ink text-center font-medium"
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
    
    <p className="mt-4 text-[10px] font-mono text-zinc-400 uppercase tracking-[0.2em] animate-pulse">
      AI Engine Analyzing Destiny Pattern...
    </p>
  </motion.div>
);

const PaginatedResult = ({ content, onPrint, onDownload }: { content: string, onPrint: () => void, onDownload: () => void }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const sections = content.split(/(?=【)/).filter(s => s.trim().length > 0);
  const totalPages = sections.length;

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="min-h-[300px]"
        >
          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {sections[currentPage] || content}
            </ReactMarkdown>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-12 pt-8 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <button 
            disabled={currentPage === 0}
            onClick={() => setCurrentPage(p => p - 1)}
            className="p-3 rounded-full bg-zinc-50 text-zinc-400 hover:bg-zinc-100 hover:text-traditional-ink disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="flex items-center gap-1.5 px-4 h-10 bg-zinc-50 rounded-full border border-zinc-100 overflow-x-auto max-w-[200px] sm:max-w-none">
            {sections.map((_, i) => (
              <button 
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`w-2 h-2 shrink-0 rounded-full transition-all ${i === currentPage ? 'bg-traditional-red scale-125' : 'bg-zinc-200 hover:bg-zinc-300'}`}
              />
            ))}
          </div>

          <button 
            disabled={currentPage === totalPages - 1}
            onClick={() => setCurrentPage(p => p + 1)}
            className="p-3 rounded-full bg-zinc-50 text-zinc-400 hover:bg-zinc-100 hover:text-traditional-ink disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={onPrint} className="p-2.5 rounded-xl bg-zinc-50 text-zinc-500 hover:bg-zinc-100 transition-all border border-zinc-100">
            <Printer size={18} />
          </button>
          <button onClick={onDownload} className="p-2.5 rounded-xl bg-zinc-50 text-zinc-500 hover:bg-zinc-100 transition-all border border-zinc-100">
            <Download size={18} />
          </button>
          <div className="ml-2 text-xs font-serif font-medium text-zinc-400 uppercase tracking-widest whitespace-nowrap">
            {currentPage + 1} / {totalPages}
          </div>
        </div>
      </div>

      {currentPage < totalPages - 1 && (
        <button 
          onClick={() => {
            setCurrentPage(p => p + 1);
            window.scrollTo({ top: document.getElementById('report-header')?.offsetTop ? document.getElementById('report-header')!.offsetTop - 100 : 0, behavior: 'smooth' });
          }}
          className="w-full mt-6 py-4 bg-traditional-paper text-traditional-red rounded-2xl border-2 border-dashed border-traditional-red/20 font-serif font-bold flex items-center justify-center gap-2 hover:bg-traditional-red/5 transition-all group"
        >
          다음 장으로 넘기기 <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      )}
    </div>
  );
};

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
  const [namingOutput, setNamingOutput] = useState('');
  const [horoscopeOutput, setHoroscopeOutput] = useState('');
  const [selectedZodiac, setSelectedZodiac] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('천기를 읽고 있습니다...');

  const downloadResult = (title: string, content: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${title}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const printResult = () => window.print();

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
    if (!formData.name) { alert('이름을 입력해주세요.'); return; }
    setLoading(true);
    try {
      const result = calculateSaju(formData.year, formData.month, formData.day, formData.hour, formData.minute, formData.isLunar);
      setSajuResult(result);
      const text = await getSajuInterpretation(result, formData.name, formData.gender === 'male' ? '남성' : '여성');
      setInterpretation(text || '');
    } catch (error) { console.error(error); } finally {
      setLoading(false);
      setTimeout(() => document.getElementById('result')?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const handleNameReading = async () => {
    if (!formData.name || !sajuResult) { alert('이름과 사주 정보를 먼저 입력해주세요.'); return; }
    setLoading(true);
    const text = await getNameReading(formData.name, sajuResult);
    setNamingOutput(text || '');
    setLoading(false);
  };

  const handleHoroscope = async (zodiac: string) => {
    setSelectedZodiac(zodiac);
    setLoading(true);
    const text = await getDailyHoroscope(zodiac);
    setHoroscopeOutput(text || '');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-traditional-red/20 selection:text-traditional-red font-sans">
      <AnimatePresence>{loading && <LoadingOverlay message={loadingMessage} />}</AnimatePresence>

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-traditional-gold/20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('saju')}>
            <div className="w-8 h-8 bg-traditional-red rounded-full flex items-center justify-center text-white font-serif font-bold text-lg">命</div>
            <h1 className="text-xl font-serif font-bold tracking-tight text-traditional-ink">명리 AI</h1>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {['saju', 'horoscope', 'naming', 'guide'].map((tab) => (
              <button 
                key={tab}
                onClick={() => { setActiveTab(tab as any); setSelectedGuide(null); }}
                className={`text-sm font-medium transition-colors ${activeTab === tab ? 'text-traditional-red border-b-2 border-traditional-red pb-1' : 'text-zinc-500 hover:text-traditional-red'}`}
              >
                {tab === 'saju' ? '사주 분석' : tab === 'horoscope' ? '오늘의 운세' : tab === 'naming' ? '성명 분석' : '사주 가이드'}
              </button>
            ))}
          </nav>

          <button className="md:hidden p-2 text-zinc-600" onClick={() => setShowNav(!showNav)}>
            {showNav ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        <AnimatePresence>
          {showNav && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-traditional-gold/20 px-4 py-4 space-y-4 overflow-hidden"
            >
              {['saju', 'horoscope', 'naming'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => { setActiveTab(tab as any); setShowNav(false); }}
                  className="block w-full text-left font-medium text-zinc-600 hover:text-traditional-red py-2"
                >
                  {tab === 'saju' ? '사주 분석' : tab === 'horoscope' ? '오늘의 운세' : '성명 분석'}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
        {activeTab === 'saju' && (
          <div className="space-y-12">
            <section className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-traditional-gold/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <div className="text-[120px] font-serif leading-none">運</div>
              </div>
              
              <div className="max-w-2xl">
                <h2 className="text-3xl font-serif font-bold text-traditional-red mb-4 underline decoration-traditional-gold/30 underline-offset-8">정통 사주 분석</h2>
                <p className="text-zinc-600 mb-8 leading-relaxed">
                  생년월일시 정보를 바탕으로 AI 명리학자가 당신의 운명을 정밀 분석합니다.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-500 flex items-center gap-1.5 uppercase tracking-wider">성함</label>
                    <input 
                      type="text" 
                      placeholder="이름 입력"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-4 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-traditional-red/20 focus:border-traditional-red transition-all"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-500 flex items-center gap-1.5 uppercase tracking-wider">성별</label>
                    <div className="flex gap-2">
                      {['male', 'female'].map(g => (
                        <button 
                          key={g}
                          onClick={() => setFormData({...formData, gender: g as any})}
                          className={`flex-1 py-4 rounded-xl border transition-all text-sm font-medium ${formData.gender === g ? 'bg-traditional-ink text-white border-traditional-ink' : 'bg-zinc-50 text-zinc-500 border-zinc-200 hover:border-zinc-300'}`}
                        >
                          {g === 'male' ? '남성' : '여성'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-500 flex items-center gap-1.5 uppercase tracking-wider">생년월일</label>
                    <div className="grid grid-cols-3 gap-2">
                      <select value={formData.year} onChange={(e) => setFormData({...formData, year: Number(e.target.value)})} className="px-2 py-4 rounded-xl border border-zinc-200 focus:outline-none text-sm bg-white">
                        {Array.from({length: 100}, (_, i) => 2025 - i).map(y => (<option key={y} value={y}>{y}년</option>))}
                      </select>
                      <select value={formData.month} onChange={(e) => setFormData({...formData, month: Number(e.target.value)})} className="px-2 py-4 rounded-xl border border-zinc-200 focus:outline-none text-sm bg-white">
                        {Array.from({length: 12}, (_, i) => i + 1).map(m => (<option key={m} value={m}>{m}월</option>))}
                      </select>
                      <select value={formData.day} onChange={(e) => setFormData({...formData, day: Number(e.target.value)})} className="px-2 py-4 rounded-xl border border-zinc-200 focus:outline-none text-sm bg-white">
                        {Array.from({length: 31}, (_, i) => i + 1).map(d => (<option key={d} value={d}>{d}일</option>))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-500 flex items-center gap-1.5 uppercase tracking-wider">태어난 시</label>
                    <div className="grid grid-cols-2 gap-2">
                      <select value={formData.hour} onChange={(e) => setFormData({...formData, hour: Number(e.target.value)})} className="px-2 py-4 rounded-xl border border-zinc-200 focus:outline-none text-sm bg-white">
                        {Array.from({length: 24}, (_, i) => i).map(h => (<option key={h} value={h}>{h}시</option>))}
                      </select>
                      <select value={formData.minute} onChange={(e) => setFormData({...formData, minute: Number(e.target.value)})} className="px-2 py-4 rounded-xl border border-zinc-200 focus:outline-none text-sm bg-white">
                        {Array.from({length: 60}, (_, i) => i).map(m => (<option key={m} value={m}>{m}분</option>))}
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-2 flex items-center gap-3 pt-4">
                    <input 
                      type="checkbox" 
                      id="lunar" 
                      checked={formData.isLunar} 
                      onChange={(e) => setFormData({...formData, isLunar: e.target.checked})} 
                      className="w-5 h-5 rounded border-zinc-300 text-traditional-red focus:ring-traditional-red"
                    />
                    <label htmlFor="lunar" className="text-sm font-medium text-zinc-600 cursor-pointer">음력(달력)으로 계산</label>
                  </div>
                </div>

                <button 
                  onClick={handleCalculate}
                  disabled={loading}
                  className="w-full mt-8 bg-traditional-ink text-white py-5 rounded-2xl font-serif text-xl font-bold hover:bg-traditional-red transition-all flex items-center justify-center gap-2 shadow-xl disabled:opacity-70 group"
                >
                  {loading ? <RefreshCw className="animate-spin" /> : <>운명의 분석 시작 <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" /></>}
                </button>
              </div>
            </section>

            <AnimatePresence>
              {sajuResult && interpretation && (
                <motion.div id="result" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                  <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-3xl p-6 md:p-10 shadow-lg border border-traditional-gold/10 overflow-x-auto">
                      <h3 className="text-2xl font-serif font-bold text-traditional-ink mb-8 flex items-center gap-2"><BookOpen className="text-traditional-gold" /> 사주 명식 (命式)</h3>
                      <div className="grid grid-cols-4 gap-2 md:gap-4 mb-10 min-w-[320px]">
                        {[
                          { l: '시주', s: sajuResult.hourStem, b: sajuResult.hourBranch },
                          { l: '일주', s: sajuResult.dayStem, b: sajuResult.dayBranch },
                          { l: '월주', s: sajuResult.monthStem, b: sajuResult.monthBranch },
                          { l: '연주', s: sajuResult.yearStem, b: sajuResult.yearBranch }
                        ].map((p, i) => (
                          <div key={i} className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-tighter">{p.l}</span>
                            <div className="w-full space-y-1">
                              <div className="bg-zinc-50 p-4 md:p-6 rounded-t-xl text-center border border-zinc-100"><span className="text-2xl md:text-3xl font-serif font-bold">{p.s}</span></div>
                              <div className="bg-zinc-50 p-4 md:p-6 rounded-b-xl text-center border border-zinc-100"><span className="text-2xl md:text-3xl font-serif font-bold">{p.b}</span></div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                        <h4 className="text-[10px] font-bold text-zinc-400 mb-6 text-center uppercase tracking-[0.2em]">오행 자원 분포</h4>
                        <div className="flex justify-between items-end h-24">
                          {Object.entries(sajuResult.fiveElements).map(([k, v]) => (
                            <div key={k} className="flex flex-col items-center gap-2 flex-1">
                              <div className="relative w-full flex justify-center items-end h-16">
                                <motion.div initial={{ height: 0 }} animate={{ height: `${(v / 4) * 100}%` }} className="w-3 rounded-t-full shadow-sm" style={{ backgroundColor: ELEMENT_COLORS[k] }} />
                              </div>
                              <span className="text-[10px] font-bold text-zinc-500">{ELEMENT_NAMES[k]}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 md:p-10 shadow-lg border border-traditional-gold/10 flex flex-col">
                      <h3 className="text-2xl font-serif font-bold text-traditional-ink mb-8 flex items-center gap-2"><LayoutDashboard className="text-traditional-gold" /> 에너지 밸런스</h3>
                      <div className="flex-1 flex flex-col justify-center min-h-[300px]">
                        <ElementRadarChart data={sajuResult} />
                      </div>
                    </div>
                  </section>

                  <section className="bg-traditional-paper/50 rounded-3xl p-6 md:p-10 border border-traditional-gold/10 text-center overflow-hidden">
                    <h3 className="text-2xl font-serif font-bold text-traditional-ink mb-2">운명 에너지 네트워크</h3>
                    <p className="text-zinc-500 text-sm mb-12">오행의 상생상극(相生相剋) 흐름을 시각적으로 탐색하세요.</p>
                    <DestinyNetwork data={sajuResult} />
                  </section>

                  <section className="bg-white rounded-3xl shadow-xl border border-traditional-gold/10 overflow-hidden relative">
                    <div className="h-2 bg-traditional-red"></div>
                    <div className="p-6 md:p-12">
                      <div id="report-header" className="flex items-center justify-between mb-12">
                        <div>
                          <h3 className="text-3xl font-serif font-bold text-traditional-ink">운명 심층 보고서</h3>
                          <p className="text-zinc-500 text-sm flex items-center gap-1.5 font-serif italic text-traditional-gold mt-1">
                            <ShieldCheck size={14} /> AI 명리학 정밀 솔루션
                          </p>
                        </div>
                      </div>
                      <PaginatedResult content={interpretation} onPrint={printResult} onDownload={() => downloadResult(`${formData.name}_사주해석`, interpretation)} />
                    </div>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ... Rest of tabs (naming, horoscope, etc) implemented with same styling ... */}
        {activeTab === 'horoscope' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            <h2 className="text-3xl font-serif font-bold text-center mb-8 underline decoration-zinc-100 underline-offset-8">오늘의 띠별 운세</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지'].map((z, i) => (
                <button 
                  key={i}
                  onClick={() => handleHoroscope(z)}
                  className={`aspect-square flex flex-col items-center justify-center rounded-2xl shadow-sm border transition-all gap-1 group ${selectedZodiac === z ? 'bg-traditional-ink text-white border-traditional-ink' : 'bg-white border-zinc-200 hover:border-traditional-red/30 focus:border-traditional-red'}`}
                >
                  <span className="text-3xl transform group-hover:scale-110 transition-transform">{['🐭', '🐮', '🐯', '🐰', '🐲', '🐍', '🐴', '🐑', '🐵', '🐔', '🐶', '🐷'][i]}</span>
                  <span className="text-xs font-bold tracking-tight">{z}띠</span>
                </button>
              ))}
            </div>
            {horoscopeOutput && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-8 shadow-lg border border-traditional-gold/10 markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{horoscopeOutput}</ReactMarkdown>
              </motion.div>
            )}
          </div>
        )}

        {activeTab === 'naming' && (
           <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-3xl font-serif font-bold text-center mb-4">성명학 이름 감명</h2>
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-traditional-gold/10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">분석할 이름</label>
                  <input type="text" placeholder="이름 입력" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-6 py-4 rounded-xl border border-zinc-200 text-lg focus:ring-2 focus:ring-zinc-100" />
                </div>
                <div className="flex flex-col justify-end">
                   <button onClick={handleNameReading} className="w-full py-4 bg-traditional-ink text-white rounded-xl font-bold hover:bg-traditional-red transition-all">이름 감명 시작</button>
                </div>
              </div>
              {namingOutput && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-8 border-t border-zinc-100 markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{namingOutput}</ReactMarkdown>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="space-y-8 max-w-4xl mx-auto">
             <h2 className="text-3xl font-serif font-bold text-center mb-8">사주 명리학 가이드</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {GUIDE_POSTS.map((post, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setSelectedGuide(post)}
                    className="p-6 bg-white rounded-3xl shadow-sm border border-zinc-100 text-left hover:shadow-md transition-all group"
                  >
                    <span className="text-[10px] font-bold text-traditional-red mb-2 block uppercase tracking-widest">{post.category}</span>
                    <h4 className="text-lg font-serif font-bold mb-3 group-hover:text-traditional-red transition-colors">{post.title}</h4>
                    <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                  </button>
                ))}
             </div>
             {selectedGuide && (
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed inset-0 z-[60] bg-white overflow-y-auto p-6 md:p-12">
                  <div className="max-w-3xl mx-auto">
                    <button onClick={() => setSelectedGuide(null)} className="mb-12 flex items-center gap-2 text-zinc-500 hover:text-traditional-ink font-medium"><ChevronLeft size={20} /> 목록으로 돌아가기</button>
                    <div className="markdown-body">
                      <h1>{selectedGuide.title}</h1>
                      <div className="text-zinc-400 text-sm mb-12">발행일: {selectedGuide.date}</div>
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{selectedGuide.content}</ReactMarkdown>
                    </div>
                  </div>
               </motion.div>
             )}
          </div>
        )}
      </main>

      <footer className="bg-zinc-900 text-zinc-500 py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white mb-6">
              <div className="w-6 h-6 bg-traditional-red rounded-full flex items-center justify-center font-serif text-sm">命</div>
              <span className="font-serif font-bold tracking-widest uppercase">Myungli AI</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">AI 명리학 분석 플랫폼. 전통의 지혜를 현대적인 기술로 해석하여 당신의 삶의 방향을 제안합니다.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h5 className="text-white text-sm font-bold mb-4 uppercase tracking-tighter">서비스</h5>
              <ul className="text-xs space-y-3">
                <li><button onClick={() => setActiveTab('saju')}>사주 분석</button></li>
                <li><button onClick={() => setActiveTab('horoscope')}>띠별 운세</button></li>
                <li><button onClick={() => setActiveTab('naming')}>성명 감명</button></li>
              </ul>
            </div>
            <div>
               <h5 className="text-white text-sm font-bold mb-4 uppercase tracking-tighter">정보</h5>
               <ul className="text-xs space-y-3">
                 <li><button onClick={() => setActiveTab('policy')}>개인정보 처리방침</button></li>
                 <li><button onClick={() => setActiveTab('contact')}>문의하기</button></li>
               </ul>
            </div>
          </div>
          <div>
            <h5 className="text-white text-sm font-bold mb-4 uppercase tracking-tighter">Contact</h5>
            <p className="text-xs">apark12321@gmail.com</p>
            <p className="text-[10px] mt-6 text-zinc-600">© 2026 AlGoPartners. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
