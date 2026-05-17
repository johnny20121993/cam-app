import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Users, AlertTriangle, LayoutDashboard, Search, FileDown, FileUp,
  Plus, Trash2, Check, Save, Upload, Info, Map as MapIcon,
  BarChart3, Edit, X, UserPlus, Image as ImageIcon, CheckSquare,
  Calendar, Printer, Settings, MinusCircle, Camera,
  History, LogIn, Shield, Eye, EyeOff, Activity, ChevronDown, ChevronUp,
  FolderOpen, Grid, List, Copy, QrCode, Trash, Download, Clock,
  Menu, DatabaseBackup, DownloadCloud, UploadCloud,
  ClipboardList, BellRing, CheckCircle2, AlertOctagon, CalendarClock, Briefcase, FilePlus
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

// ==================== HELPER TÍNH TOÁN TRẠNG THÁI CÔNG VIỆC ====================
const getTaskStatusInfo = (ngayDenHan, hoanThanh) => {
  if (hoanThanh) return { label: 'Hoàn thành', color: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400', icon: <CheckCircle2 size={16}/>, priority: 4 };
  if (!ngayDenHan) return { label: 'Chưa xác định', color: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400', icon: <Clock size={16}/>, priority: 3 };
  
  const today = new Date();
  today.setHours(0,0,0,0);
  const due = new Date(ngayDenHan);
  due.setHours(0,0,0,0);
  
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: 'Quá hạn', color: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 animate-pulse', icon: <AlertOctagon size={16}/>, priority: 1 };
  if (diffDays === 0) return { label: 'Đến hạn hôm nay', color: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400', icon: <BellRing size={16}/>, priority: 2 };
  if (diffDays <= 3) return { label: 'Sắp đến hạn', color: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400', icon: <CalendarClock size={16}/>, priority: 2 };
  
  return { label: 'Đang tiến hành', color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400', icon: <Activity size={16}/>, priority: 3 };
};

// ==================== COMPONENTS GIAO DIỆN CHUNG ====================
function Input({ label, className, ...props }) {
  return (
    <div className="w-full">
      {label && <label className="block text-[14px] font-semibold mb-1 text-slate-700 dark:text-slate-300">{safeRender(label)}</label>}
      <input className={`w-full px-3 py-2 min-h-[44px] text-[14px] border rounded-lg dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-blue-500 transition-shadow ${className}`} {...props} />
    </div>
  );
}

function Select({ label, options, className, ...props }) {
  return (
    <div className="w-full">
      {label && <label className="block text-[14px] font-semibold mb-1 text-slate-700 dark:text-slate-300">{safeRender(label)}</label>}
      <select className={`w-full px-3 py-2 min-h-[44px] text-[14px] border rounded-lg dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-blue-500 transition-shadow ${className}`} {...props}>
        {options.map(o => <option key={o?.value || o} value={o?.value || o}>{safeRender(o?.label || o)}</option>)}
      </select>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl">
      <h3 className="text-[16px] md:text-lg font-bold border-b-2 border-slate-100 dark:border-slate-700 pb-2 mb-4 text-blue-800 dark:text-blue-300 uppercase tracking-wide">{safeRender(title)}</h3>
      {children}
    </div>
  );
}

// ==================== MAIN APP ====================
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState([]);
  const [cskvMapping, setCskvMapping] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  const [darkMode, setDarkMode] = useState(false);
  const [isDBReady, setIsDBReady] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskRecord, setTaskRecord] = useState(null);
  const [taskForm, setTaskForm] = useState({ noiDung: '', cskv: '', giamSat: '', ngayBaoCao: '', ngayDenHan: '' });
  const [showReminder, setShowReminder] = useState(false);
  const [reminderTasks, setReminderTasks] = useState([]);
  const [hasCheckedReminder, setHasCheckedReminder] = useState(false);

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
      deferredPrompt.userChoice.then(() => setShowInstall(false));
    }
  };

  const [listSearchTerm, setListSearchTerm] = useState('');
  const [listFilters, setListFilters] = useState({
    khuPho: 'All', trangThaiQL: 'All', dien: '', toiDanh: '', hinhThucXuLy: '', gioiTinh: 'All', tuNgaySinh: '', denNgaySinh: ''
  });
  const [viewMode, setViewMode] = useState('table');

  const notify = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000);
  };

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
    }, 60000);
    return () => clearInterval(backupInterval);
  }, [data]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        let dbData = await getItemDB(DATA_KEY);
        
        if (dbData !== null && dbData !== undefined && Array.isArray(dbData)) {
          const now = new Date();
          const cleanedData = dbData.filter(d => {
            if (!d.deletedAt) return true;
            const delDate = new Date(d.deletedAt);
            const daysDiff = (now - delDate) / (1000 * 60 * 60 * 24);
            return daysDiff <= 30;
          });
          
          if (cleanedData.length !== dbData.length) {
            await setItemDB(DATA_KEY, cleanedData);
          }
          setData(cleanedData);

          if (!hasCheckedReminder) {
            let pendingTasks = [];
            cleanedData.forEach(record => {
              if (record.tasks && Array.isArray(record.tasks)) {
                record.tasks.forEach(task => {
                  if (!task.hoanThanh) {
                    const statusInfo = getTaskStatusInfo(task.ngayDenHan, task.hoanThanh);
                    if (statusInfo.priority <= 2) {
                      pendingTasks.push({ ...task, recordId: record.id, recordName: record.hoTen, recordCCCD: record.cccd, statusInfo });
                    }
                  }
                });
              }
            });
            
            if (pendingTasks.length > 0) {
              pendingTasks.sort((a, b) => a.statusInfo.priority - b.statusInfo.priority);
              setReminderTasks(pendingTasks);
              setShowReminder(true);
            }
            setHasCheckedReminder(true);
          }
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
  }, [hasCheckedReminder]);

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

  useEffect(() => {
    const timer = setInterval(() => {
      if (isDBReady) {
        setItemDB(DATA_KEY, data)
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

  const changeTab = (tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  const filteredDataByUser = useMemo(() => {
    if (!currentUser) return data;
    return data.filter(d => d.khuPho === currentUser.khuPho);
  }, [data, currentUser]);

  const activeDataCount = data.filter(d => !d.deletedAt).length;
  const trashCount = data.filter(d => d.deletedAt).length;

  const openTaskModal = (record) => {
    setTaskRecord(record);
    setTaskForm({ noiDung: '', cskv: record.canBoPhuTrach || '', giamSat: '', ngayBaoCao: '', ngayDenHan: '' });
    setShowTaskModal(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!taskForm.noiDung || !taskForm.ngayDenHan) return notify("Vui lòng nhập Nội dung và Ngày đến hạn", "error");

    const newTask = {
      ...taskForm,
      id: 'task_' + Date.now().toString(),
      hoanThanh: false,
      ngayGiao: new Date().toISOString()
    };

    const newData = data.map(item => {
      if (item.id === taskRecord.id) {
        return { ...item, tasks: [...(item.tasks || []), newTask] };
      }
      return item;
    });

    setData(newData);
    setShowTaskModal(false);
    notify("Đã giao việc thành công!");
  };

  const handleCompleteTask = (recordId, taskId) => {
    const newData = data.map(item => {
      if (item.id === recordId) {
        const updatedTasks = (item.tasks || []).map(t => 
          t.id === taskId ? { ...t, hoanThanh: true, ngayHoanThanh: new Date().toISOString() } : t
        );
        return { ...item, tasks: updatedTasks };
      }
      return item;
    });
    
    setData(newData);
    
    if (showReminder) {
      setReminderTasks(prev => prev.filter(t => t.id !== taskId));
      if (reminderTasks.length <= 1) setShowReminder(false);
    }
    notify("Đã đánh dấu hoàn thành công việc!");
  };

  return (
    <div className={`flex h-screen ${darkMode ? 'dark' : ''} bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans text-[14px]`}>
      
      {/* Overlay cho Mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* POPUP NHẮC NHỞ */}
      {showReminder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="bg-gradient-to-r from-orange-500 to-rose-500 p-4 md:p-5 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <BellRing className="animate-bounce" size={24} />
                <h2 className="text-lg md:text-xl font-bold">Nhắc nhở Công việc ({reminderTasks.length})</h2>
              </div>
              <button onClick={() => setShowReminder(false)} className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 min-h-[44px] min-w-[44px] rounded-full transition-colors flex items-center justify-center"><X size={20}/></button>
            </div>
            <div className="p-0 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {reminderTasks.map((task, idx) => (
                <div key={idx} className="p-4 border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div className="flex-1 w-full">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`px-2.5 py-1 text-[13px] font-bold rounded-full border flex items-center gap-1 ${task.statusInfo.color}`}>
                        {task.statusInfo.icon} {task.statusInfo.label}
                      </span>
                      <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">Hạn: {new Date(task.ngayDenHan).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <p className="font-bold text-[15px] mb-1">{safeRender(task.noiDung)}</p>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400">
                      Đ/tượng: <span className="font-bold text-blue-600 dark:text-blue-400">{task.recordName}</span> ({task.recordCCCD})
                    </p>
                  </div>
                  <button 
                    onClick={() => handleCompleteTask(task.recordId, task.id)}
                    className="flex items-center gap-2 px-4 py-2 min-h-[44px] bg-emerald-500 hover:bg-emerald-600 text-white text-[14px] font-bold rounded-xl transition-colors shadow-sm w-full md:w-auto justify-center"
                  >
                    <Check size={18} /> Đã Xong
                  </button>
                </div>
              ))}
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 text-center border-t border-slate-200 dark:border-slate-700">
              <button onClick={() => setShowReminder(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-bold text-[14px] px-6 py-2 min-h-[44px] rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors w-full sm:w-auto">Đóng để xem sau</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <div className={`fixed inset-y-0 left-0 w-72 md:w-64 bg-slate-900 dark:bg-slate-950 text-white flex flex-col shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 print:hidden`}>
        <div className="p-5 bg-slate-950 dark:bg-black flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/30">C</div>
             <div>
               <h1 className="font-bold text-lg tracking-wide">C.A.M.S</h1>
               <p className="text-[11px] text-blue-300 uppercase tracking-widest">Hệ thống QLĐT</p>
             </div>
          </div>
          <button className="md:hidden text-slate-400 hover:text-white min-h-[44px] min-w-[44px] flex justify-center items-center rounded-lg" onClick={() => setIsSidebarOpen(false)}><X size={24}/></button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          <NavItem active={activeTab === 'dashboard'} onClick={() => changeTab('dashboard')} icon={<LayoutDashboard size={20} />} label="Tổng quan & Cảnh báo" />
          <NavItem active={activeTab === 'list'} onClick={() => changeTab('list')} icon={<Users size={20} />} label={`Hồ sơ Đối tượng (${activeDataCount})`} />
          <NavItem active={activeTab === 'form'} onClick={() => { setEditingRecord(null); changeTab('form'); }} icon={<UserPlus size={20} />} label="Thêm mới Hồ sơ" />
          
          <div className="pt-4 pb-2"><p className="text-[12px] font-bold text-slate-500 uppercase px-3 tracking-wider">Công cụ & Dữ liệu</p></div>
          <NavItem active={activeTab === 'import'} onClick={() => changeTab('import')} icon={<Database size={20} />} label="Đồng bộ File CSV" />
          <NavItem active={activeTab === 'compare'} onClick={() => changeTab('compare')} icon={<CheckSquare size={20} />} label="Đối chiếu & Cập nhật" />
          <NavItem active={activeTab === 'bulkImage'} onClick={() => changeTab('bulkImage')} icon={<FolderOpen size={20} />} label="Import ảnh hàng loạt" />
          <NavItem active={activeTab === 'backup'} onClick={() => changeTab('backup')} icon={<DatabaseBackup size={20} />} label="Sao lưu & Phục hồi" />
          <NavItem active={activeTab === 'trash'} onClick={() => changeTab('trash')} icon={<Trash size={20} />} label={`Thùng rác (${trashCount})`} />
          
          <div className="pt-4 pb-2"><p className="text-[12px] font-bold text-slate-500 uppercase px-3 tracking-wider">Hệ thống</p></div>
          <NavItem active={activeTab === 'settings'} onClick={() => changeTab('settings')} icon={<Settings size={20} />} label="Phân công CSKV" />
          <NavItem active={activeTab === 'report'} onClick={() => changeTab('report')} icon={<BarChart3 size={20} />} label="Báo cáo & Thống kê" />
          
          {!currentUser && (
            <NavItem active={activeTab === 'login'} onClick={() => changeTab('login')} icon={<LogIn size={20} />} label="Đăng nhập CSKV" />
          )}
          
          <button onClick={() => setDarkMode(!darkMode)} className="w-full mt-6 flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            {darkMode ? <Eye size={20} /> : <EyeOff size={20} />} <span className="font-medium text-[14px]">Chế độ {darkMode ? 'Sáng' : 'Tối'}</span>
          </button>
        </nav>
        {currentUser && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900">
            <div>
              <p className="text-[14px] font-medium">{safeRender(currentUser.name)}</p>
              <p className="text-[13px] text-slate-400">{safeRender(currentUser.khuPho)}</p>
            </div>
            <button onClick={handleLogout} className="p-2 min-h-[44px] min-w-[44px] hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors flex items-center justify-center"><LogIn size={18} /></button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 px-4 md:px-8 py-3 md:py-4 flex justify-between items-center z-10 print:hidden min-h-[60px]">
          <div className="flex items-center">
            {/* Mobile Hamburger Button */}
            <button className="md:hidden mr-3 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md bg-slate-100 dark:bg-slate-700" onClick={() => setIsSidebarOpen(true)}>
               <Menu size={24} />
            </button>
            <h2 className="text-[16px] md:text-[18px] font-bold text-slate-700 dark:text-slate-200 truncate max-w-[200px] md:max-w-none">
              {activeTab === 'dashboard' && 'Bảng Điều Khiển Trung Tâm'}
              {activeTab === 'list' && 'Quản Lý Hồ Sơ Đối Tượng'}
              {activeTab === 'form' && (editingRecord ? 'Cập Nhật Hồ Sơ' : 'Thêm Mới Hồ Sơ')}
              {activeTab === 'import' && 'Đồng Bộ File Excel'}
              {activeTab === 'compare' && 'Đối Chiếu & Cập Nhật'}
              {activeTab === 'bulkImage' && 'Import ảnh hàng loạt'}
              {activeTab === 'backup' && 'Sao lưu & Phục hồi'}
              {activeTab === 'trash' && 'Thùng rác an toàn'}
              {activeTab === 'settings' && 'Quản Lý Cán Bộ Khu Vực'}
              {activeTab === 'report' && 'Hệ Thống Báo Cáo'}
              {activeTab === 'login' && 'Đăng nhập Cán bộ'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {currentUser && <span className="text-[12px] md:text-[13px] bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-3 py-1.5 rounded-full font-semibold border border-blue-200 dark:border-blue-800 whitespace-nowrap">{safeRender(currentUser.name)}</span>}
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900 relative p-3 md:p-6 lg:p-8 print:p-0 print:bg-white custom-scrollbar">
          {toast.show && (
            <div className={`fixed top-4 md:top-6 right-4 md:right-6 px-4 py-3 md:px-6 md:py-3 rounded-xl shadow-2xl flex items-center gap-3 z-[100] animate-fade-in-down font-medium text-white border border-white/20 text-[14px] ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'} max-w-[90vw]`}>
              {toast.type === 'error' ? <AlertTriangle size={20} className="shrink-0" /> : <Check size={20} className="shrink-0" />}
              <span className="break-words">{safeRender(toast.msg)}</span>
            </div>
          )}

          {!isDBReady ? (
             <div className="flex items-center justify-center h-full text-slate-400 font-medium">
                <Activity className="animate-spin mr-2" size={20}/> Đang khởi tạo cơ sở dữ liệu...
             </div>
          ) : (
            <>
              {activeTab === 'dashboard' && <DashboardView data={filteredDataByUser.filter(d => !d.deletedAt)} />}
              {activeTab === 'list' && <ListView data={filteredDataByUser.filter(d => !d.deletedAt)} setData={setData} allData={data} notify={notify} openForm={openForm} cskvMapping={cskvMapping} searchTerm={listSearchTerm} setSearchTerm={setListSearchTerm} filters={listFilters} setFilters={setListFilters} viewMode={viewMode} setViewMode={setViewMode} openTaskModal={openTaskModal} />}
              {activeTab === 'form' && <FormView data={data} setData={setData} editingRecord={editingRecord} setActiveTab={setActiveTab} notify={notify} cskvMapping={cskvMapping} />}
              {activeTab === 'import' && <ImportView data={data} setData={setData} notify={notify} cskvMapping={cskvMapping} />}
              {activeTab === 'compare' && <CompareView data={filteredDataByUser.filter(d => !d.deletedAt)} setData={setData} notify={notify} />}
              {activeTab === 'bulkImage' && <BulkImageImportView data={data} setData={setData} notify={notify} />}
              {activeTab === 'backup' && <BackupView data={data} setData={setData} notify={notify} />}
              {activeTab === 'trash' && <TrashView data={data} setData={setData} notify={notify} />}
              {activeTab === 'settings' && <SettingsView cskvMapping={cskvMapping} setCskvMapping={setCskvMapping} data={data} setData={setData} notify={notify} />}
              {activeTab === 'report' && <ReportView data={filteredDataByUser.filter(d => !d.deletedAt)} handleCompleteTask={handleCompleteTask} />}
              {activeTab === 'login' && <LoginView onLogin={handleLogin} cskvMapping={cskvMapping} />}
            </>
          )}
        </main>
      </div>

      {/* MODAL GIAO VIỆC */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 md:p-5 flex justify-between items-center text-white shrink-0">
              <h3 className="text-[16px] md:text-xl font-bold flex items-center gap-2">
                <ClipboardList size={22}/> Giao việc / Cập nhật tiến độ
              </h3>
              <button onClick={() => setShowTaskModal(false)} className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 min-h-[44px] min-w-[44px] rounded-full transition-colors flex items-center justify-center"><X size={20}/></button>
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 shrink-0">
               <p className="text-[14px] text-slate-500">Đối tượng: <strong className="text-slate-800 dark:text-white text-[15px]">{taskRecord?.hoTen}</strong> - {taskRecord?.cccd}</p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
              <form id="taskForm" onSubmit={handleSaveTask} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[14px] font-bold text-slate-700 dark:text-slate-300">Nội dung công việc <span className="text-rose-500">*</span></label>
                  <textarea 
                    required rows="3" 
                    className="w-full px-4 py-3 min-h-[80px] bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-purple-500 focus:bg-white dark:focus:bg-slate-900 rounded-xl outline-none transition-all resize-none text-[14px]" 
                    value={taskForm.noiDung} onChange={e => setTaskForm({...taskForm, noiDung: e.target.value})} 
                    placeholder="Vd: Yêu cầu trình diện tại công an phường..."
                  ></textarea>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[14px] font-bold text-slate-700 dark:text-slate-300">CSKV phụ trách</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2.5 min-h-[44px] bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-purple-500 focus:bg-white dark:focus:bg-slate-900 rounded-xl outline-none transition-all text-[14px]" 
                    value={taskForm.cskv} onChange={e => setTaskForm({...taskForm, cskv: e.target.value})} 
                    placeholder="Tên CSKV..." 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[14px] font-bold text-slate-700 dark:text-slate-300">Cán bộ giám sát</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2.5 min-h-[44px] bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-purple-500 focus:bg-white dark:focus:bg-slate-900 rounded-xl outline-none transition-all text-[14px]" 
                    value={taskForm.giamSat} onChange={e => setTaskForm({...taskForm, giamSat: e.target.value})} 
                    placeholder="Tên Cán bộ..." 
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[14px] font-bold text-slate-700 dark:text-slate-300">Ngày báo cáo</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-2.5 min-h-[44px] bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-purple-500 focus:bg-white dark:focus:bg-slate-900 rounded-xl outline-none transition-all text-slate-700 dark:text-slate-300 text-[14px]" 
                    value={taskForm.ngayBaoCao} onChange={e => setTaskForm({...taskForm, ngayBaoCao: e.target.value})} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[14px] font-bold text-slate-700 dark:text-slate-300">Ngày đến hạn <span className="text-rose-500">*</span></label>
                  <input 
                    required type="date" 
                    className="w-full px-4 py-2.5 min-h-[44px] bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-purple-500 focus:bg-white dark:focus:bg-slate-900 rounded-xl outline-none transition-all text-slate-700 dark:text-slate-300 text-[14px]" 
                    value={taskForm.ngayDenHan} onChange={e => setTaskForm({...taskForm, ngayDenHan: e.target.value})} 
                  />
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex flex-col-reverse md:flex-row justify-end gap-3 shrink-0 bg-slate-50 dark:bg-slate-900/50">
              <button type="button" onClick={() => setShowTaskModal(false)} className="w-full md:w-auto px-6 py-2.5 min-h-[44px] bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors">Hủy</button>
              <button type="submit" form="taskForm" className="w-full md:w-auto px-6 py-2.5 min-h-[44px] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 transition-transform active:scale-95"><Save size={18} /> Lưu Công việc</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function Database(props) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>; }

function NavItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full min-h-[44px] flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      {icon} <span className="font-medium text-[14px] truncate">{label}</span>
    </button>
  );
}

// ==================== SAO LƯU & PHỤC HỒI (BACKUP) ====================
function BackupView({ data, setData, notify }) {
  const handleExportBackup = () => {
    if (data.length === 0) return notify("Không có dữ liệu để xuất!", "error");
    const dataStr = JSON.stringify(data);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CAMS_Backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify("Đã trích xuất toàn bộ dữ liệu thành file Backup an toàn!", "success");
  };

  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const importedData = JSON.parse(evt.target.result);
        if (Array.isArray(importedData)) {
           if (window.confirm("⚠️ CẢNH BÁO NGUY HIỂM: Thao tác này sẽ GHI ĐÈ XÓA SẠCH toàn bộ dữ liệu đang có trên máy tính/điện thoại này và thay thế bằng dữ liệu từ file Backup. Bạn có chắc chắn muốn tiếp tục?")) {
               setData(importedData);
               notify("Đã phục hồi dữ liệu thành công từ file Backup!", "success");
           }
        } else {
           notify("File không đúng định dạng dữ liệu C.A.M.S", "error");
        }
      } catch(err) {
        notify("Lỗi đọc file. Vui lòng chọn đúng file .json", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleMergeBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const importedData = JSON.parse(evt.target.result);
        if (Array.isArray(importedData)) {
            let addedCount = 0;
            const newData = [...data];
            
            importedData.forEach(importedItem => {
                // Kiểm tra xem CCCD hoặc ID đã có trong DB hiện tại chưa
                const isExist = newData.some(d => d.cccd === importedItem.cccd || d.id === importedItem.id);
                if (!isExist) {
                    newData.push(importedItem);
                    addedCount++;
                }
            });

            setData(newData);
            notify(`Đã gộp thành công ${addedCount} hồ sơ mới từ file Backup! Các dữ liệu cũ vẫn được giữ nguyên.`, "success");
        } else {
           notify("File không đúng định dạng dữ liệu C.A.M.S", "error");
        }
      } catch(err) {
        notify("Lỗi đọc file. Vui lòng chọn đúng file .json", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border dark:border-slate-700 p-4 md:p-10 max-w-6xl mx-auto">
      <div className="text-center mb-8 md:mb-10">
         <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400">
            <DatabaseBackup size={32} className="md:w-10 md:h-10" />
         </div>
         <h2 className="text-xl md:text-3xl font-bold mb-3">Sao Lưu & Phục Hồi Dữ Liệu</h2>
         <p className="text-[14px] text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Công cụ này giúp bạn trích xuất dữ liệu, phục hồi nguyên trạng, hoặc gộp thêm dữ liệu từ máy khác mang sang.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
         <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 md:p-8 rounded-3xl border border-emerald-200 dark:border-emerald-800/50 flex flex-col items-center text-center">
            <DownloadCloud size={48} className="text-emerald-500 mb-4" />
            <h3 className="text-lg md:text-xl font-bold text-emerald-800 dark:text-emerald-400 mb-2">1. Trích xuất</h3>
            <p className="text-[14px] text-emerald-600 dark:text-emerald-500 mb-6 flex-1">Tải xuống toàn bộ hồ sơ hiện có dưới dạng file .json.</p>
            <button onClick={handleExportBackup} className="w-full py-3 md:py-4 min-h-[44px] bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 transition-all flex justify-center items-center gap-2">
               <DownloadCloud size={20} /> Tạo Backup
            </button>
            <p className="text-[13px] text-slate-400 mt-4">Hệ thống đang lưu: {data.length} bản ghi.</p>
         </div>

         <div className="bg-blue-50 dark:bg-blue-900/10 p-6 md:p-8 rounded-3xl border border-blue-200 dark:border-blue-800/50 flex flex-col items-center text-center relative overflow-hidden">
            <FilePlus size={48} className="text-blue-500 mb-4" />
            <h3 className="text-lg md:text-xl font-bold text-blue-800 dark:text-blue-400 mb-2">2. Gộp Cập Nhật</h3>
            <p className="text-[14px] text-blue-600 dark:text-blue-500 mb-6 flex-1">Nạp file Backup để <strong>bổ sung</strong> các hồ sơ mới (chưa có trên máy). <strong>Không làm mất dữ liệu cũ.</strong></p>
            
            <label className="w-full py-3 md:py-4 min-h-[44px] bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all flex justify-center items-center gap-2 cursor-pointer z-10">
               <UploadCloud size={20} /> Chọn file Gộp
               <input type="file" accept=".json" className="hidden" onChange={handleMergeBackup} />
            </label>
         </div>

         <div className="bg-orange-50 dark:bg-orange-900/10 p-6 md:p-8 rounded-3xl border border-orange-200 dark:border-orange-800/50 flex flex-col items-center text-center relative overflow-hidden">
            <UploadCloud size={48} className="text-orange-500 mb-4" />
            <h3 className="text-lg md:text-xl font-bold text-orange-800 dark:text-orange-400 mb-2">3. Khôi phục (Ghi đè)</h3>
            <p className="text-[14px] text-orange-600 dark:text-orange-500 mb-6 flex-1">Nạp file Backup vào máy. <strong className="text-red-500">Dữ liệu hiện tại trên máy sẽ bị XÓA SẠCH.</strong></p>
            
            <label className="w-full py-3 md:py-4 min-h-[44px] bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 shadow-lg shadow-orange-600/30 transition-all flex justify-center items-center gap-2 cursor-pointer z-10">
               <AlertTriangle size={20} /> Chọn file Ghi đè
               <input type="file" accept=".json" className="hidden" onChange={handleImportBackup} />
            </label>
         </div>
      </div>
    </div>
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
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <StatCard label="Tổng Hồ Sơ" value={tongSo} color="blue" Icon={Users} />
        <StatCard label="Đang Quản Lý (duy nhất)" value={dangQuanLy} color="emerald" Icon={CheckSquare} />
        <StatCard label="Đã Kết Thúc" value={daKetThuc} color="slate" Icon={Trash2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <AlertBox title="Lỗi Logic (Đã chết)" count={ghostRecords.length} color="red" onExport={() => exportTableToExcel('tbl-ghost', 'Loi_Trang_Thai_Chet')}>
          <div className="w-full overflow-x-auto">
            <table id="tbl-ghost" className="w-full text-[14px] text-left whitespace-nowrap min-w-[300px]">
              <thead className="bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 sticky top-0">
                <tr><th className="p-2 font-semibold">Họ tên</th><th className="p-2 font-semibold">Số CCCD</th><th className="p-2 font-semibold">Khu phố</th></tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-700">
                {ghostRecords.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="p-2 font-bold">{safeRender(d.hoTen)}</td><td className="p-2 font-mono text-[13px]">{safeRender(d.cccd)}</td><td className="p-2">{safeRender(d.khuPho)}</td>
                  </tr>
                ))}
                {ghostRecords.length === 0 && <tr><td colSpan="3" className="p-4 text-center text-slate-400 italic">Không có dữ liệu</td></tr>}
              </tbody>
            </table>
          </div>
        </AlertBox>
        
        <AlertBox title="Sắp hết hạn" count={expiringRecords.length} color="orange" onExport={() => exportTableToExcel('tbl-expire', 'Sap_Het_Han')}>
          <div className="w-full overflow-x-auto">
            <table id="tbl-expire" className="w-full text-[14px] text-left whitespace-nowrap min-w-[300px]">
              <thead className="bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200 sticky top-0">
                <tr><th className="p-2 font-semibold">Họ tên</th><th className="p-2 font-semibold">Số CCCD</th><th className="p-2 font-semibold">Còn (ngày)</th></tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-700">
                {expiringRecords.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="p-2 font-bold">{safeRender(d.hoTen)}</td><td className="p-2 font-mono text-[13px]">{safeRender(d.cccd)}</td><td className="p-2 font-bold text-orange-600">{safeRender(d.daysLeft)}</td>
                  </tr>
                ))}
                {expiringRecords.length === 0 && <tr><td colSpan="3" className="p-4 text-center text-slate-400 italic">Không có dữ liệu</td></tr>}
              </tbody>
            </table>
          </div>
        </AlertBox>

        <AlertBox title="Trùng nhiều diện" count={overlappingRecords.length} color="purple" onExport={() => exportTableToExcel('tbl-overlap', 'Trung_Nhieu_Dien')}>
          <div className="w-full overflow-x-auto">
            <table id="tbl-overlap" className="w-full text-[14px] text-left whitespace-nowrap min-w-[350px]">
              <thead className="bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 sticky top-0">
                <tr><th className="p-2 font-semibold">Họ tên</th><th className="p-2 font-semibold">Số CCCD</th><th className="p-2 font-semibold">Diện bị trùng</th></tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-700">
                {overlappingRecords.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="p-2 font-bold">{safeRender(d.hoTen)}</td><td className="p-2 font-mono text-[13px]">{safeRender(d.cccd)}</td><td className="p-2 text-red-600 font-semibold">{safeRender(d.duplicatedDiens)}</td>
                  </tr>
                ))}
                {overlappingRecords.length === 0 && <tr><td colSpan="3" className="p-4 text-center text-slate-400 italic">Không có dữ liệu</td></tr>}
              </tbody>
            </table>
          </div>
        </AlertBox>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
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
    <div className={`bg-white dark:bg-slate-800 p-4 md:p-6 rounded-2xl shadow-sm flex items-center justify-between border-l-4 ${colors[color]}`}>
      <div><p className="text-[13px] font-bold text-slate-400 uppercase">{safeRender(label)}</p><p className="text-3xl md:text-4xl font-black">{safeRender(value)}</p></div>
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
    <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border ${bg} flex flex-col h-[350px] md:h-[400px] overflow-hidden`}>
      <div className="px-3 py-3 flex justify-between items-center border-b dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50">
        <h3 className="font-bold flex items-center gap-2 text-[14px]">{safeRender(title)} <span className="bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full text-[13px]">{safeRender(count)}</span></h3>
        <button onClick={onExport} className="text-[13px] bg-white dark:bg-slate-700 border dark:border-slate-600 px-3 py-1.5 min-h-[36px] rounded-lg flex items-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm"><FileDown size={14}/> Xuất Excel</button>
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
      <h3 className="font-bold mb-2 text-[14px]">{safeRender(title)}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
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
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border dark:border-slate-700 p-4 md:p-8 flex flex-col">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-red-600"><Trash size={28}/> Thùng rác ({trashData.length})</h2>
          {trashData.length > 0 && <button onClick={handleEmptyTrash} className="w-full sm:w-auto px-4 py-2 min-h-[44px] bg-red-100 text-red-600 font-bold rounded-lg hover:bg-red-200">Dọn sạch thùng rác</button>}
       </div>
       <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-[14px] border border-red-100 dark:border-red-800 mb-6">
          <Info size={18} className="inline md:mr-2 mb-1 md:mb-0"/> Hồ sơ trong thùng rác sẽ tự động bị xóa vĩnh viễn sau 30 ngày.
       </div>
       
       {trashData.length === 0 ? (
         <div className="text-center py-20 text-slate-400"><Trash size={48} className="mx-auto mb-4 opacity-50"/> Thùng rác trống</div>
       ) : (
         <div className="w-full overflow-x-auto border dark:border-slate-700 rounded-xl">
           <table className="w-full text-[14px] text-left whitespace-nowrap min-w-[600px]">
             <thead className="bg-slate-50 dark:bg-slate-700 uppercase text-[13px]">
               <tr><th className="p-3">Họ tên</th><th className="p-3">CCCD</th><th className="p-3">Ngày xóa</th><th className="p-3 text-right">Thao tác</th></tr>
             </thead>
             <tbody className="divide-y dark:divide-slate-700 bg-white dark:bg-slate-800">
               {trashData.map(d => (
                 <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                   <td className="p-3 font-bold">{safeRender(d.hoTen)}</td>
                   <td className="p-3 font-mono">{safeRender(d.cccd)}</td>
                   <td className="p-3 text-red-500">{new Date(d.deletedAt).toLocaleString('vi-VN')}</td>
                   <td className="p-3 text-right flex justify-end gap-2">
                      <button onClick={() => handleRestore(d.id)} className="text-blue-600 hover:underline font-semibold min-h-[40px] px-2">Khôi phục</button>
                      <button onClick={() => handlePermanentDelete(d.id)} className="text-red-600 hover:underline font-semibold min-h-[40px] px-2">Xóa</button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
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
    quanHeGiaDinh: [], hoSoYTePhapLy: [], tasks: []
  };

  const [formData, setFormData] = useState({ ...emptyRecord, ...editingRecord });
  const [dienInput, setDienInput] = useState('');
  const [dienTrangThai, setDienTrangThai] = useState('Đang quản lý');
  const [dienNgayDuaVao, setDienNgayDuaVao] = useState('');
  
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
    return events.sort((a,b) => b.date - a.date);
  }, [formData]);

  const getCskv = (khuPho) => {
    const kpStr = (khuPho || '').trim().toLowerCase();
    const key = Object.keys(cskvMapping).find(k => k.trim().toLowerCase() === kpStr);
    return key ? cskvMapping[key] : '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updates = { [name]: value };
    if (name === 'cccd') updates.cccd = value.replace(/[^0-9]/g, ''); 
    if (name === 'khuPho') updates.canBoPhuTrach = getCskv(value);
    setFormData({ ...formData, ...updates });
  };

  const handleCCCDBlur = () => {
    let cccd = formData.cccd?.trim();
    if (!cccd) return;
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
      setData([{ ...cleaned, id: generateId(), tasks: [] }, ...data]);
      notify("Tạo mới thành công");
    }
    setActiveTab('list');
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border dark:border-slate-700 flex flex-col md:h-[85vh]">
      <div className="px-4 md:px-6 py-4 border-b dark:border-slate-700 flex justify-between shrink-0">
        <h2 className="text-xl font-bold">{editingRecord ? 'Cập nhật' : 'Thêm mới'} Hồ sơ</h2>
        <button onClick={() => setActiveTab('list')} className="text-slate-500 hover:text-red-500 min-h-[44px] min-w-[44px] flex items-center justify-center"><X size={24} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 md:p-8 space-y-8 md:space-y-10 custom-scrollbar">
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
              {formData.avatar && <button onClick={() => setFormData({...formData, avatar: null})} className="text-[13px] min-h-[40px] px-3 text-red-500 font-bold hover:underline">Xóa ảnh</button>}
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
                 <label key={mark} className="flex items-center gap-2 cursor-pointer text-[14px] font-semibold min-h-[44px]">
                   <input type="checkbox" checked={(formData.dacDiemRieng || []).includes(mark)} onChange={() => toggleSpecialMark(mark)} className="w-5 h-5 text-blue-600 rounded" />
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
                  <div key={idx} className="flex flex-col md:flex-row md:items-center gap-2 bg-slate-50 dark:bg-slate-700 p-2 md:p-3 rounded-lg border dark:border-slate-600">
                    <span className="flex-1 font-semibold text-[14px] pl-2">{safeRender(ten)}</span>
                    <div className="flex items-center flex-wrap gap-2 mt-1 md:mt-0 pl-2 md:pl-0">
                       <span className={`text-[12px] px-2 py-1 rounded ${trangThai === 'Đang quản lý' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-300'}`}>{safeRender(trangThai)}</span>
                       <span className="text-[13px] text-slate-500">{safeRender(ngayDuaVao)}</span>
                       <button onClick={() => handleDienRemove(idx)} className="text-red-500 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/50 rounded ml-2"><X size={16} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border dark:border-slate-700">
              <select className="px-3 py-2 min-h-[44px] border rounded-lg dark:bg-slate-700 dark:border-slate-600 text-[14px]" value={dienInput} onChange={e => setDienInput(e.target.value)}>
                <option value="">-- Chọn diện --</option>
                {allDiens.map(d => <option key={d} value={d}>{safeRender(d)}</option>)}
              </select>
              <input type="text" className="px-3 py-2 min-h-[44px] border rounded-lg dark:bg-slate-700 dark:border-slate-600 text-[14px]" placeholder="Hoặc gõ diện mới" value={dienInput} onChange={e => setDienInput(e.target.value)} />
              <div className="flex flex-col sm:flex-row gap-2">
                 <select className="px-3 py-2 min-h-[44px] border rounded-lg dark:bg-slate-700 dark:border-slate-600 text-[14px] w-full sm:w-1/2" value={dienTrangThai} onChange={e => setDienTrangThai(e.target.value)}>
                   <option>Đang quản lý</option><option>Đã kết thúc</option>
                 </select>
                 <Input placeholder="Ngày BĐ (dd/mm/yyyy)" className="text-[14px]" value={dienNgayDuaVao} onChange={e => setDienNgayDuaVao(e.target.value)} />
              </div>
              <button onClick={handleDienAdd} className="px-4 py-2 min-h-[44px] bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1"><Plus size={16}/> Thêm</button>
            </div>
          </div>
        </Section>

        <Section title="2. Tiền án / Tiền sự">
          <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800 flex flex-col md:flex-row gap-4 items-center">
            <div className="font-bold text-amber-800 dark:text-amber-200 flex items-center gap-2 w-full md:w-auto"><Clock size={18}/> Trợ lý tính hạn:</div>
            <div className="flex flex-col sm:flex-row flex-1 gap-2 items-center w-full">
               <input type="text" placeholder="Ngày BĐ" className="px-3 py-2 min-h-[44px] border rounded-lg w-full sm:w-32 md:w-40 dark:bg-slate-700 dark:border-slate-600 text-[14px]" value={calcStart} onChange={e => setCalcStart(e.target.value)}/>
               <span className="font-bold text-slate-400 hidden sm:inline">+</span>
               <div className="flex w-full sm:w-auto gap-2">
                  <input type="number" placeholder="Năm" className="px-3 py-2 min-h-[44px] border rounded-lg w-full sm:w-20 dark:bg-slate-700 dark:border-slate-600 text-center text-[14px]" value={calcYears} onChange={e => setCalcYears(e.target.value)}/>
                  <input type="number" placeholder="Tháng" className="px-3 py-2 min-h-[44px] border rounded-lg w-full sm:w-20 dark:bg-slate-700 dark:border-slate-600 text-center text-[14px]" value={calcMonths} onChange={e => setCalcMonths(e.target.value)}/>
               </div>
               <span className="font-bold text-slate-400 hidden sm:inline">=</span>
               <input type="text" readOnly placeholder="Ngày kết thúc" className="px-3 py-2 min-h-[44px] border rounded-lg w-full sm:w-32 md:w-40 bg-white font-bold text-emerald-600 dark:bg-slate-800 dark:border-slate-600 outline-none text-[14px]" value={calcResult} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <label className="block text-[14px] font-semibold mb-1">Tội danh *</label>
                <input type="text" className="w-full px-3 py-2 min-h-[44px] text-[14px] border rounded-lg dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Tìm tội danh..."
                  value={currentAn.toiDanh} onChange={e => { setCurrentAn({...currentAn, toiDanh: e.target.value}); setSearchToiDanh(e.target.value); setShowToiDanhDropdown(true); }}
                  onFocus={() => setShowToiDanhDropdown(true)} onBlur={() => setTimeout(() => setShowToiDanhDropdown(false), 200)}
                />
                {showToiDanhDropdown && filteredToiDanh.length > 0 && (
                  <div className="absolute z-10 w-full bg-white dark:bg-slate-700 border dark:border-slate-600 rounded-lg shadow max-h-60 overflow-auto">
                    {filteredToiDanh.map((item, idx) => (
                      <div key={idx} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer min-h-[44px]" onClick={() => { setCurrentAn({...currentAn, toiDanh: item.ten}); setSearchToiDanh(''); setShowToiDanhDropdown(false); }}>
                        <span className="text-[12px] text-slate-500 dark:text-slate-400 block">{safeRender(item.group)}</span>{safeRender(item.ten)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Select label="Hình thức xử lý chính" options={HINH_THUC_XU_LY_FULL} value={currentAn.hinhThucChinh} onChange={e => setCurrentAn({...currentAn, hinhThucChinh: e.target.value})} />
              <div>
                <label className="block text-[14px] font-semibold mb-1">Hình thức phụ</label>
                <select multiple className="w-full px-3 py-2 text-[14px] border rounded-lg dark:bg-slate-700 dark:border-slate-600 h-24 custom-scrollbar outline-none focus:ring-2 focus:ring-blue-500" value={currentAn.hinhThucPhu} onChange={e => setCurrentAn({...currentAn, hinhThucPhu: Array.from(e.target.selectedOptions, o => o.value)})}>
                  {HINH_THUC_XU_LY_FULL.map(ht => <option key={ht} className="p-1">{safeRender(ht)}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Input label="Ngày bắt đầu" value={currentAn.ngayBatDau} onChange={e => setCurrentAn({...currentAn, ngayBatDau: e.target.value})} placeholder="dd/mm/yyyy" />
              <Input label="Ngày kết thúc" value={currentAn.ngayKetThuc} onChange={e => setCurrentAn({...currentAn, ngayKetThuc: e.target.value})} placeholder="dd/mm/yyyy" />
              <div className="flex gap-2 items-end col-span-1 sm:col-span-2 md:col-span-1">
                <div className="flex-1"><Input label="Năm" type="number" value={currentAn.thoiHanNam} onChange={e => setCurrentAn({...currentAn, thoiHanNam: e.target.value})} /></div>
                <div className="flex-1"><Input label="Tháng" type="number" value={currentAn.thoiHanThang} onChange={e => setCurrentAn({...currentAn, thoiHanThang: e.target.value})} /></div>
              </div>
              <div className="flex items-end gap-2 col-span-1 sm:col-span-2 md:col-span-1">
                <button onClick={addOrUpdateAn} className="flex-1 min-h-[44px] px-4 py-2 bg-green-600 text-white font-bold rounded-lg flex items-center justify-center gap-1"><Plus size={16} /> {anEditingIndex !== null ? 'Cập nhật' : 'Thêm'}</button>
                {anEditingIndex !== null && <button onClick={() => { setCurrentAn({ toiDanh: '', hinhThucChinh: '', hinhThucPhu: [], ngayBatDau: '', ngayKetThuc: '', thoiHanNam: '', thoiHanThang: '' }); setAnEditingIndex(null); }} className="px-4 py-2 min-h-[44px] border rounded-lg dark:border-slate-600">Hủy</button>}
              </div>
            </div>
            
            <div className="overflow-x-auto border dark:border-slate-700 rounded-lg mt-4 w-full">
              <table className="w-full text-[14px] whitespace-nowrap min-w-[700px]">
                <thead className="bg-slate-50 dark:bg-slate-700"><tr><th className="p-3 text-left">Tội danh</th><th className="p-3 text-left min-w-[120px]">Xử lý chính</th><th className="p-3 text-left">Phụ</th><th className="p-3 text-left min-w-[90px]">Ngày BĐ</th><th className="p-3 text-left min-w-[90px]">Ngày KT</th><th className="p-3 text-left min-w-[100px]">Thời hạn</th><th className="p-3 text-center min-w-[100px]">Thao tác</th></tr></thead>
                <tbody className="bg-white dark:bg-slate-800">
                  {(formData.tienAnTienSu || []).map((an, idx) => (
                    <tr key={idx} className="border-t dark:border-slate-700">
                      <td className="p-3 font-semibold">{safeRender(an.toiDanh)}</td><td className="p-3">{safeRender(an.hinhThucChinh)}</td><td className="p-3 text-[13px] text-slate-500">{an.hinhThucPhu ? safeRender(an.hinhThucPhu.join(', ')) : ''}</td>
                      <td className="p-3">{safeRender(an.ngayBatDau)}</td><td className="p-3">{safeRender(an.ngayKetThuc)}</td><td className="p-3">{safeRender(an.thoiHanNam)} năm {safeRender(an.thoiHanThang)} th</td>
                      <td className="p-3 text-center flex justify-center gap-2">
                        <button onClick={() => editAn(idx)} className="text-blue-500 min-h-[44px] min-w-[44px] flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 rounded"><Edit size={16} /></button>
                        <button onClick={() => removeAn(idx)} className="text-red-500 min-h-[44px] min-w-[44px] flex items-center justify-center bg-red-50 dark:bg-red-900/30 rounded"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                  {(formData.tienAnTienSu || []).length === 0 && <tr><td colSpan="7" className="p-4 text-center text-slate-400 italic">Chưa có dữ liệu tiền án/tiền sự</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </Section>

        <Section title="3. Quan hệ gia đình">
          <div className="space-y-4">
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border dark:border-slate-700">
                <Input label="Quan hệ *" placeholder="VD: Cha, Mẹ, Vợ..." value={currentQh.quanHe} onChange={e => setCurrentQh({...currentQh, quanHe: e.target.value})} />
                <Input label="Họ Tên *" value={currentQh.hoTen} onChange={e => setCurrentQh({...currentQh, hoTen: e.target.value})} />
                <Input label="Năm sinh" type="number" value={currentQh.namSinh} onChange={e => setCurrentQh({...currentQh, namSinh: e.target.value})} />
                <Input label="Thông tin (CCCD, Địa chỉ)" value={currentQh.thongTinKhac} onChange={e => setCurrentQh({...currentQh, thongTinKhac: e.target.value})} />
                <div className="flex flex-col gap-1 sm:col-span-2 md:col-span-1">
                   <label className="text-[14px] font-semibold">Đính kèm (Ảnh)</label>
                   <div className="flex gap-2">
                     <label className="bg-slate-200 dark:bg-slate-700 min-h-[44px] p-2 rounded-lg cursor-pointer hover:bg-slate-300 flex items-center justify-center flex-1 transition-colors">
                       <ImageIcon size={20} />
                       <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUploadBase64(e.target.files[0], (b64) => setCurrentQh({...currentQh, fileDinhKem: b64}))} />
                     </label>
                     <button onClick={handleAddQh} className="bg-blue-600 text-white px-4 min-h-[44px] rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center"><Plus size={20}/></button>
                   </div>
                </div>
                {currentQh.fileDinhKem && <div className="md:col-span-5 text-[13px] text-emerald-600 font-bold mt-1">Đã tải lên 1 tệp đính kèm.</div>}
             </div>
             
             {(formData.quanHeGiaDinh && formData.quanHeGiaDinh.length > 0) && (
                <div className="overflow-x-auto w-full border dark:border-slate-700 rounded-xl">
                <table className="w-full text-[14px] text-left whitespace-nowrap bg-white dark:bg-slate-800 min-w-[600px]">
                  <thead className="bg-slate-100 dark:bg-slate-700"><tr><th className="p-3">Quan hệ</th><th className="p-3">Họ tên</th><th className="p-3">Năm sinh</th><th className="p-3">Thông tin khác</th><th className="p-3 text-center">Tài liệu</th><th className="p-3 text-center">Xóa</th></tr></thead>
                  <tbody className="divide-y dark:divide-slate-700">
                     {formData.quanHeGiaDinh.map((qh, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                          <td className="p-3 font-bold">{safeRender(qh.quanHe)}</td><td className="p-3">{safeRender(qh.hoTen)}</td><td className="p-3">{safeRender(qh.namSinh)}</td><td className="p-3">{safeRender(qh.thongTinKhac)}</td>
                          <td className="p-3 text-center">{qh.fileDinhKem ? <a href={qh.fileDinhKem} target="_blank" className="text-blue-500 hover:underline bg-blue-50 dark:bg-blue-900/30 min-h-[40px] px-3 py-1 rounded inline-flex items-center text-[13px]"><ImageIcon size={14} className="mr-1"/>Xem</a> : '—'}</td>
                          <td className="p-3 text-center"><button onClick={() => setFormData(prev => ({...prev, quanHeGiaDinh: prev.quanHeGiaDinh.filter((_,idx) => idx !== i)}))} className="text-red-500 min-h-[40px] min-w-[40px] inline-flex items-center justify-center bg-red-50 dark:bg-red-900/30 rounded"><Trash2 size={16}/></button></td>
                        </tr>
                     ))}
                  </tbody>
                </table>
                </div>
             )}
          </div>
        </Section>
        
        <Section title="4. Hồ sơ y tế & Quyết định pháp lý">
          <div className="space-y-4">
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border dark:border-slate-700">
                <Input label="Loại hồ sơ *" placeholder="VD: Sổ khám bệnh, GCN, QĐ..." value={currentHs.loaiHoSo} onChange={e => setCurrentHs({...currentHs, loaiHoSo: e.target.value})} />
                <Input label="Số/Ký hiệu" value={currentHs.soQuyetDinh} onChange={e => setCurrentHs({...currentHs, soQuyetDinh: e.target.value})} />
                <Input label="Ngày ban hành" placeholder="dd/mm/yyyy" value={currentHs.ngayBanHanh} onChange={e => setCurrentHs({...currentHs, ngayBanHanh: e.target.value})} />
                <Input label="Cơ quan ban hành" value={currentHs.coQuanBanHanh} onChange={e => setCurrentHs({...currentHs, coQuanBanHanh: e.target.value})} />
                <div className="flex flex-col gap-1 sm:col-span-2 md:col-span-1">
                   <label className="text-[14px] font-semibold">Đính kèm (Ảnh)</label>
                   <div className="flex gap-2">
                     <label className="bg-slate-200 dark:bg-slate-700 min-h-[44px] p-2 rounded-lg cursor-pointer hover:bg-slate-300 flex items-center justify-center flex-1 transition-colors">
                       <ImageIcon size={20} />
                       <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUploadBase64(e.target.files[0], (b64) => setCurrentHs({...currentHs, fileDinhKem: b64}))} />
                     </label>
                     <button onClick={handleAddHs} className="bg-blue-600 text-white px-4 min-h-[44px] rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center"><Plus size={20}/></button>
                   </div>
                </div>
                {currentHs.fileDinhKem && <div className="md:col-span-5 text-[13px] text-emerald-600 font-bold mt-1">Đã tải lên 1 tệp đính kèm.</div>}
             </div>
             
             {(formData.hoSoYTePhapLy && formData.hoSoYTePhapLy.length > 0) && (
                <div className="overflow-x-auto w-full border dark:border-slate-700 rounded-xl">
                <table className="w-full text-[14px] text-left whitespace-nowrap bg-white dark:bg-slate-800 min-w-[700px]">
                  <thead className="bg-slate-100 dark:bg-slate-700"><tr><th className="p-3">Loại hồ sơ</th><th className="p-3">Số QĐ</th><th className="p-3">Ngày ban hành</th><th className="p-3">Cơ quan</th><th className="p-3 text-center">Tài liệu</th><th className="p-3 text-center">Xóa</th></tr></thead>
                  <tbody className="divide-y dark:divide-slate-700">
                     {formData.hoSoYTePhapLy.map((hs, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                          <td className="p-3 font-bold">{safeRender(hs.loaiHoSo)}</td><td className="p-3">{safeRender(hs.soQuyetDinh)}</td><td className="p-3">{safeRender(hs.ngayBanHanh)}</td><td className="p-3">{safeRender(hs.coQuanBanHanh)}</td>
                          <td className="p-3 text-center">{hs.fileDinhKem ? <a href={hs.fileDinhKem} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline bg-blue-50 dark:bg-blue-900/30 min-h-[40px] px-3 py-1 rounded inline-flex items-center text-[13px]"><ImageIcon size={14} className="mr-1"/>Xem</a> : '—'}</td>
                          <td className="p-3 text-center"><button onClick={() => setFormData(prev => ({...prev, hoSoYTePhapLy: prev.hoSoYTePhapLy.filter((_,idx) => idx !== i)}))} className="text-red-500 min-h-[40px] min-w-[40px] inline-flex items-center justify-center bg-red-50 dark:bg-red-900/30 rounded"><Trash2 size={16}/></button></td>
                        </tr>
                     ))}
                  </tbody>
                </table>
                </div>
             )}
          </div>
        </Section>

        <Section title="5. Lịch sử Ghi chú & Xác minh">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <Input label="Ngày ghi nhận" type="date" value={currentGhiChu.ngay} onChange={e => setCurrentGhiChu({...currentGhiChu, ngay: e.target.value})} />
              <Input label="Đơn vị xác minh" placeholder="VD: CSKV Khu phố 1" value={currentGhiChu.donVi} onChange={e => setCurrentGhiChu({...currentGhiChu, donVi: e.target.value})} />
              <div className="md:col-span-2 flex flex-col md:flex-row gap-2 items-end">
                <div className="flex-1 w-full">
                   <Input label="Nội dung xác minh *" placeholder="Nhập chi tiết quá trình xác minh..." value={currentGhiChu.noiDung} onChange={e => setCurrentGhiChu({...currentGhiChu, noiDung: e.target.value})} />
                </div>
                <button onClick={handleAddGhiChu} className="w-full md:w-auto px-4 py-2 min-h-[44px] bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 whitespace-nowrap flex items-center justify-center"><Plus size={16} className="inline mr-1"/> Thêm</button>
              </div>
            </div>
            
            {(formData.ghiChuLog && formData.ghiChuLog.length > 0) ? (
              <div className="border dark:border-slate-700 rounded-xl overflow-x-auto mt-4 w-full">
                <table className="w-full text-[14px] text-left whitespace-nowrap bg-white dark:bg-slate-800 min-w-[600px]">
                  <thead className="bg-slate-50 dark:bg-slate-700 border-b dark:border-slate-600">
                    <tr><th className="p-3 w-32">Ngày</th><th className="p-3 w-48">Đơn vị</th><th className="p-3 min-w-[300px]">Nội dung</th><th className="p-3 w-16 text-center">Xóa</th></tr>
                  </thead>
                  <tbody className="divide-y dark:divide-slate-700">
                    {formData.ghiChuLog.map((log, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="p-3 font-semibold">{parseDate(log.ngay) ? new Date(log.ngay).toLocaleDateString('vi-VN') : log.ngay}</td>
                        <td className="p-3">{safeRender(log.donVi)}</td>
                        <td className="p-3 whitespace-normal break-words">{safeRender(log.noiDung)}</td>
                        <td className="p-3 text-center"><button onClick={() => handleRemoveGhiChu(idx)} className="text-red-500 hover:bg-red-50 min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded dark:hover:bg-red-900/30"><Trash2 size={16}/></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-400 italic text-[14px] mt-2">Chưa có ghi chú xác minh nào.</p>
            )}
          </div>
        </Section>

        {/* Timeline Dòng thời gian */}
        <Section title="6. Timeline Dòng thời gian đối tượng">
          <div className="relative pl-6 border-l-2 border-blue-200 dark:border-blue-900 space-y-6 mt-4 ml-2">
             {timelineEvents.length === 0 ? <p className="text-[14px] italic text-slate-400">Chưa có sự kiện nào được ghi nhận</p> : 
                timelineEvents.map((ev, i) => (
                   <div key={i} className="relative">
                      <div className={`absolute -left-[33px] w-4 h-4 rounded-full ${ev.color} border-4 border-white dark:border-slate-800 top-1`}></div>
                      <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border dark:border-slate-700 inline-block w-full max-w-2xl shadow-sm">
                         <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm inline-block mb-1 border dark:border-slate-600">{ev.date.toLocaleDateString('vi-VN')}</span>
                         <h4 className="font-bold text-[14px] text-slate-800 dark:text-slate-200">{safeRender(ev.title)}</h4>
                         <p className="text-[14px] text-slate-600 dark:text-slate-400 mt-1">{safeRender(ev.desc)}</p>
                      </div>
                   </div>
                ))
             }
          </div>
        </Section>

      </div>
      <div className="px-4 md:px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border-t dark:border-slate-700 flex flex-col-reverse md:flex-row justify-end gap-3 z-10 shrink-0">
        <button onClick={() => setActiveTab('list')} className="w-full md:w-auto px-6 py-2 min-h-[44px] border rounded-lg font-bold text-slate-600 dark:text-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Hủy</button>
        <button onClick={handleSave} className="w-full md:w-auto px-8 py-2 min-h-[44px] bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700 flex items-center justify-center gap-2 transition-transform active:scale-95"><Save size={18} /> Lưu Hồ Sơ</button>
      </div>
    </div>
  );
}

// ==================== LIST VIEW ====================
function ListView({ data, setData, allData, notify, openForm, cskvMapping, searchTerm, setSearchTerm, filters, setFilters, viewMode, setViewMode, openTaskModal }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [qrModal, setQrModal] = useState(null);

  const uniqueDiens = useMemo(() => {
    const set = new Set();
    data.forEach(d => d.danhSachDien?.forEach(x => set.add(typeof x === 'string' ? x : x.ten)));
    return Array.from(set).filter(Boolean);
  }, [data]);

  const uniqueToiDanh = useMemo(() => {
    const set = new Set();
    data.forEach(d => d.tienAnTienSu?.forEach(x => { if (x.toiDanh) set.add(x.toiDanh) }));
    return Array.from(set).filter(Boolean);
  }, [data]);

  const uniqueHinhThuc = useMemo(() => {
    const set = new Set();
    data.forEach(d => d.tienAnTienSu?.forEach(x => {
        if (x.hinhThucChinh) set.add(x.hinhThucChinh);
        if (x.hinhThucPhu) x.hinhThucPhu.forEach(h => set.add(h));
    }));
    return Array.from(set).filter(Boolean);
  }, [data]);


  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = !searchTerm || item.hoTen?.toLowerCase().includes(searchTerm.toLowerCase()) || item.cccd?.includes(searchTerm);
      const matchKhuPho = filters.khuPho === 'All' || item.khuPho === filters.khuPho;
      
      const matchDien = !filters.dien || filters.dien === 'All' || item.danhSachDien?.some(d => {
         const ten = typeof d === 'string' ? d : d.ten;
         return ten?.toLowerCase().includes(filters.dien.toLowerCase());
      });
      const matchToiDanh = !filters.toiDanh || filters.toiDanh === 'All' || item.tienAnTienSu?.some(an => an.toiDanh?.toLowerCase().includes(filters.toiDanh.toLowerCase()));
      const matchHinhThuc = !filters.hinhThucXuLy || filters.hinhThucXuLy === 'All' || item.tienAnTienSu?.some(an => an.hinhThucChinh?.toLowerCase().includes(filters.hinhThucXuLy.toLowerCase()) || an.hinhThucPhu?.some(h => h.toLowerCase().includes(filters.hinhThucXuLy.toLowerCase())));
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
          if (!filters.dien || filters.dien === 'All') return true;
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
      <div className="bg-white dark:bg-slate-800 p-4 md:p-5 rounded-2xl shadow-sm border dark:border-slate-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input placeholder="Tìm tên, CCCD..." className="w-full pl-10 pr-4 py-2 min-h-[44px] text-[14px] border rounded-lg dark:bg-slate-700 dark:border-slate-600 outline-none focus:border-blue-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select className="px-3 py-2 min-h-[44px] text-[14px] border rounded-lg dark:bg-slate-700 dark:border-slate-600" value={filters.khuPho} onChange={e => setFilters({...filters, khuPho: e.target.value})}>
            <option value="All">Tất cả Khu phố</option>
            {uniqueKhuPho.map(kp => <option key={kp}>{safeRender(kp)}</option>)}
          </select>
          <select className="px-3 py-2 min-h-[44px] text-[14px] border rounded-lg dark:bg-slate-700 dark:border-slate-600 font-semibold" value={filters.trangThaiQL} onChange={e => setFilters({...filters, trangThaiQL: e.target.value})}>
            <option value="All">Trạng thái (Tổng đối tượng)</option>
            <option className="text-green-600 font-bold" value="Đang quản lý">Chỉ Lọc Đang quản lý</option>
            <option className="text-gray-500 font-bold" value="Đã kết thúc">Chỉ Lọc Đã kết thúc</option>
          </select>
          
          <select className="px-3 py-2 min-h-[44px] text-[14px] border rounded-lg dark:bg-slate-700 dark:border-slate-600" value={filters.dien} onChange={e => setFilters({...filters, dien: e.target.value})}>
             <option value="All">Tất cả Diện quản lý</option>
             {uniqueDiens.map(d => <option key={d} value={d}>{safeRender(d)}</option>)}
          </select>
          
          <select className="px-3 py-2 min-h-[44px] text-[14px] border rounded-lg dark:bg-slate-700 dark:border-slate-600" value={filters.toiDanh} onChange={e => setFilters({...filters, toiDanh: e.target.value})}>
             <option value="All">Tất cả Tội danh</option>
             {uniqueToiDanh.map(t => <option key={t} value={t}>{safeRender(t)}</option>)}
          </select>
          
          <select className="px-3 py-2 min-h-[44px] text-[14px] border rounded-lg dark:bg-slate-700 dark:border-slate-600" value={filters.hinhThucXuLy} onChange={e => setFilters({...filters, hinhThucXuLy: e.target.value})}>
             <option value="All">Tất cả Hình thức xử lý</option>
             {uniqueHinhThuc.map(h => <option key={h} value={h}>{safeRender(h)}</option>)}
          </select>
          
          <select className="px-3 py-2 min-h-[44px] text-[14px] border rounded-lg dark:bg-slate-700 dark:border-slate-600" value={filters.gioiTinh} onChange={e => setFilters({...filters, gioiTinh: e.target.value})}>
            <option value="All">Giới tính</option><option>Nam</option><option>Nữ</option>
          </select>
          <div className="flex gap-2 items-center">
            <input placeholder="Từ ngày sinh" className="px-3 py-2 min-h-[44px] text-[14px] border rounded-lg w-full dark:bg-slate-700 dark:border-slate-600" value={filters.tuNgaySinh} onChange={e => setFilters({...filters, tuNgaySinh: e.target.value})} />
            <input placeholder="Đến" className="px-3 py-2 min-h-[44px] text-[14px] border rounded-lg w-full dark:bg-slate-700 dark:border-slate-600" value={filters.denNgaySinh} onChange={e => setFilters({...filters, denNgaySinh: e.target.value})} />
          </div>
        </div>
        <div className="mt-4 flex flex-col md:flex-row justify-between items-start md:items-center border-t dark:border-slate-700 pt-4 gap-4 md:gap-0">
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} className="bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 px-4 py-2 min-h-[44px] rounded-lg flex items-center gap-2 font-bold transition-colors w-full md:w-auto justify-center">
              <AlertTriangle size={18} /> Format Toàn bộ Dữ liệu
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2 bg-red-50 dark:bg-red-900/40 p-3 rounded-lg border border-red-200 dark:border-red-800 animate-fade-in w-full md:w-auto justify-center">
              <span className="text-[14px] font-bold text-red-600 dark:text-red-400">Gõ chữ XOA:</span>
              <input
                type="text"
                className="w-24 p-2 min-h-[44px] border rounded-lg border-red-300 dark:border-red-600 dark:bg-slate-700 text-center font-bold text-red-600 uppercase outline-none focus:ring-2 focus:ring-red-500"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value.toUpperCase())}
                placeholder="XOA"
              />
              <button onClick={executeDeleteAllData} className="bg-red-600 text-white px-4 py-2 min-h-[44px] rounded-lg font-bold hover:bg-red-700 shadow-sm text-[14px]">Xác nhận</button>
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }} className="bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200 px-4 py-2 min-h-[44px] rounded-lg font-bold hover:bg-slate-400 text-[14px]">Hủy</button>
            </div>
          )}
          
          <div className="flex gap-2 w-full md:w-auto justify-end">
            <div className="bg-slate-100 dark:bg-slate-700 p-1 rounded-lg flex mr-2">
               <button onClick={() => setViewMode('table')} className={`p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg ${viewMode==='table' ? 'bg-white dark:bg-slate-600 shadow-sm' : 'text-slate-400'}`} title="Dạng bảng"><List size={18}/></button>
               <button onClick={() => setViewMode('grid')} className={`p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg ${viewMode==='grid' ? 'bg-white dark:bg-slate-600 shadow-sm' : 'text-slate-400'}`} title="Dạng thẻ Danh bạ"><Grid size={18}/></button>
            </div>
            <button onClick={exportToExcel} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 min-h-[44px] rounded-lg flex items-center justify-center gap-2 font-bold transition-colors shadow-lg shadow-emerald-600/30 flex-1 md:flex-none">
              <FileDown size={18} /> Xuất Excel
            </button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 p-4 rounded-xl text-[14px] font-medium flex flex-col sm:flex-row justify-between items-center border border-blue-100 dark:border-blue-800 shadow-sm gap-2 text-center sm:text-left">
         <div className="flex items-center gap-2"><Info size={18}/><span>Kết quả lọc hiện tại:</span></div>
         <div>
            Tìm thấy <strong className="text-lg bg-white dark:bg-slate-800 px-2 py-0.5 rounded shadow-sm mx-1">{safeRender(uniqueGridData.length)}</strong> đối tượng / 
            <strong className="text-lg bg-white dark:bg-slate-800 px-2 py-0.5 rounded shadow-sm mx-1">{safeRender(flattenedData.length)}</strong> lượt diện hồ sơ đúng chuẩn.
         </div>
      </div>

      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border dark:border-slate-700 overflow-x-auto w-full relative">
          <table id="main-list" className="w-full text-[14px] text-left whitespace-nowrap min-w-[900px]">
            <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 uppercase text-[12px] tracking-wider">
              <tr><th className="p-3 min-w-[200px]">Họ tên</th><th className="p-3">Số CCCD</th><th className="p-3 min-w-[100px]">Ngày sinh</th><th className="p-3 min-w-[250px]">Diện QL & Trạng thái</th><th className="p-3 min-w-[120px]">Khu phố</th><th className="p-3 min-w-[120px]">CSKV</th><th className="print:hidden text-center p-3 sticky right-0 bg-slate-50 dark:bg-slate-700 z-10 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)]">Thao tác</th></tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-700">
              {flattenedData.map((item, idx) => (
                <tr key={`${item.id}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="p-3 font-bold flex items-center gap-2 whitespace-nowrap">
                    {item.avatar ? <img src={item.avatar} className="w-8 h-8 rounded-full object-cover border shrink-0" alt="" /> : <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center shrink-0"><UserPlus size={14} className="text-slate-400"/></div>}
                    {safeRender(item.hoTen)}
                  </td>
                  <td className="p-3 font-mono">{safeRender(item.cccd)}</td>
                  <td className="p-3">{safeRender(item.ngaySinh)}</td>
                  <td className="p-3">
                    <span className="bg-blue-50 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-[13px] block mb-1 font-semibold border dark:border-blue-800 whitespace-nowrap overflow-hidden text-ellipsis max-w-[250px]" title={item._displayDien}>{safeRender(item._displayDien)}</span>
                    <div className="flex gap-2 items-center mt-1">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full inline-block font-bold uppercase tracking-wide ${item._dienStatus === 'Đang quản lý' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                        {safeRender(item._dienStatus)}
                      </span>
                      {item.tasks && item.tasks.filter(t=>!t.hoanThanh).length > 0 && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full inline-flex items-center gap-1 font-bold uppercase tracking-wide bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                          <Briefcase size={10}/> {item.tasks.filter(t=>!t.hoanThanh).length} việc
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">{safeRender(item.khuPho)}</td>
                  <td className="p-3">{safeRender(getDisplayCskv(item.khuPho, item.canBoPhuTrach))}</td>
                  <td className="print:hidden p-3 sticky right-0 bg-white dark:bg-slate-800 shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.05)] z-10 group-hover:bg-slate-50 dark:group-hover:bg-slate-700/50">
                    <div className="flex gap-2 justify-center">
                      <button onClick={() => openTaskModal(item)} className="min-h-[40px] min-w-[40px] flex items-center justify-center text-purple-600 bg-purple-50 hover:bg-purple-600 hover:text-white rounded-lg dark:bg-purple-900/30 dark:hover:bg-purple-600 transition-colors tooltip relative" title="Giao việc / Nhắc việc"><ClipboardList size={18} /></button>
                      <button onClick={() => setQrModal(item)} className="min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 transition-colors" title="Mã QR"><QrCode size={18} /></button>
                      <button onClick={() => handleCopyReport(item)} className="min-h-[40px] min-w-[40px] flex items-center justify-center text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-lg dark:bg-teal-900/30 dark:hover:bg-teal-900/50 transition-colors" title="Copy báo cáo"><Copy size={18} /></button>
                      <button onClick={() => openForm(item)} className="min-h-[40px] min-w-[40px] flex items-center justify-center text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg dark:bg-blue-900/30 dark:hover:bg-blue-900/50 transition-colors" title="Sửa đối tượng"><Edit size={18} /></button>
                      <button onClick={() => handleDeleteDien(item.id, item._displayDien)} className="min-h-[40px] min-w-[40px] flex items-center justify-center text-orange-500 bg-orange-50 hover:bg-orange-100 rounded-lg dark:bg-orange-900/30 dark:hover:bg-orange-900/50 transition-colors" title="Gỡ diện này"><MinusCircle size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {uniqueGridData.map((item) => (
             <div key={item.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow relative group flex flex-col">
                <div className="p-5 flex gap-4">
                   <div className="w-16 h-20 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden border dark:border-slate-600 flex-shrink-0 relative">
                     {item.avatar ? <img src={item.avatar} className="w-full h-full object-cover" alt="" /> : <UserPlus className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-slate-300" size={32}/>}
                   </div>
                   <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 truncate">{safeRender(item.hoTen)}</h3>
                      <p className="text-[13px] font-mono text-slate-500 dark:text-slate-400 mb-1">{safeRender(item.cccd)}</p>
                      <p className="text-[13px] text-slate-600 dark:text-slate-300 truncate"><MapIcon size={12} className="inline mr-1 opacity-50"/>{safeRender(item.khuPho)}</p>
                      
                      {item.tasks && item.tasks.filter(t=>!t.hoanThanh).length > 0 && (
                        <p className="text-[13px] font-bold text-purple-600 dark:text-purple-400 mt-2 flex items-center gap-1"><Briefcase size={12}/> {item.tasks.filter(t=>!t.hoanThanh).length} việc đang chờ</p>
                      )}
                   </div>
                </div>
                <div className="px-5 pb-4 space-y-2 flex-1">
                   {item.danhSachDien?.slice(0,2).map((d, i) => {
                      const t = typeof d === 'string' ? d : d.ten;
                      const tt = typeof d === 'string' ? item.trangThaiQL : d.trangThai;
                      return (
                        <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-2 rounded text-[12px] border dark:border-slate-700">
                           <span className="truncate flex-1 font-medium mr-2">{safeRender(t)}</span>
                           <span className={`w-2 h-2 rounded-full shrink-0 ${tt === 'Đang quản lý' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        </div>
                      )
                   })}
                   {item.danhSachDien?.length > 2 && <p className="text-[13px] text-center text-blue-500 italic font-semibold">+ {item.danhSachDien.length - 2} diện khác</p>}
                </div>
                <div className="flex flex-wrap justify-center gap-2 border-t dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-800/50 mt-auto">
                   <button onClick={() => openTaskModal(item)} className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-lg transition-colors" title="Giao việc"><ClipboardList size={18} /></button>
                   <button onClick={() => setQrModal(item)} className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center bg-slate-200 hover:bg-slate-300 text-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 rounded-lg transition-colors" title="Mã QR"><QrCode size={18} /></button>
                   <button onClick={() => handleCopyReport(item)} className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center bg-teal-100 hover:bg-teal-200 text-teal-600 rounded-lg transition-colors" title="Copy báo cáo"><Copy size={18} /></button>
                   <button onClick={() => openForm(item)} className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors" title="Sửa"><Edit size={18} /></button>
                   <button onClick={() => handleDeleteToanBo(item.id)} className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors" title="Xóa vào thùng rác"><Trash size={18} /></button>
                </div>
             </div>
          ))}
        </div>
      )}

      {/* QR Modal */}
      {qrModal && (
         <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-2xl relative max-w-sm w-full text-center border border-slate-200 dark:border-slate-700">
               <button onClick={() => setQrModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center"><X size={24}/></button>
               <h3 className="text-xl font-bold mb-1">{safeRender(qrModal.hoTen)}</h3>
               <p className="font-mono text-[14px] text-slate-500 mb-6">{safeRender(qrModal.cccd)}</p>
               
               <div className="bg-white p-4 rounded-2xl inline-block shadow-inner border border-slate-200">
                 <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`CCCD: ${qrModal.cccd}\nHọ tên: ${qrModal.hoTen}\nDiện QL: ${qrModal.danhSachDien?.filter(d => (typeof d === 'string' ? qrModal.trangThaiQL : d.trangThai) === 'Đang quản lý').map(d => typeof d === 'string' ? d : d.ten).join(', ') || 'Không có diện Đang QL'}`)}`} alt="QR Code" className="w-48 h-48 md:w-56 md:h-56" />
               </div>
               
               <p className="mt-6 text-[14px] text-slate-600 dark:text-slate-300">Quét mã này để tra cứu nhanh thông tin đối tượng (Tên, CCCD, Các diện đang quản lý).</p>
            </div>
         </div>
      )}
    </div>
  );
}

// ==================== IMPORT NÂNG CAO ====================
function ImportView({ data, setData, notify, cskvMapping }) {
  const [importMode, setImportMode] = useState('tonghop');
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

      if (importMode === 'thoihan' || importMode === 'trangthai') {
         const headers = rows[0].map(h => h.toLowerCase().trim());
         const idxCCCD = headers.findIndex(h => h.includes('cccd') || h.includes('cmnd'));
         const idxTen = headers.findIndex(h => h.includes('họ và tên') || h.includes('họ tên'));
         
         const idxNgayVao = headers.findIndex(h => h.includes('ngày đưa vào diện'));
         const idxThoiHan = headers.findIndex(h => h.includes('thời hạn quản lý'));
         
         const idxDien = headers.findIndex(h => h.includes('diện đối tượng'));
         const idxTrangThai = headers.findIndex(h => h.includes('trạng thái') && !h.includes('phần mềm'));
         const idxKhuPho = headers.findIndex(h => h.includes('khu phố') || h.includes('địa bàn'));

         if (idxCCCD === -1) return notify("Không tìm thấy cột CCCD trong file", "error");

         const parsedNew = [];
         const updateMap = new Map(); 

         for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || !row[idxCCCD]) continue;
            
            const cccd = formatCCCD(row[idxCCCD]);
            const ten = idxTen !== -1 ? (row[idxTen] || '').trim() : 'Chưa rõ tên';
            const khuPho = idxKhuPho !== -1 ? (row[idxKhuPho] || '').replace('#N/A', '').trim() : '';
            
            const dbRecord = data.find(d => String(d.cccd).trim() === cccd);
            
            if (!dbRecord && importMode === 'trangthai') {
                const dien = idxDien !== -1 ? (row[idxDien] || '').trim() : '';
                const trangThai = idxTrangThai !== -1 ? (row[idxTrangThai] || 'Đang quản lý').trim() : 'Đang quản lý';
                const ngayVao = idxNgayVao !== -1 ? (row[idxNgayVao] || '').trim() : '';
                
                if (cccd && dien) {
                   const existingNew = parsedNew.find(n => n.cccd === cccd);
                   if (existingNew) {
                       existingNew.danhSachDien.push({ ten: dien, trangThai, ngayDuaVao: ngayVao });
                       existingNew.trangThaiQL = existingNew.danhSachDien.some(d => d.trangThai === 'Đang quản lý') ? 'Đang quản lý' : 'Đã kết thúc';
                   } else {
                       parsedNew.push({
                          id: generateId(), cccd, hoTen: ten, khuPho: khuPho, canBoPhuTrach: getCskv(khuPho),
                          danhSachDien: [{ ten: dien, trangThai, ngayDuaVao: ngayVao }],
                          trangThaiQL: trangThai === 'Đang quản lý' ? 'Đang quản lý' : 'Đã kết thúc',
                          selected: true, tasks: []
                       });
                   }
                }
                continue;
            }

            if (!dbRecord) continue; 

            const oldRecord = updateMap.has(cccd) ? updateMap.get(cccd).oldRecord : dbRecord;
            const currentObj = updateMap.has(cccd) ? updateMap.get(cccd).newRecord : JSON.parse(JSON.stringify(dbRecord));
            const changes = updateMap.has(cccd) ? updateMap.get(cccd).changes : [];
            
            const updatedObj = { 
               ...currentObj, 
               danhSachDien: (currentObj.danhSachDien || []).map(d => typeof d === 'string' ? { ten: d, trangThai: 'Đang quản lý', ngayDuaVao: '' } : { ...d }) 
            };

            if (importMode === 'thoihan') {
               const ngayVaoMoi = idxNgayVao !== -1 ? (row[idxNgayVao] || '').replace('#N/A', '').trim() : '';
               const thoiHanMoi = idxThoiHan !== -1 ? (row[idxThoiHan] || '').replace('#N/A', '').trim() : '';
               
               if (ngayVaoMoi && updatedObj.danhSachDien?.length > 0) {
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
                  let matchIdx = updatedObj.danhSachDien.findIndex(d => d.ten === dien && d.ngayDuaVao === ngayVao && !d._matched);
                  if (matchIdx === -1) {
                     matchIdx = updatedObj.danhSachDien.findIndex(d => d.ten === dien && !d._matched);
                  }

                  if (matchIdx !== -1) {
                     const oldStatus = updatedObj.danhSachDien[matchIdx].trangThai;
                     if (oldStatus !== trangThai) {
                        changes.push({ field: `Cập nhật Trạng thái`, oldVal: oldStatus, newVal: trangThai, description: `${dien.substring(0,35)}...` });
                     }
                     updatedObj.danhSachDien[matchIdx].trangThai = trangThai;
                     if (ngayVao && !updatedObj.danhSachDien[matchIdx].ngayDuaVao) {
                        updatedObj.danhSachDien[matchIdx].ngayDuaVao = ngayVao;
                     }
                     updatedObj.danhSachDien[matchIdx]._matched = true; 
                  } else {
                     updatedObj.danhSachDien.push({ ten: dien, trangThai, ngayDuaVao: ngayVao, _matched: true });
                     changes.push({ field: 'Phát sinh Diện mới', oldVal: '---', newVal: `${dien.substring(0, 25)}... (${trangThai})` });
                  }
                  
                  updatedObj.trangThaiQL = updatedObj.danhSachDien.some(d => d.trangThai === 'Đang quản lý') ? 'Đang quản lý' : 'Đã kết thúc';
               }
            }

            if (changes.length > 0 || updateMap.has(cccd)) {
               updateMap.set(cccd, { oldRecord, newRecord: updatedObj, changes, selected: true });
            }
         }
         
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
                donViQuanLy: rawDonVi, trangThaiQL: dienStatus, canBoPhuTrach: getCskv(rawKhuPho), gioiTinh: 'Nam', tienAnTienSu: [], tasks: []
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
                   updatedData[index] = u.newRecord;
                } else {
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
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border dark:border-slate-700 p-4 md:p-8 max-w-6xl mx-auto flex flex-col md:h-[85vh]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3"><Database size={28} className="text-blue-600"/> Đồng Bộ & Cập Nhật Dữ Liệu</h2>
      </div>
      {!fileData ? (
        <div className="space-y-6">
           <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-center flex flex-col justify-center">
                 <Upload size={48} className="mx-auto text-slate-400 mb-4" />
                 <h3 className="font-bold text-lg mb-2">Tải lên file Excel (CSV)</h3>
                 <p className="text-[14px] text-slate-500 mb-4 px-4">Hỗ trợ cập nhật: Danh sách đối tượng tổng hợp, Cập nhật thời hạn quản lý, Cập nhật trạng thái diện.</p>
                 <input type="file" id="csv-upload" accept=".csv" onChange={handleFileUpload} className="hidden" />
                 <label htmlFor="csv-upload" className="cursor-pointer px-6 py-3 min-h-[44px] bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-transform active:scale-95 inline-flex items-center justify-center mx-auto">Chọn File CSV từ máy</label>
              </div>
              <div className="flex-1 space-y-4">
                 <label className="font-bold text-lg block border-b dark:border-slate-700 pb-2">Chế độ Import:</label>
                 <select className="w-full px-4 py-3 min-h-[44px] border rounded-xl dark:bg-slate-700 dark:border-slate-600 bg-white font-medium shadow-sm outline-none focus:ring-2 focus:ring-blue-500 text-[14px]" value={importMode} onChange={e => setImportMode(e.target.value)}>
                    <option value="tonghop">1. Tổng hợp (Thêm mới, Cập nhật TT chung)</option>
                    <option value="thoihan">2. Cập nhật Thời Hạn Quản Lý (Theo CCCD)</option>
                    <option value="trangthai">3. Cập nhật Trạng thái diện (Quét tự động sinh hồ sơ)</option>
                 </select>
                 <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-[14px] border border-blue-100 dark:border-blue-800 text-blue-800 dark:text-blue-200">
                    <Info size={16} className="inline mr-1 mb-1"/> <strong>Ghi chú (Tính năng mới):</strong> Chọn chế độ 3, phần mềm sẽ tự động dò CCCD, cập nhật diện, nếu CCCD chưa có trên hệ thống sẽ <strong>Tự động sinh hồ sơ mới</strong>.
                 </div>
              </div>
           </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in flex-1 overflow-hidden flex flex-col min-h-0">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl border border-blue-100 dark:border-blue-800 gap-4 shrink-0">
              <div className="w-full md:w-auto">
                 <p className="font-bold text-blue-800 dark:text-blue-200 break-all text-[14px]">File: {fileName}</p>
                 <p className="text-[13px] text-blue-600 dark:text-blue-300 font-semibold mt-1">Tìm thấy: {newRecords.length} mới, {updateRecords.length} cập nhật, {removedRecords.length} xử lý cũ.</p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                 <button onClick={() => { setFileData(false); setNewRecords([]); setUpdateRecords([]); setRemovedRecords([]); setFileName(''); document.getElementById('csv-upload').value = ""; }} className="flex-1 md:flex-none px-4 py-2 min-h-[44px] border border-blue-200 text-blue-700 rounded-lg font-bold hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/50">Hủy</button>
                 <button onClick={applyData} className="flex-1 md:flex-none px-6 py-2 min-h-[44px] bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex justify-center items-center gap-2 shadow-lg shadow-blue-600/30"><Save size={18}/> Áp dụng</button>
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto space-y-6 min-h-0 custom-scrollbar pr-2 w-full">
             {/* Bảng New Records */}
             {newRecords.length > 0 && (
               <div className="border dark:border-slate-700 rounded-xl overflow-hidden shrink-0 w-full overflow-x-auto">
                  <div className="bg-emerald-50 dark:bg-emerald-900/30 p-3 font-bold border-b dark:border-slate-700 text-emerald-700 dark:text-emerald-400 sticky top-0 z-10">Thêm mới ({newRecords.length})</div>
                  <table className="w-full text-[14px] text-left whitespace-nowrap min-w-[600px] bg-white dark:bg-slate-800">
                     <thead className="bg-slate-100 dark:bg-slate-700"><tr><th className="p-2 text-center w-12">Chọn</th><th className="p-2">Họ tên</th><th className="p-2">CCCD</th><th className="p-2">Khu phố</th><th className="p-2 w-1/2">Diện</th></tr></thead>
                     <tbody className="divide-y dark:divide-slate-700">
                        {newRecords.map((r, i) => (
                           <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                              <td className="p-2 text-center"><input type="checkbox" checked={r.selected} onChange={e => { const arr = [...newRecords]; arr[i].selected = e.target.checked; setNewRecords(arr); }} className="w-5 h-5 rounded" /></td>
                              <td className="p-2 font-bold text-emerald-700 dark:text-emerald-400">{safeRender(r.hoTen)}</td><td className="p-2 font-mono">{safeRender(r.cccd)}</td>
                              <td className="p-2">{safeRender(r.khuPho)}</td>
                              <td className="p-2 text-[13px] whitespace-normal min-w-[200px]">{r.danhSachDien?.map(d => typeof d === 'string' ? d : d.ten).join(', ')}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
             )}
             
             {/* Bảng Update Records */}
             {updateRecords.length > 0 && (
               <div className="border dark:border-slate-700 rounded-xl overflow-hidden shrink-0 w-full overflow-x-auto">
                  <div className="bg-blue-50 dark:bg-blue-900/30 p-3 font-bold border-b dark:border-slate-700 text-blue-700 dark:text-blue-400 sticky top-0 z-10">Cập nhật ({updateRecords.length})</div>
                  <table className="w-full text-[14px] text-left min-w-[600px] whitespace-nowrap bg-white dark:bg-slate-800">
                     <thead className="bg-slate-100 dark:bg-slate-700"><tr><th className="p-2 text-center w-12">Chọn</th><th className="p-2 w-48 min-w-[150px]">Họ tên / CCCD</th><th className="p-2 min-w-[300px]">Nội dung cập nhật</th></tr></thead>
                     <tbody className="divide-y dark:divide-slate-700">
                        {updateRecords.map((r, i) => (
                           <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                              <td className="p-2 text-center align-top"><input type="checkbox" checked={r.selected} onChange={e => { const arr = [...updateRecords]; arr[i].selected = e.target.checked; setUpdateRecords(arr); }} className="w-5 h-5 rounded mt-2" /></td>
                              <td className="p-2 align-top">
                                 <div className="font-bold text-blue-700 dark:text-blue-400">{safeRender(r.newRecord.hoTen)}</div>
                                 <div className="font-mono text-[13px] text-slate-500 mt-1">{safeRender(r.newRecord.cccd)}</div>
                              </td>
                              <td className="p-2 align-top whitespace-normal">
                                 {r.changes.map((c, idx) => (
                                    <div key={idx} className="text-[13px] mb-2 bg-slate-50 dark:bg-slate-900/50 p-2 rounded border dark:border-slate-700">
                                       <span className="font-bold text-slate-700 dark:text-slate-300">{c.field}:</span> <br className="sm:hidden"/> <span className="line-through text-slate-400 ml-0 sm:ml-1">{safeRender(c.oldVal)}</span> <span className="text-blue-500 mx-1">➜</span> <span className="text-emerald-600 font-bold">{safeRender(c.newVal)}</span>
                                       {c.description && <div className="text-slate-500 italic text-[12px] mt-1">{safeRender(c.description)}</div>}
                                    </div>
                                 ))}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
             )}
           </div>
        </div>
      )}
    </div>
  );
}

// ==================== CÔNG CỤ ĐỐI CHIẾU HÀNG LOẠT (NÂNG CẤP KHẮT KHE) ====================
function CompareView({ data, setData, notify }) {
  const [activeSubTab, setActiveSubTab] = useState('compare');
  
  const [inputText, setInputText] = useState('');
  const [targetDienType, setTargetDienType] = useState('PL1');
  const [customKeyword, setCustomKeyword] = useState('');
  const [result, setResult] = useState(null);
  const [dbMatchCount, setDbMatchCount] = useState(0);
  const [missingFromPasted, setMissingFromPasted] = useState([]);

  const [updateCCCDs, setUpdateCCCDs] = useState('');
  const [updateField, setUpdateField] = useState('choOHienNay');
  const [updateType, setUpdateType] = useState('text'); 
  
  const [updateTextValue, setUpdateTextValue] = useState('');
  const [updateDienName, setUpdateDienName] = useState(DIEN_DOI_TUONG_LIST[0]);
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
    
    // Yêu cầu: Nếu có nhiều diện trùng loại (vd 2 cái methadone), 
    // nếu có ít nhất 1 cái "Đang quản lý" thì ưu tiên lấy "Đang quản lý".
    const hasActive = matched.some(d => (typeof d === 'string' ? record.trangThaiQL : d.trangThai) === 'Đang quản lý');
    const status = hasActive ? 'Đang quản lý' : 'Đã kết thúc';
    
    return { dienList: mappedMatched.join('; '), status };
  };

  const handleRunCompare = () => {
    if (!inputText.trim()) return notify("Vui lòng dán danh sách CCCD!", "error");
    const cccdArrayRaw = inputText.split('\n').map(s => formatCCCD(s)).filter(s => s.length === 12);
    const cccdArray = [...new Set(cccdArrayRaw)];
    
    // Lấy tất cả hồ sơ đang active trên hệ thống CÓ CHỨA diện yêu cầu.
    const activeInDbRecords = data.filter(d => !d.deletedAt && d.danhSachDien?.some(dienObj => {
           const ten = typeof dienObj === 'string' ? dienObj : dienObj.ten;
           const tt = typeof dienObj === 'string' ? d.trangThaiQL : dienObj.trangThai;
           return tt === 'Đang quản lý' && isDienMatch(ten, targetDienType, customKeyword);
       })
    );
    
    setDbMatchCount(activeInDbRecords.length);

    // Tìm những người CÓ trên PM (đang quản lý diện đó) nhưng bị THIẾU trong danh sách CCCD dán vào.
    const missing = activeInDbRecords.filter(dbRecord => !cccdArray.includes(String(dbRecord.cccd).trim()));
    setMissingFromPasted(missing);

    const compareResults = cccdArray.map(cccdInput => {
      let found = data.find(d => String(d.cccd).trim() === cccdInput && !d.deletedAt);
      if (!found) {
        const candidates = data.filter(d => d.trangThaiQL === 'Đang quản lý' && !d.deletedAt);
        for (let cand of candidates) {
          if (levenshteinDistance(cand.cccd, cccdInput) <= 2) { found = cand; break; }
        }
      }
      
      if (!found) return { 
         cccd: cccdInput, hoTen: '---', khuPho: '---', 
         status: 'Không có trong hệ thống', isHopLe: false, 
         matchedDien: '', dienStatus: '' 
      };
      
      const { dienList, status: dienStatus } = getMatchDienDisplay(found, targetDienType, customKeyword);
      const isMatchDien = dienList !== '';
      
      let finalStatus = 'Sai diện';
      let isHopLe = false;

      if (isMatchDien) {
         if (dienStatus === 'Đang quản lý') {
            finalStatus = 'Hợp lệ';
            isHopLe = true;
         } else {
            // Yêu cầu: Diện tìm thấy nhưng chỉ có "Đã kết thúc" -> Báo lệch (không hợp lệ)
            finalStatus = 'Diện đã kết thúc';
         }
      }
      
      return { 
         cccd: cccdInput, hoTen: found.hoTen, khuPho: found.khuPho || 'Chưa ĐK',
         status: finalStatus, isHopLe, matchedDien: dienList, dienStatus, 
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
    const cccdArray = [...new Set(cccdArrayRaw)]; 
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
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border dark:border-slate-700 p-4 md:p-8 max-w-6xl mx-auto flex flex-col md:h-[85vh]">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 shrink-0 gap-4 md:gap-0">
         <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3"><CheckSquare size={28} className="text-emerald-600"/> Xử lý dữ liệu Hàng loạt</h2>
         <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl w-full md:w-auto overflow-x-auto shrink-0">
            <button onClick={() => setActiveSubTab('compare')} className={`flex-1 md:flex-none px-4 md:px-6 py-2 min-h-[44px] rounded-lg font-bold text-[14px] transition-colors whitespace-nowrap ${activeSubTab === 'compare' ? 'bg-white dark:bg-slate-800 shadow text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}>1. Đối chiếu CCCD</button>
            <button onClick={() => setActiveSubTab('update')} className={`flex-1 md:flex-none px-4 md:px-6 py-2 min-h-[44px] rounded-lg font-bold text-[14px] transition-colors whitespace-nowrap ${activeSubTab === 'update' ? 'bg-white dark:bg-slate-800 shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>2. Cập nhật Hàng loạt</button>
         </div>
      </div>

      {activeSubTab === 'compare' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 flex-1 overflow-hidden min-h-0">
          <div className="lg:col-span-1 flex flex-col h-full space-y-4 min-h-0">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl text-[14px] border border-emerald-100 dark:border-emerald-800 shrink-0 hidden md:block">
              <strong>HƯỚNG DẪN:</strong> Dán hàng trăm CCCD, chọn diện yêu cầu. Công cụ sẽ xuất báo cáo đối tượng nào Hợp lệ và đối tượng Lỗi (Bao gồm báo Lệch Số nếu bị thiếu).
            </div>
            <div className="flex flex-col shrink-0">
              <label className="font-bold mb-2 text-[14px] md:text-[15px]">Chọn diện yêu cầu:</label>
              <select value={targetDienType} onChange={e => setTargetDienType(e.target.value)} className="px-4 py-3 min-h-[44px] border rounded-xl dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-emerald-700 dark:text-emerald-400 text-[14px]">
                <option value="PL1">PL1 - Sử dụng trái phép</option>
                <option value="PL2">PL2 - Methadone</option>
                <option value="PL3">PL3 - Sau cai</option>
                <option value="custom">Khác (nhập từ khóa)</option>
              </select>
            </div>
            {targetDienType === 'custom' && (
              <div className="flex flex-col animate-fade-in shrink-0">
                <label className="font-bold mb-2 text-[14px]">Từ khóa diện:</label>
                <input type="text" value={customKeyword} onChange={e => setCustomKeyword(e.target.value)} placeholder="VD: Cai nghiện tự nguyện" className="px-4 py-3 min-h-[44px] text-[14px] border rounded-xl dark:bg-slate-700 dark:border-slate-600" />
              </div>
            )}
            <div className="flex flex-col flex-1 min-h-[150px]">
              <label className="font-bold mb-2 text-[14px] shrink-0">Dán danh sách CCCD:</label>
              <textarea value={inputText} onChange={e => setInputText(e.target.value)} placeholder="079...&#10;049..." className="p-3 border rounded-xl flex-1 resize-none overflow-y-auto font-mono text-[14px] dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-emerald-500 custom-scrollbar w-full"></textarea>
            </div>
            <button onClick={handleRunCompare} className="w-full py-4 min-h-[44px] bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 text-[16px] shrink-0 transition-transform active:scale-95">Đối Chiếu Khắt Khe</button>
          </div>
          
          <div className="lg:col-span-2 flex flex-col h-full lg:border-l border-slate-200 dark:border-slate-700 lg:pl-8 min-h-0 pt-6 lg:pt-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 shrink-0 gap-4 md:gap-0">
              <div className="w-full md:w-auto">
                 <h3 className="font-bold text-[16px] mb-2">Báo Cáo Đối Chiếu</h3>
                 {result && (
                    <div className="text-[14px] bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 p-3 rounded-lg border border-blue-100 dark:border-blue-800 inline-block w-full md:w-auto">
                       SL CCCD dán vào: <strong className="text-lg">{[...new Set(inputText.split('\n').map(s => formatCCCD(s)).filter(s => s.length === 12))].length}</strong> | 
                       Hệ thống đang QL: <strong className="text-lg">{dbMatchCount}</strong> 
                       <br className="md:hidden" />
                       {missingFromPasted.length > 0 ? (
                          <span className="md:ml-2 text-red-600 font-bold bg-red-100 dark:bg-red-900/50 px-2 py-0.5 rounded inline-block mt-2 md:mt-0">Lệch (Thiếu {missingFromPasted.length} hs)!</span>
                       ) : (
                          <span className="md:ml-2 text-emerald-600 font-bold bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded inline-block mt-2 md:mt-0">Đã đủ số lượng <Check size={16} className="inline"/></span>
                       )}
                    </div>
                 )}
              </div>
              {result && <button onClick={() => exportTableToExcel('compare-table', 'Bao_Cao_Doi_Chieu_CCCD')} className="text-[14px] px-4 py-3 min-h-[44px] bg-slate-800 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-slate-900 w-full md:w-auto"><FileDown size={16}/> Xuất Excel</button>}
            </div>
            
            {result && missingFromPasted.length > 0 && (
               <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl shrink-0 flex flex-col max-h-[30%]">
                  <p className="font-bold text-red-600 text-[14px] mb-2 shrink-0"><AlertTriangle size={16} className="inline mr-1"/> Đối tượng có trên PM nhưng BỊ THIẾU trong file:</p>
                  <div className="overflow-y-auto custom-scrollbar text-[13px] flex-1 min-h-0 bg-white/50 dark:bg-slate-900/50 rounded p-2 border border-red-100 dark:border-red-900/30">
                     <ul className="list-disc pl-5 text-red-800 dark:text-red-300">
                        {missingFromPasted.map(m => (
                           <li key={m.id}><strong>{safeRender(m.cccd)}</strong> - {safeRender(m.hoTen)} <span className="opacity-70">({safeRender(m.khuPho)})</span></li>
                        ))}
                     </ul>
                  </div>
               </div>
            )}

            <div className="flex-1 w-full overflow-x-auto border dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 min-h-[200px] relative">
              {!result ? <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-medium">Chưa có kết quả đối chiếu</div> : (
                <table id="compare-table" className="w-full text-[14px] text-left whitespace-nowrap bg-white dark:bg-slate-800 min-w-[600px]">
                  <thead className="bg-slate-100 dark:bg-slate-700 sticky top-0 shadow-sm z-10">
                    <tr><th className="p-3 min-w-[120px]">CCCD Nhập</th><th className="p-3 min-w-[150px]">Thông tin</th><th className="p-3 min-w-[120px] text-center">Tình trạng</th><th className="p-3 min-w-[150px]">Ghi chú PM</th></tr>
                  </thead>
                  <tbody className="divide-y dark:divide-slate-700 whitespace-normal">
                    {result.map((r, i) => (
                      <tr key={i} className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 ${!r.isHopLe ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                        <td className="p-3 font-mono">
                           {safeRender(r.cccd)}
                           {r.cccdDung && <><br/><span className="text-orange-600 text-[12px] mt-1 block">DB: {safeRender(r.cccdDung)}</span></>}
                        </td>
                        <td className="p-3">
                           <div className="font-bold">{safeRender(r.hoTen)}</div>
                           <div className="text-[13px] text-slate-500 mt-1 flex items-center gap-1"><MapIcon size={12}/> {safeRender(r.khuPho)}</div>
                           {r.cccdDung && <span className="block text-orange-600 text-[12px] font-normal italic mt-1 leading-tight">⚠️ Có thể sai số CCCD</span>}
                        </td>
                        <td className="p-3 font-bold text-center">
                          {r.isHopLe ? <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg border border-emerald-200 inline-block min-w-[100px]">Hợp lệ</span> : 
                           <span className="text-rose-600 bg-rose-50 dark:bg-rose-900/30 px-3 py-1.5 rounded-lg border border-rose-200 inline-block min-w-[100px] whitespace-nowrap">{r.status}</span>}
                        </td>
                        <td className="p-3 text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
                           {r.matchedDien ? (
                              <span>
                                 {r.matchedDien.includes('(Trùng') ? 
                                    <span className="text-red-600 font-bold">{safeRender(r.matchedDien)}</span> : 
                                    safeRender(r.matchedDien)
                                 }
                              </span>
                           ) : <span className="italic">Không tìm thấy diện này</span>}
                           {r.dienStatus === 'Đã kết thúc' && <span className="block text-red-500 font-bold mt-1 bg-red-50 dark:bg-red-900/20 px-1 py-0.5 rounded inline-block">(Đã kết thúc)</span>}
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 overflow-hidden min-h-0">
           {/* Cột 1 */}
           <div className="flex flex-col h-[200px] lg:h-full bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border dark:border-slate-700 min-h-0 shrink-0 lg:shrink">
              <label className="font-bold mb-2 text-slate-700 dark:text-slate-300 text-[14px] shrink-0">1. Dán CCCD:</label>
              <textarea value={updateCCCDs} onChange={e => setUpdateCCCDs(e.target.value)} placeholder="079...&#10;049..." className="p-3 min-h-[80px] border rounded-xl flex-1 resize-none overflow-y-auto font-mono text-[14px] dark:bg-slate-800 dark:border-slate-600 outline-none focus:ring-2 focus:ring-blue-500 custom-scrollbar w-full"></textarea>
           </div>
           
           {/* Cột 2 */}
           <div className="flex flex-col bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border dark:border-slate-700 shrink-0">
              <label className="font-bold mb-2 text-slate-700 dark:text-slate-300 text-[14px]">2. Chọn Mục cập nhật:</label>
              <select value={updateField} onChange={handleFieldChange} className="px-4 py-3 min-h-[44px] text-[14px] border rounded-xl dark:bg-slate-800 dark:border-slate-600 outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-blue-700 dark:text-blue-400">
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
              <div className="mt-4 text-[13px] text-slate-500 overflow-y-auto flex-1 min-h-[80px] bg-white/50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                 * <strong>Nội dung:</strong> Dữ liệu cũ sẽ bị ghi đè.<br/>
                 * <strong>Đánh dấu:</strong> Hệ thống tự tích chọn vào hồ sơ.<br/>
                 * <strong>Bổ sung Diện:</strong> Tự tạo mới diện hoặc cập nhật ngày/trạng thái nếu đã có.
              </div>
           </div>

           {/* Cột 3 & Cột Chạy */}
           <div className="lg:col-span-2 flex flex-col h-[400px] lg:h-full space-y-4 min-h-0">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border dark:border-slate-700 min-h-[160px] flex flex-col shrink-0">
                 <label className="font-bold mb-2 text-slate-700 dark:text-slate-300 text-[14px] shrink-0">3. Nhập Dữ liệu hàng loạt:</label>
                 
                 {updateType === 'mark' && (
                    <div className="flex-1 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-800 min-h-[80px]">
                       <p className="text-blue-600 font-semibold text-center px-4 text-[14px]">Tự động Check vào mục <br/>"{updateField}" cho tất cả CCCD</p>
                    </div>
                 )}

                 {updateType === 'text' && (
                    <textarea value={updateTextValue} onChange={e => setUpdateTextValue(e.target.value)} placeholder="Ví dụ: Số 9 đường ABC..." className="p-3 min-h-[80px] border rounded-xl flex-1 resize-none overflow-y-auto text-[14px] dark:bg-slate-800 dark:border-slate-600 outline-none focus:ring-2 focus:ring-blue-500 custom-scrollbar"></textarea>
                 )}

                 {updateType === 'dien' && (
                    <div className="flex flex-col gap-3 animate-fade-in flex-1 justify-center bg-white dark:bg-slate-800 p-4 rounded-xl border dark:border-slate-600 shadow-sm">
                       <div className="flex flex-col">
                          <label className="text-[13px] font-bold mb-1 text-blue-600">Tên diện cần thêm (Hoặc cập nhật):</label>
                          <input list="dien-list-suggestions" value={updateDienName} onChange={e => setUpdateDienName(e.target.value)} placeholder="Nhập tên diện..." className="px-3 py-2 min-h-[44px] border rounded-lg text-[14px] dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-blue-500" />
                          <datalist id="dien-list-suggestions">
                             {DIEN_DOI_TUONG_LIST.map(d => <option key={d} value={d} />)}
                          </datalist>
                       </div>
                       <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1 flex flex-col">
                             <label className="text-[13px] font-bold mb-1">Trạng thái:</label>
                             <select value={updateDienStatus} onChange={e => setUpdateDienStatus(e.target.value)} className="px-3 py-2 min-h-[44px] border rounded-lg text-[14px] dark:bg-slate-700 dark:border-slate-600 outline-none">
                                <option>Đang quản lý</option><option>Đã kết thúc</option>
                             </select>
                          </div>
                          <div className="flex-1 flex flex-col">
                             <label className="text-[13px] font-bold mb-1">Ngày đưa vào:</label>
                             <input type="text" placeholder="dd/mm/yyyy" value={updateDienDate} onChange={e => setUpdateDienDate(e.target.value)} className="px-3 py-2 min-h-[44px] border rounded-lg text-[14px] dark:bg-slate-700 dark:border-slate-600 outline-none" />
                          </div>
                       </div>
                    </div>
                 )}
              </div>
              <button onClick={handleRunUpdate} className="w-full py-4 min-h-[44px] bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/30 text-[16px] flex justify-center items-center gap-2 shrink-0 transition-transform active:scale-95"><Upload size={20}/> Chạy Cập Nhật Danh Sách</button>
              
              <div className="flex-1 border dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 flex flex-col min-h-[150px]">
                 <div className="bg-slate-100 dark:bg-slate-700 p-2 font-bold text-[14px] text-center border-b dark:border-slate-600 shrink-0">Lịch sử Xử lý {updateLog && `(${updateLog.length} lượt)`}</div>
                 <div className="flex-1 overflow-y-auto custom-scrollbar p-2 min-h-0">
                    {!updateLog ? <div className="h-full flex items-center justify-center text-slate-400 text-[14px]">Chưa có lịch sử chạy</div> : 
                       <ul className="space-y-2">
                          {updateLog.map((log, i) => (
                             <li key={i} className={`text-[13px] p-3 rounded-lg flex flex-col sm:flex-row justify-between gap-2 ${log.status === 'Không tìm thấy' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20'}`}>
                                <span className="font-mono truncate">{log.cccd} - <span className="font-bold">{log.hoTen}</span></span>
                                <span className="shrink-0 font-medium">{log.msg || log.status}</span>
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

  const handleFileSelect = (e) => {
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
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 md:p-8 max-w-4xl mx-auto border dark:border-slate-700">
      <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-3"><ImageIcon size={28} className="text-purple-600" /> Import Ảnh Hàng Loạt</h2>
      <div className="space-y-6">
        <div className="bg-purple-50 dark:bg-purple-900/20 p-5 rounded-xl border border-purple-100 dark:border-purple-800">
          <p className="font-semibold text-[14px] leading-relaxed text-purple-800 dark:text-purple-300">
             <Info size={18} className="inline mr-2 mb-1"/> 
             Hướng dẫn: Đặt tên file ảnh là <strong>số CCCD</strong> (ví dụ: <code className="bg-purple-100 dark:bg-purple-800 px-1 rounded">079079011091.jpg</code>). 
             Chọn tải lên tất cả ảnh cùng lúc, hệ thống sẽ tự động quét số thẻ và gán ảnh vào đúng hồ sơ tương ứng.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {/* Nút dành cho Desktop/PC */}
           <label className="border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-50 dark:hover:bg-slate-700/50 transition-colors bg-slate-50 dark:bg-slate-800/50">
             <ImageIcon size={48} className="text-purple-400 mb-4 drop-shadow-md" />
             <span className="text-lg font-bold text-slate-700 dark:text-slate-300 text-center mb-1">Chọn trên Máy tính</span>
             <span className="text-[13px] text-slate-500 text-center">(Hỗ trợ bôi đen quét nhiều ảnh)</span>
             <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
           </label>

           {/* Nút dành riêng cho Mobile/Điện thoại */}
           <label className="border-2 border-solid border-indigo-300 dark:border-indigo-600 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-indigo-50 dark:hover:bg-slate-700/50 transition-colors bg-indigo-50/50 dark:bg-slate-800/50">
             <Camera size={48} className="text-indigo-400 mb-4 drop-shadow-md" />
             <span className="text-lg font-bold text-slate-700 dark:text-slate-300 text-center mb-1">Chọn trên Điện thoại</span>
             <span className="text-[13px] text-slate-500 text-center">(Mở thư viện ảnh điện thoại)</span>
             {/* Note: Sử dụng capture="environment" hoặc bỏ trống để gọi native picker trên mobile */}
             <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
           </label>
        </div>

        {selectedFiles.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-100 dark:bg-slate-700 p-4 rounded-xl gap-4">
            <p className="font-bold text-[16px] text-slate-700 dark:text-slate-200">Đã chọn: <span className="text-blue-600 dark:text-blue-400">{safeRender(selectedFiles.length)}</span> ảnh</p>
            <button onClick={importImages} disabled={importing} className="w-full sm:w-auto px-8 py-3 min-h-[44px] bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 shadow-lg shadow-purple-600/30 transition-transform active:scale-95 flex items-center justify-center gap-2">
              {importing ? <><Activity className="animate-spin" size={20}/> Đang gán ảnh...</> : <><Upload size={20}/> Bắt đầu Nạp Ảnh</>}
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
    <div className="max-w-5xl mx-auto bg-white dark:bg-slate-800 p-4 md:p-8 rounded-2xl shadow border dark:border-slate-700">
      <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-3"><Settings className="text-blue-600"/> Cài Đặt CSKV Theo Khu Phố</h2>
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 md:p-5 rounded-xl mb-6 text-[14px] border border-blue-100 dark:border-blue-800">
        <h4 className="font-bold mb-2 flex items-center gap-2"><Info size={18}/> HƯỚNG DẪN:</h4>
        <p>Nhập danh sách phân công CSKV theo định dạng: <strong>[Tên Khu Phố] - [Tên CSKV]</strong>. Mỗi người 1 dòng.</p>
        <p className="mt-2 text-blue-700 dark:text-blue-400 font-semibold italic">* Khi bạn nhấn "Lưu Cài Đặt", hệ thống sẽ tự động quét và cập nhật lại CSKV cho toàn bộ các hồ sơ đã nhập từ trước.</p>
      </div>
      <div className="flex flex-col md:flex-row gap-6 h-[500px] md:h-[400px]">
        <div className="flex-1 flex flex-col h-full min-h-[200px]">
          <label className="font-bold mb-2 block shrink-0 text-[14px]">Dán danh sách vào đây:</label>
          <textarea className="w-full p-4 border rounded-xl font-mono text-[14px] dark:bg-slate-700 dark:border-slate-600 flex-1 resize-none custom-scrollbar outline-none focus:ring-2 focus:ring-blue-500" value={text} onChange={e => setText(e.target.value)} placeholder="Khu phố 1 - Đồng chí A&#10;Khu phố 2 - Đồng chí B" />
        </div>
        <div className="flex-1 flex flex-col h-full min-h-[200px]">
          <label className="font-bold mb-2 block shrink-0 text-[14px]">Bảng dữ liệu đã lưu:</label>
          <div className="w-full overflow-x-auto border dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 flex-1 custom-scrollbar">
            <table className="w-full text-[14px] text-left whitespace-nowrap bg-white dark:bg-slate-800 min-w-[300px]">
              <thead className="bg-slate-100 dark:bg-slate-700 sticky top-0"><tr><th className="p-3">Khu phố</th><th className="p-3">CSKV</th></tr></thead>
              <tbody className="divide-y dark:divide-slate-700">{Object.entries(cskvMapping).map(([k,v]) => <tr key={k} className="hover:bg-slate-50 dark:hover:bg-slate-700/50"><td className="p-3 font-semibold">{safeRender(k)}</td><td className="p-3">{safeRender(v)}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button onClick={handleSave} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 min-h-[44px] rounded-xl font-bold shadow-lg shadow-blue-600/30 transition-transform active:scale-95 flex justify-center items-center gap-2"><Save size={20} /> Lưu Cài Đặt</button>
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
    <div className="max-w-md mx-auto bg-white dark:bg-slate-800 p-6 md:p-10 rounded-3xl border dark:border-slate-700 shadow-2xl mt-10 md:mt-20">
      <div className="flex justify-center mb-8">
        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-600/40 text-white transform rotate-3"><Shield size={40} className="-rotate-3"/></div>
      </div>
      <h2 className="text-xl md:text-2xl font-black mb-8 text-center text-slate-800 dark:text-slate-100 uppercase tracking-widest">Cán Bộ Đăng Nhập</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
           <label className="block text-[14px] font-bold text-slate-600 dark:text-slate-400 mb-2">Vui lòng chọn Địa bàn / Khu phố phụ trách</label>
           <select className="w-full p-4 min-h-[44px] border rounded-xl dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-blue-500 font-semibold shadow-sm text-[14px]" value={selectedKp} onChange={e => setSelectedKp(e.target.value)} required>
             <option value="">-- Click để chọn --</option>
             {Object.entries(cskvMapping).map(([kp, name]) => <option key={kp} value={kp}>{safeRender(kp)} - {safeRender(name)}</option>)}
           </select>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-4 min-h-[44px] rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 text-[16px] active:scale-95"><LogIn size={20}/> Vào Hệ Thống</button>
      </form>
    </div>
  );
}

// ==================== BÁO CÁO THỐNG KÊ ====================
function ReportView({ data, handleCompleteTask }) {
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center print:hidden gap-4 mb-6">
        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3"><BarChart3 size={28} className="text-purple-600"/> Báo Cáo Thống Kê</h2>
        <button onClick={() => window.print()} className="w-full sm:w-auto px-5 py-3 min-h-[44px] bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-900 transition-transform active:scale-95 shadow-lg"><Printer size={18}/> In Báo Cáo / Xuất PDF</button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border dark:border-slate-700 overflow-hidden mb-6 print:hidden">
         <div className="p-4 md:p-6 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
               <ClipboardList size={24} />
            </div>
            <div>
               <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white">Bảng Theo Dõi Tiến Độ Công Việc</h3>
               <p className="text-[13px] md:text-[14px] text-slate-500">Quản lý các công việc đã giao cho đối tượng</p>
            </div>
         </div>
         <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-[14px] whitespace-nowrap min-w-[900px]">
               <thead className="bg-slate-100 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400">
                  <tr>
                     <th className="px-4 md:px-6 py-4 font-bold">Trạng thái</th>
                     <th className="px-4 md:px-6 py-4 font-bold">Đối tượng / CCCD</th>
                     <th className="px-4 md:px-6 py-4 font-bold">Nội dung việc</th>
                     <th className="px-4 md:px-6 py-4 font-bold">CSKV / Giám sát</th>
                     <th className="px-4 md:px-6 py-4 font-bold text-center">Thao tác</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 whitespace-normal">
                  {data.flatMap(record => 
                     (record.tasks || []).map(task => ({
                        ...task, 
                        recordId: record.id, 
                        recordName: record.hoTen, 
                        recordCCCD: record.cccd, 
                        recordKp: record.khuPho,
                        statusInfo: getTaskStatusInfo(task.ngayDenHan, task.hoanThanh)
                     }))
                  )
                  .sort((a, b) => a.statusInfo.priority - b.statusInfo.priority)
                  .map((task, idx) => (
                     <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                        <td className="px-4 md:px-6 py-4">
                           <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-[13px] font-bold border whitespace-nowrap ${task.statusInfo.color}`}>
                              {task.statusInfo.icon} {task.statusInfo.label}
                           </span>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                           <p className="font-bold text-slate-800 dark:text-white text-[15px]">{task.recordName}</p>
                           <p className="text-[13px] text-slate-500 font-mono mt-0.5">{task.recordCCCD} - {task.recordKp}</p>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                           <p className="font-medium whitespace-pre-wrap max-w-sm truncate" title={task.noiDung}>{task.noiDung}</p>
                           <p className="text-[13px] text-slate-500 mt-1">Hạn: <strong className="text-slate-700 dark:text-slate-300">{task.ngayDenHan ? new Date(task.ngayDenHan).toLocaleDateString('vi-VN') : '---'}</strong></p>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                           <p className="font-medium text-slate-700 dark:text-slate-300">{task.cskv || '---'}</p>
                           <p className="text-[13px] text-slate-500 mt-1">GS: {task.giamSat || '---'}</p>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-center">
                           {!task.hoanThanh ? (
                              <button 
                                 onClick={() => handleCompleteTask(task.recordId, task.id)}
                                 className="inline-flex min-h-[44px] items-center justify-center gap-1 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-500 hover:bg-emerald-500 hover:text-white rounded-lg transition-all text-[14px] font-bold shadow-sm dark:bg-slate-800"
                              >
                                 <Check size={16} /> Hoàn thành
                              </button>
                           ) : (
                              <span className="text-[13px] font-bold text-slate-400 flex items-center justify-center gap-1">
                                 <CheckCircle2 size={16}/> Đã xong
                              </span>
                           )}
                        </td>
                     </tr>
                  ))}
                  {data.flatMap(r => r.tasks || []).length === 0 && (
                     <tr><td colSpan="5" className="text-center py-10 text-slate-400 font-medium italic">Chưa có dữ liệu công việc nào được giao.</td></tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-6 print:block">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border dark:border-slate-700 overflow-hidden">
          <div className="p-4 md:p-6 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 text-center">
             <h3 className="font-bold text-lg md:text-xl uppercase tracking-wide text-slate-800 dark:text-slate-100">Mật độ Đối tượng theo Khu phố</h3>
             <p className="text-[13px] md:text-[14px] mt-1 text-slate-500 dark:text-slate-400 font-medium">Lưu ý: Chỉ đếm các hồ sơ đang quản lý (lọc trùng lặp)</p>
          </div>
          <div className="p-4 md:p-10">
             <ul className="space-y-6 max-w-4xl mx-auto">
               {sortedKp.length === 0 ? <p className="text-slate-400 italic text-center py-10">Chưa có dữ liệu</p> :
                 sortedKp.map(([kp, count], idx) => (
                   <li key={kp} className="group">
                     <div className="flex justify-between text-base mb-2 font-bold">
                       <span className="text-slate-700 dark:text-slate-200 group-hover:text-blue-600 transition-colors">{idx+1}. {safeRender(kp)}</span>
                       <span className={idx < 3 ? 'text-red-600 text-lg drop-shadow-sm' : 'text-blue-600'}>{count} hồ sơ</span>
                     </div>
                     <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-4 overflow-hidden shadow-inner">
                       <div className={`h-full rounded-full transition-all duration-1000 ease-out relative ${idx < 3 ? 'bg-gradient-to-r from-red-500 to-red-400' : 'bg-gradient-to-r from-blue-600 to-blue-400'}`} style={{width: `${Math.min((count/sortedKp[0][1])*100, 100)}%`}}>
                          <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
                       </div>
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
