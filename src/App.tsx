import { useEffect, useState } from 'react';
import { Activity, Briefcase, CheckCircle2, ChevronRight, CreditCard, Heart, Lock, Menu, MessageCircle, RefreshCw, ShieldCheck, Sparkles, Star, Wallet, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { calculateSaju, SajuData, ELEMENT_COLORS, ELEMENT_NAMES } from './lib/saju';
import { getSajuInterpretation, getNameReading, getDailyHoroscope } from './services/geminiService';

type Tab = 'saju' | 'pricing' | 'horoscope' | 'naming' | 'contact';
type PayMethod = 'card' | 'kakao' | 'toss' | 'naver';

const nav: Array<{ key: Tab; label: string }> = [
  { key: 'saju', label: '사주 분석' },
  { key: 'pricing', label: '이용요금' },
  { key: 'horoscope', label: '오늘의 운세' },
  { key: 'naming', label: '이름 감명' },
  { key: 'contact', label: '문의' }
];

const reportItems = [
  { icon: Wallet, title: '재물운', desc: '돈이 들어오고 새는 흐름과 관리 포인트' },
  { icon: Briefcase, title: '직업·사업운', desc: '맞는 일, 이직·창업 판단 기준' },
  { icon: Heart, title: '연애·배우자운', desc: '관계 스타일과 갈등을 줄이는 방법' },
  { icon: Activity, title: '건강 경향', desc: '생활 습관 관점의 관리 방향' }
];

function Loading({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-traditional-paper/95 p-6">
      <div className="w-16 h-16 rounded-full border-4 border-traditional-red/10 border-t-traditional-red animate-spin mb-6" />
      <p className="text-xl font-bold text-center">{message}</p>
      <p className="text-sm text-zinc-500 mt-2 text-center">어려운 용어를 줄이고 쉬운 리포트로 정리 중입니다.</p>
    </div>
  );
}

function PaymentModal({ open, onClose, onComplete }: { open: boolean; onClose: () => void; onComplete: () => void }) {
  const [method, setMethod] = useState<PayMethod>('card');
  const [agree, setAgree] = useState(false);
  if (!open) return null;

  const methods: Array<{ key: PayMethod; label: string }> = [
    { key: 'card', label: '카드' },
    { key: 'kakao', label: '카카오페이' },
    { key: 'toss', label: '토스페이' },
    { key: 'naver', label: '네이버페이' }
  ];

  return (
    <div className="fixed inset-0 z-[90] bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-traditional-red">전체 사주 리포트</p>
            <h3 className="text-2xl font-bold mt-1">9,900원 결제하기</h3>
            <p className="text-sm text-zinc-500 mt-2">한 번 결제 후 바로 열람합니다. 정기결제가 아닙니다.</p>
          </div>
          <button onClick={onClose} className="p-2 h-10 rounded-full hover:bg-zinc-100"><X size={22} /></button>
        </div>

        <div className="p-6 space-y-5">
          <div className="rounded-2xl bg-zinc-50 p-4 border border-zinc-100 text-sm space-y-3">
            <div className="flex justify-between"><span className="text-zinc-500">상품</span><b>전체 사주 리포트</b></div>
            <div className="flex justify-between"><span className="text-zinc-500">금액</span><b className="text-xl text-traditional-red">9,900원</b></div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-500 pt-2">
              <span>✓ 즉시 열람</span><span>✓ 저장 가능</span><span>✓ 정기결제 아님</span><span>✓ 광고성 연락 없음</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-bold">결제수단</label>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {methods.map((m) => (
                <button key={m.key} onClick={() => setMethod(m.key)} className={`py-3 rounded-xl border text-sm font-bold ${method === m.key ? 'bg-traditional-ink text-white border-traditional-ink' : 'bg-white text-zinc-600 border-zinc-200'}`}>{m.label}</button>
              ))}
            </div>
          </div>

          <label className="flex gap-3 rounded-2xl border border-zinc-200 p-4 cursor-pointer">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 accent-traditional-red" />
            <span className="text-xs text-zinc-600 leading-relaxed">이용약관, 개인정보 처리방침, 결제 및 환불 안내를 확인했습니다. 디지털 콘텐츠 특성상 열람 후 단순 변심 환불은 제한될 수 있습니다.</span>
          </label>

          <button disabled={!agree} onClick={onComplete} className="w-full py-4 rounded-2xl bg-traditional-red text-white font-bold hover:bg-traditional-ink disabled:opacity-40 flex items-center justify-center gap-2">
            <CreditCard size={18} /> 결제하고 전체 리포트 보기
          </button>
          <p className="text-[11px] text-zinc-400 text-center">운영 전 실제 PG 승인 연동과 환불 정책 고지가 필요합니다.</p>
        </div>
      </div>
    </div>
  );
}

function Pricing({ onStartFree, onPay }: { onStartFree: () => void; onPay: () => void }) {
  return (
    <section className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-sm font-bold text-traditional-red mb-2">이용요금</p>
        <h2 className="text-3xl md:text-4xl font-bold">무료로 먼저 보고, 필요할 때만 결제하세요</h2>
        <p className="text-zinc-600 mt-4">핵심 상품은 하나로 단순화했습니다. 무료 요약 후 전체 리포트로 자연스럽게 이어집니다.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm flex flex-col">
          <Sparkles className="text-traditional-red" /><h3 className="text-2xl font-bold mt-4">무료 사주 요약</h3><p className="text-4xl font-black mt-4">0원</p>
          <p className="text-sm text-zinc-500 mt-3">성향, 오행 균형, 올해 흐름을 간단히 확인합니다.</p>
          <ul className="mt-6 space-y-3 text-sm text-zinc-600 flex-1"><li>✓ 기본 성향</li><li>✓ 오행 균형표</li><li>✓ 올해 흐름 요약</li></ul>
          <button onClick={onStartFree} className="mt-8 w-full py-4 rounded-2xl border border-zinc-200 font-bold hover:bg-zinc-50">무료로 보기</button>
        </div>
        <div className="bg-white rounded-3xl p-6 border-2 border-traditional-red shadow-xl flex flex-col relative">
          <span className="absolute top-0 right-0 bg-traditional-red text-white text-xs font-bold px-4 py-2 rounded-bl-2xl">추천</span>
          <Star className="text-traditional-red" /><h3 className="text-2xl font-bold mt-4">전체 사주 리포트</h3><p className="text-4xl font-black text-traditional-red mt-4">9,900원</p>
          <p className="text-sm text-zinc-500 mt-3">재물·직업·연애·건강·올해 흐름까지 한 번에 확인합니다.</p>
          <ul className="mt-6 space-y-3 text-sm text-zinc-700 flex-1"><li>✓ 재물운 상세</li><li>✓ 직업·사업 흐름</li><li>✓ 연애·배우자운</li><li>✓ 저장 가능</li></ul>
          <button onClick={onPay} className="mt-8 w-full py-4 rounded-2xl bg-traditional-red text-white font-bold hover:bg-traditional-ink">9,900원으로 전체 보기</button>
          <p className="text-[11px] text-center text-zinc-400 mt-3">정기결제 아님 · 결제 후 바로 열람</p>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm flex flex-col">
          <MessageCircle className="text-traditional-red" /><h3 className="text-2xl font-bold mt-4">전문가 상담 신청</h3><p className="text-4xl font-black mt-4">49,000원~</p>
          <p className="text-sm text-zinc-500 mt-3">작명, 궁합, 이사, 사업 방향처럼 자세한 상담이 필요한 경우입니다.</p>
          <ul className="mt-6 space-y-3 text-sm text-zinc-600 flex-1"><li>✓ 상담 범위 확인</li><li>✓ 일정 협의</li><li>✓ 개별 질문 중심</li></ul>
          <a href="mailto:apark12321@gmail.com?subject=사주 전문가 상담 신청" className="mt-8 w-full py-4 rounded-2xl border border-zinc-200 font-bold hover:bg-zinc-50 text-center">상담 문의하기</a>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>('saju');
  const [showNav, setShowNav] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('사주 정보를 확인하고 있습니다...');
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem('saju_report_unlocked') === 'true');
  const [form, setForm] = useState({ name: '', gender: 'male', birthDate: '1990-01-01', birthTime: '12:00', isLunar: false, hanja: '' });
  const [saju, setSaju] = useState<SajuData | null>(null);
  const [report, setReport] = useState('');
  const [nameReport, setNameReport] = useState('');
  const [zodiac, setZodiac] = useState('');
  const [daily, setDaily] = useState('');

  useEffect(() => {
    if (!loading) return;
    const messages = ['사주 정보를 확인하고 있습니다...', '오행 균형을 정리하고 있습니다...', '일반인이 이해하기 쉬운 말로 바꾸고 있습니다...'];
    let i = 0;
    const id = window.setInterval(() => { i = (i + 1) % messages.length; setLoadingMessage(messages[i]); }, 2200);
    return () => window.clearInterval(id);
  }, [loading]);

  const moveToInput = () => { setTab('saju'); setTimeout(() => document.getElementById('input')?.scrollIntoView({ behavior: 'smooth' }), 80); };
  const openPayment = () => setPaymentOpen(true);
  const completePayment = () => { localStorage.setItem('saju_report_unlocked', 'true'); setUnlocked(true); setPaymentOpen(false); setTimeout(() => document.getElementById('full-report')?.scrollIntoView({ behavior: 'smooth' }), 80); };

  const analyze = async () => {
    if (!form.name.trim()) return alert('이름을 입력해주세요.');
    const [year, month, day] = form.birthDate.split('-').map(Number);
    const [hour, minute] = form.birthTime.split(':').map(Number);
    setLoading(true);
    try {
      const result = calculateSaju(year, month, day, hour || 12, minute || 0, form.isLunar);
      setSaju(result);
      const text = await getSajuInterpretation(result, form.name.trim(), form.gender === 'male' ? '남성' : '여성');
      setReport(text || '분석 결과를 가져오지 못했습니다.');
    } catch (e) {
      console.error(e);
      alert('분석 중 오류가 발생했습니다. 입력값을 확인해주세요.');
    } finally {
      setLoading(false);
      setTimeout(() => document.getElementById('result')?.scrollIntoView({ behavior: 'smooth' }), 80);
    }
  };

  const runNameReading = async () => {
    if (!form.name.trim()) return alert('이름을 입력해주세요.');
    if (!saju) return alert('먼저 사주 분석을 진행하면 이름 감명이 더 정확합니다.');
    setLoading(true);
    setNameReport(await getNameReading(form.name.trim(), saju));
    setLoading(false);
  };

  const runDaily = async (z: string) => {
    setZodiac(z);
    setLoading(true);
    setDaily(await getDailyHoroscope(z));
    setLoading(false);
  };

  const download = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([report], { type: 'text/plain' }));
    a.download = `${form.name || '사주'}_전체리포트.txt`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-traditional-red/20">
      {loading && <Loading message={loadingMessage} />}
      <PaymentModal open={paymentOpen} onClose={() => setPaymentOpen(false)} onComplete={completePayment} />

      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-traditional-gold/20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => setTab('saju')} className="flex items-center gap-2"><span className="w-8 h-8 bg-traditional-red rounded-full text-white flex items-center justify-center font-serif font-bold">命</span><b className="text-xl font-serif">사주명리 리포트</b></button>
          <nav className="hidden md:flex items-center gap-7">{nav.map((n) => <button key={n.key} onClick={() => setTab(n.key)} className={`text-sm font-bold ${tab === n.key ? 'text-traditional-red border-b-2 border-traditional-red pb-1' : 'text-zinc-500 hover:text-traditional-red'}`}>{n.label}</button>)}</nav>
          <button className="md:hidden p-2" onClick={() => setShowNav(!showNav)}>{showNav ? <X /> : <Menu />}</button>
        </div>
        {showNav && <div className="md:hidden bg-white px-4 py-4 border-t space-y-2">{nav.map((n) => <button key={n.key} onClick={() => { setTab(n.key); setShowNav(false); }} className="block w-full text-left py-2 font-bold text-zinc-600">{n.label}</button>)}</div>}
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 md:py-12">
        {tab === 'saju' && <div className="space-y-12">
          <section className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white border border-traditional-gold/20 px-4 py-2 rounded-full text-sm font-bold text-traditional-red"><ShieldCheck size={16} /> 회원가입 없이 무료 요약 가능</div>
              <h1 className="text-4xl md:text-6xl font-black leading-tight">내 사주,<br />어려운 말 없이 쉽게 확인하세요</h1>
              <p className="text-lg text-zinc-600 leading-relaxed max-w-2xl">생년월일과 태어난 시간을 입력하면 성향, 재물운, 직업운, 연애운, 올해 흐름을 한눈에 볼 수 있는 개인 사주 리포트를 제공합니다.</p>
              <div className="flex flex-col sm:flex-row gap-3"><button onClick={moveToInput} className="px-6 py-4 rounded-2xl bg-traditional-red text-white font-bold shadow-lg">무료로 간단히 보기</button><button onClick={() => setTab('pricing')} className="px-6 py-4 rounded-2xl bg-white border border-zinc-200 font-bold">이용요금 보기</button></div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-zinc-500">{['태어난 시간을 몰라도 가능', '정기결제 없음', '결제 전 무료 요약 제공'].map((t) => <span key={t} className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-600" />{t}</span>)}</div>
            </div>

            <div id="input" className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-traditional-gold/10">
              <h2 className="text-2xl font-bold">사주 분석 정보 입력</h2><p className="text-sm text-zinc-500 mt-1 mb-6">필수 정보만 입력해도 무료 요약을 볼 수 있습니다.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <label className="space-y-2 md:col-span-2"><span className="text-sm font-bold text-zinc-600">이름</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="예: 홍길동" className="w-full px-4 py-4 rounded-xl border border-zinc-200" /></label>
                <div className="space-y-2"><span className="text-sm font-bold text-zinc-600">성별</span><div className="flex gap-2"><button onClick={() => setForm({ ...form, gender: 'male' })} className={`flex-1 py-4 rounded-xl border font-bold ${form.gender === 'male' ? 'bg-traditional-ink text-white' : 'bg-zinc-50 text-zinc-500'}`}>남성</button><button onClick={() => setForm({ ...form, gender: 'female' })} className={`flex-1 py-4 rounded-xl border font-bold ${form.gender === 'female' ? 'bg-traditional-ink text-white' : 'bg-zinc-50 text-zinc-500'}`}>여성</button></div></div>
                <label className="space-y-2"><span className="text-sm font-bold text-zinc-600">생년월일</span><input type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} className="w-full px-4 py-4 rounded-xl border border-zinc-200 bg-white" /></label>
                <label className="space-y-2"><span className="text-sm font-bold text-zinc-600">태어난 시간</span><input type="time" value={form.birthTime} onChange={(e) => setForm({ ...form, birthTime: e.target.value })} className="w-full px-4 py-4 rounded-xl border border-zinc-200 bg-white" /><span className="text-[11px] text-zinc-400">모르면 정오 기준으로 시작해도 됩니다.</span></label>
                <div className="space-y-2"><span className="text-sm font-bold text-zinc-600">달력 기준</span><button onClick={() => setForm({ ...form, isLunar: !form.isLunar })} className={`w-full py-4 rounded-xl border font-bold ${form.isLunar ? 'bg-traditional-ink text-white' : 'bg-zinc-50 text-zinc-600'}`}>{form.isLunar ? '음력으로 계산 중' : '양력으로 계산 중'}</button></div>
                <label className="space-y-2 md:col-span-2"><span className="text-sm font-bold text-zinc-600">이름 한자 <span className="text-zinc-400 font-normal">선택</span></span><input value={form.hanja} onChange={(e) => setForm({ ...form, hanja: e.target.value })} placeholder="예: 洪吉童" className="w-full px-4 py-4 rounded-xl border border-zinc-200" /></label>
              </div>
              <button onClick={analyze} disabled={loading} className="w-full mt-8 bg-traditional-ink text-white py-5 rounded-2xl text-lg font-bold hover:bg-traditional-red flex items-center justify-center gap-2 disabled:opacity-70">{loading ? <RefreshCw className="animate-spin" /> : <>무료 사주 요약 보기 <ChevronRight size={22} /></>}</button>
              <p className="text-[11px] text-zinc-400 text-center mt-3">입력 정보는 리포트 생성을 위해서만 사용됩니다.</p>
            </div>
          </section>

          {saju && report && <section id="result" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border border-traditional-gold/10">
                <h3 className="text-2xl font-bold mb-6">무료 사주 요약</h3>
                <div className="grid grid-cols-4 gap-2 mb-8">{[{l:'시주',s:saju.hourStem,b:saju.hourBranch},{l:'일주',s:saju.dayStem,b:saju.dayBranch},{l:'월주',s:saju.monthStem,b:saju.monthBranch},{l:'연주',s:saju.yearStem,b:saju.yearBranch}].map((p) => <div key={p.l} className="text-center"><p className="text-xs text-zinc-400 font-bold mb-2">{p.l}</p><div className="bg-zinc-50 p-4 rounded-t-xl border"><b className="text-2xl font-serif">{p.s}</b></div><div className="bg-zinc-50 p-4 rounded-b-xl border"><b className="text-2xl font-serif">{p.b}</b></div></div>)}</div>
                <h4 className="text-xs font-bold text-zinc-400 mb-4 text-center">오행 균형표</h4>
                <div className="flex justify-between items-end h-24 bg-zinc-50 rounded-2xl p-5 border">{Object.entries(saju.fiveElements).map(([k, v]) => <div key={k} className="flex flex-col items-center gap-2 flex-1"><div className="h-14 flex items-end"><div className="w-4 rounded-t-full" style={{ height: `${Math.max(12, (Number(v) / 4) * 100)}%`, backgroundColor: ELEMENT_COLORS[k] }} /></div><span className="text-[11px] font-bold text-zinc-500">{ELEMENT_NAMES[k]}</span></div>)}</div>
              </div>
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border border-traditional-gold/10">
                <h3 className="text-2xl font-bold mb-6">무료로 확인한 내용</h3>
                <div className="space-y-4">{reportItems.map((item) => { const Icon = item.icon; return <div key={item.title} className="rounded-2xl border bg-zinc-50 p-5 flex gap-4"><Icon className="text-traditional-red shrink-0" /><div><b>{item.title}</b><p className="text-sm text-zinc-500 mt-1">{item.desc}</p></div><Lock className="text-zinc-300 ml-auto shrink-0" /></div>; })}</div>
              </div>
            </div>
            {!unlocked ? <div className="bg-white rounded-3xl shadow-xl border border-traditional-gold/10 p-6 md:p-10"><p className="text-sm font-bold text-traditional-red mb-2">무료 요약 완료</p><h3 className="text-3xl font-bold">더 자세한 해석은 전체 리포트에서 확인하세요</h3><p className="text-zinc-500 mt-3">재물운, 직업운, 연애운, 건강 경향, 올해 주의 시기를 쉬운 말로 풀어드립니다.</p><button onClick={openPayment} className="mt-6 px-6 py-4 rounded-2xl bg-traditional-red text-white font-bold">9,900원으로 전체 보기</button></div> : <div id="full-report" className="bg-white rounded-3xl shadow-xl border border-traditional-gold/10 p-6 md:p-10"><div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"><div><p className="text-sm font-bold text-traditional-red mb-2">전체 열람 완료</p><h3 className="text-3xl font-bold">전체 사주 리포트</h3></div><div className="flex gap-2"><button onClick={() => window.print()} className="px-4 py-2 rounded-xl border font-bold">출력</button><button onClick={download} className="px-4 py-2 rounded-xl border font-bold">저장</button></div></div><div className="markdown-body"><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{report}</ReactMarkdown></div></div>}
          </section>}
        </div>}

        {tab === 'pricing' && <Pricing onStartFree={moveToInput} onPay={openPayment} />}

        {tab === 'horoscope' && <section className="max-w-4xl mx-auto space-y-8"><div className="text-center"><p className="text-sm font-bold text-traditional-red mb-2">무료 콘텐츠</p><h2 className="text-3xl md:text-4xl font-bold">오늘의 띠별 운세</h2><p className="text-zinc-500 mt-3">가볍게 확인하는 하루 조언입니다.</p></div><div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">{['쥐','소','호랑이','토끼','용','뱀','말','양','원숭이','닭','개','돼지'].map((z, i) => <button key={z} onClick={() => runDaily(z)} className={`aspect-square rounded-2xl border shadow-sm flex flex-col items-center justify-center gap-1 ${zodiac === z ? 'bg-traditional-ink text-white' : 'bg-white'}`}><span className="text-3xl">{['🐭','🐮','🐯','🐰','🐲','🐍','🐴','🐑','🐵','🐔','🐶','🐷'][i]}</span><b className="text-xs">{z}띠</b></button>)}</div>{daily && <div className="bg-white rounded-3xl p-8 shadow-lg border markdown-body"><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{daily}</ReactMarkdown></div>}</section>}

        {tab === 'naming' && <section className="max-w-4xl mx-auto space-y-8"><div className="text-center"><p className="text-sm font-bold text-traditional-red mb-2">선택 분석</p><h2 className="text-3xl md:text-4xl font-bold">이름 감명</h2><p className="text-zinc-500 mt-3">사주 분석 후 진행하면 이름과 오행의 조화를 더 자세히 볼 수 있습니다.</p></div><div className="bg-white rounded-3xl p-8 shadow-lg border space-y-6"><div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-end"><label className="space-y-2"><span className="text-sm font-bold">분석할 이름</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="예: 홍길동" className="w-full px-6 py-4 rounded-xl border" /></label><button onClick={runNameReading} className="py-4 px-6 bg-traditional-ink text-white rounded-xl font-bold hover:bg-traditional-red">이름 감명 시작</button></div>{nameReport && <div className="pt-8 border-t markdown-body"><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{nameReport}</ReactMarkdown></div>}</div></section>}

        {tab === 'contact' && <section className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-10 shadow-lg border"><p className="text-sm font-bold text-traditional-red mb-2">문의하기</p><h2 className="text-3xl font-bold mb-4">상담이나 결제 문의가 필요하신가요?</h2><p className="text-zinc-600 leading-relaxed mb-6">전문가 상담, 작명, 궁합, 사업 방향, 결제 오류 문의는 아래 이메일로 남겨주세요.</p><a href="mailto:apark12321@gmail.com?subject=사주명리 리포트 문의" className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-traditional-red text-white font-bold"><MessageCircle size={18} /> 이메일로 문의하기</a></section>}
      </main>

      <footer className="bg-zinc-900 text-zinc-500 py-12 px-4 mt-8"><div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8"><div><div className="flex items-center gap-2 text-white mb-5"><span className="w-6 h-6 bg-traditional-red rounded-full flex items-center justify-center font-serif text-sm">命</span><b>사주명리 리포트</b></div><p className="text-sm leading-relaxed max-w-xs">전통 명리학을 현대적인 언어로 풀어, 일반인도 쉽게 이해할 수 있는 사주 리포트를 제공합니다.</p></div><div><h5 className="text-white text-sm font-bold mb-4">서비스</h5><ul className="text-xs space-y-3">{nav.slice(0,4).map((n) => <li key={n.key}><button onClick={() => setTab(n.key)}>{n.label}</button></li>)}</ul></div><div><h5 className="text-white text-sm font-bold mb-4">Contact</h5><p className="text-xs">apark12321@gmail.com</p><p className="text-[10px] mt-6 text-zinc-600">© 2026 AlGoPartners. All rights reserved.</p></div></div></footer>
    </div>
  );
}
