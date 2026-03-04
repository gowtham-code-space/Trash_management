import React, { useState, useRef, useEffect, useCallback } from "react";
import ThemeStore from "../../store/ThemeStore";
import Pagination from "../../utils/Pagination";
import AdminKpiCard from "../../components/Cards/Admin/AdminKpiCard";
import UpdateQuestionModal from "../../components/Modals/Admin/UpdateQuestionModal";
import DeleteQuestionModal from "../../components/Modals/Admin/DeleteQuestionModal";
import DeletedConfigModal from "../../components/Modals/Admin/DeletedConfigModal";
import ToastNotification from "../../components/Notification/ToastNotification";
import { ToastContainer } from "react-toastify";
import { SkeletonLine } from "../../components/skeleton";
import {
  People, Stats, Check, Mobile, Search, Add, More, Upload, Edit, Trash, X,
} from "../../assets/icons/icons";
import {
  getQuizConfigs, createQuizConfig, updateQuizConfig, deleteQuizConfig, activateQuizConfig,
  getQuizQuestions, createQuizQuestion, updateQuizQuestion, deleteQuizQuestion, bulkUploadQuestions,
  getQuizKpis, getDeletedQuizConfigs,
} from "../../services/features/adminService";

const OPTION_LETTERS = ["a", "b", "c", "d"];

// ─── Config Card ──────────────────────────────────────────────────────────────
function ConfigCard({ config, isSelected, onSelect, onEdit, onDelete, isDarkTheme }) {
  return (
    <div
      onClick={onSelect}
      className={`rounded-large border p-4 cursor-pointer transition-all duration-200 ease-in-out hover:scale-[0.99]
        ${isSelected ? "border-primary bg-primary/5" : isDarkTheme ? "border-darkBorder bg-darkBackground" : "border-gray-200 bg-background"}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-5 h-5 rounded-full border-2 shrink-0 transition-all duration-200
            ${isSelected ? "border-primary bg-primary" : isDarkTheme ? "border-darkBorder" : "border-gray-300"}`} />
          <span className={`text-sm font-bold ${isSelected ? "text-primary" : isDarkTheme ? "text-darkTextPrimary" : "text-secondaryDark"}`}>
            Config {config.score_time_id}
          </span>
          {config.is_active ? (
            <span className="text-xs px-2 py-0.5 rounded-medium bg-primary/10 text-primary font-semibold">Active</span>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(config); }}
            className={`p-1.5 rounded-medium hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200
              ${isDarkTheme ? "bg-darkSurface text-darkTextSecondary" : "bg-secondary text-secondaryDark"}`}
          >
            <Edit size={14} defaultColor={isDarkTheme ? "#B7D6C9" : "#316F5D"} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(config); }}
            className="p-1.5 rounded-medium hover:scale-[0.99] active:scale-[0.99] focus:outline-none hover:bg-error/10 transition-all duration-200"
          >
            <Trash size={14} defaultColor="#E75A4C" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
        {[
          ["Time", config.total_time || "—"],
          ["Questions", config.total_questions],
          ["Total Score", config.total_score],
          ["Pass Mark", config.pass_mark],
          ["+Mark", config.correct_mark],
          ["-Mark", config.wrong_mark],
        ].map(([label, val]) => (
          <div key={label} className="flex justify-between items-center">
            <span className={`text-xs ${isDarkTheme ? "text-darkTextSecondary" : "text-secondaryDark"}`}>{label}</span>
            <span className={`text-xs font-semibold ${isSelected ? "text-primary" : isDarkTheme ? "text-darkTextPrimary" : "text-secondaryDark"}`}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Config Modal ─────────────────────────────────────────────────────────────
function ConfigModal({ onClose, onSave, existingConfig = null, isDarkTheme }) {
  const isEdit = Boolean(existingConfig);
  const [form, setForm] = useState({
    total_time: existingConfig?.total_time ?? "",
    total_questions: existingConfig?.total_questions ?? "",
    total_score: existingConfig?.total_score ?? "",
    pass_mark: existingConfig?.pass_mark ?? "",
    correct_mark: existingConfig?.correct_mark ?? 1,
    wrong_mark: existingConfig?.wrong_mark ?? -0.25,
  });

  const inputClass = `w-full px-4 py-3 rounded-medium text-sm border outline-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200
    ${isDarkTheme ? "bg-darkBackground border-darkBorder text-darkTextPrimary placeholder:text-darkTextSecondary" : "bg-background border-gray-200 text-secondaryDark placeholder:text-gray-400"}`;
  const labelClass = `text-sm font-semibold mb-2 block ${isDarkTheme ? "text-darkTextSecondary" : "text-secondaryDark"}`;

  function handleSubmit() {
    if (!form.total_time || !form.total_questions || !form.total_score || !form.pass_mark) return;
    const payload = {
      ...form,
      total_time: form.total_time.length === 5 ? `${form.total_time}:00` : form.total_time,
    };
    onSave(payload);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 w-full max-w-md mx-4 rounded-veryLarge border shadow-lg p-6 space-y-4
        ${isDarkTheme ? "bg-darkSurface border-darkBorder" : "bg-white border-gray-200"}`}>
        <div className="flex items-center justify-between">
          <h2 className={`text-lg font-bold ${isDarkTheme ? "text-darkTextPrimary" : "text-primary"}`}>
            {isEdit ? "Edit Configuration" : "Add Configuration"}
          </h2>
          <button onClick={onClose} className={`p-2 rounded-medium hover:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200
            ${isDarkTheme ? "bg-darkBackground" : "bg-secondary"}`}>
            <X size={16} defaultColor={isDarkTheme ? "#B7D6C9" : "#316F5D"} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Time (HH:MM:SS)</label>
            <input
              type="text"
              className={inputClass}
              value={form.total_time || ""}
              onChange={(e) => setForm((p) => ({ ...p, total_time: e.target.value }))}
              placeholder="00:15:00"
              maxLength={8}
            />
          </div>
          {[
            ["Total Questions", "total_questions"],
            ["Total Score", "total_score"],
            ["Pass Mark", "pass_mark"],
            ["Correct Mark", "correct_mark"],
            ["Wrong Mark", "wrong_mark"],
          ].map(([label, field]) => (
            <div key={field}>
              <label className={labelClass}>{label}</label>
              <input
                type="number"
                className={inputClass}
                value={form[field]}
                onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                placeholder="0"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className={`flex-1 py-3 rounded-medium text-sm font-semibold hover:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200
            ${isDarkTheme ? "bg-darkBackground text-darkTextPrimary border border-darkBorder" : "bg-secondary text-secondaryDark"}`}>Cancel</button>
          <button onClick={handleSubmit} className="flex-1 py-3 rounded-medium text-sm font-semibold bg-primary text-white hover:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200">
            {isEdit ? "Save" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Question Row ─────────────────────────────────────────────────────────────
function QuestionRow({ question, index, onEdit, onDelete, isDarkTheme }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`flex items-center justify-between px-6 py-4 border-b transition-all duration-200
      ${isDarkTheme ? "border-darkBorder hover:bg-darkSurfaceHover" : "border-gray-100 hover:bg-background"}`}>
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <span className={`text-sm font-bold w-8 pt-0.5 shrink-0 ${isDarkTheme ? "text-darkTextSecondary" : "text-secondaryDark"}`}>
          {String(index).padStart(2, "0")}
        </span>
        <p className={`text-sm font-medium truncate ${isDarkTheme ? "text-darkTextPrimary" : "text-secondaryDark"}`}>
          {question.question}
        </p>
      </div>
      <div className="relative shrink-0 ml-3" ref={menuRef}>
        <button
          onClick={() => setShowMenu((p) => !p)}
          className={`p-2 rounded-medium hover:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200
            ${isDarkTheme ? "hover:bg-darkBackground" : "hover:bg-secondary"}`}
        >
          <More size={18} defaultColor={isDarkTheme ? "#B7D6C9" : "#316F5D"} />
        </button>
        {showMenu && (
          <div className={`absolute right-0 top-full mt-1 w-36 rounded-large border shadow-lg z-30 overflow-hidden
            ${isDarkTheme ? "bg-darkSurface border-darkBorder" : "bg-white border-gray-200"}`}>
            <button
              onClick={() => { setShowMenu(false); onEdit(question); }}
              className={`w-full flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200
                ${isDarkTheme ? "text-darkTextPrimary hover:bg-darkBackground" : "text-secondaryDark hover:bg-background"}`}
            >
              <Edit size={14} defaultColor={isDarkTheme ? "#B7D6C9" : "#316F5D"} />
              Edit
            </button>
            <div className={`h-px ${isDarkTheme ? "bg-darkBorder" : "bg-gray-100"}`} />
            <button
              onClick={() => { setShowMenu(false); onDelete(question); }}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-error hover:bg-error/5 transition-all duration-200"
            >
              <Trash size={14} defaultColor="#E75A4C" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function QuizManagement() {
  const { isDarkTheme } = ThemeStore();

  const [questions, setQuestions] = useState([]);
  const [questionsTotal, setQuestionsTotal] = useState(0);
  const [questionsPage, setQuestionsPage] = useState(1);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deleteQuestion, setDeleteQuestion] = useState(null);

  const [configs, setConfigs] = useState([]);
  const [configsLoading, setConfigsLoading] = useState(true);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [activatingId, setActivatingId] = useState(null);
  const [showDeletedModal, setShowDeletedModal] = useState(false);

  const [kpis, setKpis] = useState(null);
  const [kpisLoading, setKpisLoading] = useState(true);

  const fileInputRef = useRef(null);
  const ITEMS_PER_PAGE = 5;

  const fetchQuestions = useCallback(async (page = 1, search = "") => {
    setQuestionsLoading(true);
    try {
      const res = await getQuizQuestions({ page, limit: ITEMS_PER_PAGE, search });
      setQuestions(res.data?.rows || []);
      setQuestionsTotal(res.data?.total || 0);
    } catch {
      ToastNotification("Failed to load questions", "error");
    } finally {
      setQuestionsLoading(false);
    }
  }, []);

  const fetchConfigs = useCallback(async () => {
    setConfigsLoading(true);
    try {
      const res = await getQuizConfigs();
      setConfigs(Array.isArray(res.data) ? res.data : []);
    } catch {
      ToastNotification("Failed to load configs", "error");
    } finally {
      setConfigsLoading(false);
    }
  }, []);

  const fetchKpis = useCallback(async () => {
    setKpisLoading(true);
    try {
      const res = await getQuizKpis();
      setKpis(res.data || null);
    } catch {
      // silently fail — KPIs are non-critical
    } finally {
      setKpisLoading(false);
    }
  }, []);

  useEffect(() => { fetchConfigs(); fetchQuestions(1, ""); fetchKpis(); }, [fetchConfigs, fetchQuestions, fetchKpis]);

  useEffect(() => {
    const t = setTimeout(() => { setQuestionsPage(1); fetchQuestions(1, searchQuery); }, 400);
    return () => clearTimeout(t);
  }, [searchQuery, fetchQuestions]);

  function dbToModalQuestion(q) {
    return {
      questionText: q.question,
      options: [q.option_a, q.option_b, q.option_c, q.option_d],
      correctOption: OPTION_LETTERS.indexOf(q.correct_option),
    };
  }

  function modalToDbQuestion(form) {
    return {
      question: form.questionText,
      option_a: form.options[0],
      option_b: form.options[1],
      option_c: form.options[2],
      option_d: form.options[3],
      correct_option: OPTION_LETTERS[form.correctOption],
    };
  }

  async function handleSaveQuestion(form) {
    const payload = modalToDbQuestion(form);
    try {
      if (editingQuestion) {
        await updateQuizQuestion(editingQuestion.question_id, payload);
        ToastNotification("Question updated", "success");
      } else {
        await createQuizQuestion(payload);
        ToastNotification("Question added", "success");
      }
      fetchQuestions(questionsPage, searchQuery);
    } catch { ToastNotification("Failed to save question", "error"); }
  }

  async function handleConfirmDelete() {
    try {
      await deleteQuizQuestion(deleteQuestion.question_id);
      ToastNotification("Question deleted", "success");
      setDeleteQuestion(null);
      fetchQuestions(questionsPage, searchQuery);
    } catch { ToastNotification("Failed to delete question", "error"); }
  }

  async function handleBulkUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    try {
      const XLSX = await import("xlsx");
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf);
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      const REQUIRED = ["question", "option_a", "option_b", "option_c", "option_d", "correct_option"];
      if (!rows.length || !REQUIRED.every((k) => k in rows[0])) {
        ToastNotification(`Required columns: ${REQUIRED.join(", ")}`, "error");
        return;
      }
      const cleaned = rows.map((r) => ({
        question: r.question, option_a: r.option_a, option_b: r.option_b,
        option_c: r.option_c, option_d: r.option_d, correct_option: String(r.correct_option).toLowerCase(),
      }));
      await bulkUploadQuestions(cleaned);
      ToastNotification(`${cleaned.length} questions uploaded`, "success");
      fetchQuestions(1, searchQuery);
      setQuestionsPage(1);
    } catch { ToastNotification("Bulk upload failed", "error"); }
  }

  async function handleSaveConfig(form) {
    try {
      if (editingConfig) {
        await updateQuizConfig(editingConfig.score_time_id, form);
        ToastNotification("Configuration updated", "success");
      } else {
        await createQuizConfig(form);
        ToastNotification("Configuration added", "success");
      }
      fetchConfigs();
    } catch { ToastNotification("Failed to save configuration", "error"); }
  }

  async function handleActivateConfig(config) {
    if (config.is_active) return;
    const prevConfigs = configs;
    setConfigs((prev) => prev.map((c) => ({ ...c, is_active: c.score_time_id === config.score_time_id ? 1 : 0 })));
    setActivatingId(config.score_time_id);
    try {
      await activateQuizConfig(config.score_time_id);
      ToastNotification(`Config ${config.score_time_id} activated`, "success");
      fetchConfigs();
    } catch {
      setConfigs(prevConfigs);
      ToastNotification("Failed to activate configuration", "error");
    } finally { setActivatingId(null); }
  }

  async function handleDeleteConfig(config) {
    if (config.is_active) {
      ToastNotification("Cannot delete the active configuration", "error");
      return;
    }
    const prevConfigs = configs;
    setConfigs((prev) => prev.filter((c) => c.score_time_id !== config.score_time_id));
    try {
      await deleteQuizConfig(config.score_time_id);
      ToastNotification("Configuration deleted", "success");
    } catch {
      setConfigs(prevConfigs);
      ToastNotification("Failed to delete configuration", "error");
    }
  }

  const surfaceClass = isDarkTheme ? "bg-darkSurface border-darkBorder" : "bg-white border-gray-200";
  const activeConfig = configs.find((c) => c.is_active);

  return (
    <div className={isDarkTheme ? "dark" : ""}>
      <div className="min-h-screen bg-background transition-all duration-200">
        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">

          {/* ── KPI Cards ────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <AdminKpiCard title="Total Attempts" value={kpisLoading ? "…" : (kpis?.totalAttempts ?? "—")} icon={<People size={16} defaultColor={isDarkTheme ? "#B7D6C9" : "#145B47"} />} />
            <AdminKpiCard title="Pass Rate" value={kpisLoading ? "…" : (kpis?.passRate ?? "—")} icon={<Check size={16} defaultColor={isDarkTheme ? "#B7D6C9" : "#145B47"} />} />
            <AdminKpiCard title="Avg Completion" value={kpisLoading ? "…" : (kpis?.avgCompletion ?? "—")} icon={<Stats size={16} defaultColor={isDarkTheme ? "#B7D6C9" : "#145B47"} />} />
            <AdminKpiCard title="Active Sessions" value={kpisLoading ? "…" : (kpis?.activeSessions ?? "—")} icon={<Mobile size={16} defaultColor={isDarkTheme ? "#B7D6C9" : "#145B47"} />} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

            {/* ── Question Repository ─────────────────────────────────── */}
            <div className={`rounded-veryLarge border flex flex-col ${surfaceClass}`}>
              <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-4 border-b border-gray-100 dark:border-darkBorder space-y-3">
                {/* Row 1: title + total */}
                <div className="flex items-center gap-2">
                  <h2 className={`text-base sm:text-lg font-bold ${isDarkTheme ? "text-darkTextPrimary" : "text-primary"}`}>Question Repository</h2>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-medium
                    ${isDarkTheme ? "bg-darkBackground text-darkTextSecondary" : "bg-secondary text-secondaryDark"}`}>
                    {questionsTotal} Total
                  </span>
                </div>
                {/* Row 2: search + actions */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 min-w-0">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <Search size={16} defaultColor={isDarkTheme ? "#B7D6C9" : "#316F5D"} />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search questions..."
                      className={`w-full pl-10 pr-4 py-2.5 rounded-large text-sm border outline-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200
                        ${isDarkTheme ? "bg-darkBackground border-darkBorder text-darkTextPrimary placeholder:text-darkTextSecondary" : "bg-white border-gray-200 text-secondaryDark placeholder:text-gray-400"}`}
                    />
                  </div>
                  <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleBulkUpload} />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-large text-sm font-semibold border hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 shrink-0
                      ${isDarkTheme ? "bg-darkBackground border-darkBorder text-darkTextPrimary" : "bg-secondary border-gray-200 text-secondaryDark"}`}
                  >
                    <Upload size={16} defaultColor={isDarkTheme ? "#B7D6C9" : "#316F5D"} />
                    <span className="hidden sm:inline">Bulk Upload</span>
                  </button>
                  <button
                    onClick={() => setShowQuestionModal(true)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-large text-sm font-semibold bg-primary text-white hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 shrink-0"
                  >
                    <Add size={16} defaultColor="#fff" isDarkTheme />
                    <span className="hidden sm:inline">Add New</span>
                  </button>
                </div>
              </div>

              <div className={`flex items-center px-6 py-3 border-b ${isDarkTheme ? "border-darkBorder" : "border-gray-100"}`}>
                <span className={`text-sm font-semibold flex-1 ${isDarkTheme ? "text-darkTextSecondary" : "text-secondaryDark"}`}>Question Text</span>
                <span className={`text-sm font-semibold w-16 text-right ${isDarkTheme ? "text-darkTextSecondary" : "text-secondaryDark"}`}>Actions</span>
              </div>

              <div className="flex-1 pb-3">
                {questionsLoading ? (
                  <div className="px-6 py-3 space-y-4">
                    {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <SkeletonLine width="w-8" height="h-4" isDarkTheme={isDarkTheme} />
                        <SkeletonLine width="flex-1" height="h-4" isDarkTheme={isDarkTheme} />
                        <SkeletonLine width="w-8" height="h-6" isDarkTheme={isDarkTheme} />
                      </div>
                    ))}
                  </div>
                ) : questions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Search size={32} defaultColor={isDarkTheme ? "#B7D6C9" : "#316F5D"} />
                    <p className={`text-sm font-medium ${isDarkTheme ? "text-darkTextSecondary" : "text-secondaryDark"}`}>
                      {searchQuery ? "No questions match your search" : "No questions found"}
                    </p>
                  </div>
                ) : (
                  <Pagination
                    data={questions}
                    itemsPerPage={ITEMS_PER_PAGE}
                    serverSide
                    totalItems={questionsTotal}
                    currentPage={questionsPage}
                    onPageChange={(p) => { setQuestionsPage(p); fetchQuestions(p, searchQuery); }}
                    renderItem={(question, i) => (
                      <QuestionRow
                        key={question.question_id}
                        question={question}
                        index={(questionsPage - 1) * ITEMS_PER_PAGE + i + 1}
                        onEdit={(q) => { setEditingQuestion(q); setShowQuestionModal(true); }}
                        onDelete={(q) => setDeleteQuestion(q)}
                        isDarkTheme={isDarkTheme}
                      />
                    )}
                  />
                )}
              </div>
            </div>

            {/* ── Quiz Configurations ─────────────────────────────── */}
            <div className={`rounded-veryLarge border flex flex-col ${surfaceClass}`}>
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-darkBorder">
                <div>
                  <h2 className={`text-lg font-bold ${isDarkTheme ? "text-darkTextPrimary" : "text-primary"}`}>Quiz Configurations</h2>
                  <p className={`text-sm mt-1 ${isDarkTheme ? "text-darkTextSecondary" : "text-secondaryDark"}`}>Click a config to set it active</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowDeletedModal(true)}
                    className={`flex items-center gap-2 px-3 py-3 rounded-large text-sm font-semibold border hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200
                      ${isDarkTheme ? "bg-darkBackground border-darkBorder text-darkTextPrimary" : "bg-secondary border-gray-200 text-secondaryDark"}`}
                  >
                    View History
                  </button>
                  <button
                    onClick={() => setShowConfigModal(true)}
                    className="flex items-center gap-2 px-4 py-3 rounded-large text-sm font-semibold bg-primary text-white hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  >
                    <Add size={16} defaultColor="#fff" isDarkTheme />
                    Add Config
                  </button>
                </div>
              </div>

              <div className="p-3 sm:p-6 space-y-3 flex-1 overflow-y-auto">
                {configsLoading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className={`rounded-large border p-4 space-y-3 ${isDarkTheme ? "border-darkBorder bg-darkBackground" : "border-gray-200 bg-background"}`}>
                      <SkeletonLine width="w-32" height="h-4" isDarkTheme={isDarkTheme} />
                      <div className="grid grid-cols-2 gap-2">
                        {Array.from({ length: 6 }).map((_, j) => (
                          <SkeletonLine key={j} width="w-full" height="h-3" isDarkTheme={isDarkTheme} />
                        ))}
                      </div>
                    </div>
                  ))
                ) : configs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <p className={`text-sm ${isDarkTheme ? "text-darkTextSecondary" : "text-secondaryDark"}`}>No configurations found</p>
                  </div>
                ) : (
                  configs.map((config) => (
                    <ConfigCard
                      key={config.score_time_id}
                      config={config}
                      isSelected={!!config.is_active || activatingId === config.score_time_id}
                      onSelect={() => handleActivateConfig(config)}
                      onEdit={(c) => { setEditingConfig(c); setShowConfigModal(true); }}
                      onDelete={handleDeleteConfig}
                      isDarkTheme={isDarkTheme}
                    />
                  ))
                )}
              </div>

              {activeConfig && (
                <div className={`mx-6 mb-6 p-4 rounded-large border ${isDarkTheme ? "bg-darkBackground border-darkBorder" : "bg-secondary border-gray-200"}`}>
                  <p className={`text-sm font-semibold mb-1 ${isDarkTheme ? "text-darkTextSecondary" : "text-secondaryDark"}`}>
                    Active: Config {activeConfig.score_time_id}
                  </p>
                  <p className={`text-sm ${isDarkTheme ? "text-darkTextPrimary" : "text-primary"}`}>
                    {activeConfig.total_time} min • {activeConfig.total_questions} Qs • Pass: {activeConfig.pass_mark}/{activeConfig.total_score}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showQuestionModal && (
        <UpdateQuestionModal
          onClose={() => { setShowQuestionModal(false); setEditingQuestion(null); }}
          onSave={handleSaveQuestion}
          existingQuestion={editingQuestion ? dbToModalQuestion(editingQuestion) : null}
        />
      )}

      {deleteQuestion && (
        <DeleteQuestionModal
          question={deleteQuestion}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteQuestion(null)}
        />
      )}

      {showDeletedModal && (
        <DeletedConfigModal
          onClose={() => setShowDeletedModal(false)}
          onRestored={fetchConfigs}
        />
      )}

      {showConfigModal && (
        <ConfigModal
          onClose={() => { setShowConfigModal(false); setEditingConfig(null); }}
          onSave={handleSaveConfig}
          existingConfig={editingConfig}
          isDarkTheme={isDarkTheme}
        />
      )}

      <ToastContainer />
    </div>
  );
}

export default QuizManagement;
