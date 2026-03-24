"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { registerForEvent } from "../../../api/dashboard";

const EventRegistrationModal = ({ event, isOpen, onClose, currentUser, darkMode = false, onRegisterSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [isGroup, setIsGroup] = useState(event.myRegistration ? event.myRegistration.isGroup : false);
  const [groupMembers, setGroupMembers] = useState(
    event.myRegistration?.isGroup && event.myRegistration.groupMembers?.length > 0
      ? event.myRegistration.groupMembers
      : [{ name: "", email: "", mobile: "", enrollmentNumber: "" }]
  );
  
  const [answers, setAnswers] = useState(() => {
    if (event.myRegistration && event.myRegistration.answers) {
      return event.myRegistration.answers;
    }
    const initial = {};
    if (event.registrationFields) {
      Object.keys(event.registrationFields).forEach(field => {
        if (event.registrationFields[field]) {
          // Attempt to pre-fill from currentUser, otherwise empty string
          initial[field] = currentUser?.[field] || "";
        }
      });
    }
    return initial;
  });

  if (!isOpen) return null;

  const handleMemberChange = (index, field, value) => {
    const updated = [...groupMembers];
    updated[index][field] = value;
    setGroupMembers(updated);
  };

  const addMember = () => {
    if (groupMembers.length < 4) {
      setGroupMembers([...groupMembers, { name: "", email: "", mobile: "", enrollmentNumber: "" }]);
    }
  };

  const removeMember = (index) => {
    setGroupMembers(groupMembers.filter((_, i) => i !== index));
  };

  const handleAnswerChange = (question, value) => {
    setAnswers(prev => ({ ...prev, [question]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        eventId: event._id,
        isGroup,
        groupMembers: isGroup ? groupMembers : [],
        answers
      };

      const result = await registerForEvent(payload);
      if (result.registration) {
        toast.success("🎉 Registration successful!");
        if (onRegisterSuccess) {
           onRegisterSuccess(result.registration);
        }
        onClose();
      } else {
        toast.error(result.message || "❌ Registration failed.");
      }
    } catch (err) {
      toast.error("❌ An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className={`relative w-full max-w-xl ${darkMode ? "bg-slate-900 border-white/10" : "bg-white border-gray-200"} border rounded-[2rem] shadow-2xl overflow-hidden my-auto`}>
        <div className={`px-8 py-4 border-b ${darkMode ? "border-white/10" : "border-gray-100"} flex items-center justify-between`}>
          <h2 className={`text-xl font-black ${darkMode ? "text-white" : "text-gray-900"}`}>Register for Event</h2>
          <button onClick={onClose} className="text-2xl text-gray-400">&times;</button>
        </div>

        <form onSubmit={handleRegister} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <h3 className={`font-bold ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Event: {event.title}</h3>
            
            {event.allowGroupRegistration && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <input 
                  type="checkbox" 
                  checked={isGroup} 
                  onChange={(e) => setIsGroup(e.target.checked)}
                  id="group-reg"
                  className="w-4 h-4"
                />
                <label htmlFor="group-reg" className="text-sm font-bold text-blue-600 dark:text-blue-400 cursor-pointer">Register as a Group (2-4 members)</label>
              </div>
            )}

            {/* Base Registration Fields */}
            {event.registrationFields && Object.keys(event.registrationFields).map(field => {
              if (!event.registrationFields[field]) return null;
              
              const isPhone = field === "phoneNumber" || field === "mobileNumber";
              
              return (
                <div key={field} className="space-y-1">
                  <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {field.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  
                  {isPhone ? (
                    <div className="flex gap-2">
                      <div className={`p-3 rounded-xl border flex items-center justify-center font-bold ${darkMode ? "bg-slate-800 border-white/10 text-white" : "bg-gray-100 border-gray-200 text-gray-700"} `}>
                        +91
                      </div>
                      <input
                        required
                        type="tel"
                        maxLength={10}
                        pattern="\d{10}"
                        placeholder="10-digit number"
                        value={answers[field] || ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                          handleAnswerChange(field, val);
                        }}
                        className={`flex-1 p-3 rounded-xl border ${darkMode ? "bg-slate-800 border-white/10 text-white" : "bg-white border-gray-200"}`}
                      />
                    </div>
                  ) : (
                    <input
                      required
                      value={answers[field] || ""}
                      onChange={(e) => handleAnswerChange(field, e.target.value)}
                      className={`w-full p-3 rounded-xl border ${darkMode ? "bg-slate-800 border-white/10 text-white" : "bg-white border-gray-200"}`}
                    />
                  )}
                </div>
              );
            })}

            {/* Custom Questions */}
            {event.customQuestions?.map((q, i) => (
              <div key={i} className="space-y-1">
                <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{q.question}</label>
                <input
                  required
                  placeholder="Your answer..."
                  className={`w-full p-3 rounded-xl border ${darkMode ? "bg-slate-800 border-white/10 text-white" : "bg-white border-gray-200"}`}
                  onChange={(e) => handleAnswerChange(q.question, e.target.value)}
                />
              </div>
            ))}

            {isGroup && (
              <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/5">
                <h4 className={`text-sm font-black uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Group Members</h4>
                {groupMembers.map((member, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border ${darkMode ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100"} space-y-3`}>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-blue-500">Member {idx + 1}</span>
                      {idx > 0 && <button type="button" onClick={() => removeMember(idx)} className="text-red-500 text-xs">Remove</button>}
                    </div>
                    <input 
                      placeholder="Name" 
                      className={`w-full p-2 text-sm rounded-lg border ${darkMode ? "bg-slate-800 border-white/10 text-white" : "bg-white border-gray-200"}`}
                      value={member.name}
                      onChange={(e) => handleMemberChange(idx, "name", e.target.value)}
                      required
                    />
                    <input 
                      placeholder="Email" 
                      className={`w-full p-2 text-sm rounded-lg border ${darkMode ? "bg-slate-800 border-white/10 text-white" : "bg-white border-gray-200"}`}
                      value={member.email}
                      onChange={(e) => handleMemberChange(idx, "email", e.target.value)}
                      required
                    />
                    <div className="grid grid-cols-2 gap-2">
                       <input 
                        placeholder="Mobile" 
                        className={`p-2 text-sm rounded-lg border ${darkMode ? "bg-slate-800 border-white/10 text-white" : "bg-white border-gray-200"}`}
                        value={member.mobile}
                        onChange={(e) => handleMemberChange(idx, "mobile", e.target.value)}
                        required
                      />
                       <input 
                        placeholder="Enrollment #" 
                        className={`p-2 text-sm rounded-lg border ${darkMode ? "bg-slate-800 border-white/10 text-white" : "bg-white border-gray-200"}`}
                        value={member.enrollmentNumber}
                        onChange={(e) => handleMemberChange(idx, "enrollmentNumber", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                ))}
                {groupMembers.length < 4 && (
                  <button type="button" onClick={addMember} className={`w-full py-2 border-2 border-dashed rounded-xl text-sm font-bold ${darkMode ? "border-white/20 text-gray-400" : "border-gray-200 text-gray-500"}`}>
                    + Add Member
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${loading ? "bg-gray-400" : "bg-black text-white hover:bg-gray-800 shadow-xl active:scale-95"}`}
          >
            {loading ? "Registering..." : "Confirm Registration"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EventRegistrationModal;
