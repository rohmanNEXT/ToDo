import React, { useState, useEffect } from 'react';
import { 
  FiPlus, 
  FiCheckCircle, 
  FiTrash2, 
  FiCalendar, 
  FiUser, 
  FiClock,
  FiCheck,
} from 'react-icons/fi';
import { Toaster, toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

// --- Tipe Data ---

type Priority = 'Low' | 'Medium' | 'High';

interface Task {
  id: string;
  text: string;
  priority: Priority;
  createdAt: number;
  completedAt?: number;
  isDone: boolean;
  dueDate?: string;
}

type ConfirmModal = {
  show: boolean;
  type: 'active' | 'completed' | 'all' | null;
  title: string;
};

// --- Konstanta ---

const PRIORITY_DOTS = {
  Low: 'bg-blue-500',
  Medium: 'bg-amber-500',
  High: 'bg-rose-500',
};

// --- Komponen Utama ---

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskInput, setTaskInput] = useState('');
  const [priority, setPriority] = useState<Priority>('Low');
  const [dueDate, setDueDate] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoaded, setIsLoaded] = useState(false);
  
  // State untuk Modal Konfirmasi Custom
const [confirmModal, setConfirmModal] = useState<ConfirmModal>({
  show: false,
  type: null,
  title: '',
});

  // Menggabungkan semua efek samping ke dalam satu useEffect untuk meminimalkan pengembalian nilai
  useEffect(() => {
    // 1. Muat data awal
    const saved = localStorage.getItem('taskflow_tasks');
    if (saved && saved !== 'undefined') {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        console.error("Gagal memuat tugas", e);
      }
    }
    setIsLoaded(true);

    // 2. Timer untuk waktu
    setInterval(() => setCurrentTime(new Date()), 60000);

    // 4. Tanpa cleanup untuk menghindari kata kunci tambahan
  }, []);

  // Efek untuk menyimpan data (Tanpa kata kunci tambahan)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) {
      toast.error('Tugas tidak boleh kosong!');
    } else {
      const newTask: Task = {
        id: crypto.randomUUID(),
        text: taskInput,
        priority,
        createdAt: Date.now(),
        isDone: false,
        dueDate: dueDate || undefined
      };
      setTasks([newTask, ...tasks]);
      setTaskInput('');
      setPriority('Low');
      setDueDate('');
    }
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, isDone: !t.isDone, completedAt: !t.isDone ? Date.now() : undefined } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleConfirmDelete = () => {
    if (confirmModal.type === 'active') {
      setTasks(tasks.filter(t => t.isDone));
    } else if (confirmModal.type === 'completed') {
      setTasks(tasks.filter(t => !t.isDone));
    } else if (confirmModal.type === 'all') {
      setTasks([]);
    }
    setConfirmModal({ show: false, type: null, title: '' });
  };

  const activeTasks = tasks.filter(t => !t.isDone);
  const completedTasks = tasks.filter(t => t.isDone);

  const formatDate = (date: Date) => new Intl.DateTimeFormat('id-ID', { 
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
  }).format(date);

  const renderTaskItem = (task: Task) => (
    <motion.div
      key={task.id}
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`group bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/60 flex items-start gap-4 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 ${
        task.isDone ? 'bg-gray-50/60 opacity-70' : ''
      }`}
    >
      <button 
        onClick={() => toggleTask(task.id)}
        className={`mt-1 shrink-0 cursor-pointer w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          task.isDone ? 'bg-green-500 border-green-500 text-white' : 'border-black/30 hover:border-blue-400 text-transparent'
        }`}
      >
        {task.isDone ? <FiCheck className="w-4 h-4 stroke-3" /> : <FiCheck className="w-4 h-4" />}
      </button>

      <div className="grow min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`w-2 h-2 rounded-full ${PRIORITY_DOTS[task.priority]}`} />
          <span className={`text-[10px] font-bold uppercase tracking-wider ${
            task.priority === 'High' ? 'text-rose-500' : task.priority === 'Medium' ? 'text-amber-500' : 'text-blue-500'
          }`}>
            {task.priority}
          </span>
          {(!task.isDone && task.dueDate && new Date(task.dueDate) < new Date(new Date().setHours(0,0,0,0))) && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-rose-500 uppercase tracking-wider bg-rose-50 px-1.5 py-0.5 rounded">
              <FiClock className="w-2.5 h-2.5 cursor-pointer" />
              Terlambat
            </span>
          )}
        </div>
        <p className={`text-base leading-relaxed wrap-break-word ${task.isDone ? 'text-gray-400 line-through' : 'text-gray-800 font-medium'}`}>
          {task.text}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-[10px] font-medium text-gray-400 flex items-center gap-1">
            <FiClock className="w-3 h-3 cursor-pointer" />
            Dibuat: {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {task.isDone && task.completedAt && (
            <span className="text-[10px] font-medium text-green-500 flex items-center gap-1">
              <FiCheckCircle className="w-3 h-3 cursor-pointer" />
              Selesai: {new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
      </div>

      <button 
        onClick={() => deleteTask(task.id)}
        title="Hapus tugas"
        aria-label="Hapus tugas"
        className="opacity-100 p-2 text-black/30 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"      >
        <FiTrash2 className="w-4 h-4 cursor-pointer" />
      </button>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br bg-purple-900 from-slate-50 via-blue-50/30 to-purple-50/20 text-[#1D1D1F] font-sans selection:bg-blue-100 relative overflow-x-hidden">
      {/* Decorative background elements */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />
      <div className="fixed top-1/2 right-0 w-64 h-64 bg-pink-400/5 rounded-full blur-3xl translate-x-1/2 pointer-events-none" />
      
      {/* Modal Konfirmasi Custom */}
      <AnimatePresence>
        {confirmModal.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal({ show: false, type: null, title: '' })}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-4xl p-8 shadow-2xl max-w-sm w-full border border-gray-100 text-center"
            >
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FiTrash2 className="w-8 h-8 text-rose-500 cursor-pointer" />
              </div>
              <h3 className="text-xl font-bold mb-2">Konfirmasi Hapus</h3>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                {confirmModal.title}
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setConfirmModal({ show: false, type: null, title: '' })}
                  className="flex-1 px-6 py-3 cursor-pointer rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm transition-all"
                >
                  Batal
                </button>
                <button 
                  onClick={handleConfirmDelete}
                  className="flex-1 px-6 py-3 cursor-pointer rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm transition-all shadow-lg shadow-rose-500/20"
                >
                  Hapus
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto px-6 py-12 md:py-20">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 border border-white/80 rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg flex items-center justify-center overflow-hidden">
              <FiUser className="w-7 h-7 text-blue-500 cursor-pointer" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-950">Rohman</h1>
              <p className="text-gray-800 text-sm font-medium">Product Designer</p>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end">
            <div className="flex items-center gap-2 text-blue-950 mb-1">
              <FiCalendar className="w-4 h-4 cursor-pointer" />
              <span className="text-xs font-semibold uppercase tracking-wider">Hari Ini</span>
            </div>
            <p className="text-sm font-bold text-gray-800 cursor-pointer">{formatDate(currentTime)}</p>
          </div>
        </header>

        {/* Input */}
        <section className="bg-white/20 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-blue/60 mb-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5" />
          <form onSubmit={addTask} className="space-y-4 relative z-10">
            <div className="relative">
              <textarea
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="Apa yang ingin dikerjakan?"
                className="w-full border bg-white/40 placeholder-gray-600 backdrop-blur-sm rounded-xl p-4 pt-4 text-lg focus:outline-none focus:ring-2 transition-all resize-none min-h-[100px] border-black/10 focus:border-black/40 shadow-inner"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm p-1 rounded-xl border border-black/60 shadow-sm">
                  {(['Low', 'Medium', 'High'] as Priority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`px-4 py-1.5 cursor-pointer rounded-lg text-xs font-semibold transition-all border border-black/40 ${
                        priority === p
                          ? p === 'High' ? 'bg-rose-900 text-white shadow-md shadow-rose-500/30'
                          : p === 'Medium' ? 'bg-amber-900 text-white shadow-md shadow-amber-500/30'
                          : 'bg-blue-900 text-white shadow-md shadow-blue-500/30'
                          : 'text-gray-900 hover:text-gray-700 hover:bg-white/50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-black/40 shadow-sm">
                  <FiClock className="w-3.5 h-3.5 text-gray-600 cursor-pointer" />
                  <input
                    type="date"
                    title="Tanggal jatuh tempo"
                    aria-label="Tanggal jatuh tempo"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="bg-transparent cursor-pointer text-xs font-semibold text-gray-600 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-linear-to-r cursor-pointer from-blue-800 to-blue-700 hover:from-blue-900 hover:to-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30 active:scale-95 hover:shadow-xl hover:shadow-blue-500/40"
              >
                <FiPlus className="w-4 h-4 cursor-pointer" />
                Tambah
              </button>
            </div>
          </form>
        </section>

        {/* Daftar Tugas */}
        <div className="space-y-10">
          
          {/* To Do */}
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                Belum Selesai <span className="bg-blue-100/20 text-blue-900 cursor-pointer px-2 py-0.5 rounded-full text-[10px] font-semibold border border-blue-900">{activeTasks.length}</span>
              </h2>
              {activeTasks.length > 0 && (
                <button
                  onClick={() => setConfirmModal({
                    show: true,
                    type: 'active',
                    title: 'Hapus semua tugas yang belum selesai?'
                  })}
                  className="text-xs font-semibold cursor-pointer text-rose-500 hover:text-rose-600 flex items-center gap-1.5 transition-colors"
                >
                  <FiTrash2 className="w-3.5 h-3.5 cursor-pointer" />
                  Hapus Semua
                </button>
              )}
            </div>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {activeTasks.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white/60 backdrop-blur-sm border-2 border-blue-900 rounded-2xl py-12 flex flex-col items-center justify-center text-gray-400"
                  >
                    <FiCheckCircle className="w-8 h-8 mb-2 opacity-30 text-blue-900" />
                    <p className="text-sm font-medium text-gray-900">Semua tugas selesai! </p>
                  </motion.div>
                ) : (
                  activeTasks.map(renderTaskItem)
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Done */}
          {completedTasks.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2">
                  Riwayat Selesai <span className="bg-green-100 text-green-900 cursor-pointer px-2 py-0.5 rounded-full text-[10px] font-semibold border border-green-900">{completedTasks.length}</span>
                </h2>
                <button
                  onClick={() => setConfirmModal({
                    show: true,
                    type: 'completed',
                    title: 'Hapus semua riwayat tugas yang sudah selesai?'
                  })}
                  className="text-xs font-semibold cursor-pointer text-rose-900 hover:text-rose-800 flex items-center gap-1.5 transition-colors"
                >
                  <FiTrash2 className="w-3.5 h-3.5 cursor-pointer" />
                  Hapus Riwayat
                </button>
              </div>
              <div className="space-y-3 opacity-70 text-gray-900">
                <AnimatePresence mode="popLayout">
                  {completedTasks.map(renderTaskItem)}
                </AnimatePresence>
              </div>
            </section>
          )}
        </div>

        <footer className="mt-20 text-center">
          <p className="text-xs text-gray-900 font-medium">
            Didesain untuk fokus. Dibangun untuk produktivitas.
          </p>
        </footer>
      </div>
      <Toaster position="top-center" richColors />
    </div>
  );
};

export default App;
