"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { registerForEvent } from "../../../api/dashboard";

const EventRegistrationModal = ({ event, isOpen, onClose, currentUser, darkMode = false, onRegisterSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
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
    const newErrors = [];
    if (event.registrationFields) {
      Object.keys(event.registrationFields).forEach(field => {
        if (event.registrationFields[field] && !answers[field]) {
          newErrors.push(field);
        }
      });
    }
    if (event.customQuestions) {
      event.customQuestions.forEach(q => {
        if (!answers[q.question]) newErrors.push(q.question);
      });
    }
    if (isGroup) {
      groupMembers.forEach((member, idx) => {
        if (!member.name) newErrors.push(`group_${idx}_name`);
        if (!member.email) newErrors.push(`group_${idx}_email`);
        if (!member.mobile) newErrors.push(`group_${idx}_mobile`);
        if (!member.enrollmentNumber) newErrors.push(`group_${idx}_enrollmentNumber`);
      });
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      toast.error("❌ Please fill in all required fields.");
      return;
    }
    setErrors([]);

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
        if (result.message && result.message.toLowerCase().includes("not found")) {
            toast.error("❌ Event not found! It may have been deleted.");
            setTimeout(() => {
                window.location.href = "/dashboard";
            }, 1000);
        } else {
            toast.error(result.message || "❌ Registration failed.");
        }
      }
    } catch (err) {
      toast.error("❌ An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  const getErrorClass = (field) => {
    return errors.includes(field)
      ? "flex-1 p-[2px] rounded-xl bg-red-500 focus-within:ring-2 focus-within:ring-red-400 shadow-lg animate-pulse transition-all leading-none"
      : "flex-1 p-[2px] rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 focus-within:ring-2 focus-within:ring-purple-400 transition-all leading-none";
  };

  const getBaseErrorClass = (field, isGroup = false) => {
     return errors.includes(field)
      ? `p-[2px] ${isGroup ? 'rounded-lg' : 'rounded-xl'} bg-red-500 focus-within:ring-2 focus-within:ring-red-400 shadow-lg animate-pulse transition-all`
      : `p-[2px] ${isGroup ? 'rounded-lg' : 'rounded-xl'} bg-gradient-to-r from-blue-500 to-purple-500 focus-within:ring-2 focus-within:ring-purple-400 transition-all`;
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className={`p-[2px] rounded-[2.1rem] bg-gradient-to-tr from-blue-500 to-purple-600 w-full max-w-xl my-auto shadow-2xl transition-all`}>
        <div className={`relative w-full h-full ${darkMode ? "bg-slate-900" : "bg-white"} rounded-[2rem] overflow-hidden`}>
          <div className={`px-8 py-4 border-b ${darkMode ? "border-white/10" : "border-gray-100"} flex items-center justify-between`}>
            <h2 className={`text-xl font-black ${darkMode ? "text-white" : "text-black"}`}>Register for Event</h2>
            <button onClick={onClose} className="text-2xl text-gray-400 hover:text-red-500">&times;</button>
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
                  <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-black"} ${errors.includes(field) ? "text-red-500" : ""}`}>
                    {field.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  
                  {isPhone ? (
                    <div className="flex gap-2">
                       <div className="p-[2px] rounded-xl bg-gradient-to-r from-blue-500 to-purple-500">
                          <div className={`p-3 rounded-[10px] h-full flex items-center justify-center font-bold ${darkMode ? "bg-slate-900 text-white" : "bg-white text-black"} `}>
                            +91
                          </div>
                       </div>
                       <div className={getErrorClass(field)}>
                        <input
                          type="tel"
                          maxLength={10}
                          pattern="\d{10}"
                          placeholder="10-digit number"
                          value={answers[field] || ""}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                            handleAnswerChange(field, val);
                            setErrors(prev => prev.filter(err => err !== field));
                          }}
                          className={`w-full p-3 h-full rounded-[10px] ${darkMode ? "bg-slate-900 text-white" : "bg-white text-black"} outline-none border-none`}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className={getBaseErrorClass(field)}>
                      <input
                        value={answers[field] || ""}
                        onChange={(e) => { handleAnswerChange(field, e.target.value); setErrors(prev => prev.filter(err => err !== field)); }}
                        className={`w-full p-3 rounded-[10px] ${darkMode ? "bg-slate-900 text-white" : "bg-white text-black"} outline-none border-none`}
                      />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Custom Questions */}
            {event.customQuestions?.map((q, i) => (
              <div key={i} className="space-y-1">
                <label className={`text-xs font-black uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-black"} ${errors.includes(q.question) ? "text-red-500" : ""}`}>{q.question}</label>
                <div className={getBaseErrorClass(q.question)}>
                  <input
                    placeholder="Your answer..."
                    className={`w-full p-3 rounded-[10px] ${darkMode ? "bg-slate-900 text-white" : "bg-white text-black"} outline-none border-none`}
                    onChange={(e) => { handleAnswerChange(q.question, e.target.value); setErrors(prev => prev.filter(err => err !== q.question)); }}
                  />
                </div>
              </div>
            ))}

            {isGroup && (
              <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/5">
                <h4 className={`text-sm font-black uppercase tracking-widest ${darkMode ? "text-gray-400" : "text-black"}`}>Group Members</h4>
                {groupMembers.map((member, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border ${darkMode ? "bg-slate-800 border-white/10" : "bg-blue-50/50 border-blue-100"} space-y-3`}>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-blue-600">Member {idx + 1}</span>
                      {idx > 0 && <button type="button" onClick={() => removeMember(idx)} className="text-red-500 text-xs font-bold uppercase tracking-widest">Remove</button>}
                    </div>
                    <div className={getBaseErrorClass(`group_${idx}_name`, true)}>
                      <input 
                        placeholder="Name" 
                        className={`w-full p-3 text-sm rounded-[6px] ${darkMode ? "bg-slate-900 text-white" : "bg-white text-black"} outline-none border-none`}
                        value={member.name}
                        onChange={(e) => { handleMemberChange(idx, "name", e.target.value); setErrors(prev => prev.filter(err => err !== `group_${idx}_name`)); }}
                      />
                    </div>
                    <div className={getBaseErrorClass(`group_${idx}_email`, true)}>
                      <input 
                        placeholder="Email" 
                        className={`w-full p-3 text-sm rounded-[6px] ${darkMode ? "bg-slate-900 text-white" : "bg-white text-black"} outline-none border-none`}
                        value={member.email}
                        onChange={(e) => { handleMemberChange(idx, "email", e.target.value); setErrors(prev => prev.filter(err => err !== `group_${idx}_email`)); }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                       <div className={getBaseErrorClass(`group_${idx}_mobile`, true)}>
                         <input 
                          placeholder="Mobile" 
                          className={`w-full p-3 text-sm rounded-[6px] ${darkMode ? "bg-slate-900 text-white" : "bg-white text-black"} outline-none border-none`}
                          value={member.mobile}
                          onChange={(e) => { handleMemberChange(idx, "mobile", e.target.value); setErrors(prev => prev.filter(err => err !== `group_${idx}_mobile`)); }}
                        />
                       </div>
                       <div className={getBaseErrorClass(`group_${idx}_enrollmentNumber`, true)}>
                         <input 
                          placeholder="Enrollment #" 
                          className={`w-full p-3 text-sm rounded-[6px] ${darkMode ? "bg-slate-900 text-white" : "bg-white text-black"} outline-none border-none`}
                          value={member.enrollmentNumber}
                          onChange={(e) => { handleMemberChange(idx, "enrollmentNumber", e.target.value); setErrors(prev => prev.filter(err => err !== `group_${idx}_enrollmentNumber`)); }}
                        />
                       </div>
                    </div>
                  </div>
                ))}
                {groupMembers.length < 4 && (
                  <button type="button" onClick={addMember} className={`w-full py-3 border-2 border-dashed rounded-xl text-sm font-black uppercase tracking-widest ${darkMode ? "border-white/20 text-gray-400" : "border-gray-200 text-black"}`}>
                    + Add Member
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-5 rounded-3xl text-sm font-black uppercase tracking-[0.2em] transition-all ${loading ? "bg-gray-400" : "bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-xl active:scale-95"}`}
          >
            {loading ? "Registering..." : "Confirm Registration"}
          </button>
        </form>
      </div>
    </div>
  </div>
  );
};

export default EventRegistrationModal;
