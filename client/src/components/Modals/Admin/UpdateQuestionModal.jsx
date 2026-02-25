import React, { useState, useEffect } from "react";
import { X } from "../../../assets/icons/icons";
import ThemeStore from "../../../store/ThemeStore";

function UpdateQuestionModal({ onClose, onSave, existingQuestion = null }) {
  const { isDarkTheme } = ThemeStore();

  const isEdit = Boolean(existingQuestion);

  const [form, setForm] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctOption: 0,
  });

  useEffect(function () {
    if (existingQuestion) {
      setForm({
        questionText: existingQuestion.questionText || "",
        options: existingQuestion.options || ["", "", "", ""],
        correctOption: existingQuestion.correctOption || 0,
      });
    }
  }, [existingQuestion]);

  function handleChange(field, value) {
    setForm(function (prev) {
      return { ...prev, [field]: value };
    });
  }

  function handleOptionChange(index, value) {
    setForm(function (prev) {
      const updated = [...prev.options];
      updated[index] = value;
      return { ...prev, options: updated };
    });
  }

  function handleSubmit() {
    if (!form.questionText.trim()) return;
    onSave(form);
    onClose();
  }

  const inputClass = `w-full px-3 py-2 rounded-medium text-sm border outline-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200
    ${isDarkTheme
      ? "bg-darkBackground border-darkBorder text-darkTextPrimary placeholder:text-darkTextSecondary"
      : "bg-background border-gray-200 text-secondaryDark placeholder:text-gray-400"
    }`;

  const labelClass = `text-xs font-semibold mb-1 block ${isDarkTheme ? "text-darkTextSecondary" : "text-secondaryDark"}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative z-10 w-full max-w-lg mx-4 rounded-veryLarge border shadow-lg p-6 space-y-4
          ${isDarkTheme ? "bg-darkSurface border-darkBorder" : "bg-white border-gray-200"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-base font-bold ${isDarkTheme ? "text-darkTextPrimary" : "text-primary"}`}>
              {isEdit ? "Edit Question" : "Add New Question"}
            </h2>
            <p className={`text-xs mt-0.5 ${isDarkTheme ? "text-darkTextSecondary" : "text-secondaryDark"}`}>
              {isEdit ? "Update the question details below" : "Fill in the details to add a new question"}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-medium hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200
              ${isDarkTheme ? "bg-darkBackground text-darkTextSecondary" : "bg-secondary text-secondaryDark"}`}
          >
            <X size={16} defaultColor={isDarkTheme ? "#B7D6C9" : "#316F5D"} />
          </button>
        </div>

        {/* Question Text */}
        <div>
          <label className={labelClass}>Question Text</label>
          <textarea
            rows={3}
            value={form.questionText}
            onChange={function (e) { handleChange("questionText", e.target.value); }}
            placeholder="Enter question text..."
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Options */}
        <div>
          <label className={labelClass}>Answer Options</label>
          <div className="space-y-2">
            {form.options.map(function (opt, idx) {
              return (
                <div key={idx} className="flex items-center gap-2">
                  <button
                    onClick={function () { handleChange("correctOption", idx); }}
                    className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all duration-200 hover:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20
                      ${form.correctOption === idx
                        ? "border-primaryLight bg-primaryLight"
                        : isDarkTheme ? "border-darkBorder" : "border-gray-300"
                      }`}
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={function (e) { handleOptionChange(idx, e.target.value); }}
                    placeholder={`Option ${idx + 1}`}
                    className={inputClass}
                  />
                </div>
              );
            })}
          </div>
          <p className={`text-xs mt-1 ${isDarkTheme ? "text-darkTextSecondary" : "text-secondaryDark"}`}>
            Click the circle to mark the correct answer
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className={`flex-1 py-2 rounded-medium text-xs font-semibold hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200
              ${isDarkTheme ? "bg-darkBackground text-darkTextPrimary border border-darkBorder" : "bg-secondary text-secondaryDark"}`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2 rounded-medium text-xs font-semibold bg-primary text-white hover:scale-[0.99] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
          >
            {isEdit ? "Save Changes" : "Add Question"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UpdateQuestionModal;
