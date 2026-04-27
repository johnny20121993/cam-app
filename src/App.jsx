import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Users, AlertTriangle, LayoutDashboard, Search, FileDown, FileUp,
  Plus, Trash2, Check, Save, Upload, Info, Map as MapIcon,
  BarChart3, Edit, X, UserPlus, Image as ImageIcon, CheckSquare,
  Calendar, Printer, Settings, MinusCircle, Camera,
  History, LogIn, Shield, Eye, EyeOff, Activity, ChevronDown, ChevronUp,
  FolderOpen, Grid, List, Copy, QrCode, Trash, Download, Clock
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

// ==================== CÔNG CỤ AN TOÀN HIỂN THỊ ====================
const safeRender = (val) => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') {
    if (val.$$typeof) return ''; 
    try { return JSON.stringify(val); } catch (e) { return ''; }
  }
  return String(val);
};

// ==================== CƠ SỞ DỮ LIỆU INDEXED DB ====================
const DB_NAME = 'CAMS_Database';
const DB_VERSION = 1;
const STORE_NAME = 'HoSoStore';
const DATA_KEY = 'doiTuongData_v6';

const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const setItemDB = async (key, value) => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(value, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('IndexedDB Set Error:', error);
    throw error;
  }
};

const getItemDB = async (key) => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('IndexedDB Get Error:', error);
    return null;
  }
};

// ==================== DANH MỤC MỞ RỘNG ====================
const DANH_MUC_TOI_DANH_FULL = {
  "0. Chưa có tiền án, tiền sự": ["Chưa có tiền án, tiền sự"],
  "1. Nhóm xâm phạm tính mạng, sức khỏe": [
    "Giết người", "Giết người trong trạng thái tinh thần bị kích động mạnh",
    "Giết người do vượt quá phòng vệ chính đáng", "Vô ý làm chết người",
    "Cố ý gây thương tích", "Gây thương tích do vượt quá phòng vệ chính đáng",
    "Vô ý gây thương tích", "Hành hạ người khác", "Ngược đãi người thân",
    "Đe dọa giết người"
  ],
  "2. Nhóm ma túy": [
    "Tàng trữ trái phép chất ma túy", "Vận chuyển trái phép chất ma túy",
    "Mua bán trái phép chất ma túy", "Tổ chức sử dụng trái phép chất ma túy",
    "Chứa chấp việc sử dụng trái phép chất ma túy", "Lôi kéo người khác sử dụng trái phép chất ma túy",
    "Sản xuất trái phép chất ma túy", "Chiếm đoạt chất ma túy"
  ],
  "3. Nhóm xâm phạm sở hữu": [
    "Trộm cắp tài sản", "Cướp tài sản", "Cướp giật tài sản", "Cưỡng đoạt tài sản",
    "Lừa đảo chiếm đoạt tài sản", "Lạm dụng tín nhiệm chiếm đoạt tài sản",
    "Hủy hoại tài sản", "Sử dụng trái phép tài sản"
  ],
  "4. Nhóm trật tự xã hội": [
    "Gây rối trật tự công cộng", "Đánh bạc", "Tổ chức đánh bạc", "Gá bạc",
    "Mại dâm", "Chứa mại dâm", "Môi giới mại dâm"
  ],
  "5. Nhóm chức vụ, tham nhũng": [
    "Tham ô tài sản", "Nhận hối lộ", "Đưa hối lộ", "Môi giới hối lộ",
    "Lợi dụng chức vụ quyền hạn", "Lạm quyền trong khi thi hành công vụ",
    "Thiếu trách nhiệm gây hậu quả nghiêm trọng"
  ],
  "6. Nhóm giao thông": [
    "Vi phạm quy định về tham gia giao thông đường bộ", "Đua xe trái phép",
    "Tổ chức đua xe trái phép", "Cản trở giao thông"
  ],
  "7. Nhóm khác": [
    "Chống người thi hành công vụ", "Làm giả con dấu, tài liệu", "Sử dụng tài liệu giả",
    "Tổ chức xuất nhập cảnh trái phép", "Nhập cảnh trái phép", "Xuất cảnh trái phép"
  ]
};

const HINH_THUC_XU_LY_FULL = [
  "Phạt tiền", "Cảnh cáo", "Cải tạo không giam giữ", "Án treo", "Tù có thời hạn",
  "Tù chung thân", "Tử hình", "Quản chế", "Cấm cư trú", "Cấm đảm nhiệm chức vụ",
  "Cấm hành nghề", "Cấm làm công việc nhất định", "Giáo dục tại xã/phường/thị trấn",
  "Đưa vào cơ sở cai nghiện bắt buộc", "Cai nghiện tự nguyện", "Điều trị Methadone",
  "Quản lý sau cai nghiện", "Tha tù trước thời hạn có điều kiện", "Tạm đình chỉ chấp hành án",
  "Hoãn chấp hành án", "Miễn chấp hành án", "Giảm thời hạn chấp hành án", "Trục xuất",
  "Bắt buộc chữa bệnh", "Tịch thu tài sản", "Phạt bổ sung"
];

const DIEN_DOI_TUONG_LIST = [
  "Sử dụng trái phép chất ma túy",
  "Người cai nghiện ma túy tự nguyện tại gia đình, cộng đồng và điều trị bằng thuốc thay thế methadol",
  "Sau cai nghiện ma túy",
  "Cai nghiện bắt buộc",
  "Quản lý sau cai",
  "Nghiện ma túy",
  "Tàng trữ trái phép chất ma túy",
  "Mua bán trái phép chất ma túy"
];

// Thêm danh sách này ra ngoài dùng chung
const SPECIAL_MARKS = ["Sưu tra loại A", "Sưu tra loại B", "Hiềm Nghi", "DS 2688", "Đối tượng Lưu Động", "Đối tượng di chuyển"];

// ==================== UTILS ====================
const generateId = () => Math.random().toString(36).substr(2, 9).toUpperCase();

const parseDate = (str) => {
  if (!str) return null;
  if (str.includes('-')) return new Date(str);
  const parts = str.split('/');
  if (parts.length === 3) return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  return new Date(str);
};

const calculateDateDiff = (start, end) => {
  if (!start || !end) return { years: 0, months: 0 };
  const d1 = parseDate(start), d2 = parseDate(end);
  if (isNaN(d1) || isNaN(d2)) return { years: 0, months: 0 };
  let months = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
  const years = Math.floor(months / 12);
  months = months % 12;
  return { years, months };
};

const addTime = (start, years, months) => {
  if (!start) return '';
  const d = parseDate(start);
  if (isNaN(d)) return '';
  d.setFullYear(d.getFullYear() + (years || 0));
  d.setMonth(d.getMonth() + (months || 0));
  return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
};

const formatCCCD = (cccd) => {
  if (!cccd) return '';
  let cleaned = String(cccd).replace(/[^0-9]/g, '');
  if (cleaned.length > 0 && cleaned.length < 12) {
    cleaned = cleaned.padStart(12, '0');
  }
  return cleaned;
};

const exportTableToExcel = (tableId, filename) => {
  const table = document.getElementById(tableId);
  if (!table) return;
  const html = `<html><head><meta charset="utf-8"></head><body>${table.outerHTML}</body></html>`;
  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${filename}_${new Date().toISOString().slice(0,10)}.xls`;
  a.click();
};

const levenshteinDistance = (a, b) => {
  if (!a || !b) return 999;
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) matrix[i][j] = matrix[i - 1][j - 1];
      else matrix[i][j] = Math.min(matrix[i - 1][j - 1], matrix[i][j - 1], matrix[i - 1][j]) + 1;
    }
  }
  return matrix[a.length][b.length];
};

function parseCSV(text) {
  if (!text) return [];
  if (text.charCodeAt(0) === 0xFEFF) text = text.substr(1);
  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return [];
  const firstLine = lines[0];
  let delimiter = ',';
  if (firstLine.split(';').length > firstLine.split(',').length) delimiter = ';';
  else if (firstLine.split('\t').length > firstLine.split(',').length) delimiter = '\t';
  const rows = [];
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let row = [];
    let inQuotes = false;
    let currentCell = '';
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        if (inQuotes && line[j + 1] === '"') { currentCell += '"'; j++; }
        else { inQuotes = !inQuotes; }
      } else if (char === delimiter && !inQuotes) {
        row.push(currentCell.trim()); currentCell = '';
      } else { currentCell += char; }
    }
    row.push(currentCell.trim());
    rows.push(row);
  }
  return rows;
}

// ==================== MAIN APP ====================
export default function App() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setShowInstall(false);
        setDeferredPrompt(null);
      });
    }
  };

  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState([]);
  const [cskvMapping, setCskvMapping] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  const [darkMode, setDarkMode] = useState(false);
  const [isDBReady, setIsDBReady] = useState(false);

  // --- STATE LƯU TRỮ CHO LISTVIEW ---
  const [listSearchTerm, setListSearchTerm] = useState('');
  const [listFilters, setListFilters] = useState({
    khuPho: 'All', trangThaiQL: 'All', dien: '', toiDanh: '', hinhThucXuLy: '', gioiTinh: 'All', tuNgaySinh: '', denNgaySinh: ''
  });
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  const notify = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000);
  };

  // Tính năng 4: AUTO BACKUP lúc 17:00
  useEffect(() => {
    const backupInterval = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 17 && now.getMinutes() === 0) {
        const lastBackup = localStorage.getItem('lastBackupDate');
        const today = now.toLocaleDateString();
        if (lastBackup !== today && data.length > 0) {
          const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `CAMS_AutoBackup_${today.replace(/\//g, '-')}.json`;
          a.click();
          localStorage.setItem('lastBackupDate', today);
          notify('Đã tự động sao lưu dữ liệu cuối ngày (17:00)', 'success');
        }
      }
    }, 60000); // Check every minute
    return () => clearInterval(backupInterval);
  }, [data]);

  // Khởi tạo và tải dữ liệu từ IndexedDB khi mở app
  useEffect(() => {
    const initializeData = async () => {
      try {
        let dbData = await getItemDB(DATA_KEY);
        
        if (dbData !== null && dbData !== undefined && Array.isArray(dbData)) {
          // Tính năng 1: DỌN THÙNG RÁC SAU 30 NGÀY
          const now = new Date();
          const cleanedData = dbData.filter(d => {
            if (!d.deletedAt) return true;
            const delDate = new Date(d.deletedAt);
            const daysDiff = (now - delDate) / (1000 * 60 * 60 * 24);
            return daysDiff <= 30; // Giữ lại nếu chưa quá 30 ngày
          });
          
          if (cleanedData.length !== dbData.length) {
            await setItemDB(DATA_KEY, cleanedData); // Lưu lại DB đã dọn dẹp
          }
          setData(cleanedData);
        } else {
          const oldStorage = localStorage.getItem('doiTuongData_v5');
          if (oldStorage) {
            try {
              const parsed = JSON.parse(oldStorage);
              setData(parsed);
              await setItemDB(DATA_KEY, parsed);
              notify('Đã chuyển đổi dữ liệu thành công sang IndexedDB.', 'success');
              localStorage.removeItem('doiTuongData_v5'); 
            } catch (e) {
               console.error("Lỗi khi parse dữ liệu cũ", e);
            }
          }
        }
      } catch (error) {
        console.error("Lỗi khởi tạo DB:", error);
      } finally {
        setIsDBReady(true);
      }

      const savedCskv = localStorage.getItem('cskvMapping_v1');
      if (savedCskv) setCskvMapping(JSON.parse(savedCskv));
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) setCurrentUser(JSON.parse(savedUser));
      const savedTheme = localStorage.getItem('darkMode');
      if (savedTheme) setDarkMode(JSON.parse(savedTheme));
      const savedViewMode = localStorage.getItem('viewMode');
      if (savedViewMode) setViewMode(savedViewMode);
    };

    initializeData();
  }, []);

  // Lưu khi có thay đổi dữ liệu vào IndexedDB
  useEffect(() => {
    const saveData = async () => {
      if (!isDBReady) return; 
      try {
        await setItemDB(DATA_KEY, data);
      } catch (e) {
        console.error("Lỗi khi lưu vào IndexedDB:", e);
        notify('Lỗi hệ thống: Không thể lưu trữ dữ liệu. Hãy kiểm tra dung lượng ổ đĩa.', 'error');
      }
    };
    saveData();
  }, [data, isDBReady]);

  // Vòng lặp Auto-save
  useEffect(() => {
    const timer = setInterval(() => {
      if (isDBReady) {
        setItemDB(DATA_KEY, data)
          // .then(() => notify('Dữ liệu đã được tự động lưu an toàn', 'success'))
          .catch(e => console.error(e));
      }
    }, 15 * 60 * 1000);
    return () => clearInterval(timer);
  }, [data, isDBReady]);

  useEffect(() => {
    localStorage.setItem('cskvMapping_v1', JSON.stringify(cskvMapping));
  }, [cskvMapping]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  const openForm = (record = null) => {
    setEditingRecord(record);
    setActiveTab('form');
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    notify(`Đăng nhập thành công. Chào ${user.name}`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    notify('Đã đăng xuất');
  };

  const filteredDataByUser = useMemo(() => {
    if (!currentUser) return data;
    return data.filter(d => d.khuPho === currentUser.khuPho);
  }, [data, currentUser]);

  const activeDataCount = data.filter(d => !d.deletedAt).length;
  const trashCount = data.filter(d => d.deletedAt).length;

  return (
    <div className={`flex h-screen ${darkMode ? 'dark' : ''} bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans`}>
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 dark:bg-slate-950 text-white flex flex-col shadow-2xl z-20 print:hidden">
        <div className="p-5 bg-slate-950 dark:bg-black flex items-center gap-3 border-b border-slate-800">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">C</div>
          <div>
            <h1 className="font-bold text-lg tracking-wide">C.A.M.S</h1>
            <p className="text-[10px] text-blue-300 uppercase">Hệ thống QLĐT</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={20} />} label="Tổng quan & Cảnh báo" />
          <NavItem active={activeTab === 'list'} onClick={() => setActiveTab('list')} icon={<Users size={20} />} label={`Hồ sơ Đối tượng (${activeDataCount})`} />
          <NavItem active={activeTab === 'form'} onClick={() => openForm(null)} icon={<UserPlus size={20} />} label="Thêm mới Hồ sơ" />
          
          <div className="pt-4 pb-2"><p className="text-xs font-semibold text-slate-500 uppercase px-3">Công cụ & Dữ liệu</p></div>
          <NavItem active={activeTab === 'import'} onClick={() => setActiveTab('import')} icon={<Database size={20} />} label="Đồng bộ / Cập nhật" />
          <NavItem active={activeTab === 'compare'} onClick={() => setActiveTab('compare')} icon={<CheckSquare size={20} />} label="Đối chiếu CCCD" />
          <NavItem active={activeTab === 'bulkImage'} onClick={() => setActiveTab('bulkImage')} icon={<FolderOpen size={20} />} label="Import ảnh hàng loạt" />
          <NavItem active={activeTab === 'trash'} onClick={() => setActiveTab('trash')} icon={<Trash size={20} />} label={`Thùng rác (${trashCount})`} />
          
          <div className="pt-4 pb-2"><p className="text-xs font-semibold text-slate-500 uppercase px-3">Hệ thống</p></div>
          <NavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={20} />} label="Phân công CSKV" />
          <NavItem active={activeTab === 'report'} onClick={() => setActiveTab('report')} icon={<BarChart3 size={20} />} label="Báo cáo & Thống kê" />
          
          {!currentUser && (
            <NavItem active={activeTab === 'login'} onClick={() => setActiveTab('login')} icon={<LogIn size={20} />} label="Đăng nhập CSKV" />
          )}
          <button onClick={() => setDarkMode(!darkMode)} className="w-full mt-4 flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white">
            {darkMode ? <Eye size={20} /> : <EyeOff size={20} />} Chế độ {darkMode ? 'sáng' : 'tối'}
          </button>
        </nav>
        {currentUser && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{safeRender(currentUser.name)}</p>
              <p className="text-xs text-slate-400">{safeRender(currentUser.khuPho)}</p>
            </div>
            <button onClick={handleLogout} className="p-2 hover:bg-slate-800 rounded-lg"><LogIn size={16} /></button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 px-8 py-4 flex justify-between items-center z-10 print:hidden">
          <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">
            {activeTab === 'dashboard' && 'Bảng Điều Khiển Trung Tâm'}
            {activeTab === 'list' && 'Quản Lý Danh Sách Hồ Sơ Đối Tượng'}
            {activeTab === 'form' && (editingRecord ? 'Cập Nhật Hồ Sơ' : 'Thêm Mới Hồ Sơ')}
            {activeTab === 'import' && 'Đồng Bộ & Cập Nhật Tự Động Từ Excel'}
            {activeTab === 'compare' && 'Công Cụ Đối Chiếu Dữ Liệu Thông Minh'}
            {activeTab === 'bulkImage' && 'Import ảnh hàng loạt từ thư mục'}
            {activeTab === 'trash' && 'Thùng rác an toàn (Lưu trữ 30 ngày)'}
            {activeTab === 'settings' && 'Quản Lý Danh Sách Cán Bộ Khu Vực'}
            {activeTab === 'report' && 'Hệ Thống Báo Cáo Phân Tích'}
            {activeTab === 'login' && 'Đăng nhập CSKV'}
          </h2>
          <div className="flex items-center gap-4">
            {currentUser && <span className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full">{safeRender(currentUser.name)}</span>}
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900 relative p-6 md:p-8 print:p-0 print:bg-white custom-scrollbar">
          {toast.show && (
            <div className={`fixed top-6 right-6 px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 z-50 animate-fade-in-down font-medium text-white ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
              {toast.type === 'error' ? <AlertTriangle size={20} /> : <Check size={20} />}
              {safeRender(toast.msg)}
            </div>
          )}

          {!isDBReady ? (
             <div className="flex items-center justify-center h-full text-slate-400">
                Đang khởi tạo cơ sở dữ liệu IndexedDB...
             </div>
          ) : (
            <>
              {activeTab === 'dashboard' && <DashboardView data={filteredDataByUser.filter(d => !d.deletedAt)} />}
              {activeTab === 'list' && <ListView data={filteredDataByUser.filter(d => !d.deletedAt)} setData={setData} allData={data} notify={notify} openForm={openForm} cskvMapping={cskvMapping} searchTerm={listSearchTerm} setSearchTerm={setListSearchTerm} filters={listFilters} setFilters={setListFilters} viewMode={viewMode} setViewMode={setViewMode} />}
              {activeTab === 'form' && <FormView data={data} setData={setData} editingRecord={editingRecord} setActiveTab={setActiveTab} notify={notify} cskvMapping={cskvMapping} />}
              {activeTab === 'import' && <ImportView data={data} setData={setData} notify={notify} cskvMapping={cskvMapping} />}
              {activeTab === 'compare' && <CompareView data={filteredDataByUser.filter(d => !d.deletedAt)} setData={setData} notify={notify} />}
              {activeTab === 'bulkImage' && <BulkImageImportView data={data} setData={setData} notify={notify} />}
              {activeTab === 'trash' && <TrashView data={data} setData={setData} notify={notify} />}
              {activeTab === 'settings' && <SettingsView cskvMapping={cskvMapping} setCskvMapping={setCskvMapping} data={data} setData={setData} notify={notify} />}
              {activeTab === 'report' && <ReportView data={filteredDataByUser.filter(d => !d.deletedAt)} />}
              {activeTab === 'login' && <LoginView onLogin={handleLogin} cskvMapping={cskvMapping} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function Database(props) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>; }
function NavItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      {icon} <span className="font-medium text-sm truncate">{label}</span>
    </button>
  );
}

// ==================== DASHBOARD ====================
function DashboardView({ data }) {
  const uniqueIds = new Set(data.filter(d => d.trangThaiQL === 'Đang quản lý').map(d => d.id));
  const tongSo = data.length;
  const dangQuanLy = uniqueIds.size;
  const daKetThuc = tongSo - dangQuanLy;
  const today = new Date();

  let ghostRecords = [], expiringRecords = [], overlappingRecords = [];

  data.forEach(d => {
    if (d.trangThaiQL === 'Đang quản lý' && safeRender(d.trangThaiCD).toLowerCase().includes('đã chết')) {
      ghostRecords.push(d);
    }
    // Check all dates in danhSachDien or tienAnTienSu if there's no single ngayKetThuc
    if (d.trangThaiQL === 'Đang quản lý') {
       let closestEnd = null;
       d.tienAnTienSu?.forEach(an => {
          if (an.ngayKetThuc) {
             const end = parseDate(an.ngayKetThuc);
             if (end && !isNaN(end) && (!closestEnd || end < closestEnd)) closestEnd = end;
          }
       });
       if (closestEnd) {
          const daysLeft = Math.ceil((closestEnd - today) / (1000 * 60 * 60 * 24));
          if (daysLeft >= 0 && daysLeft <= 30) expiringRecords.push({ ...d, daysLeft });
       }
    }

    if (d.trangThaiQL === 'Đang quản lý' && d.danhSachDien?.length > 1) {
      const activeDiens = d.danhSachDien.filter(x => {
        const status = typeof x === 'string' ? d.trangThaiQL : x.trangThai;
        return status === 'Đang quản lý';
      });
      if (activeDiens.length > 1) {
        const activeDienNames = activeDiens.map(x => typeof x === 'string' ? x.trim() : x.ten?.trim()).filter(Boolean);
        const duplicates = activeDienNames.filter((item, index) => activeDienNames.indexOf(item) !== index);
        if (duplicates.length > 0) {
          const uniqueDuplicates = [...new Set(duplicates)];
          overlappingRecords.push({ ...d, duplicatedDiens: uniqueDuplicates.join('; ') });
        }
      }
    }
  });

  const kpData = useMemo(() => {
    const map = {};
    const countedIds = new Set();
    data.filter(d => d.trangThaiQL === 'Đang quản lý').forEach(d => {
      if (!countedIds.has(d.id)) {
        countedIds.add(d.id);
        const kp = safeRender(d.khuPho) || 'Chưa xác định';
        map[kp] = (map[kp] || 0) + 1;
      }
    });
    return Object.entries(map).map(([name, value]) => ({ name: String(name), value: Number(value) }));
  }, [data]);

  const toiDanhData = useMemo(() => {
    const map = {};
    data.filter(d => d.trangThaiQL === 'Đang quản lý').forEach(d => {
      d.tienAnTienSu?.forEach(an => {
        if (an.toiDanh) map[safeRender(an.toiDanh)] = (map[safeRender(an.toiDanh)] || 0) + 1;
      });
    });
    return Object.entries(map).map(([name, value]) => ({ name: String(name), value: Number(value) }));
  }, [data]);

  const dienData = useMemo(() => {
    const map = {};
    data.filter(d => d.trangThaiQL === 'Đang quản lý').forEach(d => {
      d.danhSachDien?.forEach(dienObj => {
        const dien = typeof dienObj === 'string' ? dienObj : dienObj.ten;
        const trangThai = typeof dienObj === 'string' ? d.trangThaiQL : dienObj.trangThai;
        if (dien && trangThai === 'Đang quản lý') {
          const safeDien = safeRender(dien);
          map[safeDien] = (map[safeDien] || 0) + 1;
        }
      });
    });
    return Object.entries(map).map(([name, value]) => ({ name: String(name), value: Number(value) }));
  }, [data]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Tổng Hồ Sơ" value={tongSo} color="blue" Icon={Users} />
        <StatCard label="Đang Quản Lý (duy nhất)" value={dangQuanLy} color="emerald" Icon={CheckSquare} />
        <StatCard label="Đã Kết Thúc" value={daKetThuc} color="slate" Icon={Trash2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AlertBox title="Lỗi Logic (Đã chết)" count={ghostRecords.length} color="red" onExport={() => exportTableToExcel('tbl-ghost', 'Loi_Trang_Thai_Chet')}>
          <table id="tbl-ghost" className="w-full text-sm text-left">
            <thead className="bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 sticky top-0">
              <tr>
                <th className="p-2 font-semibold">Họ tên</th>
                <th className="p-2 font-semibold">Số CCCD</th>
                <th className="p-2 font-semibold">Khu phố</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-700">
              {ghostRecords.map(d => (
                <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="p-2 font-bold">{safeRender(d.hoTen)}</td>
                  <td className="p-2 font-mono text-xs">{safeRender(d.cccd)}</td>
                  <td className="p-2">{safeRender(d.khuPho)}</td>
                </tr>
              ))}
              {ghostRecords.length === 0 && <tr><td colSpan="3" className="p-4 text-center text-slate-400 italic">Không có dữ liệu</td></tr>}
            </tbody>
          </table>
        </AlertBox>
        
        <AlertBox title="Sắp hết hạn" count={expiringRecords.length} color="orange" onExport={() => exportTableToExcel('tbl-expire', 'Sap_Het_Han')}>
          <table id="tbl-expire" className="w-full text-sm text-left">
            <thead className="bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200 sticky top-0">
              <tr>
                <th className="p-2 font-semibold">Họ tên</th>
                <th className="p-2 font-semibold">Số CCCD</th>
                <th className="p-2 font-semibold">Còn (ngày)</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-700">
              {expiringRecords.map(d => (
                <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="p-2 font-bold">{safeRender(d.hoTen)}</td>
                  <td className="p-2 font-mono text-xs">{safeRender(d.cccd)}</td>
                  <td className="p-2 font-bold text-orange-600">{safeRender(d.daysLeft)}</td>
                </tr>
              ))}
              {expiringRecords.length === 0 && <tr><td colSpan="3" className="p-4 text-center text-slate-400 italic">Không có dữ liệu</td></tr>}
            </tbody>
          </table>
        </AlertBox>

        <AlertBox title="Trùng nhiều diện" count={overlappingRecords.length} color="purple" onExport={() => exportTableToExcel('tbl-overlap', 'Trung_Nhieu_Dien')}>
          <table id="tbl-overlap" className="w-full text-sm text-left">
            <thead className="bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 sticky top-0">
              <tr>
                <th className="p-2 font-semibold">Họ tên</th>
                <th className="p-2 font-semibold">Số CCCD</th>
                <th className="p-2 font-semibold">Diện bị trùng</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-700">
              {overlappingRecords.map(d => (
                <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="p-2 font-bold">{safeRender(d.hoTen)}</td>
                  <td className="p-2 font-mono text-xs">{safeRender(d.cccd)}</td>
                  <td className="p-2 text-red-600 font-semibold">{safeRender(d.duplicatedDiens)}</td>
                </tr>
              ))}
              {overlappingRecords.length === 0 && <tr><td colSpan="3" className="p-4 text-center text-slate-400 italic">Không có dữ liệu</td></tr>}
            </tbody>
          </table>
        </AlertBox>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Phân bố theo Khu phố" data={kpData} />
        <ChartCard title="Phân bố theo Tội danh" data={toiDanhData} />
        <ChartCard title="Phân bố theo Diện (Đang quản lý)" data={dienData} />
      </div>
    </div>
  );
}

function StatCard({ label, value, color, Icon }) {
  const colors = { blue: 'border-blue-500', emerald: 'border-emerald-500', slate: 'border-slate-300' };
  return (
    <div className={`bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm flex items-center justify-between border-l-4 ${colors[color]}`}>
      <div><p className="text-sm font-bold text-slate-400 uppercase">{safeRender(label)}</p><p className="text-4xl font-black">{safeRender(value)}</p></div>
      <Icon size={32} className="opacity-30" />
    </div>
  );
}

function AlertBox({ title, count, color, onExport, children }) {
  const bg = { 
    red: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/50', 
    orange: 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-900/50', 
    purple: 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-900/50' 
  }[color];

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border ${bg} flex flex-col h-[400px] overflow-hidden`}>
      <div className="px-4 py-3 flex justify-between items-center border-b dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50">
        <h3 className="font-bold flex items-center gap-2">{safeRender(title)} <span className="bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full text-xs">{safeRender(count)}</span></h3>
        <button onClick={onExport} className="text-xs bg-white dark:bg-slate-700 border dark:border-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm"><FileDown size={14}/> Xuất Excel</button>
      </div>
      <div className="flex-1 overflow-auto custom-scrollbar relative">
        {children}
      </div>
    </div>
  );
}

function ChartCard({ title, data }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border dark:border-slate-700">
      <h3 className="font-bold mb-2">{safeRender(title)}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ==================== TRASH VIEW (THÙNG RÁC) ====================
function TrashView({ data, setData, notify }) {
  const trashData = data.filter(d => d.deletedAt);

  const handleRestore = (id) => {
    setData(data.map(d => {
       if (d.id === id) {
          const newObj = {...d};
          delete newObj.deletedAt;
          return newObj;
       }
       return d;
    }));
    notify("Đã khôi phục hồ sơ thành công");
  };

  const handlePermanentDelete = (id) => {
    if(window.confirm("Xóa vĩnh viễn hồ sơ này? Hành động này không thể hoàn tác!")) {
      setData(data.filter(d => d.id !== id));
      notify("Đã xóa vĩnh viễn");
    }
  };

  const handleEmptyTrash = () => {
    if(window.confirm("Dọn sạch toàn bộ thùng rác?")) {
      setData(data.filter(d => !d.deletedAt));
      notify("Đã dọn sạch thùng rác");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border dark:border-slate-700 p-8">
       <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-3 text-red-600"><Trash size={28}/> Thùng rác ({trashData.length})</h2>
          {trashData.length > 0 && <button onClick={handleEmptyTrash} className="px-4 py-2 bg-red-100 text-red-600 font-bold rounded-lg hover:bg-red-200">Dọn sạch thùng rác</button>}
       </div>
       <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-sm border border-red-100 dark:border-red-800 mb-6">
          <Info size={18} className="inline mr-2"/> Hồ sơ trong thùng rác sẽ tự động bị xóa vĩnh viễn sau 30 ngày.
       </div>
       
       {trashData.length === 0 ? (
         <div className="text-center py-20 text-slate-400"><Trash size={48} className="mx-auto mb-4 opacity-50"/> Thùng rác trống</div>
       ) : (
         <table className="w-full text-sm text-left">
           <thead className="bg-slate-50 dark:bg-slate-700 uppercase text-xs">
             <tr><th className="p-3">Họ tên</th><th className="p-3">CCCD</th><th className="p-3">Ngày xóa</th><th className="p-3 text-right">Thao tác</th></tr>
           </thead>
           <tbody className="divide-y dark:divide-slate-700">
             {trashData.map(d => (
               <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                 <td className="p-3 font-bold">{safeRender(d.hoTen)}</td>
                 <td className="p-3 font-mono">{safeRender(d.cccd)}</td>
                 <td className="p-3 text-red-500">{new Date(d.deletedAt).toLocaleString('vi-VN')}</td>
                 <td className="p-3 text-right">
                    <button onClick={() => handleRestore(d.id)} className="text-blue-600 hover:underline font-semibold mr-4">Khôi phục</button>
                    <button onClick={() => handlePermanentDelete(d.id)} className="text-red-600 hover:underline font-semibold">Xóa vĩnh viễn</button>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
       )}
    </div>
  )
}

// ==================== FORM VIEW ====================
function FormView({ data, setData, editingRecord, setActiveTab, notify, cskvMapping }) {
  const emptyRecord = {
    hoTen: '', cccd: '', ngaySinh: '', gioiTinh: 'Nam', thuongTru: '', choOHienNay: '', phuongXa: '', khuPho: '', canBoPhuTrach: '',
    hoTenCha: '', cccdCha: '', hoTenMe: '', cccdMe: '', hoTenVoChong: '', cccdVoChong: '', trinhDoHocVan: '',
    danhSachDien: [], 
    phieuXetNghiem: '', ngayXetNghiem: '', giayChungNhan: '', cqbhGCN: '',
    hinhThucCaiNghien: '', htCaiNghienHienTai: '', thoiGianChapHanh: '', coSoCaiNghien: '',
    quyetDinhQL: '', cqbhQD: '', thoiHanQuanLy: '', quyetDinhXLHC: '', thoiHanXLHC: '',
    trangThaiCD: 'Còn sống', ngayChet: '', tinhTrangCuTru: 'Có mặt', ngayVangMat: '', lyDoVangMat: '',
    trangThaiQL: 'Đang quản lý', trangThaiPM: 'Đã nhập', ghiChu: '', ngayVaoSo: '', suuTra: '',
    avatar: null,
    tienAnTienSu: [],
    ghiChuLog: [],
    dacDiemRieng: [], diaBanDiChuyen: '',
    quanHeGiaDinh: [], hoSoYTePhapLy: []
  };

  const [formData, setFormData] = useState({ ...emptyRecord, ...editingRecord });
  const [dienInput, setDienInput] = useState('');
  const [dienTrangThai, setDienTrangThai] = useState('Đang quản lý');
  const [dienNgayDuaVao, setDienNgayDuaVao] = useState('');
  
  // Tính năng: Trợ lý tính hạn
  const [calcStart, setCalcStart] = useState('');
  const [calcYears, setCalcYears] = useState(0);
  const [calcMonths, setCalcMonths] = useState(0);
  const [calcResult, setCalcResult] = useState('');

  const [currentAn, setCurrentAn] = useState({ toiDanh: '', hinhThucChinh: '', hinhThucPhu: [], ngayBatDau: '', ngayKetThuc: '', thoiHanNam: '', thoiHanThang: '' });
  const [anEditingIndex, setAnEditingIndex] = useState(null);
  const [searchToiDanh, setSearchToiDanh] = useState('');
  const [showToiDanhDropdown, setShowToiDanhDropdown] = useState(false);

  const [currentGhiChu, setCurrentGhiChu] = useState({
    ngay: new Date().toISOString().slice(0, 10),
    donVi: '',
    noiDung: ''
  });

  const [currentQh, setCurrentQh] = useState({ quanHe: '', hoTen: '', namSinh: '', thongTinKhac: '', fileDinhKem: null });
  const [currentHs, setCurrentHs] = useState({ loaiHoSo: '', soQuyetDinh: '', ngayBanHanh: '', coQuanBanHanh: '', fileDinhKem: null });

  // Đã di chuyển SPECIAL_MARKS ra ngoài dùng chung

  const allDiens = useMemo(() => {
    const set = new Set(DIEN_DOI_TUONG_LIST);
    data.forEach(d => {
      d.danhSachDien?.forEach(dienObj => {
        const ten = typeof dienObj === 'string' ? dienObj : dienObj.ten;
        if (ten) set.add(ten);
      });
    });
    return Array.from(set);
  }, [data]);

  // Tạo Timeline Data
  const timelineEvents = useMemo(() => {
    const events = [];
    (formData.danhSachDien || []).forEach(d => {
       const dDate = parseDate(typeof d === 'string' ? '' : d.ngayDuaVao);
       if (dDate && !isNaN(dDate)) {
          events.push({ date: dDate, title: 'Đưa vào diện', desc: typeof d === 'string' ? d : d.ten, color: 'bg-blue-500' });
       }
    });
    (formData.tienAnTienSu || []).forEach(an => {
       const start = parseDate(an.ngayBatDau);
       if (start && !isNaN(start)) {
          events.push({ date: start, title: 'Bắt đầu Thi hành án/Xử lý', desc: `${an.toiDanh} - ${an.hinhThucChinh}`, color: 'bg-red-500' });
       }
       const end = parseDate(an.ngayKetThuc);
       if (end && !isNaN(end)) {
          events.push({ date: end, title: 'Kết thúc Thi hành án/Xử lý', desc: `${an.toiDanh}`, color: 'bg-emerald-500' });
       }
    });
    (formData.ghiChuLog || []).forEach(g => {
       const gDate = new Date(g.ngay);
       if (gDate && !isNaN(gDate)) {
          events.push({ date: gDate, title: 'Ghi chú xác minh', desc: `${g.donVi}: ${g.noiDung}`, color: 'bg-purple-500' });
       }
    });
    return events.sort((a,b) => b.date - a.date); // Mới nhất lên đầu
  }, [formData]);

  const getCskv = (khuPho) => {
    const kpStr = (khuPho || '').trim().toLowerCase();
    const key = Object.keys(cskvMapping).find(k => k.trim().toLowerCase() === kpStr);
    return key ? cskvMapping[key] : '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updates = { [name]: value };
    if (name === 'cccd') updates.cccd = value.replace(/[^0-9]/g, ''); // Chỉ cho nhập số
    if (name === 'khuPho') updates.canBoPhuTrach = getCskv(value);
    setFormData({ ...formData, ...updates });
  };

  const handleCCCDBlur = () => {
    let cccd = formData.cccd?.trim();
    if (!cccd) return;
    
    // Auto pad zeros
    cccd = formatCCCD(cccd);
    setFormData(prev => ({ ...prev, cccd }));

    if (editingRecord) return;
    const existing = data.find(d => d.cccd === cccd);
    if (existing) {
      if (window.confirm(`CCCD ${cccd} đã tồn tại. Bạn có muốn tự động điền thông tin từ hồ sơ cũ không?`)) {
        setFormData({
          ...formData,
          hoTen: existing.hoTen || formData.hoTen,
          ngaySinh: existing.ngaySinh || formData.ngaySinh,
          thuongTru: existing.thuongTru || formData.thuongTru,
          choOHienNay: existing.choOHienNay || formData.choOHienNay,
          phuongXa: existing.phuongXa || formData.phuongXa,
          khuPho: existing.khuPho || formData.khuPho,
          canBoPhuTrach: existing.canBoPhuTrach || getCskv(existing.khuPho),
          avatar: existing.avatar || formData.avatar
        });
        notify("Đã điền tự động từ hồ sơ cũ.");
      }
    }
  };

  const handleDienAdd = () => {
    const ten = dienInput.trim();
    if (!ten) return;
    const newDien = { ten, trangThai: dienTrangThai, ngayDuaVao: dienNgayDuaVao };
    setFormData({ ...formData, danhSachDien: [...formData.danhSachDien, newDien] });
    setDienInput('');
    setDienNgayDuaVao('');
  };

  const handleDienRemove = (idx) => {
    const newList = formData.danhSachDien.filter((_, i) => i !== idx);
    setFormData({ ...formData, danhSachDien: newList });
  };

  const addOrUpdateAn = () => {
    if (!currentAn.toiDanh) return notify("Vui lòng chọn tội danh", "error");
    let newAn = { ...currentAn };
    if (newAn.ngayBatDau && newAn.ngayKetThuc) {
      const diff = calculateDateDiff(newAn.ngayBatDau, newAn.ngayKetThuc);
      newAn.thoiHanNam = diff.years;
      newAn.thoiHanThang = diff.months;
    } else if (newAn.ngayBatDau && (newAn.thoiHanNam || newAn.thoiHanThang)) {
      newAn.ngayKetThuc = addTime(newAn.ngayBatDau, newAn.thoiHanNam, newAn.thoiHanThang);
    }
    const updatedList = [...(formData.tienAnTienSu || [])];
    if (anEditingIndex !== null) {
      updatedList[anEditingIndex] = newAn;
    } else {
      updatedList.push(newAn);
    }
    setFormData({ ...formData, tienAnTienSu: updatedList });
    setCurrentAn({ toiDanh: '', hinhThucChinh: '', hinhThucPhu: [], ngayBatDau: '', ngayKetThuc: '', thoiHanNam: '', thoiHanThang: '' });
    setAnEditingIndex(null);
    notify("Đã lưu tiền án/tiền sự");
  };

  const editAn = (idx) => {
    setCurrentAn(formData.tienAnTienSu[idx]);
    setAnEditingIndex(idx);
  };

  const removeAn = (idx) => {
    const updated = formData.tienAnTienSu.filter((_, i) => i !== idx);
    setFormData({ ...formData, tienAnTienSu: updated });
    notify("Đã xóa bản án");
  };

  const handleAddGhiChu = () => {
    if (!currentGhiChu.noiDung) return notify("Vui lòng nhập nội dung ghi chú", "error");
    const updatedLog = [...(formData.ghiChuLog || []), currentGhiChu];
    setFormData({ ...formData, ghiChuLog: updatedLog });
    setCurrentGhiChu({ ngay: new Date().toISOString().slice(0, 10), donVi: '', noiDung: '' });
    notify("Đã thêm ghi chú xác minh");
  };

  const handleRemoveGhiChu = (idx) => {
    if (!window.confirm("Xóa ghi chú này?")) return;
    const updatedLog = (formData.ghiChuLog || []).filter((_, i) => i !== idx);
    setFormData({ ...formData, ghiChuLog: updatedLog });
  };

  const handleFileUploadBase64 = (file, callback) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => callback(evt.target.result);
    reader.readAsDataURL(file);
  };

  const handleAddQh = () => {
    if (!currentQh.quanHe || !currentQh.hoTen) return notify("Vui lòng nhập Quan hệ và Họ tên", "error");
    setFormData(prev => ({ ...prev, quanHeGiaDinh: [...(prev.quanHeGiaDinh||[]), currentQh] }));
    setCurrentQh({ quanHe: '', hoTen: '', namSinh: '', thongTinKhac: '', fileDinhKem: null });
  };

  const handleAddHs = () => {
    if (!currentHs.loaiHoSo) return notify("Vui lòng nhập Loại hồ sơ", "error");
    setFormData(prev => ({ ...prev, hoSoYTePhapLy: [...(prev.hoSoYTePhapLy||[]), currentHs] }));
    setCurrentHs({ loaiHoSo: '', soQuyetDinh: '', ngayBanHanh: '', coQuanBanHanh: '', fileDinhKem: null });
  };

  const toggleSpecialMark = (mark) => {
    const current = formData.dacDiemRieng || [];
    if (current.includes(mark)) {
      setFormData({ ...formData, dacDiemRieng: current.filter(m => m !== mark) });
    } else {
      setFormData({ ...formData, dacDiemRieng: [...current, mark] });
    }
  };

  // Trợ lý tính hạn
  useEffect(() => {
    if (calcStart && (calcYears > 0 || calcMonths > 0)) {
       setCalcResult(addTime(calcStart, parseInt(calcYears)||0, parseInt(calcMonths)||0));
    } else {
       setCalcResult('');
    }
  }, [calcStart, calcYears, calcMonths]);

  const filteredToiDanh = useMemo(() => {
    if (!searchToiDanh) return [];
    const results = [];
    Object.entries(DANH_MUC_TOI_DANH_FULL).forEach(([group, list]) => {
      list.forEach(t => {
        if (t.toLowerCase().includes(searchToiDanh.toLowerCase())) results.push({ group, ten: t });
      });
    });
    return results.slice(0, 20);
  }, [searchToiDanh]);

  const handleSave = () => {
    let finalCCCD = formatCCCD(formData.cccd);
    if (!formData.hoTen || !finalCCCD) return notify("Họ tên và CCCD là bắt buộc", "error");
    
    const cleaned = { ...formData, cccd: finalCCCD, danhSachDien: formData.danhSachDien.filter(d => {
        const ten = typeof d === 'string' ? d : d.ten;
        return ten?.trim() !== '';
    }) };
    
    if (cleaned.danhSachDien.length > 0) {
      cleaned.trangThaiQL = cleaned.danhSachDien.some(d => d.trangThai === 'Đang quản lý') ? 'Đang quản lý' : 'Đã kết thúc';
    }

    if (editingRecord) {
      setData(data.map(d => d.id === cleaned.id ? cleaned : d));
      notify("Cập nhật thành công");
    } else {
      if (data.some(d => d.cccd === cleaned.cccd && !d.deletedAt)) return notify("CCCD đã tồn tại trong danh sách đang quản lý", "error");
      setData([{ ...cleaned, id: generateId() }, ...data]);
      notify("Tạo mới thành công");
    }
    setActiveTab('list');
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border dark:border-slate-700 flex flex-col h-[85vh]">
      <div className="px-6 py-4 border-b dark:border-slate-700 flex justify-between">
        <h2 className="text-xl font-bold">{editingRecord ? 'Cập nhật' : 'Thêm mới'} Hồ sơ</h2>
        <button onClick={() => setActiveTab('list')}><X size={24} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-8 space-y-10">
        <Section title="1. Thông tin cơ bản & Diện quản lý">
          <div className="flex flex-col md:flex-row gap-6 mb-4">
            <div className="flex flex-col items-center gap-2">
              <div className="w-32 h-40 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-700 relative hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-2"><UserPlus size={32} className="mx-auto text-slate-400 mb-1" /><span className="text-[10px] text-slate-500 font-bold uppercase">Tải ảnh lên</span></div>
                )}
                <input type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (evt) => setFormData({ ...formData, avatar: evt.target.result });
                    reader.readAsDataURL(file);
                  }
                }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" title="Nhấn để tải ảnh lên" />
              </div>
              {formData.avatar && <button onClick={() => setFormData({...formData, avatar: null})} className="text-xs text-red-500 font-bold hover:underline">Xóa ảnh</button>}
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Họ và tên *" name="hoTen" value={formData.hoTen} onChange={handleChange} />
              <Input label="Số CCCD *" name="cccd" value={formData.cccd} onChange={handleChange} onBlur={handleCCCDBlur} />
              <Input label="Ngày sinh" name="ngaySinh" value={formData.ngaySinh} onChange={handleChange} placeholder="dd/mm/yyyy" />
              <Select label="Giới tính" name="gioiTinh" value={formData.gioiTinh} onChange={handleChange} options={['Nam', 'Nữ']} />
              <Input label="Trình độ học vấn" name="trinhDoHocVan" value={formData.trinhDoHocVan} onChange={handleChange} />
              <Input label="Tình trạng hiện tại" name="trangThaiCD" value={formData.trangThaiCD} onChange={handleChange} placeholder="VD: Còn sống, Đã chết..." />
              <div className="md:col-span-2"><Input label="Nơi ở hiện nay" name="choOHienNay" value={formData.choOHienNay} onChange={handleChange} /></div>
              <Input label="Phường/Xã" name="phuongXa" value={formData.phuongXa} onChange={handleChange} />
              <Input label="Khu phố" name="khuPho" value={formData.khuPho} onChange={handleChange} />
              <Input label="CSKV phụ trách" name="canBoPhuTrach" value={formData.canBoPhuTrach} onChange={handleChange} />
            </div>
          </div>
          
          <div className="mt-2 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
            <label className="font-bold mb-3 block text-yellow-800 dark:text-yellow-200"><Shield size={18} className="inline mr-1" /> Đặc điểm nghiệp vụ (Đánh dấu)</label>
            <div className="flex flex-wrap gap-4">
               {SPECIAL_MARKS.map(mark => (
                 <label key={mark} className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
                   <input type="checkbox" checked={(formData.dacDiemRieng || []).includes(mark)} onChange={() => toggleSpecialMark(mark)} className="w-4 h-4 text-blue-600 rounded" />
                   {mark}
                 </label>
               ))}
            </div>
            {(formData.dacDiemRieng || []).includes("Đối tượng di chuyển") && (
              <div className="mt-3 animate-fade-in">
                <Input placeholder="Nhập địa bàn phường/xã chuyển đến..." value={formData.diaBanDiChuyen || ''} onChange={e => setFormData({...formData, diaBanDiChuyen: e.target.value})} />
              </div>
            )}
          </div>

          <div className="mt-4">
            <label className="font-bold mb-2 block">Diện quản lý</label>
            <div className="space-y-2 mb-2">
              {formData.danhSachDien.map((dien, idx) => {
                const ten = typeof dien === 'string' ? dien : dien.ten;
                const trangThai = typeof dien === 'string' ? 'Đang quản lý' : dien.trangThai;
                const ngayDuaVao = typeof dien === 'string' ? '' : dien.ngayDuaVao;
                return (
                  <div key={idx} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700 p-2 rounded border dark:border-slate-600">
                    <span className="flex-1 font-semibold text-sm pl-2">{safeRender(ten)}</span>
                    <span className={`text-xs px-2 py-1 rounded ${trangThai === 'Đang quản lý' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-300'}`}>{safeRender(trangThai)}</span>
                    <span className="text-xs text-slate-500">{safeRender(ngayDuaVao)}</span>
                    <button onClick={() => handleDienRemove(idx)} className="text-red-500 p-1 hover:bg-red-100 dark:hover:bg-red-900/50 rounded"><X size={16} /></button>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border dark:border-slate-700">
              <select className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600 text-sm" value={dienInput} onChange={e => setDienInput(e.target.value)}>
                <option value="">-- Chọn diện --</option>
                {allDiens.map(d => <option key={d} value={d}>{safeRender(d)}</option>)}
              </select>
              <input type="text" className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600 text-sm" placeholder="Hoặc gõ diện mới" value={dienInput} onChange={e => setDienInput(e.target.value)} />
              <div className="flex gap-2">
                 <select className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600 text-sm w-1/2" value={dienTrangThai} onChange={e => setDienTrangThai(e.target.value)}>
                   <option>Đang quản lý</option><option>Đã kết thúc</option>
                 </select>
                 <Input placeholder="Ngày BĐ (dd/mm/yyyy)" className="text-sm" value={dienNgayDuaVao} onChange={e => setDienNgayDuaVao(e.target.value)} />
              </div>
              <button onClick={handleDienAdd} className="px-4 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 flex items-center justify-center gap-1"><Plus size={16}/> Thêm Diện</button>
            </div>
          </div>
        </Section>

        <Section title="2. Tiền án / Tiền sự">
          {/* Trợ lý tính hạn */}
          <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800 flex flex-col md:flex-row gap-4 items-center">
            <div className="font-bold text-amber-800 dark:text-amber-200 flex items-center gap-2 w-full md:w-auto"><Clock size={18}/> Trợ lý tính hạn:</div>
            <div className="flex flex-1 gap-2 items-center text-sm w-full">
               <input type="text" placeholder="Ngày bắt đầu (dd/mm/yyyy)" className="p-2 border rounded w-full md:w-40 dark:bg-slate-700 dark:border-slate-600" value={calcStart} onChange={e => setCalcStart(e.target.value)}/>
               <span className="font-bold text-slate-400">+</span>
               <input type="number" placeholder="Năm" className="p-2 border rounded w-16 dark:bg-slate-700 dark:border-slate-600 text-center" value={calcYears} onChange={e => setCalcYears(e.target.value)}/>
               <input type="number" placeholder="Tháng" className="p-2 border rounded w-16 dark:bg-slate-700 dark:border-slate-600 text-center" value={calcMonths} onChange={e => setCalcMonths(e.target.value)}/>
               <span className="font-bold text-slate-400">=</span>
               <input type="text" readOnly placeholder="Ngày kết thúc" className="p-2 border rounded w-full md:w-40 bg-white font-bold text-emerald-600 dark:bg-slate-800 dark:border-slate-600 outline-none" value={calcResult} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <label className="block text-sm font-semibold mb-1">Tội danh *</label>
                <input type="text" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600" placeholder="Tìm tội danh..."
                  value={currentAn.toiDanh} onChange={e => { setCurrentAn({...currentAn, toiDanh: e.target.value}); setSearchToiDanh(e.target.value); setShowToiDanhDropdown(true); }}
                  onFocus={() => setShowToiDanhDropdown(true)} onBlur={() => setTimeout(() => setShowToiDanhDropdown(false), 200)}
                />
                {showToiDanhDropdown && filteredToiDanh.length > 0 && (
                  <div className="absolute z-10 w-full bg-white dark:bg-slate-700 border dark:border-slate-600 rounded shadow max-h-60 overflow-auto">
                    {filteredToiDanh.map((item, idx) => (
                      <div key={idx} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer" onClick={() => { setCurrentAn({...currentAn, toiDanh: item.ten}); setSearchToiDanh(''); setShowToiDanhDropdown(false); }}>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{safeRender(item.group)}</span><br />{safeRender(item.ten)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Hình thức xử lý chính</label>
                <select className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600" value={currentAn.hinhThucChinh} onChange={e => setCurrentAn({...currentAn, hinhThucChinh: e.target.value})}>
                  <option value="">-- Chọn --</option>
                  {HINH_THUC_XU_LY_FULL.map(ht => <option key={ht}>{safeRender(ht)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Hình thức phụ</label>
                <select multiple className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600" value={currentAn.hinhThucPhu} onChange={e => setCurrentAn({...currentAn, hinhThucPhu: Array.from(e.target.selectedOptions, o => o.value)})}>
                  {HINH_THUC_XU_LY_FULL.map(ht => <option key={ht}>{safeRender(ht)}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input label="Ngày bắt đầu" value={currentAn.ngayBatDau} onChange={e => setCurrentAn({...currentAn, ngayBatDau: e.target.value})} placeholder="dd/mm/yyyy" />
              <Input label="Ngày kết thúc" value={currentAn.ngayKetThuc} onChange={e => setCurrentAn({...currentAn, ngayKetThuc: e.target.value})} placeholder="dd/mm/yyyy" />
              <div className="flex gap-2 items-end">
                <Input label="Năm" type="number" value={currentAn.thoiHanNam} onChange={e => setCurrentAn({...currentAn, thoiHanNam: e.target.value})} />
                <Input label="Tháng" type="number" value={currentAn.thoiHanThang} onChange={e => setCurrentAn({...currentAn, thoiHanThang: e.target.value})} />
              </div>
              <div className="flex items-end gap-2">
                <button onClick={addOrUpdateAn} className="px-4 py-2 bg-green-600 text-white font-bold rounded flex items-center gap-1"><Plus size={16} /> {anEditingIndex !== null ? 'Cập nhật' : 'Thêm'}</button>
                {anEditingIndex !== null && <button onClick={() => { setCurrentAn({ toiDanh: '', hinhThucChinh: '', hinhThucPhu: [], ngayBatDau: '', ngayKetThuc: '', thoiHanNam: '', thoiHanThang: '' }); setAnEditingIndex(null); }} className="px-4 py-2 border rounded dark:border-slate-600">Hủy</button>}
              </div>
            </div>
            <div>
              <table className="w-full text-sm border dark:border-slate-700 mt-2">
                <thead className="bg-slate-50 dark:bg-slate-700"><tr><th className="p-2 text-left">Tội danh</th><th className="p-2 text-left">Xử lý chính</th><th className="p-2 text-left">Phụ</th><th className="p-2 text-left">Ngày BĐ</th><th className="p-2 text-left">Ngày KT</th><th className="p-2 text-left">Thời hạn</th><th className="p-2"></th></tr></thead>
                <tbody>
                  {(formData.tienAnTienSu || []).map((an, idx) => (
                    <tr key={idx} className="border-t dark:border-slate-700">
                      <td className="p-2 font-semibold">{safeRender(an.toiDanh)}</td><td className="p-2">{safeRender(an.hinhThucChinh)}</td><td className="p-2 text-xs text-slate-500">{an.hinhThucPhu ? safeRender(an.hinhThucPhu.join(', ')) : ''}</td>
                      <td className="p-2">{safeRender(an.ngayBatDau)}</td><td className="p-2">{safeRender(an.ngayKetThuc)}</td><td className="p-2">{safeRender(an.thoiHanNam)} năm {safeRender(an.thoiHanThang)} tháng</td>
                      <td className="p-2 text-center"><button onClick={() => editAn(idx)} className="mr-2 text-blue-500"><Edit size={14} /></button><button onClick={() => removeAn(idx)} className="text-red-500"><Trash2 size={14} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Section>

        <Section title="3. Quan hệ gia đình">
          <div className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border dark:border-slate-700">
                <Input label="Quan hệ *" placeholder="VD: Cha, Mẹ, Vợ..." value={currentQh.quanHe} onChange={e => setCurrentQh({...currentQh, quanHe: e.target.value})} />
                <Input label="Họ Tên *" value={currentQh.hoTen} onChange={e => setCurrentQh({...currentQh, hoTen: e.target.value})} />
                <Input label="Năm sinh" type="number" value={currentQh.namSinh} onChange={e => setCurrentQh({...currentQh, namSinh: e.target.value})} />
                <Input label="Thông tin (CCCD, Địa chỉ)" value={currentQh.thongTinKhac} onChange={e => setCurrentQh({...currentQh, thongTinKhac: e.target.value})} />
                <div className="flex flex-col gap-1">
                   <label className="text-xs font-semibold">Đính kèm (Ảnh)</label>
                   <div className="flex gap-2">
                     <label className="bg-slate-200 dark:bg-slate-700 p-2 rounded cursor-pointer hover:bg-slate-300 flex items-center justify-center flex-1">
                       <ImageIcon size={18} />
                       <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUploadBase64(e.target.files[0], (b64) => setCurrentQh({...currentQh, fileDinhKem: b64}))} />
                     </label>
                     <button onClick={handleAddQh} className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700"><Plus size={18}/></button>
                   </div>
                </div>
                {currentQh.fileDinhKem && <div className="md:col-span-5 text-xs text-emerald-600 font-bold">Đã tải lên 1 tệp đính kèm.</div>}
             </div>
             
             {(formData.quanHeGiaDinh && formData.quanHeGiaDinh.length > 0) && (
                <table className="w-full text-sm mt-2 border dark:border-slate-700">
                  <thead className="bg-slate-100 dark:bg-slate-700"><tr><th className="p-2">Quan hệ</th><th className="p-2">Họ tên</th><th className="p-2">Năm sinh</th><th className="p-2">Thông tin khác</th><th className="p-2">Tài liệu</th><th className="p-2">Xóa</th></tr></thead>
                  <tbody>
                     {formData.quanHeGiaDinh.map((qh, i) => (
                        <tr key={i} className="border-t dark:border-slate-700">
                          <td className="p-2 font-bold">{safeRender(qh.quanHe)}</td><td className="p-2">{safeRender(qh.hoTen)}</td><td className="p-2">{safeRender(qh.namSinh)}</td><td className="p-2">{safeRender(qh.thongTinKhac)}</td>
                          <td className="p-2">{qh.fileDinhKem ? <a href={qh.fileDinhKem} target="_blank" className="text-blue-500 hover:underline"><ImageIcon size={16} className="inline mr-1"/>Xem</a> : ''}</td>
                          <td className="p-2"><button onClick={() => setFormData(prev => ({...prev, quanHeGiaDinh: prev.quanHeGiaDinh.filter((_,idx) => idx !== i)}))} className="text-red-500"><Trash2 size={16}/></button></td>
                        </tr>
                     ))}
                  </tbody>
                </table>
             )}
          </div>
        </Section>
        
        <Section title="4. Hồ sơ y tế & Quyết định pháp lý">
          <div className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border dark:border-slate-700">
                <Input label="Loại hồ sơ *" placeholder="VD: Sổ khám bệnh, GCN, QĐ..." value={currentHs.loaiHoSo} onChange={e => setCurrentHs({...currentHs, loaiHoSo: e.target.value})} />
                <Input label="Số/Ký hiệu" value={currentHs.soQuyetDinh} onChange={e => setCurrentHs({...currentHs, soQuyetDinh: e.target.value})} />
                <Input label="Ngày ban hành" placeholder="dd/mm/yyyy" value={currentHs.ngayBanHanh} onChange={e => setCurrentHs({...currentHs, ngayBanHanh: e.target.value})} />
                <Input label="Cơ quan ban hành" value={currentHs.coQuanBanHanh} onChange={e => setCurrentHs({...currentHs, coQuanBanHanh: e.target.value})} />
                <div className="flex flex-col gap-1">
                   <label className="text-xs font-semibold">Đính kèm (Ảnh)</label>
                   <div className="flex gap-2">
                     <label className="bg-slate-200 dark:bg-slate-700 p-2 rounded cursor-pointer hover:bg-slate-300 flex items-center justify-center flex-1">
                       <ImageIcon size={18} />
                       <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUploadBase64(e.target.files[0], (b64) => setCurrentHs({...currentHs, fileDinhKem: b64}))} />
                     </label>
                     <button onClick={handleAddHs} className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700"><Plus size={18}/></button>
                   </div>
                </div>
                {currentHs.fileDinhKem && <div className="md:col-span-5 text-xs text-emerald-600 font-bold">Đã tải lên 1 tệp đính kèm.</div>}
             </div>
             
             {(formData.hoSoYTePhapLy && formData.hoSoYTePhapLy.length > 0) && (
                <table className="w-full text-sm mt-2 border dark:border-slate-700">
                  <thead className="bg-slate-100 dark:bg-slate-700"><tr><th className="p-2">Loại hồ sơ</th><th className="p-2">Số QĐ</th><th className="p-2">Ngày ban hành</th><th className="p-2">Cơ quan</th><th className="p-2">Tài liệu</th><th className="p-2">Xóa</th></tr></thead>
                  <tbody>
                     {formData.hoSoYTePhapLy.map((hs, i) => (
                        <tr key={i} className="border-t dark:border-slate-700">
                          <td className="p-2 font-bold">{safeRender(hs.loaiHoSo)}</td><td className="p-2">{safeRender(hs.soQuyetDinh)}</td><td className="p-2">{safeRender(hs.ngayBanHanh)}</td><td className="p-2">{safeRender(hs.coQuanBanHanh)}</td>
                          <td className="p-2">{hs.fileDinhKem ? <a href={hs.fileDinhKem} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline"><ImageIcon size={16} className="inline mr-1"/>Xem</a> : ''}</td>
                          <td className="p-2"><button onClick={() => setFormData(prev => ({...prev, hoSoYTePhapLy: prev.hoSoYTePhapLy.filter((_,idx) => idx !== i)}))} className="text-red-500"><Trash2 size={16}/></button></td>
                        </tr>
                     ))}
                  </tbody>
                </table>
             )}
          </div>
        </Section>

        <Section title="5. Lịch sử Ghi chú & Xác minh">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <Input label="Ngày ghi nhận" type="date" value={currentGhiChu.ngay} onChange={e => setCurrentGhiChu({...currentGhiChu, ngay: e.target.value})} />
              <Input label="Đơn vị xác minh" placeholder="VD: CSKV Khu phố 1" value={currentGhiChu.donVi} onChange={e => setCurrentGhiChu({...currentGhiChu, donVi: e.target.value})} />
              <div className="md:col-span-2 flex gap-2 items-end">
                <div className="flex-1">
                   <Input label="Nội dung xác minh *" placeholder="Nhập chi tiết quá trình xác minh đối tượng..." value={currentGhiChu.noiDung} onChange={e => setCurrentGhiChu({...currentGhiChu, noiDung: e.target.value})} />
                </div>
                <button onClick={handleAddGhiChu} className="px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 h-[42px] whitespace-nowrap"><Plus size={16} className="inline mr-1"/> Thêm</button>
              </div>
            </div>
            
            {(formData.ghiChuLog && formData.ghiChuLog.length > 0) ? (
              <div className="border dark:border-slate-700 rounded-xl overflow-hidden mt-4">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-700 border-b dark:border-slate-600">
                    <tr><th className="p-3 w-32">Ngày</th><th className="p-3 w-48">Đơn vị</th><th className="p-3">Nội dung</th><th className="p-3 w-16 text-center">Xóa</th></tr>
                  </thead>
                  <tbody className="divide-y dark:divide-slate-700">
                    {formData.ghiChuLog.map((log, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="p-3 font-semibold">{parseDate(log.ngay) ? new Date(log.ngay).toLocaleDateString('vi-VN') : log.ngay}</td>
                        <td className="p-3">{safeRender(log.donVi)}</td>
                        <td className="p-3 whitespace-pre-wrap">{safeRender(log.noiDung)}</td>
                        <td className="p-3 text-center"><button onClick={() => handleRemoveGhiChu(idx)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16}/></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-400 italic text-sm mt-2">Chưa có ghi chú xác minh nào.</p>
            )}
          </div>
        </Section>

        {/* Timeline Dòng thời gian */}
        <Section title="6. Timeline Dòng thời gian đối tượng">
          <div className="relative pl-6 border-l-2 border-blue-200 dark:border-blue-900 space-y-6 mt-4">
             {timelineEvents.length === 0 ? <p className="text-sm italic text-slate-400">Chưa có sự kiện nào được ghi nhận</p> : 
                timelineEvents.map((ev, i) => (
                   <div key={i} className="relative">
                      <div className={`absolute -left-[33px] w-4 h-4 rounded-full ${ev.color} border-4 border-white dark:border-slate-800 top-1`}></div>
                      <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border dark:border-slate-700 inline-block w-full max-w-2xl shadow-sm">
                         <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm inline-block mb-1">{ev.date.toLocaleDateString('vi-VN')}</span>
                         <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{safeRender(ev.title)}</h4>
                         <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{safeRender(ev.desc)}</p>
                      </div>
                   </div>
                ))
             }
          </div>
        </Section>

      </div>
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border-t dark:border-slate-700 flex justify-end gap-3 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button onClick={() => setActiveTab('list')} className="px-6 py-2 border rounded font-bold text-slate-600 dark:text-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700">Hủy</button>
        <button onClick={handleSave} className="px-8 py-2 bg-blue-600 text-white rounded font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700 flex items-center gap-2"><Save size={18} /> Lưu Hồ Sơ</button>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl">
      <h3 className="text-lg font-bold border-b-2 border-slate-100 dark:border-slate-700 pb-2 mb-4 text-blue-800 dark:text-blue-300 uppercase tracking-wide">{safeRender(title)}</h3>
      {children}
    </div>
  );
}

function Input({ label, className, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-300">{safeRender(label)}</label>}
      <input className={`w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-blue-500 ${className}`} {...props} />
    </div>
  );
}

function Select({ label, options, className, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-semibold mb-1 text-slate-700 dark:text-slate-300">{safeRender(label)}</label>}
      <select className={`w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-blue-500 ${className}`} {...props}>
        {options.map(o => <option key={o} value={o}>{safeRender(o)}</option>)}
      </select>
    </div>
  );
}

// ==================== LIST VIEW ====================
function ListView({ data, setData, allData, notify, openForm, cskvMapping, searchTerm, setSearchTerm, filters, setFilters, viewMode, setViewMode }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [qrModal, setQrModal] = useState(null); // null or obj

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = !searchTerm || item.hoTen?.toLowerCase().includes(searchTerm.toLowerCase()) || item.cccd?.includes(searchTerm);
      const matchKhuPho = filters.khuPho === 'All' || item.khuPho === filters.khuPho;
      
      const matchDien = !filters.dien || item.danhSachDien?.some(d => {
         const ten = typeof d === 'string' ? d : d.ten;
         return ten?.toLowerCase().includes(filters.dien.toLowerCase());
      });
      const matchToiDanh = !filters.toiDanh || item.tienAnTienSu?.some(an => an.toiDanh?.toLowerCase().includes(filters.toiDanh.toLowerCase()));
      const matchHinhThuc = !filters.hinhThucXuLy || item.tienAnTienSu?.some(an => an.hinhThucChinh?.toLowerCase().includes(filters.hinhThucXuLy.toLowerCase()) || an.hinhThucPhu?.some(h => h.toLowerCase().includes(filters.hinhThucXuLy.toLowerCase())));
      const matchGioiTinh = filters.gioiTinh === 'All' || item.gioiTinh === filters.gioiTinh;
      
      let matchNgaySinh = true;
      if (filters.tuNgaySinh || filters.denNgaySinh) {
        const ngaySinh = parseDate(item.ngaySinh);
        if (ngaySinh && !isNaN(ngaySinh)) {
          if (filters.tuNgaySinh) {
            const tu = parseDate(filters.tuNgaySinh);
            if (tu && ngaySinh < tu) matchNgaySinh = false;
          }
          if (filters.denNgaySinh) {
            const den = parseDate(filters.denNgaySinh);
            if (den && ngaySinh > den) matchNgaySinh = false;
          }
        } else if (filters.tuNgaySinh || filters.denNgaySinh) matchNgaySinh = false;
      }
      return matchSearch && matchKhuPho && matchDien && matchToiDanh && matchHinhThuc && matchGioiTinh && matchNgaySinh;
    });
  }, [data, searchTerm, filters]);

  const flattenedData = useMemo(() => {
    const flat = filteredData.flatMap(item => {
      const diens = item.danhSachDien?.length ? item.danhSachDien : [{ ten: '(Không có diện)', trangThai: item.trangThaiQL }];
      
      const matchedDiens = diens.filter(dienObj => {
          if (!filters.dien) return true;
          const ten = typeof dienObj === 'string' ? dienObj : dienObj.ten;
          return ten?.toLowerCase().includes(filters.dien.toLowerCase());
      });

      return matchedDiens.map(dienObj => {
        const tenDien = typeof dienObj === 'string' ? dienObj : dienObj.ten;
        const trangThaiDien = typeof dienObj === 'string' ? item.trangThaiQL : (dienObj.trangThai || item.trangThaiQL);
        return { ...item, _displayDien: tenDien, _dienStatus: trangThaiDien };
      });
    });
    
    return flat.filter(item => filters.trangThaiQL === 'All' || item._dienStatus === filters.trangThaiQL);
  }, [filteredData, filters]);

  // Lấy các unique item id cho Grid view (tránh lặp 1 người 2 diện thành 2 card)
  const uniqueGridData = useMemo(() => {
     const seen = new Set();
     return flattenedData.filter(item => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
     });
  }, [flattenedData]);

  const uniqueKhuPho = useMemo(() => [...new Set(data.map(d => d.khuPho).filter(Boolean))], [data]);

  const getDisplayCskv = (kp, currentCanBo) => {
    if (!cskvMapping) return currentCanBo;
    const kpStr = String(kp || '').trim().toLowerCase();
    const key = Object.keys(cskvMapping).find(k => k.trim().toLowerCase() === kpStr);
    return key ? cskvMapping[key] : currentCanBo;
  };

  const handleDeleteDien = (id, dienToRemove) => {
    const record = data.find(d => d.id === id);
    if (!record) return;
    if (record.danhSachDien.length <= 1 || dienToRemove === '(Không có diện)') {
      if (window.confirm("Đây là diện cuối cùng, đối tượng sẽ được đưa vào Thùng Rác. Tiếp tục?")) {
        handleDeleteToanBo(id);
      }
    } else {
      if (window.confirm(`Gỡ bỏ diện "${dienToRemove}" khỏi đối tượng?`)) {
        setData(allData.map(d => {
            if (d.id !== id) return d;
            const newDiens = d.danhSachDien.filter(x => {
                const ten = typeof x === 'string' ? x : x.ten;
                return ten !== dienToRemove;
            });
            const newTrangThaiQL = newDiens.some(x => x.trangThai === 'Đang quản lý') ? 'Đang quản lý' : 'Đã kết thúc';
            return { ...d, danhSachDien: newDiens, trangThaiQL: newTrangThaiQL };
        }));
        notify("Đã gỡ diện");
      }
    }
  };

  // Tính năng: Xóa rơi vào thùng rác
  const handleDeleteToanBo = (id) => {
    if (window.confirm("Đưa hồ sơ này vào Thùng rác? (Sẽ lưu trữ 30 ngày trước khi xóa hẳn)")) {
      setData(allData.map(d => d.id === id ? { ...d, deletedAt: new Date().toISOString() } : d));
      notify("Đã chuyển vào thùng rác", "error");
    }
  };

  const executeDeleteAllData = async () => {
    if (deleteInput === 'XOA') {
      setData([]); 
      try {
        await setItemDB(DATA_KEY, []); 
        localStorage.removeItem('doiTuongData_v5'); 
        notify("Đã xóa sạch toàn bộ hồ sơ trong cơ sở dữ liệu!", "error");
      } catch (e) {
        console.error(e);
      }
      setShowDeleteConfirm(false);
      setDeleteInput('');
    } else {
      notify("Hủy thao tác do nhập sai mã xác nhận.", "success");
      setShowDeleteConfirm(false);
      setDeleteInput('');
    }
  };

  const exportToExcel = () => {
    if (flattenedData.length === 0) return notify("Không có dữ liệu", "error");
    exportTableToExcel('main-list', 'Danh_Sach_Ho_So');
  };

  // Tính năng: Báo cáo copy 1 chạm
  const handleCopyReport = (item) => {
    const diens = (item.danhSachDien || []).map(d => typeof d === 'string' ? d : `${d.ten} (${d.trangThai})`).join(', ');
    const ans = (item.tienAnTienSu || []).map(a => `${a.toiDanh} (${a.hinhThucChinh})`).join('; ');
    const text = `TRÍCH LỤC HỒ SƠ ĐỐI TƯỢNG:
- Họ tên: ${item.hoTen || '---'} (Sinh năm: ${item.ngaySinh || '---'})
- CCCD: ${item.cccd || '---'}
- Cư trú hiện tại: ${item.choOHienNay || '---'}, Khu phố: ${item.khuPho || '---'}
- Tình trạng: ${item.trangThaiCD || 'Còn sống'}
- Các diện quản lý: ${diens || '---'}
- Tiền án/Tiền sự: ${ans ? `${item.tienAnTienSu.length} vụ (${ans})` : 'Chưa ghi nhận'}
- Ghi chú gần nhất: ${(item.ghiChuLog && item.ghiChuLog.length>0) ? item.ghiChuLog[item.ghiChuLog.length-1].noiDung : 'Chưa có'}`;

    // Tạo textarea tạm để copy tránh lỗi iFrame
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    try {
      document.execCommand('copy');
      notify("Đã Copy mẫu báo cáo chuyên nghiệp vào khay nhớ tạm!");
    } catch (err) {
      notify("Trình duyệt không hỗ trợ copy", "error");
    }
    document.body.removeChild(el);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border dark:border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            <input placeholder="Tìm tên, CCCD..." className="w-full pl-10 pr-4 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 outline-none focus:border-blue-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600" value={filters.khuPho} onChange={e => setFilters({...filters, khuPho: e.target.value})}>
            <option value="All">Tất cả Khu phố</option>
            {uniqueKhuPho.map(kp => <option key={kp}>{safeRender(kp)}</option>)}
          </select>
          <select className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600 font-semibold" value={filters.trangThaiQL} onChange={e => setFilters({...filters, trangThaiQL: e.target.value})}>
            <option value="All">Trạng thái (Tổng đối tượng)</option>
            <option className="text-green-600 font-bold" value="Đang quản lý">Chỉ Lọc Đang quản lý</option>
            <option className="text-gray-500 font-bold" value="Đã kết thúc">Chỉ Lọc Đã kết thúc</option>
          </select>
          <input placeholder="Lọc diện..." className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600" value={filters.dien} onChange={e => setFilters({...filters, dien: e.target.value})} />
          <input placeholder="Lọc tội danh..." className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600" value={filters.toiDanh} onChange={e => setFilters({...filters, toiDanh: e.target.value})} />
          <input placeholder="Lọc hình thức xử lý..." className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600" value={filters.hinhThucXuLy} onChange={e => setFilters({...filters, hinhThucXuLy: e.target.value})} />
          <select className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600" value={filters.gioiTinh} onChange={e => setFilters({...filters, gioiTinh: e.target.value})}>
            <option value="All">Giới tính</option><option>Nam</option><option>Nữ</option>
          </select>
          <div className="flex gap-2 items-center">
            <input placeholder="Từ ngày sinh" className="p-2 border rounded w-full dark:bg-slate-700 dark:border-slate-600 text-sm" value={filters.tuNgaySinh} onChange={e => setFilters({...filters, tuNgaySinh: e.target.value})} />
            <input placeholder="Đến" className="p-2 border rounded w-full dark:bg-slate-700 dark:border-slate-600 text-sm" value={filters.denNgaySinh} onChange={e => setFilters({...filters, denNgaySinh: e.target.value})} />
          </div>
        </div>
        <div className="mt-4 flex justify-between items-center border-t dark:border-slate-700 pt-4">
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} className="bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 px-4 py-2 rounded flex items-center gap-2 font-bold transition-colors">
              <AlertTriangle size={18} /> Format Toàn bộ Dữ liệu
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/40 p-2 rounded-lg border border-red-200 dark:border-red-800 animate-fade-in">
              <span className="text-sm font-bold text-red-600 dark:text-red-400">Gõ chữ XOA:</span>
              <input
                type="text"
                className="w-20 p-1.5 border rounded border-red-300 dark:border-red-600 dark:bg-slate-700 text-center font-bold text-red-600 uppercase focus:outline-none focus:ring-2 focus:ring-red-500"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value.toUpperCase())}
                placeholder="XOA"
              />
              <button onClick={executeDeleteAllData} className="bg-red-600 text-white px-3 py-1.5 rounded font-bold hover:bg-red-700 shadow-sm text-sm">Xác nhận</button>
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }} className="bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded font-bold hover:bg-slate-400 text-sm">Hủy</button>
            </div>
          )}
          
          <div className="flex gap-2">
            <div className="bg-slate-100 dark:bg-slate-700 p-1 rounded-lg flex mr-2">
               <button onClick={() => setViewMode('table')} className={`p-1.5 rounded ${viewMode==='table' ? 'bg-white dark:bg-slate-600 shadow-sm' : 'text-slate-400'}`} title="Dạng bảng"><List size={18}/></button>
               <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode==='grid' ? 'bg-white dark:bg-slate-600 shadow-sm' : 'text-slate-400'}`} title="Dạng thẻ Danh bạ"><Grid size={18}/></button>
            </div>
            <button onClick={exportToExcel} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded flex items-center gap-2 font-bold transition-colors shadow-lg shadow-emerald-600/30">
              <FileDown size={18} /> Xuất Excel
            </button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 p-4 rounded-xl text-sm font-medium flex justify-between items-center border border-blue-100 dark:border-blue-800 shadow-sm">
         <div className="flex items-center gap-2"><Info size={18}/><span>Kết quả lọc hiện tại:</span></div>
         <div>
            Tìm thấy <strong className="text-lg bg-white dark:bg-slate-800 px-2 py-0.5 rounded shadow-sm mx-1">{safeRender(uniqueGridData.length)}</strong> đối tượng / 
            <strong className="text-lg bg-white dark:bg-slate-800 px-2 py-0.5 rounded shadow-sm mx-1">{safeRender(flattenedData.length)}</strong> lượt diện hồ sơ đúng chuẩn.
         </div>
      </div>

      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border dark:border-slate-700 overflow-x-auto">
          <table id="main-list" className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 uppercase text-[11px] tracking-wider">
              <tr><th className="p-3">Họ tên</th><th className="p-3">Số CCCD</th><th className="p-3">Ngày sinh</th><th className="p-3 w-1/4">Diện QL & Trạng thái</th><th className="p-3">Khu phố</th><th className="p-3">CSKV</th><th className="print:hidden text-center p-3">Thao tác</th></tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-700">
              {flattenedData.map((item, idx) => (
                <tr key={`${item.id}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="p-3 font-bold flex items-center gap-2">
                    {item.avatar ? <img src={item.avatar} className="w-8 h-8 rounded-full object-cover border" alt="" /> : <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center"><UserPlus size={14} className="text-slate-400"/></div>}
                    {safeRender(item.hoTen)}
                  </td>
                  <td className="p-3 font-mono">{safeRender(item.cccd)}</td>
                  <td className="p-3">{safeRender(item.ngaySinh)}</td>
                  <td className="p-3">
                    <span className="bg-blue-50 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs block mb-1 font-semibold border dark:border-blue-800 truncate max-w-xs">{safeRender(item._displayDien)}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full inline-block font-bold uppercase tracking-wide ${item._dienStatus === 'Đang quản lý' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                      {safeRender(item._dienStatus)}
                    </span>
                  </td>
                  <td className="p-3">{safeRender(item.khuPho)}</td>
                  <td className="p-3">{safeRender(getDisplayCskv(item.khuPho, item.canBoPhuTrach))}</td>
                  <td className="print:hidden p-3">
                    <div className="flex gap-2 justify-center">
                      <button onClick={() => setQrModal(item)} className="p-1.5 text-slate-500 bg-slate-100 hover:bg-slate-200 rounded dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600" title="Mã QR"><QrCode size={14} /></button>
                      <button onClick={() => handleCopyReport(item)} className="p-1.5 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded dark:bg-purple-900/30 dark:hover:bg-purple-900/50" title="Copy báo cáo"><Copy size={14} /></button>
                      <button onClick={() => openForm(item)} className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded dark:bg-blue-900/30 dark:hover:bg-blue-900/50" title="Sửa đối tượng"><Edit size={14} /></button>
                      <button onClick={() => handleDeleteDien(item.id, item._displayDien)} className="p-1.5 text-orange-500 bg-orange-50 hover:bg-orange-100 rounded dark:bg-orange-900/30 dark:hover:bg-orange-900/50" title="Gỡ diện này"><MinusCircle size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {uniqueGridData.map((item) => (
             <div key={item.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow relative group">
                <div className="p-5 flex gap-4">
                   <div className="w-16 h-20 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden border dark:border-slate-600 flex-shrink-0 relative">
                     {item.avatar ? <img src={item.avatar} className="w-full h-full object-cover" alt="" /> : <UserPlus className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-slate-300" size={32}/>}
                   </div>
                   <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 truncate">{safeRender(item.hoTen)}</h3>
                      <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-1">{safeRender(item.cccd)}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 truncate"><MapIcon size={12} className="inline mr-1 opacity-50"/>{safeRender(item.khuPho)}</p>
                   </div>
                </div>
                <div className="px-5 pb-4 space-y-2">
                   {item.danhSachDien?.slice(0,2).map((d, i) => {
                      const t = typeof d === 'string' ? d : d.ten;
                      const tt = typeof d === 'string' ? item.trangThaiQL : d.trangThai;
                      return (
                        <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-2 rounded text-xs border dark:border-slate-700">
                           <span className="truncate flex-1 font-medium">{safeRender(t)}</span>
                           <span className={`w-2 h-2 rounded-full ml-2 ${tt === 'Đang quản lý' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        </div>
                      )
                   })}
                   {item.danhSachDien?.length > 2 && <p className="text-xs text-center text-blue-500 italic">+ {item.danhSachDien.length - 2} diện khác</p>}
                </div>
                {/* Actions overlay on hover */}
                <div className="absolute inset-x-0 bottom-0 bg-slate-900/90 p-3 flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                   <button onClick={() => setQrModal(item)} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg" title="Mã QR"><QrCode size={18} /></button>
                   <button onClick={() => handleCopyReport(item)} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg" title="Copy báo cáo"><Copy size={18} /></button>
                   <button onClick={() => openForm(item)} className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg" title="Sửa"><Edit size={18} /></button>
                   <button onClick={() => handleDeleteToanBo(item.id)} className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg" title="Xóa vào thùng rác"><Trash size={18} /></button>
                </div>
             </div>
          ))}
        </div>
      )}

      {/* QR Modal */}
      {qrModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl relative max-w-sm w-full text-center">
               <button onClick={() => setQrModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"><X size={24}/></button>
               <h3 className="text-xl font-bold mb-1">{safeRender(qrModal.hoTen)}</h3>
               <p className="font-mono text-sm text-slate-500 mb-6">{safeRender(qrModal.cccd)}</p>
               
               <div className="bg-white p-4 rounded-2xl inline-block shadow-inner border border-slate-200">
                 {/* Khắc phục nội dung QR Code theo yêu cầu */}
                 <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`CCCD: ${qrModal.cccd}\nHọ tên: ${qrModal.hoTen}\nDiện QL: ${qrModal.danhSachDien?.filter(d => (typeof d === 'string' ? qrModal.trangThaiQL : d.trangThai) === 'Đang quản lý').map(d => typeof d === 'string' ? d : d.ten).join(', ') || 'Không có diện Đang QL'}`)}`} alt="QR Code" className="w-48 h-48" />
               </div>
               
               <p className="mt-6 text-sm text-slate-600 dark:text-slate-300">Quét mã này để tra cứu nhanh thông tin đối tượng (Tên, CCCD, Các diện đang quản lý).</p>
            </div>
         </div>
      )}
    </div>
  );
}

// ==================== IMPORT NÂNG CAO ====================
function ImportView({ data, setData, notify, cskvMapping }) {
  const [importMode, setImportMode] = useState('tonghop'); // 'tonghop' | 'thoihan' | 'trangthai'
  const [newRecords, setNewRecords] = useState([]);
  const [updateRecords, setUpdateRecords] = useState([]);
  const [removedRecords, setRemovedRecords] = useState([]);
  const [fileData, setFileData] = useState(false);
  const [fileName, setFileName] = useState('');

  const getCskv = (khuPhoStr) => {
    const kpStr = String(khuPhoStr || '').trim().toLowerCase();
    const key = Object.keys(cskvMapping).find(k => k.trim().toLowerCase() === kpStr);
    return key ? cskvMapping[key] : '';
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const rows = parseCSV(evt.target.result);
      if (rows.length < 2) return notify("File trống hoặc sai định dạng", "error");

      // ====== CHẾ ĐỘ 2 & 3: CẬP NHẬT THỜI HẠN / TÌNH TRẠNG (Theo file của user) ======
      if (importMode === 'thoihan' || importMode === 'trangthai') {
         const headers = rows[0].map(h => h.toLowerCase().trim());
         // Tìm vị trí các cột quan trọng
         const idxCCCD = headers.findIndex(h => h.includes('cccd') || h.includes('cmnd'));
         const idxTen = headers.findIndex(h => h.includes('họ và tên'));
         
         // Dành cho chế độ Thời Hạn (Ảnh 1)
         const idxNgayVao = headers.findIndex(h => h.includes('ngày đưa vào diện'));
         const idxThoiHan = headers.findIndex(h => h.includes('thời hạn quản lý'));
         
         // Dành cho chế độ Trạng thái & Phát sinh (Ảnh mới update)
         const idxDien = headers.findIndex(h => h.includes('diện đối tượng'));
         const idxTrangThai = headers.findIndex(h => h.includes('trạng thái') && !h.includes('phần mềm'));

         if (idxCCCD === -1) return notify("Không tìm thấy cột CCCD trong file", "error");

         const parsedNew = [];
         const updateMap = new Map(); // Gom nhóm các dòng cập nhật của cùng 1 CCCD

         for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || !row[idxCCCD]) continue;
            
            // Format CCCD 12 số
            const cccd = formatCCCD(row[idxCCCD]);
            const ten = idxTen !== -1 ? (row[idxTen] || '').trim() : '';
            
            // 1. Nếu là đối tượng mới tinh (Chế độ 3)
            const dbRecord = data.find(d => String(d.cccd).trim() === cccd);
            if (!dbRecord && importMode === 'trangthai') {
                const dien = idxDien !== -1 ? (row[idxDien] || '').trim() : '';
                const trangThai = idxTrangThai !== -1 ? (row[idxTrangThai] || 'Đang quản lý').trim() : 'Đang quản lý';
                const ngayVao = idxNgayVao !== -1 ? (row[idxNgayVao] || '').trim() : '';
                
                if (cccd && ten && dien) {
                   // Tránh tạo nhiều hồ sơ mới cho cùng 1 CCCD nếu file CSV có 2 dòng
                   const existingNew = parsedNew.find(n => n.cccd === cccd);
                   if (existingNew) {
                       existingNew.danhSachDien.push({ ten: dien, trangThai, ngayDuaVao: ngayVao });
                       existingNew.trangThaiQL = existingNew.danhSachDien.some(d => d.trangThai === 'Đang quản lý') ? 'Đang quản lý' : 'Đã kết thúc';
                   } else {
                       parsedNew.push({
                          id: generateId(), cccd, hoTen: ten,
                          danhSachDien: [{ ten: dien, trangThai, ngayDuaVao: ngayVao }],
                          trangThaiQL: trangThai === 'Đang quản lý' ? 'Đang quản lý' : 'Đã kết thúc',
                          selected: true
                       });
                   }
                }
                continue;
            }

            if (!dbRecord) continue; // Bỏ qua đối với chế độ 2 nếu ko có trong DB

            // Lấy record để update: từ Map nếu đã có cập nhật từ các dòng trước đó, hoặc từ DB
            const oldRecord = updateMap.has(cccd) ? updateMap.get(cccd).oldRecord : dbRecord;
            const currentObj = updateMap.has(cccd) ? updateMap.get(cccd).newRecord : JSON.parse(JSON.stringify(dbRecord));
            const changes = updateMap.has(cccd) ? updateMap.get(cccd).changes : [];
            
            // Chuẩn hóa danh sách diện thành object (nếu đang là dạng string từ bản cũ)
            const updatedObj = { 
               ...currentObj, 
               danhSachDien: (currentObj.danhSachDien || []).map(d => typeof d === 'string' ? { ten: d, trangThai: 'Đang quản lý', ngayDuaVao: '' } : { ...d }) 
            };

            if (importMode === 'thoihan') {
               const ngayVaoMoi = idxNgayVao !== -1 ? (row[idxNgayVao] || '').replace('#N/A', '').trim() : '';
               const thoiHanMoi = idxThoiHan !== -1 ? (row[idxThoiHan] || '').replace('#N/A', '').trim() : '';
               
               if (ngayVaoMoi && updatedObj.danhSachDien?.length > 0) {
                  // Chỉ cập nhật cái đầu tiên vì thời hạn không có cột "Diện" đi kèm
                  if (updatedObj.danhSachDien[0].ngayDuaVao !== ngayVaoMoi) {
                      changes.push({ field: 'Ngày đưa vào', oldVal: updatedObj.danhSachDien[0].ngayDuaVao || '---', newVal: ngayVaoMoi });
                      updatedObj.danhSachDien[0].ngayDuaVao = ngayVaoMoi;
                  }
               }
               if (thoiHanMoi && updatedObj.thoiHanQuanLy !== thoiHanMoi) {
                  changes.push({ field: 'Thời hạn QL', oldVal: updatedObj.thoiHanQuanLy || '---', newVal: thoiHanMoi });
                  updatedObj.thoiHanQuanLy = thoiHanMoi;
               }
            } else if (importMode === 'trangthai') {
               const dien = idxDien !== -1 ? (row[idxDien] || '').trim() : '';
               const trangThai = idxTrangThai !== -1 ? (row[idxTrangThai] || 'Đang quản lý').trim() : 'Đang quản lý';
               const ngayVao = idxNgayVao !== -1 ? (row[idxNgayVao] || '').trim() : '';

               if (dien) {
                  // CƠ CHẾ ÁNH XẠ 1-1 (Giải quyết lỗi trùng 2 diện giống tên nhau)
                  // Ưu tiên 1: Tìm diện cùng Tên + Cùng Ngày đưa vào + Chưa bị khóa (_matched)
                  let matchIdx = updatedObj.danhSachDien.findIndex(d => d.ten === dien && d.ngayDuaVao === ngayVao && !d._matched);
                  
                  // Ưu tiên 2: Nếu không khớp ngày, tìm diện cùng Tên + Chưa bị khóa (_matched)
                  if (matchIdx === -1) {
                     matchIdx = updatedObj.danhSachDien.findIndex(d => d.ten === dien && !d._matched);
                  }

                  if (matchIdx !== -1) {
                     // Tìm thấy diện hợp lệ để cập nhật
                     const oldStatus = updatedObj.danhSachDien[matchIdx].trangThai;
                     if (oldStatus !== trangThai) {
                        changes.push({ field: `Cập nhật Trạng thái`, oldVal: oldStatus, newVal: trangThai, description: `${dien.substring(0,35)}...` });
                     }
                     updatedObj.danhSachDien[matchIdx].trangThai = trangThai;
                     if (ngayVao && !updatedObj.danhSachDien[matchIdx].ngayDuaVao) {
                        updatedObj.danhSachDien[matchIdx].ngayDuaVao = ngayVao;
                     }
                     // KHÓA DIỆN NÀY LẠI, để dòng CSV tiếp theo không ghi đè vào đây nữa
                     updatedObj.danhSachDien[matchIdx]._matched = true; 
                  } else {
                     // Nếu không tìm thấy hoặc tất cả đã bị khóa -> Đây là 1 diện hoàn toàn mới phát sinh thêm
                     updatedObj.danhSachDien.push({ ten: dien, trangThai, ngayDuaVao: ngayVao, _matched: true });
                     changes.push({ field: 'Phát sinh Diện mới', oldVal: '---', newVal: `${dien.substring(0, 25)}... (${trangThai})` });
                  }
                  
                  // Cập nhật trạng thái quản lý chung của phần mềm
                  updatedObj.trangThaiQL = updatedObj.danhSachDien.some(d => d.trangThai === 'Đang quản lý') ? 'Đang quản lý' : 'Đã kết thúc';
               }
            }

            // Lưu thay đổi vào Map để cộng dồn nếu 1 người có nhiều dòng CSV
            if (changes.length > 0 || updateMap.has(cccd)) {
               updateMap.set(cccd, { oldRecord, newRecord: updatedObj, changes, selected: true });
            }
         }
         
         // Dọn dẹp cờ _matched trước khi xuất ra UI để tránh dư thừa dữ liệu
         const finalUpdateRecords = Array.from(updateMap.values()).map(u => {
             u.newRecord.danhSachDien.forEach(d => delete d._matched);
             return u;
         });

         setUpdateRecords(finalUpdateRecords);
         setNewRecords(parsedNew);
         setRemovedRecords([]);
         setFileData(true);
         return;
      }

      // ====== CHẾ ĐỘ 1: TỔNG HỢP (Code cũ) ======
      const groupedByCCCD = {};
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length < 5) continue; 
        
        const rawName = String(row[1] || '').trim();
        if (!rawName || rawName.includes('#N/A') || rawName.toLowerCase() === 'họ và tên') continue;

        const rawCCCD = formatCCCD(row[2]);
        const rawDob = String(row[3] || '').replace('#N/A', '').trim();
        const rawDien = String(row[4] || '').replace('#N/A', '').trim();
        const rawNgayDuaVao = String(row[5] || '').replace('#N/A', '').trim();
        const rawDonVi = String(row[6] || '').replace('#N/A', '').trim();
        
        let rawKhuPho = String(row[13] || '').replace('#N/A', '').trim();
        if (rawKhuPho.toLowerCase() === 'chưa điền khu phố') rawKhuPho = '';
        
        const rawThuongTru = String(row[7] || '').replace('#N/A', '').trim();
        const rawChoOHienNay = String(row[10] || '').replace('#N/A', '').trim();
        const rawTrangThaiCD = String(row[14] || '').replace('#N/A', '').trim();
        const rawHocVan = String(row[15] || '').replace('#N/A', '').trim();

        const rawTrangThai = String(row[row.length - 1] || '').replace('#N/A', '').trim();
        const isDangQuanLy = rawTrangThai.includes('Đang quản lý');
        const dienStatus = isDangQuanLy ? 'Đang quản lý' : 'Đã kết thúc';

        const khuPhoMatch = rawDonVi.match(/Phường\s+([^,]+)/i);
        const phuongXa = khuPhoMatch ? khuPhoMatch[1] : '';

        if (!groupedByCCCD[rawCCCD]) {
            groupedByCCCD[rawCCCD] = {
                hoTen: rawName, cccd: rawCCCD, ngaySinh: rawDob, thuongTru: rawThuongTru, phuongXa: phuongXa,
                choOHienNay: rawChoOHienNay, khuPho: rawKhuPho, trangThaiCD: rawTrangThaiCD || 'Còn sống', trinhDoHocVan: rawHocVan,
                danhSachDien: rawDien ? [{ ten: rawDien, trangThai: dienStatus, ngayDuaVao: rawNgayDuaVao }] : [],
                donViQuanLy: rawDonVi, trangThaiQL: dienStatus, canBoPhuTrach: getCskv(rawKhuPho), gioiTinh: 'Nam', tienAnTienSu: []
            };
        } else {
            if (rawDien) groupedByCCCD[rawCCCD].danhSachDien.push({ ten: rawDien, trangThai: dienStatus, ngayDuaVao: rawNgayDuaVao });
            if (isDangQuanLy) groupedByCCCD[rawCCCD].trangThaiQL = 'Đang quản lý';
            if (rawKhuPho && !groupedByCCCD[rawCCCD].khuPho) {
                groupedByCCCD[rawCCCD].khuPho = rawKhuPho;
                groupedByCCCD[rawCCCD].canBoPhuTrach = getCskv(rawKhuPho);
            }
        }
      }

      const importedCCCDs = Object.keys(groupedByCCCD);
      const parsedNew = [];
      const parsedUpdate = [];
      
      Object.values(groupedByCCCD).forEach(importedObj => {
        const existingRecord = data.find(d => String(d.cccd).trim() === importedObj.cccd && !d.deletedAt);
        if (!existingRecord) {
            parsedNew.push({ ...importedObj, id: generateId(), selected: true });
        } else {
            const changes = [];
            const fieldsToCompare = [ { key: 'hoTen', label: 'Họ tên' }, { key: 'ngaySinh', label: 'Ngày sinh' }, { key: 'khuPho', label: 'Khu phố' } ];
            fieldsToCompare.forEach(f => {
                if (importedObj[f.key] && existingRecord[f.key] !== importedObj[f.key]) {
                    changes.push({ field: f.label, key: f.key, oldVal: existingRecord[f.key] || '', newVal: importedObj[f.key] });
                }
            });

            if (importedObj.khuPho && existingRecord.khuPho !== importedObj.khuPho) {
                importedObj.canBoPhuTrach = getCskv(importedObj.khuPho);
            }

            const serializeDiens = (diens) => diens.map(d => `${typeof d === 'string' ? d : d.ten}|${typeof d === 'string' ? 'Đang quản lý' : d.trangThai}`).sort().join('||');
            const oldSerialized = serializeDiens(existingRecord.danhSachDien || []);
            const newSerialized = serializeDiens(importedObj.danhSachDien || []);

            if (oldSerialized !== newSerialized) {
                changes.push({
                    field: 'Diện & Trạng thái', key: 'danhSachDien',
                    oldVal: `Danh sách cũ (${(existingRecord.danhSachDien || []).length} diện)`,
                    newVal: `Cập nhật theo file (${importedObj.danhSachDien.length} diện)`,
                    description: 'Thay đổi diện/trạng thái'
                });
            }

            if (changes.length > 0) parsedUpdate.push({ oldRecord: existingRecord, newRecord: importedObj, changes, selected: true });
        }
      });

      const removed = data.filter(d => d.trangThaiQL === 'Đang quản lý' && !d.deletedAt && !importedCCCDs.includes(d.cccd))
                          .map(d => ({ ...d, selected: false, action: 'end' }));

      setNewRecords(parsedNew);
      setUpdateRecords(parsedUpdate);
      setRemovedRecords(removed);
      setFileData(true);
      document.getElementById('csv-upload').value = "";
    };
    reader.readAsText(file, 'UTF-8');
  };

  const applyData = () => {
    let updatedData = [...data];
    let newAddedCount = 0, updatedCount = 0, removedCount = 0;

    const toAdd = newRecords.filter(r => r.selected);
    if (toAdd.length > 0) {
        updatedData = [...updatedData, ...toAdd];
        newAddedCount = toAdd.length;
    }

    const toUpdate = updateRecords.filter(r => r.selected);
    if (toUpdate.length > 0) {
        toUpdate.forEach(u => {
            const index = updatedData.findIndex(d => d.id === u.oldRecord.id);
            if (index !== -1) {
                if (importMode === 'thoihan' || importMode === 'trangthai') {
                   // Chế độ update đè thẳng
                   updatedData[index] = u.newRecord;
                } else {
                   // Chế độ tổng hợp
                   const updatedRecord = { ...updatedData[index] };
                   u.changes.forEach(c => {
                       if (c.key === 'danhSachDien') {
                           const existing = updatedRecord.danhSachDien || [];
                           const imported = u.newRecord.danhSachDien || [];
                           const merged = [...imported];
                           existing.forEach(ex => {
                               const tenEx = typeof ex === 'string' ? ex : ex.ten;
                               if (!imported.some(imp => imp.ten === tenEx)) merged.push(ex);
                           });
                           updatedRecord.danhSachDien = merged;
                           updatedRecord.trangThaiQL = merged.some(d => d.trangThai === 'Đang quản lý') ? 'Đang quản lý' : 'Đã kết thúc';
                       } else {
                           updatedRecord[c.key] = c.newVal;
                       }
                   });
                   if (updatedRecord.khuPho) updatedRecord.canBoPhuTrach = getCskv(updatedRecord.khuPho) || updatedRecord.canBoPhuTrach;
                   updatedData[index] = updatedRecord;
                }
                updatedCount++;
            }
        });
    }

    const toRemove = removedRecords.filter(r => r.selected);
    if (toRemove.length > 0) {
        toRemove.forEach(r => {
            const index = updatedData.findIndex(d => d.id === r.id);
            if (index !== -1) {
                if (r.action === 'end') {
                    const finishedDiens = updatedData[index].danhSachDien.map(d => {
                         if (typeof d === 'string') return { ten: d, trangThai: 'Đã kết thúc' };
                         return { ...d, trangThai: 'Đã kết thúc' };
                    });
                    updatedData[index] = { ...updatedData[index], danhSachDien: finishedDiens, trangThaiQL: 'Đã kết thúc' };
                } else if (r.action === 'delete') {
                    updatedData[index] = { ...updatedData[index], deletedAt: new Date().toISOString() };
                }
                removedCount++;
            }
        });
    }

    if (newAddedCount === 0 && updatedCount === 0 && removedCount === 0) return notify("Bạn chưa chọn dữ liệu nào để áp dụng!", "error");

    setData(updatedData);
    notify(`Tạo mới: ${newAddedCount}, Cập nhật: ${updatedCount}, Xử lý cũ: ${removedCount}`);
    setFileData(false);
    setNewRecords([]); setUpdateRecords([]); setRemovedRecords([]); setFileName('');
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border dark:border-slate-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-3"><Database size={28} className="text-blue-600"/> Đồng Bộ & Cập Nhật Dữ Liệu</h2>
      </div>
      {!fileData ? (
        <div className="space-y-6">
           <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-center">
                 <Upload size={48} className="mx-auto text-slate-400 mb-4" />
                 <h3 className="font-bold text-lg mb-2">Tải lên file Excel (CSV)</h3>
                 <p className="text-sm text-slate-500 mb-4">Hỗ trợ cập nhật: Danh sách đối tượng tổng hợp, Cập nhật thời hạn quản lý, Cập nhật trạng thái diện.</p>
                 <input type="file" id="csv-upload" accept=".csv" onChange={handleFileUpload} className="hidden" />
                 <label htmlFor="csv-upload" className="cursor-pointer px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">Chọn File</label>
              </div>
              <div className="flex-1 space-y-4">
                 <label className="font-bold">Chế độ Import:</label>
                 <select className="w-full p-3 border rounded-xl dark:bg-slate-700 dark:border-slate-600" value={importMode} onChange={e => setImportMode(e.target.value)}>
                    <option value="tonghop">Chế độ 1: Tổng hợp (Thêm mới, Cập nhật thông tin chung)</option>
                    <option value="thoihan">Chế độ 2: Cập nhật Thời Hạn Quản Lý (Tìm theo CCCD)</option>
                    <option value="trangthai">Chế độ 3: Cập nhật Diện / Trạng thái quản lý (Có gom nhóm)</option>
                 </select>
              </div>
           </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
           <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
              <div>
                 <p className="font-bold text-blue-800 dark:text-blue-200">File: {fileName}</p>
                 <p className="text-sm text-blue-600 dark:text-blue-300">Tìm thấy: {newRecords.length} mới, {updateRecords.length} cập nhật, {removedRecords.length} xử lý cũ.</p>
              </div>
              <div className="flex gap-3">
                 <button onClick={() => { setFileData(false); setNewRecords([]); setUpdateRecords([]); setRemovedRecords([]); setFileName(''); document.getElementById('csv-upload').value = ""; }} className="px-4 py-2 border border-blue-200 text-blue-700 rounded-lg font-bold hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/50">Hủy</button>
                 <button onClick={applyData} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2"><Save size={18}/> Áp dụng Dữ liệu</button>
              </div>
           </div>
           {/* Bảng New Records */}
           {newRecords.length > 0 && (
             <div className="border dark:border-slate-700 rounded-xl overflow-hidden">
                <div className="bg-emerald-50 dark:bg-emerald-900/30 p-3 font-bold border-b dark:border-slate-700 text-emerald-700 dark:text-emerald-400">Thêm mới ({newRecords.length})</div>
                <div className="max-h-60 overflow-y-auto bg-white dark:bg-slate-800">
                   <table className="w-full text-sm text-left">
                      <thead className="bg-slate-100 dark:bg-slate-700 sticky top-0"><tr><th className="p-2 text-center">Chọn</th><th className="p-2">Họ tên</th><th className="p-2">CCCD</th><th className="p-2">Diện</th></tr></thead>
                      <tbody className="divide-y dark:divide-slate-700">
                         {newRecords.map((r, i) => (
                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                               <td className="p-2 text-center"><input type="checkbox" checked={r.selected} onChange={e => { const arr = [...newRecords]; arr[i].selected = e.target.checked; setNewRecords(arr); }} /></td>
                               <td className="p-2 font-bold">{safeRender(r.hoTen)}</td><td className="p-2 font-mono">{safeRender(r.cccd)}</td>
                               <td className="p-2">{r.danhSachDien?.map(d => typeof d === 'string' ? d : d.ten).join(', ')}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
           )}
           {/* Bảng Update Records */}
           {updateRecords.length > 0 && (
             <div className="border dark:border-slate-700 rounded-xl overflow-hidden">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-3 font-bold border-b dark:border-slate-700 text-blue-700 dark:text-blue-400">Cập nhật ({updateRecords.length})</div>
                <div className="max-h-60 overflow-y-auto bg-white dark:bg-slate-800">
                   <table className="w-full text-sm text-left">
                      <thead className="bg-slate-100 dark:bg-slate-700 sticky top-0"><tr><th className="p-2 text-center">Chọn</th><th className="p-2 w-1/3">Họ tên / CCCD</th><th className="p-2">Nội dung cập nhật</th></tr></thead>
                      <tbody className="divide-y dark:divide-slate-700">
                         {updateRecords.map((r, i) => (
                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                               <td className="p-2 text-center align-top"><input type="checkbox" checked={r.selected} onChange={e => { const arr = [...updateRecords]; arr[i].selected = e.target.checked; setUpdateRecords(arr); }} /></td>
                               <td className="p-2 align-top">
                                  <div className="font-bold">{safeRender(r.newRecord.hoTen)}</div>
                                  <div className="font-mono text-xs text-slate-500">{safeRender(r.newRecord.cccd)}</div>
                               </td>
                               <td className="p-2 align-top">
                                  {r.changes.map((c, idx) => (
                                     <div key={idx} className="text-xs mb-1">
                                        <span className="font-bold text-slate-600 dark:text-slate-300">{c.field}:</span> {safeRender(c.oldVal)} <span className="text-blue-500 mx-1">➜</span> <span className="text-emerald-600 font-bold">{safeRender(c.newVal)}</span>
                                        {c.description && <div className="text-slate-400 italic text-[10px]">{safeRender(c.description)}</div>}
                                     </div>
                                  ))}
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
           )}
        </div>
      )}
    </div>
  );
}

// ==================== CÔNG CỤ ĐỐI CHIẾU HÀNG LOẠT ====================
function CompareView({ data, setData, notify }) {
  const [activeSubTab, setActiveSubTab] = useState('compare'); // 'compare' | 'update'
  
  // State cho Tab 1: Đối chiếu
  const [inputText, setInputText] = useState('');
  const [targetDienType, setTargetDienType] = useState('PL1');
  const [customKeyword, setCustomKeyword] = useState('');
  const [result, setResult] = useState(null);
  const [dbMatchCount, setDbMatchCount] = useState(0);
  const [missingFromPasted, setMissingFromPasted] = useState([]); // Danh sách lệch

  // State cho Tab 2: Cập nhật
  const [updateCCCDs, setUpdateCCCDs] = useState('');
  const [updateField, setUpdateField] = useState('choOHienNay');
  const [updateType, setUpdateType] = useState('text'); // 'text', 'mark', 'dien'
  
  // States lưu giá trị cập nhật
  const [updateTextValue, setUpdateTextValue] = useState(''); // Cho text
  const [updateDienName, setUpdateDienName] = useState(DIEN_DOI_TUONG_LIST[0]); // Cho diện
  const [updateDienStatus, setUpdateDienStatus] = useState('Đang quản lý');
  const [updateDienDate, setUpdateDienDate] = useState('');

  const [updateLog, setUpdateLog] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('compareProgress');
    if (saved) {
      try {
        const { input, type, keyword } = JSON.parse(saved);
        setInputText(input || '');
        setTargetDienType(type || 'PL1');
        setCustomKeyword(keyword || '');
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('compareProgress', JSON.stringify({
      input: inputText, type: targetDienType, keyword: customKeyword
    }));
  }, [inputText, targetDienType, customKeyword]);

  const isDienMatch = (dien, type, keyword) => {
    if (!dien) return false;
    const d = dien.toLowerCase();
    switch (type) {
      case 'PL1': return d.includes('sử dụng') || d.includes('trái phép');
      case 'PL2': return d.includes('methadol') || d.includes('methadone') || d.includes('điều trị bằng thuốc thay thế');
      case 'PL3': return d.includes('sau cai');
      case 'custom': return d.includes(keyword.toLowerCase());
      default: return false;
    }
  };

  const getMatchDienDisplay = (record, type, keyword) => {
    if (!record || !record.danhSachDien) return { dienList: '', status: '' };
    const matched = record.danhSachDien.filter(d => {
       const ten = typeof d === 'string' ? d : d.ten;
       return isDienMatch(ten, type, keyword);
    });
    if (matched.length === 0) return { dienList: '', status: '' };
    const mappedMatched = matched.map(d => typeof d === 'string' ? d : d.ten);
    
    // Lấy trạng thái của diện đầu tiên khớp để xét
    const matchedDienObj = matched[0];
    const status = typeof matchedDienObj === 'string' ? record.trangThaiQL : matchedDienObj.trangThai;
    
    return { dienList: mappedMatched.join('; '), status };
  };

  const handleRunCompare = () => {
    if (!inputText.trim()) return notify("Vui lòng dán danh sách CCCD!", "error");
    const cccdArrayRaw = inputText.split('\n').map(s => formatCCCD(s)).filter(s => s.length === 12);
    // Loại bỏ CCCD trùng lặp trong chuỗi dán vào
    const cccdArray = [...new Set(cccdArrayRaw)];
    
    // Lấy danh sách thực tế trên DB ĐANG QUẢN LÝ diện này
    const activeInDbRecords = data.filter(d => 
       d.danhSachDien?.some(dienObj => {
           const ten = typeof dienObj === 'string' ? dienObj : dienObj.ten;
           const tt = typeof dienObj === 'string' ? d.trangThaiQL : dienObj.trangThai;
           return tt === 'Đang quản lý' && isDienMatch(ten, targetDienType, customKeyword);
       })
    );
    
    setDbMatchCount(activeInDbRecords.length);

    // Tìm những đối tượng có trên DB (diện này) nhưng không có trong danh sách dán vào
    const missing = activeInDbRecords.filter(dbRecord => !cccdArray.includes(String(dbRecord.cccd).trim()));
    setMissingFromPasted(missing);

    const compareResults = cccdArray.map(cccdInput => {
      let found = data.find(d => String(d.cccd).trim() === cccdInput);
      if (!found) {
        const candidates = data.filter(d => d.trangThaiQL === 'Đang quản lý');
        for (let cand of candidates) {
          if (levenshteinDistance(cand.cccd, cccdInput) <= 2) { found = cand; break; }
        }
      }
      if (!found) return { cccd: cccdInput, hoTen: '---', status: 'Chưa nhập dữ liệu', matchedDien: '', dienStatus: '' };
      
      const { dienList, status: dienStatus } = getMatchDienDisplay(found, targetDienType, customKeyword);
      const isMatch = dienList !== '';
      
      let finalStatus = 'Sai diện';
      if (isMatch) {
         finalStatus = dienStatus === 'Đang quản lý' ? 'Đúng diện' : 'Lỗi kết thúc';
      }
      
      return { 
         cccd: cccdInput, hoTen: found.hoTen, 
         status: finalStatus, matchedDien: dienList, dienStatus, 
         cccdDung: found.cccd !== cccdInput ? found.cccd : '' 
      };
    });

    setResult(compareResults);
    notify("Đã hoàn tất rà soát!");
  };

  const handleFieldChange = (e) => {
    const val = e.target.value;
    setUpdateField(val);
    if (val === 'ADD_DIEN') {
       setUpdateType('dien');
    } else if (SPECIAL_MARKS.includes(val)) {
       setUpdateType('mark');
    } else {
       setUpdateType('text');
    }
  };

  const handleRunUpdate = () => {
    if (!updateCCCDs.trim()) return notify("Vui lòng dán danh sách CCCD!", "error");
    
    if (updateType === 'text' && !updateTextValue.trim()) return notify("Vui lòng nhập nội dung cập nhật!", "error");
    if (updateType === 'dien' && !updateDienName.trim()) return notify("Vui lòng nhập tên diện!", "error");

    const cccdArrayRaw = updateCCCDs.split('\n').map(s => formatCCCD(s)).filter(s => s.length === 12);
    const cccdArray = [...new Set(cccdArrayRaw)]; // Xóa trùng
    let updatedCount = 0;
    let logs = [];
    let newData = [...data];

    cccdArray.forEach(cccd => {
        const index = newData.findIndex(d => String(d.cccd).trim() === cccd);
        if (index !== -1) {
            let record = { ...newData[index] };
            
            if (updateType === 'mark') {
                let marks = record.dacDiemRieng || [];
                if (!marks.includes(updateField)) {
                    record.dacDiemRieng = [...marks, updateField];
                    updatedCount++;
                    logs.push({ cccd, hoTen: record.hoTen, msg: `Đã check: ${updateField}` });
                } else {
                    logs.push({ cccd, hoTen: record.hoTen, msg: 'Đã có sẵn (Bỏ qua)' });
                }
            } 
            else if (updateType === 'dien') {
                let diens = record.danhSachDien || [];
                // Kiểm tra xem đã có diện này chưa
                const existIdx = diens.findIndex(d => (typeof d === 'string' ? d : d.ten) === updateDienName);
                if (existIdx >= 0) {
                    diens[existIdx] = { ten: updateDienName, trangThai: updateDienStatus, ngayDuaVao: updateDienDate };
                    logs.push({ cccd, hoTen: record.hoTen, msg: `Cập nhật trạng thái diện` });
                } else {
                    diens.push({ ten: updateDienName, trangThai: updateDienStatus, ngayDuaVao: updateDienDate });
                    logs.push({ cccd, hoTen: record.hoTen, msg: `Đã thêm diện mới` });
                }
                record.danhSachDien = diens;
                if (updateDienStatus === 'Đang quản lý') record.trangThaiQL = 'Đang quản lý';
                updatedCount++;
            }
            else {
                // Update Text
                record[updateField] = updateTextValue;
                updatedCount++;
                logs.push({ cccd, hoTen: record.hoTen, msg: 'Cập nhật chữ thành công' });
            }
            
            newData[index] = record;
        } else {
            logs.push({ cccd, hoTen: '---', status: 'Không tìm thấy', msg: 'CCCD không tồn tại trên PM' });
        }
    });

    setData(newData);
    setUpdateLog(logs);
    notify(`Đã xử lý xong: Cập nhật ${updatedCount} hồ sơ!`);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border dark:border-slate-700 p-8 max-w-6xl mx-auto flex flex-col h-[85vh]">
      <div className="flex items-center justify-between mb-6 shrink-0">
         <h2 className="text-2xl font-bold flex items-center gap-3"><CheckSquare size={28} className="text-emerald-600"/> Xử lý dữ liệu Hàng loạt</h2>
         <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
            <button onClick={() => setActiveSubTab('compare')} className={`px-6 py-2 rounded-lg font-bold text-sm transition-colors ${activeSubTab === 'compare' ? 'bg-white dark:bg-slate-800 shadow text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}>1. Đối chiếu Diện</button>
            <button onClick={() => setActiveSubTab('update')} className={`px-6 py-2 rounded-lg font-bold text-sm transition-colors ${activeSubTab === 'update' ? 'bg-white dark:bg-slate-800 shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>2. Cập nhật Hàng loạt</button>
         </div>
      </div>

      {activeSubTab === 'compare' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 overflow-hidden min-h-0">
          <div className="md:col-span-1 flex flex-col h-full space-y-4 min-h-0">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl text-sm border border-emerald-100 dark:border-emerald-800 shrink-0">
              <strong>HƯỚNG DẪN:</strong> Dán danh sách CCCD, chọn diện cần rà soát. Phần mềm sẽ báo đúng sai và báo cáo độ lệch (nếu thiếu).
            </div>
            <div className="flex flex-col shrink-0">
              <label className="font-bold mb-2">Chọn diện để kiểm tra:</label>
              <select value={targetDienType} onChange={e => setTargetDienType(e.target.value)} className="p-3 border rounded dark:bg-slate-700 dark:border-slate-600 outline-none focus:border-emerald-500 font-semibold text-emerald-700 dark:text-emerald-400">
                <option value="PL1">PL1 - Sử dụng trái phép</option>
                <option value="PL2">PL2 - Methadone</option>
                <option value="PL3">PL3 - Sau cai</option>
                <option value="custom">Khác (nhập từ khóa)</option>
              </select>
            </div>
            {targetDienType === 'custom' && (
              <div className="flex flex-col animate-fade-in shrink-0">
                <label className="font-bold mb-2">Từ khóa diện:</label>
                <input type="text" value={customKeyword} onChange={e => setCustomKeyword(e.target.value)} placeholder="VD: Cai nghiện tự nguyện" className="p-3 border rounded dark:bg-slate-700 dark:border-slate-600" />
              </div>
            )}
            <div className="flex flex-col flex-1 min-h-0">
              <label className="font-bold mb-2 shrink-0">Dán danh sách CCCD (File của bạn):</label>
              <textarea value={inputText} onChange={e => setInputText(e.target.value)} placeholder="079...&#10;049..." className="p-3 border rounded flex-1 resize-none overflow-y-auto font-mono text-sm dark:bg-slate-700 dark:border-slate-600 outline-none focus:border-emerald-500 custom-scrollbar w-full min-h-[100px]"></textarea>
            </div>
            <button onClick={handleRunCompare} className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 text-lg shrink-0">Chạy Rà Soát</button>
          </div>
          <div className="md:col-span-2 flex flex-col h-full border-l border-slate-200 dark:border-slate-700 pl-8 min-h-0">
            <div className="flex justify-between items-end mb-4 shrink-0">
              <div>
                 <h3 className="font-bold text-lg mb-2">Kết Quả Rà Soát</h3>
                 {result && (
                    <div className="text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 p-2 rounded-lg border border-blue-100 dark:border-blue-800 inline-block">
                       SL CCCD hợp lệ dán vào: <strong className="text-lg">{[...new Set(inputText.split('\n').map(s => formatCCCD(s)).filter(s => s.length === 12))].length}</strong> | 
                       Hệ thống đang QL: <strong className="text-lg">{dbMatchCount}</strong> 
                       {missingFromPasted.length > 0 ? (
                          <span className="ml-2 text-red-600 font-bold bg-red-100 dark:bg-red-900/50 px-2 py-0.5 rounded">Lệch (Thiếu {missingFromPasted.length} hồ sơ)!</span>
                       ) : (
                          <span className="ml-2 text-emerald-600 font-bold bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded">Đã đủ số lượng <Check size={16} className="inline"/></span>
                       )}
                    </div>
                 )}
              </div>
              {result && <button onClick={() => exportTableToExcel('compare-table', 'Ket_Qua_Ra_Soat')} className="text-sm px-4 py-2 bg-slate-800 text-white rounded flex items-center gap-2 hover:bg-slate-900"><FileDown size={16}/> Xuất Excel</button>}
            </div>
            
            {/* Vùng hiển thị lỗi thiếu danh sách */}
            {result && missingFromPasted.length > 0 && (
               <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl shrink-0 flex flex-col max-h-[30%]">
                  <p className="font-bold text-red-600 text-sm mb-2 shrink-0"><AlertTriangle size={16} className="inline mr-1"/> Danh sách Đối tượng có trên PM nhưng BỊ THIẾU trong file dán vào:</p>
                  <div className="overflow-y-auto custom-scrollbar text-xs flex-1 min-h-0">
                     <ul className="list-disc pl-5 text-red-800 dark:text-red-300">
                        {missingFromPasted.map(m => (
                           <li key={m.id}><strong>{safeRender(m.cccd)}</strong> - {safeRender(m.hoTen)} <span className="opacity-70">({safeRender(m.khuPho)})</span></li>
                        ))}
                     </ul>
                  </div>
               </div>
            )}

            <div className="flex-1 overflow-y-auto border dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 min-h-0">
              {!result ? <div className="h-full flex items-center justify-center text-slate-400">Chưa có kết quả</div> : (
                <table id="compare-table" className="w-full text-sm text-left bg-white dark:bg-slate-800">
                  <thead className="bg-slate-100 dark:bg-slate-700 sticky top-0 shadow-sm">
                    <tr><th className="p-3">CCCD Nhập</th><th className="p-3">Họ Tên</th><th className="p-3">Kết luận</th><th className="p-3">Trạng thái trên PM</th></tr>
                  </thead>
                  <tbody className="divide-y dark:divide-slate-700">
                    {result.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="p-3 font-mono">
                           {safeRender(r.cccd)}
                           {r.cccdDung && <><br/><span className="text-orange-600 text-xs">Thực tế DB: {safeRender(r.cccdDung)}</span></>}
                        </td>
                        <td className="p-3 font-bold">
                           {safeRender(r.hoTen)}
                           {r.cccdDung && <span className="block text-orange-600 text-[10px] font-normal italic mt-1">⚠️ Có thể sai số CCCD trong danh sách</span>}
                        </td>
                        <td className="p-3 font-bold">
                          {r.status === 'Đúng diện' ? <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded border border-emerald-200">Đúng diện</span> : 
                           r.status === 'Lỗi kết thúc' ? <span className="text-red-600 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded border border-red-200 uppercase text-xs">Lỗi kết thúc quản lý</span> :
                           r.status === 'Sai diện' ? <span className="text-orange-600 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded border border-orange-200">Sai diện</span> : 
                           <span className="text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded border dark:border-slate-600">Không có dữ liệu</span>}
                        </td>
                        <td className="p-3 text-xs">
                           {r.matchedDien ? (
                              <span>
                                 {r.matchedDien.includes('(Trùng') ? 
                                    <span className="text-red-600 font-bold">{safeRender(r.matchedDien)}</span> : 
                                    safeRender(r.matchedDien)
                                 }
                              </span>
                           ) : '—'}
                           {r.dienStatus === 'Đã kết thúc' && <span className="block text-red-500 font-bold mt-1">(Đã kết thúc)</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'update' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 flex-1 overflow-hidden min-h-0">
           {/* Cột 1 */}
           <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border dark:border-slate-700 min-h-0">
              <label className="font-bold mb-2 text-slate-700 dark:text-slate-300 shrink-0">1. Dán CCCD Đối tượng:</label>
              <textarea value={updateCCCDs} onChange={e => setUpdateCCCDs(e.target.value)} placeholder="079...&#10;049..." className="p-3 border rounded flex-1 resize-none overflow-y-auto font-mono text-sm dark:bg-slate-800 dark:border-slate-600 outline-none focus:border-blue-500 custom-scrollbar min-h-[100px]"></textarea>
           </div>
           
           {/* Cột 2 */}
           <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border dark:border-slate-700 shrink-0">
              <label className="font-bold mb-2 text-slate-700 dark:text-slate-300">2. Chọn Mục cập nhật:</label>
              <select value={updateField} onChange={handleFieldChange} className="p-3 border rounded dark:bg-slate-800 dark:border-slate-600 outline-none focus:border-blue-500 font-semibold text-blue-700 dark:text-blue-400">
                 <optgroup label="Cập nhật Nội dung (Text)">
                    <option value="choOHienNay">Nơi ở hiện nay</option>
                    <option value="khuPho">Khu phố</option>
                    <option value="phuongXa">Phường/Xã</option>
                    <option value="ghiChu">Ghi chú chung</option>
                    <option value="trinhDoHocVan">Trình độ học vấn</option>
                 </optgroup>
                 <optgroup label="Đánh dấu Nghiệp vụ (Tự check)">
                    {SPECIAL_MARKS.map(m => <option key={m} value={m}>Tự động Check: {m}</option>)}
                 </optgroup>
                 <optgroup label="Quản lý Diện">
                    <option value="ADD_DIEN">Bổ sung / Cập nhật Diện quản lý</option>
                 </optgroup>
              </select>
              <div className="mt-4 text-xs text-slate-500 overflow-y-auto flex-1 min-h-0">
                 * Nếu chọn "Cập nhật Nội dung", dữ liệu cũ của trường đó sẽ bị ghi đè.<br/><br/>
                 * Nếu chọn "Đánh dấu", hệ thống sẽ tích chọn vào hồ sơ (không làm mất dữ liệu cũ).<br/><br/>
                 * Nếu chọn "Bổ sung Diện", phần mềm sẽ tự tạo mới diện hoặc cập nhật ngày/trạng thái nếu diện đã tồn tại.
              </div>
           </div>

           {/* Cột 3 & Cột Chạy */}
           <div className="md:col-span-2 flex flex-col h-full space-y-4 min-h-0">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border dark:border-slate-700 min-h-[160px] flex flex-col shrink-0">
                 <label className="font-bold mb-2 text-slate-700 dark:text-slate-300 shrink-0">3. Nhập Dữ liệu hàng loạt:</label>
                 
                 {updateType === 'mark' && (
                    <div className="flex-1 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 rounded border border-dashed border-blue-300 dark:border-blue-800">
                       <p className="text-blue-600 font-semibold text-center px-4">Tự động Check (Đánh dấu) vào mục <br/>"{updateField}" cho tất cả CCCD</p>
                    </div>
                 )}

                 {updateType === 'text' && (
                    <textarea value={updateTextValue} onChange={e => setUpdateTextValue(e.target.value)} placeholder="Ví dụ: Số 9 đường ABC..." className="p-3 border rounded flex-1 resize-none overflow-y-auto dark:bg-slate-800 dark:border-slate-600 outline-none focus:border-blue-500 custom-scrollbar"></textarea>
                 )}

                 {updateType === 'dien' && (
                    <div className="flex flex-col gap-3 animate-fade-in flex-1 justify-center bg-white dark:bg-slate-800 p-4 rounded border dark:border-slate-600 shadow-sm">
                       <div className="flex flex-col">
                          <label className="text-xs font-bold mb-1 text-blue-600">Tên diện cần thêm (Hoặc cập nhật):</label>
                          <input list="dien-list-suggestions" value={updateDienName} onChange={e => setUpdateDienName(e.target.value)} placeholder="Nhập tên diện..." className="p-2 border rounded text-sm dark:bg-slate-700 dark:border-slate-600" />
                          <datalist id="dien-list-suggestions">
                             {DIEN_DOI_TUONG_LIST.map(d => <option key={d} value={d} />)}
                          </datalist>
                       </div>
                       <div className="flex gap-4">
                          <div className="flex-1 flex flex-col">
                             <label className="text-xs font-bold mb-1">Trạng thái:</label>
                             <select value={updateDienStatus} onChange={e => setUpdateDienStatus(e.target.value)} className="p-2 border rounded text-sm dark:bg-slate-700 dark:border-slate-600">
                                <option>Đang quản lý</option><option>Đã kết thúc</option>
                             </select>
                          </div>
                          <div className="flex-1 flex flex-col">
                             <label className="text-xs font-bold mb-1">Ngày đưa vào (Tùy chọn):</label>
                             <input type="text" placeholder="dd/mm/yyyy" value={updateDienDate} onChange={e => setUpdateDienDate(e.target.value)} className="p-2 border rounded text-sm dark:bg-slate-700 dark:border-slate-600" />
                          </div>
                       </div>
                    </div>
                 )}

              </div>
              <button onClick={handleRunUpdate} className="py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/30 text-lg flex justify-center items-center gap-2 shrink-0"><Upload size={20}/> Chạy Cập Nhật Danh Sách</button>
              
              {/* Bảng kết quả chạy update */}
              <div className="flex-1 border dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 flex flex-col min-h-0">
                 <div className="bg-slate-100 dark:bg-slate-700 p-2 font-bold text-sm text-center border-b dark:border-slate-600 shrink-0">Lịch sử Xử lý {updateLog && `(${updateLog.length} lượt)`}</div>
                 <div className="flex-1 overflow-y-auto custom-scrollbar p-2 min-h-0">
                    {!updateLog ? <div className="h-full flex items-center justify-center text-slate-400 text-sm">Chưa chạy cập nhật</div> : 
                       <ul className="space-y-1">
                          {updateLog.map((log, i) => (
                             <li key={i} className={`text-xs p-2 rounded flex justify-between ${log.status === 'Không tìm thấy' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20'}`}>
                                <span className="font-mono">{log.cccd} - <span className="font-bold">{log.hoTen}</span></span>
                                <span>{log.msg || log.status}</span>
                             </li>
                          ))}
                       </ul>
                    }
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

// ==================== IMPORT ẢNH HÀNG LOẠT ====================
function BulkImageImportView({ data, setData, notify }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [importing, setImporting] = useState(false);

  const handleFolderSelect = (e) => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
    setSelectedFiles(files);
  };

  const importImages = async () => {
    if (selectedFiles.length === 0) return;
    setImporting(true);
    let updatedCount = 0;
    let newData = [...data];

    for (const file of selectedFiles) {
      const cccdMatch = file.name.match(/\d{12}/);
      if (cccdMatch) {
        const cccd = cccdMatch[0];
        const index = newData.findIndex(d => String(d.cccd).trim() === cccd);
        if (index !== -1) {
          const base64 = await new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.readAsDataURL(file);
          });
          newData[index] = { ...newData[index], avatar: base64 };
          updatedCount++;
        }
      }
    }
    setData(newData);
    setImporting(false);
    setSelectedFiles([]);
    notify(`Đã import thành công ${updatedCount} ảnh đại diện!`);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-8 max-w-4xl mx-auto border dark:border-slate-700">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><ImageIcon size={28} className="text-purple-600" /> Import Ảnh Hàng Loạt</h2>
      <div className="space-y-4">
        <div className="bg-purple-50 dark:bg-purple-900/20 p-5 rounded-xl border border-purple-100 dark:border-purple-800">
          <p className="font-semibold text-sm">Hướng dẫn: Đặt tên file ảnh là <strong>số CCCD</strong> (ví dụ: 079079011091.jpg). Chọn thư mục chứa ảnh, hệ thống sẽ tự động gán ảnh vào hồ sơ tương ứng.</p>
        </div>
        <label className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
          <ImageIcon size={48} className="text-slate-400 mb-4" />
          <span className="text-lg font-bold">Chọn nhiều ảnh (Ctrl+A hoặc Shift)</span>
          <input type="file" id="folder-input" multiple accept="image/*" onChange={handleFolderSelect} className="hidden" />
        </label>
        {selectedFiles.length > 0 && (
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-700 p-4 rounded-xl">
            <p className="font-bold">Đã chọn {safeRender(selectedFiles.length)} ảnh hợp lệ.</p>
            <button onClick={importImages} disabled={importing} className="px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700">
              {importing ? 'Đang xử lý...' : 'Bắt đầu Import'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== CÀI ĐẶT CSKV ====================
function SettingsView({ cskvMapping, setCskvMapping, data, setData, notify }) {
  const [text, setText] = useState(() => Object.entries(cskvMapping).map(([k,v]) => `${k} - ${v}`).join('\n'));

  const handleSave = () => {
    const lines = text.split('\n');
    const newMap = {};
    lines.forEach(l => {
      if(!l.trim()) return;
      const parts = l.split(/[-:]/);
      if (parts.length >= 2) {
        const kp = parts[0].trim();
        const name = parts.slice(1).join('-').trim();
        if (kp && name) newMap[kp] = name;
      }
    });
    setCskvMapping(newMap);

    if (data && setData) {
      const updatedData = data.map(d => {
        const kpStr = String(d.khuPho || '').trim().toLowerCase();
        const matchedKey = Object.keys(newMap).find(k => k.trim().toLowerCase() === kpStr);
        if (matchedKey && d.canBoPhuTrach !== newMap[matchedKey]) {
          return { ...d, canBoPhuTrach: newMap[matchedKey] };
        }
        return d;
      });
      setData(updatedData);
    }

    notify("Lưu cài đặt và tự động đồng bộ CSKV cho toàn bộ hồ sơ thành công!");
  };

  return (
    <div className="max-w-5xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-2xl shadow border dark:border-slate-700">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><Settings className="text-blue-600"/> Cài Đặt CSKV Theo Khu Phố</h2>
      <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-xl mb-6 text-sm border border-blue-100 dark:border-blue-800">
        <h4 className="font-bold mb-2 flex items-center gap-2"><Info size={18}/> HƯỚNG DẪN:</h4>
        <p>Nhập danh sách phân công CSKV theo định dạng: <strong>[Tên Khu Phố] - [Tên CSKV]</strong>. Mỗi người 1 dòng.</p>
        <p className="mt-1 text-blue-700 dark:text-blue-400 font-semibold italic">* Khi bạn nhấn "Lưu Cài Đặt", hệ thống sẽ tự động quét và cập nhật lại CSKV cho toàn bộ các hồ sơ đã nhập từ trước.</p>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <label className="font-bold mb-2 block">Dán danh sách vào đây:</label>
          <textarea className="w-full h-96 p-4 border rounded-xl font-mono dark:bg-slate-700 dark:border-slate-600" value={text} onChange={e => setText(e.target.value)} placeholder="Khu phố 1 - Đồng chí A&#10;Khu phố 2 - Đồng chí B" />
        </div>
        <div className="flex-1">
          <label className="font-bold mb-2 block">Bảng dữ liệu đã lưu:</label>
          <div className="border dark:border-slate-600 rounded-xl h-96 overflow-auto bg-slate-50 dark:bg-slate-900">
            <table className="w-full text-sm text-left bg-white dark:bg-slate-800">
              <thead className="bg-slate-100 dark:bg-slate-700 sticky top-0"><tr><th className="p-3">Khu phố</th><th className="p-3">CSKV</th></tr></thead>
              <tbody className="divide-y dark:divide-slate-700">{Object.entries(cskvMapping).map(([k,v]) => <tr key={k} className="hover:bg-slate-50 dark:hover:bg-slate-700/50"><td className="p-3">{safeRender(k)}</td><td className="p-3">{safeRender(v)}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/30"><Save size={20} className="inline mr-2" /> Lưu Cài Đặt</button>
      </div>
    </div>
  );
}

// ==================== ĐĂNG NHẬP CSKV ====================
function LoginView({ onLogin, cskvMapping }) {
  const [selectedKp, setSelectedKp] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedKp) return;
    onLogin({ name: cskvMapping[selectedKp], khuPho: selectedKp });
  };
  return (
    <div className="max-w-md mx-auto bg-white dark:bg-slate-800 p-10 rounded-2xl border dark:border-slate-700 shadow-xl mt-20">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/40 text-white"><Shield size={32}/></div>
      </div>
      <h2 className="text-2xl font-bold mb-8 text-center text-slate-800 dark:text-slate-100 uppercase tracking-wide">Đăng nhập CSKV</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
           <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Chọn Khu phố phụ trách</label>
           <select className="w-full p-4 border rounded-xl dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-blue-500 font-medium" value={selectedKp} onChange={e => setSelectedKp(e.target.value)} required>
             <option value="">-- Click để chọn Khu phố --</option>
             {Object.entries(cskvMapping).map(([kp, name]) => <option key={kp} value={kp}>{safeRender(kp)} - {safeRender(name)}</option>)}
           </select>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 text-lg"><LogIn size={20}/> Vào Hệ Thống</button>
      </form>
    </div>
  );
}

// ==================== BÁO CÁO THỐNG KÊ ====================
function ReportView({ data }) {
  const uniqueObjects = useMemo(() => {
    const map = new Map();
    data.forEach(d => { if (!map.has(d.cccd)) map.set(d.cccd, d); });
    return Array.from(map.values());
  }, [data]);

  const kpStats = {};
  uniqueObjects.filter(d => d.trangThaiQL === 'Đang quản lý').forEach(d => {
    const kp = safeRender(d.khuPho) || 'Chưa xác định';
    kpStats[kp] = (kpStats[kp] || 0) + 1;
  });
  const sortedKp = Object.entries(kpStats).sort((a,b) => b[1] - a[1]);

  return (
    <div className="space-y-6 animate-fade-in print:p-0">
      <div className="flex justify-between items-center print:hidden">
        <h2 className="text-2xl font-bold flex items-center gap-3"><BarChart3 size={28} className="text-purple-600"/> Báo Cáo Thống Kê</h2>
        <button onClick={() => window.print()} className="px-5 py-2.5 bg-slate-800 text-white rounded-xl flex items-center gap-2 hover:bg-slate-900"><Printer size={18}/> In Báo Cáo PDF</button>
      </div>
      <div className="grid grid-cols-1 gap-6 print:block">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border dark:border-slate-700 overflow-hidden">
          <div className="p-5 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-center">
             <h3 className="font-bold text-xl uppercase">Mật độ Đối tượng theo Khu phố (đếm theo hồ sơ duy nhất)</h3>
             <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">Tính đến ngày: {new Date().toLocaleDateString('vi-VN')}</p>
          </div>
          <div className="p-8">
             <ul className="space-y-6 max-w-3xl mx-auto">
               {sortedKp.length === 0 ? <p className="text-slate-400 italic text-center">Chưa có dữ liệu</p> :
                 sortedKp.map(([kp, count], idx) => (
                   <li key={kp}>
                     <div className="flex justify-between text-base mb-2 font-bold">
                       <span>{idx+1}. {safeRender(kp)}</span>
                       <span className={idx < 3 ? 'text-red-600 text-lg' : 'text-blue-600'}>{count} hồ sơ</span>
                     </div>
                     <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-4">
                       <div className={`h-4 rounded-full transition-all duration-1000 ${idx < 3 ? 'bg-red-500' : 'bg-blue-500'}`} style={{width: `${Math.min((count/sortedKp[0][1])*100, 100)}%`}}></div>
                     </div>
                   </li>
                 ))
               }
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
}