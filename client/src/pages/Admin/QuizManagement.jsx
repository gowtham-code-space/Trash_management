import React, { useState, useRef, useEffect } from "react";
import ThemeStore from "../../store/ThemeStore";
import Pagination from "../../utils/Pagination";
import UpdateQuestionModal from "../../components/Modals/Admin/UpdateQuestionModal";
import ProgressBar from "../../components/Statistics/ProgressBar";
import ToastNotification from "../../components/Notification/ToastNotification";
import { ToastContainer } from "react-toastify";
import {
  People,
  Stats,
  Check,
  Mobile,
  Search,
  Add,
  More,
  Upload,
  Edit,
  Trash,
  X,
  Configure,
} from "../../assets/icons/icons";

// ─── Static Mock Data ─────────────────────────────────────────────────────────
const initialQuestions = [
  { id: 1, questionText: "Which bin is used for wet waste?", category: "General", pool: "Pool A", type: "MCQ", difficulty: "Easy", options: ["Green bin", "Blue bin", "Red bin", "Yellow bin"], correctOption: 0 },
  { id: 2, questionText: "Frequency of organic collection?", category: "Operations", pool: "Pool B", type: "MCQ", difficulty: "Medium", options: ["Daily", "Weekly", "Monthly", "Yearly"], correctOption: 0 },
  { id: 3, questionText: "Identify recyclable plastic symbol", category: "Recycling", pool: "Pool C", type: "IMG", difficulty: "Hard", options: ["Triangle", "Circle", "Square", "Arrow"], correctOption: 0 },
  { id: 4, questionText: "Impact of burning plastic?", category: "Environment", pool: "Pool A", type: "MCQ", difficulty: "Easy", options: ["Air pollution", "Water pollution", "Soil enrichment", "None"], correctOption: 0 },
  { id: 5, questionText: "What colour is a recyclable bin?", category: "General", pool: "Pool B", type: "MCQ", difficulty: "Easy", options: ["Blue", "Red", "Green", "Black"], correctOption: 0 },
  { id: 6, questionText: "Which material takes longest to decompose?", category: "Environment", pool: "Pool A", type: "MCQ", difficulty: "Hard", options: ["Plastic", "Paper", "Food", "Glass"], correctOption: 0 },
  { id: 7, questionText: "What is composting?", category: "Operations", pool: "Pool C", type: "MCQ", difficulty: "Easy", options: ["Recycling organic material", "Burning waste", "Landfill", "None"], correctOption: 0 },
  { id: 8, questionText: "Which gas is produced in landfills?", category: "Environment", pool: "Pool B", type: "MCQ", difficulty: "Medium", options: ["Methane", "Oxygen", "Nitrogen", "Helium"], correctOption: 0 },
];

const initialConfigs = [
  { id: 1, name: "Config 1", duration: 10, totalQuestions: 10, totalScore: 10, passmark: 5, correctMark: 1, wrongMark: -0.25 },
  { id: 2, name: "Config 2", duration: 120, totalQuestions: 120, totalScore: 120, passmark: 65, correctMark: 1, wrongMark: -0.25 },
];

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ title, value, subtitle, subtitleColor, icon, progressValue }) {
  const { isDarkTheme } = ThemeStore();
  return (
    <div className={`rounded-large p-4 sm:p-6 border transition-all duration-200 ease-in-out hover:scale-[0.99] cursor-default
      ${isDarkTheme ? "bg-darkSurface border-darkBorder" : "bg-white border-gray-200"}`}>
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs font-semibold uppercase tracking-wide ${isDarkTheme ? "text-darkTextSecondary" : "text-secondaryDark"}`}>{title}</span>
        <span className={`p-2 rounded-medium ${isDarkTheme ? "bg-darkBackground" : "bg-secondary"}`}>{icon}</span>
      </div>
      <div className={`text-xl sm:text-2xl font-bold mb-2 ${isDarkTheme ? "text-darkTextPrimary" : "text-primary"}`}>{value}</div>
      {progressValue !== undefined && (
        <div className="mb-2">
          <ProgressBar item={{ stars: 5, percentage: progressValue }} defaultColor="bg-primaryLight" />
        </div>
      )}
      {subtitle && (
        <p className="text-xs sm:text-sm font-medium" style={{ color: subtitleColor }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ─── Config Card ──────────────────────────────────────────────────────────────
function ConfigCard({ config, isSelected, onSelect, onEdit, isDarkTheme }) {
  return (
    <div
      onClick={onSelect}
      className={`rounded-large border p-4 cursor-pointer transition-all duration-200 ease-in-out hover:scale-[0.99]
        ${isSelected
          ? "border-primary bg-primary/5"
          : isDarkTheme ? "border-darkBorder bg-darkBackground" : "border-gray-200 bg-background"
        }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all duration-200 ease-in-out
            ${isSelected ? "border-primary bg-primary" : isDarkTheme ? "border-darkBorder" : "border-gray-300"}`} />
          <span className={`text-sm font-bold ${isSelected ? "text-primary" : isDarkTheme ? "text-darkTextPrimary" : "text-secondaryDark"}`}>
            {config.name}
          </span>
        </div>
        <button
          onClick={function (e) { e.stopPropagation(); onEdit(config); }}
          className={`p-1.5 rounded-medium hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out
            ${isDarkTheme ? "bg-darkSurface text-darkTextSecondary" : "bg-secondary text-secondaryDark"}`}
        >
          <Edit size={14} defaultColor={isDarkTheme ? "#B7D6C9" : "#316F5D"} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
        {[
          ["Duration", `${config.duration} min`],
          ["Questions", config.totalQuestions],
          ["Total Score", config.totalScore],
          ["Pass Mark", config.passmark],
          ["+Mark", config.correctMark],
          ["-Mark", config.wrongMark],
        ].map(function ([label, val]) {
          return (
            <div key={label} className="flex justify-between items-center">
              <span className={`text-xs ${isDarkTheme ? "text-darkTextSecondary" : "text-secondaryDark"}`}>{label}</span>
              <span className={`text-xs font-semibold ${isSelected ? "text-primary" : isDarkTheme ? "text-darkTextPrimary" : "text-secondaryDark"}`}>{val}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Config Modal ─────────────────────────────────────────────────────────────
function ConfigModal({ onClose, onSave, existingConfig = null, isDarkTheme }) {
  const isEdit = Boolean(existingConfig);
  const [form, setForm] = useState(existingConfig || {
    name: "",
    duration: "",
    totalQuestions: "",
    totalScore: "",
    passmark: "",
    correctMark: 1,
    wrongMark: -0.25,
  });

  function handleChange(field, value) {
    setForm(function (prev) { return { ...prev, [field]: value }; });
  }

  function handleSubmit() {
    if (!form.name) return;
    onSave(form);
    onClose();
  }

  const inputClass = `w-full px-4 py-3 rounded-medium text-sm border outline-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out
    ${isDarkTheme
      ? "bg-darkBackground border-darkBorder text-darkTextPrimary placeholder:text-darkTextSecondary"
      : "bg-background border-gray-200 text-secondaryDark placeholder:text-gray-400"}`;

  const labelClass = `text-sm font-semibold mb-2 block ${isDarkTheme ? "text-darkTextSecondary" : "text-secondaryDark"}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative z-10 w-full max-w-md mx-4 rounded-veryLarge border shadow-lg p-6 space-y-4
        ${isDarkTheme ? "bg-darkSurface border-darkBorder" : "bg-white border-gray-200"}`}>
        <div className="flex items-center justify-between">
          <h2 className={`text-lg font-bold ${isDarkTheme ? "text-darkTextPrimary" : "text-primary"}`}>
            {isEdit ? "Edit Configuration" : "Add Configuration"}
          </h2>
          <button onClick={onClose} className={`p-2 rounded-medium hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out
            ${isDarkTheme ? "bg-darkBackground" : "bg-secondary"}`}>
            <X size={16} defaultColor={isDarkTheme ? "#B7D6C9" : "#316F5D"} />
          </button>
        </div>
        <div>
          <label className={labelClass}>Config Name</label>
          <input className={inputClass} value={form.name} onChange={function (e) { handleChange("name", e.target.value); }} placeholder="e.g. Config 3" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            ["Duration (min)", "duration"],
            ["Total Questions", "totalQuestions"],
            ["Total Score", "totalScore"],
            ["Pass Mark", "passmark"],
            ["Correct Mark", "correctMark"],
            ["Wrong Mark", "wrongMark"],
          ].map(function ([label, field]) {
            return (
              <div key={field}>
                <label className={labelClass}>{label}</label>
                <input type="number" className={inputClass} value={form[field]} onChange={function (e) { handleChange(field, e.target.value); }} placeholder="0" />
              </div>
            );
          })}
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className={`flex-1 py-3 rounded-medium text-sm font-semibold hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out
            ${isDarkTheme ? "bg-darkBackground text-darkTextPrimary border border-darkBorder" : "bg-secondary text-secondaryDark"}`}>Cancel</button>
          <button onClick={handleSubmit} className="flex-1 py-3 rounded-medium text-sm font-semibold bg-primary text-white hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out">
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

  useEffect(function () {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return function () { document.removeEventListener("mousedown", handleClickOutside); };
  }, []);

  return (
    <div className={`flex items-center justify-between px-6 py-4 border-b transition-all duration-200 ease-in-out
      ${isDarkTheme ? "border-darkBorder hover:bg-darkSurfaceHover" : "border-gray-100 hover:bg-background"}`}>
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <span className={`text-sm font-bold w-8 pt-0.5 shrink-0 ${isDarkTheme ? "text-darkTextSecondary" : "text-secondaryDark"}`}>
          {String(index).padStart(2, "0")}
        </span>
        <div className="min-w-0">
          <p className={`text-sm font-medium truncate ${isDarkTheme ? "text-darkTextPrimary" : "text-secondaryDark"}`}>
            {question.questionText}
          </p>
          <p className={`text-sm mt-1 ${isDarkTheme ? "text-darkTextSecondary" : "text-gray-400"}`}>
            Category: {question.category} • {question.pool}
          </p>
        </div>
      </div>
      <div className="relative flex-shrink-0 ml-3" ref={menuRef}>
        <button
          onClick={function () { setShowMenu(function (p) { return !p; }); }}
          className={`p-2 rounded-medium hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out
            ${isDarkTheme ? "hover:bg-darkBackground" : "hover:bg-secondary"}`}
        >
          <More size={18} defaultColor={isDarkTheme ? "#B7D6C9" : "#316F5D"} />
        </button>
        {showMenu && (
          <div className={`absolute right-0 top-full mt-1 w-36 rounded-large border shadow-lg z-30 overflow-hidden
            ${isDarkTheme ? "bg-darkSurface border-darkBorder" : "bg-white border-gray-200"}`}>
            <button
              onClick={function () { setShowMenu(false); onEdit(question); }}
              className={`w-full flex items-center gap-2 px-4 py-3 text-sm font-medium hover:scale-[0.99] active:scale-[0.99] focus:scale-[0.99] transition-all duration-200 ease-in-out
                ${isDarkTheme ? "text-darkTextPrimary hover:bg-darkBackground" : "text-secondaryDark hover:bg-background"}`}
            >
              <Edit size={14} defaultColor={isDarkTheme ? "#B7D6C9" : "#316F5D"} />
              Edit
            </button>
            <div className={`h-px ${isDarkTheme ? "bg-darkBorder" : "bg-gray-100"}`} />
            <button
              onClick={function () { setShowMenu(false); onDelete(question.id); }}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-error hover:bg-error/5 hover:scale-[0.99] active:scale-[0.99] focus:scale-[0.99] transition-all duration-200 ease-in-out"
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

// ─── Main Page ────────────────────────────────────────────────────────────────
function QuizManagement() {
  const { isDarkTheme } = ThemeStore();

  const [questions, setQuestions] = useState(initialQuestions);
  const [searchQuery, setSearchQuery] = useState("");
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const [configs, setConfigs] = useState(initialConfigs);
  const [selectedConfigId, setSelectedConfigId] = useState(1);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);

  const fileInputRef = useRef(null);

  const filteredQuestions = questions.filter(function (q) {
    return q.questionText.toLowerCase().includes(searchQuery.toLowerCase());
  });

  function handleAddQuestion(form) {
    setQuestions(function (prev) {
      return [...prev, { ...form, id: Date.now() }];
    });
    ToastNotification("Question added successfully", "success");
  }

  function handleEditQuestion(form) {
    setQuestions(function (prev) {
      return prev.map(function (q) {
        return q.id === editingQuestion.id ? { ...q, ...form } : q;
      });
    });
    ToastNotification("Question updated successfully", "success");
  }

  function handleDeleteQuestion(id) {
    setQuestions(function (prev) { return prev.filter(function (q) { return q.id !== id; }); });
    ToastNotification("Question deleted successfully", "success");
  }

  function handleOpenEdit(question) {
    setEditingQuestion(question);
    setShowQuestionModal(true);
  }

  function handleCloseQuestionModal() {
    setShowQuestionModal(false);
    setEditingQuestion(null);
  }

  function handleSaveQuestion(form) {
    if (editingQuestion) {
      handleEditQuestion(form);
    } else {
      handleAddQuestion(form);
    }
  }

  function handleBulkUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    ToastNotification(`"${file.name}" uploaded successfully`, "success");
    e.target.value = "";
  }

  function handleSaveConfig(form) {
    if (editingConfig) {
      setConfigs(function (prev) {
        return prev.map(function (c) {
          return c.id === editingConfig.id ? { ...c, ...form } : c;
        });
      });
      ToastNotification("Configuration updated successfully", "success");
    } else {
      setConfigs(function (prev) {
        return [...prev, { ...form, id: Date.now() }];
      });
      ToastNotification("Configuration added successfully", "success");
    }
  }

  function handleOpenEditConfig(config) {
    setEditingConfig(config);
    setShowConfigModal(true);
  }

  function handleCloseConfigModal() {
    setShowConfigModal(false);
    setEditingConfig(null);
  }

  const surfaceClass = isDarkTheme ? "bg-darkSurface border-darkBorder" : "bg-white border-gray-200";

  return (
    <div className={isDarkTheme ? "dark" : ""}>
      <div className="min-h-screen bg-background transition-all duration-200">
        <div className="p-6 space-y-6">

          {/* ── KPI Cards ──────────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard
              title="Total Attempts"
              value="14,205"
              subtitle="+12% this week"
              subtitleColor="#1E8E54"
              icon={<People size={16} defaultColor={isDarkTheme ? "#B7D6C9" : "#145B47"} />}
            />
            <KpiCard
              title="Pass Rate"
              value="68.4%"
              subtitle="Target: 70%"
              subtitleColor="#316F5D"
              progressValue={68.4}
              icon={<Check size={16} defaultColor={isDarkTheme ? "#B7D6C9" : "#145B47"} />}
            />
            <KpiCard
              title="Avg Completion"
              value="4m 12s"
              subtitle="Limit: 10 mins"
              subtitleColor="#316F5D"
              icon={<Stats size={16} defaultColor={isDarkTheme ? "#B7D6C9" : "#145B47"} />}
            />
            <KpiCard
              title="Active Sessions"
              value="42"
              subtitle="Live Now"
              subtitleColor="#1E8E54"
              icon={<Mobile size={16} defaultColor={isDarkTheme ? "#B7D6C9" : "#145B47"} />}
            />
          </div>

          {/* ── Bottom Row: Question Repo + Quiz Config ─────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* ── Question Repository ──────────────────────────────────────── */}
            <div className={`rounded-veryLarge border flex flex-col ${surfaceClass}`}>
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b gap-3 border-gray-100 dark:border-darkBorder">
                <div className="flex items-center gap-2">
                  <h2 className={`text-base sm:text-lg font-bold ${isDarkTheme ? "text-darkTextPrimary" : "text-primary"}`}>
                    Question Repository
                  </h2>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-medium
                    ${isDarkTheme ? "bg-darkBackground text-darkTextSecondary" : "bg-secondary text-secondaryDark"}`}>
                    {questions.length} Total
                  </span>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Search size={16} defaultColor={isDarkTheme ? "#B7D6C9" : "#316F5D"} />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={function (e) { setSearchQuery(e.target.value); }}
                    placeholder="Search questions..."
                    className={`w-full pl-10 pr-4 py-2.5 rounded-large text-sm border outline-none
                      focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]
                      transition-all duration-200 ease-in-out
                      ${isDarkTheme
                        ? "bg-darkBackground border-darkBorder text-darkTextPrimary placeholder:text-darkTextSecondary"
                        : "bg-white border-gray-200 text-secondaryDark placeholder:text-gray-400"}`}
                  />
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleBulkUpload}
                  />
                  <button
                    onClick={function () { fileInputRef.current && fileInputRef.current.click(); }}
                    className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-large text-xs sm:text-sm font-semibold border
                      hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]
                      transition-all duration-200 ease-in-out flex-1 sm:flex-initial
                      ${isDarkTheme ? "bg-darkBackground border-darkBorder text-darkTextPrimary" : "bg-secondary border-gray-200 text-secondaryDark"}`}
                  >
                    <Upload size={16} defaultColor={isDarkTheme ? "#B7D6C9" : "#316F5D"} />
                    <span className="hidden sm:inline">Bulk Upload</span>
                  </button>

                  <button
                    onClick={function () { setShowQuestionModal(true); }}
                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-large text-xs sm:text-sm font-semibold bg-primary text-white
                      hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99]
                      transition-all duration-200 ease-in-out flex-1 sm:flex-initial"
                  >
                    <Add size={16} defaultColor="#fff" isDarkTheme={true} />
                    <span className="hidden sm:inline">Add New</span>
                    <span className="sm:hidden">New</span>
                  </button>
                </div>
              </div>

              {/* Column Labels */}
              <div className={`flex items-center px-6 py-3 border-b ${isDarkTheme ? "border-darkBorder" : "border-gray-100"}`}>
                <span className={`text-sm font-semibold flex-1 ${isDarkTheme ? "text-darkTextSecondary" : "text-secondaryDark"}`}>
                  Question Text
                </span>
                <span className={`text-sm font-semibold w-16 text-right ${isDarkTheme ? "text-darkTextSecondary" : "text-secondaryDark"}`}>
                  Actions
                </span>
              </div>

              {/* Rows via Pagination */}
              <div className="flex-1 px-2 pb-3">
                <Pagination
                  data={filteredQuestions}
                  itemsPerPage={5}
                  renderItem={function (question) {
                    const globalIdx = filteredQuestions.indexOf(question) + 1;
                    return (
                      <QuestionRow
                        key={question.id}
                        question={question}
                        index={globalIdx}
                        onEdit={handleOpenEdit}
                        onDelete={handleDeleteQuestion}
                        isDarkTheme={isDarkTheme}
                      />
                    );
                  }}
                />
              </div>
            </div>

            {/* ── Quiz Configuration ───────────────────────────────────────── */}
            <div className={`rounded-veryLarge border flex flex-col ${surfaceClass}`}>
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-darkBorder">
                <div>
                  <h2 className={`text-lg font-bold ${isDarkTheme ? "text-darkTextPrimary" : "text-primary"}`}>
                    Quiz Configurations
                  </h2>
                  <p className={`text-sm mt-1 ${isDarkTheme ? "text-darkTextSecondary" : "text-secondaryDark"}`}>
                    Select one active configuration
                  </p>
                </div>
                <button
                  onClick={function () { setShowConfigModal(true); }}
                  className="flex items-center gap-2 px-4 py-3 rounded-large text-sm font-semibold bg-primary text-white hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:scale-[0.99] transition-all duration-200 ease-in-out"
                >
                  <Add size={16} defaultColor="#fff" isDarkTheme={true} />
                  Add Config
                </button>
              </div>

              <div className="p-6 space-y-3 flex-1 overflow-y-auto">
                {configs.map(function (config) {
                  return (
                    <ConfigCard
                      key={config.id}
                      config={config}
                      isSelected={selectedConfigId === config.id}
                      onSelect={function () { setSelectedConfigId(config.id); }}
                      onEdit={handleOpenEditConfig}
                      isDarkTheme={isDarkTheme}
                    />
                  );
                })}
              </div>

              {/* Active config summary */}
              <div className={`mx-6 mb-6 p-4 rounded-large border ${isDarkTheme ? "bg-darkBackground border-darkBorder" : "bg-secondary border-gray-200"}`}>
                {(function () {
                  const active = configs.find(function (c) { return c.id === selectedConfigId; });
                  if (!active) return null;
                  return (
                    <>
                      <p className={`text-sm font-semibold mb-1 ${isDarkTheme ? "text-darkTextSecondary" : "text-secondaryDark"}`}>
                        Active: {active.name}
                      </p>
                      <p className={`text-sm ${isDarkTheme ? "text-darkTextPrimary" : "text-primary"}`}>
                        {active.duration} min • {active.totalQuestions} Qs • Pass: {active.passmark}/{active.totalScore}
                      </p>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ───────────────────────────────────────────────────────────── */}
      {showQuestionModal && (
        <UpdateQuestionModal
          onClose={handleCloseQuestionModal}
          onSave={handleSaveQuestion}
          existingQuestion={editingQuestion}
        />
      )}

      {showConfigModal && (
        <ConfigModal
          onClose={handleCloseConfigModal}
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
