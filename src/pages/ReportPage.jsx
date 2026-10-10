import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { AuthContext } from '../context/AuthContext';

import Template1 from '../assets/Templet1.png';
import Template2 from '../assets/Templet2.png';
import Template3 from '../assets/Templet3.png';

const PROFIT_QUOTES = [
  "I followed my trading plan and waited for the right setup.",
  "This winning trade came from patience, not from luck.",
  "I kept my risk small and protected my capital first.",
  "I entered the trade only after my confirmation signals.",
  "My stop loss was set before entry, so I felt calm during the trade.",
  "I took profit at my target and did not get greedy.",
  "This win proves that discipline is better than emotion.",
  "One good trade is nice, but staying consistent is my real goal.",
  "I will review this trade and repeat what worked.",
  "I am proud of the process, and I will keep improving every month."
];

const LOSS_QUOTES = [
  "This loss was a part of trading, and I accept it calmly.",
  "I followed my stop loss, so my loss stayed small.",
  "A loss does not mean I am wrong. It means I am learning.",
  "I checked my entry and found what I can improve.",
  "I did not take revenge trades to recover the money fast.",
  "My capital is safe, so I can trade again tomorrow.",
  "I will write this trade in my journal and learn from it.",
  "Even when I lose, I will respect my rules and my risk.",
  "Good traders lose also, but they control the loss.",
  "I will stay patient and focus on the next good setup."
];

const MONTH_NAMES = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

const INITIAL_LAYOUTS = {
  template1: {
    monthYear: { top: '8%', left: '8%', fontSize: 18, isBold: true, hasBg: true },
    netPnL: { top: '50%', left: '28%', fontSize: 30, isBold: true, hasBg: false },
    totalTrades: { top: '38%', left: '78%', fontSize: 20, isBold: true, hasBg: false },
    wins: { top: '48%', left: '58%', fontSize: 18, isBold: true, hasBg: false },
    losses: { top: '48%', left: '84%', fontSize: 18, isBold: true, hasBg: false },
    winRate: { top: '60%', left: '68%', fontSize: 20, isBold: true, hasBg: false },
    quote: { top: '85%', left: '75%', fontSize: 12, isBold: true, hasBg: true }
  },
  template2: {
    monthYear: { top: '8%', left: '8%', fontSize: 18, isBold: true, hasBg: true },
    netPnL: { top: '68%', left: '31%', fontSize: 30, isBold: true, hasBg: false },
    totalTrades: { top: '26%', left: '23%', fontSize: 20, isBold: true, hasBg: false },
    wins: { top: '34%', left: '19%', fontSize: 18, isBold: true, hasBg: false },
    losses: { top: '34%', left: '42%', fontSize: 18, isBold: true, hasBg: false },
    winRate: { top: '45%', left: '24%', fontSize: 20, isBold: true, hasBg: false },
    quote: { top: '80%', left: '80%', fontSize: 12, isBold: true, hasBg: true }
  },
  template3: {
    monthYear: { top: '8%', left: '8%', fontSize: 18, isBold: true, hasBg: true },
    netPnL: { top: '37%', left: '29%', fontSize: 30, isBold: true, hasBg: false },
    totalTrades: { top: '42%', left: '65%', fontSize: 20, isBold: true, hasBg: false },
    wins: { top: '58%', left: '57%', fontSize: 18, isBold: true, hasBg: false },
    losses: { top: '58%', left: '68%', fontSize: 18, isBold: true, hasBg: false },
    winRate: { top: '69%', left: '59%', fontSize: 20, isBold: true, hasBg: false },
    quote: { top: '85%', left: '80%', fontSize: 12, isBold: true, hasBg: true }
  }
};

const templateImages = {
  template1: Template1,
  template2: Template2,
  template3: Template3,
};

const DraggableField = ({ isEditMode, isSelected, fieldKey, position, onPositionChange, onSelect, children, extraStyle = {} }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handlePointerDown = (e) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    onSelect();
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !isEditMode) return;
    
    const dx = e.clientX - startPos.x;
    const dy = e.clientY - startPos.y;
    
    const container = document.getElementById('report-card-container');
    const rect = container.getBoundingClientRect();
    
    const dLeft = (dx / rect.width) * 100;
    const dTop = (dy / rect.height) * 100;

    const currentLeft = parseFloat(position.left) || 0;
    const currentTop = parseFloat(position.top) || 0;

    onPositionChange(fieldKey, {
      ...position,
      left: `${(currentLeft + dLeft).toFixed(2)}%`,
      top: `${(currentTop + dTop).toFixed(2)}%`
    });

    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = (e) => {
    if (isDragging) {
      setIsDragging(false);
      e.target.releasePointerCapture(e.pointerId);
    }
  };

  const dynamicStyle = {
    top: position.top,
    left: position.left,
    fontSize: `${position.fontSize || 16}px`,
    fontWeight: position.isBold ? '900' : 'normal',
    backgroundColor: position.hasBg ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
    border: position.hasBg ? '2px solid black' : 'none',
    padding: position.hasBg ? '4px 8px' : '0px',
    boxShadow: position.hasBg ? '2px 2px 0px 0px rgba(0,0,0,1)' : 'none',
    ...extraStyle
  };

  return (
    <div
      className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap ${
        isEditMode ? 'cursor-move' : ''
      } ${isSelected && isEditMode ? 'outline-dashed outline-2 outline-blue-500' : ''}`}
      style={dynamicStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {children}
    </div>
  );
};

export default function ReportPage({ currency = 'USD', rate = 1 }) {
  const { user } = useContext(AuthContext);
  
  const [selectedTemplate, setSelectedTemplate] = useState('template1');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [trades, setTrades] = useState([]);
  const [randomQuote, setRandomQuote] = useState('');
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [layouts, setLayouts] = useState(INITIAL_LAYOUTS);

  useEffect(() => {
    if (user) {
      fetchTrades();
    }
  }, [selectedMonth, selectedYear, user]);

  const fetchTrades = async () => {
    // Fetch only trades belonging to the authenticated user
    const { data, error } = await supabase.from('trades').select('*').eq('user_id', user.id);
    if (data) {
      const filtered = data.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === Number(selectedMonth) && d.getFullYear() === Number(selectedYear);
      });
      setTrades(filtered);
      generateQuote(filtered);
    }
  };

  const getIsProfit = (t) => {
    const typeStr = String(t.trade_type || t.type || t.status || t.outcome || '').toUpperCase();
    if (typeStr === 'LOSS' || typeStr === 'LOSE') return false;
    if (typeStr === 'PROFIT' || typeStr === 'WIN') return true;
    // Fallback: If no explicit string type is present, assume negative amounts are losses.
    return Number(t.amount) >= 0;
  };

  const generateQuote = (monthlyTrades) => {
    let net = 0;
    monthlyTrades.forEach((t) => {
      const isProfit = getIsProfit(t);
      net += isProfit ? Math.abs(Number(t.amount)) : -Math.abs(Number(t.amount));
    });

    const quotesArr = net >= 0 ? PROFIT_QUOTES : LOSS_QUOTES;
    setRandomQuote(quotesArr[Math.floor(Math.random() * quotesArr.length)]);
  };

  let wins = 0;
  let losses = 0;
  let netPnL = 0;

  trades.forEach((t) => {
    const amt = Math.abs(Number(t.amount) || 0);
    const isProfit = getIsProfit(t);
    if (isProfit) {
      wins++;
      netPnL += amt;
    } else {
      losses++;
      netPnL -= amt;
    }
  });

  const totalTrades = trades.length;
  const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(0) : 0;
  const convertedPnL = currency === 'INR' ? Math.abs(netPnL) * rate : Math.abs(netPnL);
  const symbol = currency === 'INR' ? '₹' : '$';
  const formattedPnL = `${netPnL >= 0 ? '+' : '-'}${symbol}${convertedPnL.toFixed(2)}`;

  const currentLayout = layouts[selectedTemplate];

  const handlePositionChange = (fieldKey, newPosition) => {
    setLayouts(prev => ({
      ...prev,
      [selectedTemplate]: {
        ...prev[selectedTemplate],
        [fieldKey]: newPosition
      }
    }));
  };
  
  const updateFieldStyle = (prop, value) => {
    if (!selectedField) return;
    setLayouts(prev => ({
      ...prev,
      [selectedTemplate]: {
        ...prev[selectedTemplate],
        [selectedField]: {
          ...prev[selectedTemplate][selectedField],
          [prop]: value
        }
      }
    }));
  };

  const logCoordinates = () => {
    console.log(`Current Layout Coordinates for ${selectedTemplate}:`, JSON.stringify(layouts[selectedTemplate], null, 2));
    alert('Coordinates logged to the browser console!');
  };

  const handleDownloadPDF = async () => {
    if (isEditMode) {
      alert("Please turn off edit mode before downloading.");
      return;
    }
    const element = document.getElementById('report-card-container');
    if (!element) return;
    
    try {
      const htmlToImage = await import('html-to-image');
      const { jsPDF } = await import('jspdf');

      const imgData = await htmlToImage.toJpeg(element, {
        quality: 1.0,
        pixelRatio: 3,
        style: {
          transform: 'none',
        }
      });
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (9 * pdfWidth) / 16; 
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Trading_Report_${MONTH_NAMES[selectedMonth]}_${selectedYear}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Check the console for details.");
    }
  };

  return (
    <div className="font-mono max-w-6xl mx-auto p-6">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase dark:text-white">SELECT TEMPLATE:</span>
            {['template1', 'template2', 'template3'].map((temp, i) => (
              <button
                key={temp}
                onClick={() => {
                  setSelectedTemplate(temp);
                  setSelectedField(null);
                }}
                className={`border-3 border-black px-3 py-1.5 font-black text-xs uppercase cursor-pointer transition-all ${
                  selectedTemplate === temp
                    ? 'bg-yellow-300 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white text-black hover:bg-gray-200'
                }`}
              >
                TEMPLATE {i + 1}
              </button>
            ))}
          </div>

          <div className="flex gap-2 items-center">
            <button 
              onClick={() => {
                setIsEditMode(!isEditMode);
                if (isEditMode) setSelectedField(null);
              }}
              className={`px-4 py-2 text-sm font-black border-2 border-black ${isEditMode ? 'bg-red-500 text-white' : 'bg-blue-400 text-black'}`}
            >
              {isEditMode ? '💾 SAVE & EXIT ADJUST MODE' : '🛠️ ADJUST POSITIONS'}
            </button>
            
            {isEditMode && (
              <button onClick={logCoordinates} className="px-3 py-2 text-sm font-black bg-gray-200 border-2 border-black hover:bg-gray-300">
                LOG TO CONSOLE
              </button>
            )}

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border-3 border-black p-1.5 font-black bg-white text-xs"
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={m} value={idx}>{m}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border-3 border-black p-1.5 font-black bg-white text-xs"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>
          </div>
        </div>

        {isEditMode && selectedField && (
          <div className="flex items-center gap-4 bg-yellow-100 p-3 border-2 border-black">
            <span className="text-xs font-black uppercase">EDITING: {selectedField}</span>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold mr-2">SIZE:</span>
              <button onClick={() => updateFieldStyle('fontSize', (currentLayout[selectedField].fontSize || 16) - 2)} className="w-8 h-8 flex justify-center items-center font-bold bg-white border-2 border-black hover:bg-gray-200">-</button>
              <span className="w-8 text-center font-bold">{currentLayout[selectedField].fontSize || 16}</span>
              <button onClick={() => updateFieldStyle('fontSize', (currentLayout[selectedField].fontSize || 16) + 2)} className="w-8 h-8 flex justify-center items-center font-bold bg-white border-2 border-black hover:bg-gray-200">+</button>
            </div>
            <button 
              onClick={() => updateFieldStyle('isBold', !currentLayout[selectedField].isBold)} 
              className={`px-3 py-1 font-black border-2 border-black ${currentLayout[selectedField].isBold ? 'bg-black text-white' : 'bg-white text-black'}`}
            >
              BOLD
            </button>
            <button 
              onClick={() => updateFieldStyle('hasBg', !currentLayout[selectedField].hasBg)} 
              className={`px-3 py-1 font-black border-2 border-black ${currentLayout[selectedField].hasBg ? 'bg-black text-white' : 'bg-white text-black'}`}
            >
              BACKGROUND
            </button>
          </div>
        )}
      </div>

      {/* REPORT CARD CONTAINER */}
      <div
        id="report-card-container"
        className="relative w-full aspect-[16/9] border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] overflow-hidden bg-cover bg-center select-none text-black"
        style={{ 
          backgroundImage: `url(${templateImages[selectedTemplate]})`,
          fontFamily: '"Gill Sans Ultra Bold", "Gill Sans", sans-serif'
        }}
      >
        <DraggableField isEditMode={isEditMode} isSelected={selectedField === 'monthYear'} onSelect={() => setSelectedField('monthYear')} fieldKey="monthYear" position={currentLayout.monthYear} onPositionChange={handlePositionChange}>
          <span>{MONTH_NAMES[selectedMonth]} {selectedYear}</span>
        </DraggableField>

        <DraggableField isEditMode={isEditMode} isSelected={selectedField === 'netPnL'} onSelect={() => setSelectedField('netPnL')} fieldKey="netPnL" position={currentLayout.netPnL} onPositionChange={handlePositionChange}>
          <span className={netPnL >= 0 ? 'text-emerald-700' : 'text-red-600'}>
            {formattedPnL}
          </span>
        </DraggableField>

        <DraggableField isEditMode={isEditMode} isSelected={selectedField === 'totalTrades'} onSelect={() => setSelectedField('totalTrades')} fieldKey="totalTrades" position={currentLayout.totalTrades} onPositionChange={handlePositionChange}>
          <span>{totalTrades}</span>
        </DraggableField>

        <DraggableField isEditMode={isEditMode} isSelected={selectedField === 'wins'} onSelect={() => setSelectedField('wins')} fieldKey="wins" position={currentLayout.wins} onPositionChange={handlePositionChange}>
          <span className="text-emerald-700">{wins}</span>
        </DraggableField>

        <DraggableField isEditMode={isEditMode} isSelected={selectedField === 'losses'} onSelect={() => setSelectedField('losses')} fieldKey="losses" position={currentLayout.losses} onPositionChange={handlePositionChange}>
          <span className="text-red-600">{losses}</span>
        </DraggableField>

        <DraggableField isEditMode={isEditMode} isSelected={selectedField === 'winRate'} onSelect={() => setSelectedField('winRate')} fieldKey="winRate" position={currentLayout.winRate} onPositionChange={handlePositionChange}>
          <span>{winRate}%</span>
        </DraggableField>

        <DraggableField isEditMode={isEditMode} isSelected={selectedField === 'quote'} onSelect={() => setSelectedField('quote')} fieldKey="quote" position={currentLayout.quote} onPositionChange={handlePositionChange} extraStyle={{ whiteSpace: 'normal', minWidth: '280px', maxWidth: '320px', textAlign: 'center' }}>
          <span className="italic">"{randomQuote}"</span>
        </DraggableField>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={handleDownloadPDF}
          className={`border-4 border-black bg-yellow-400 text-black px-8 py-3 font-black text-sm uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all ${
            isEditMode ? 'opacity-50 cursor-not-allowed' : 'hover:translate-x-1 hover:translate-y-1 hover:shadow-none cursor-pointer'
          }`}
        >
          📄 DOWNLOAD HORIZONTAL FULL-PAGE PDF
        </button>
      </div>
    </div>
  );
}
