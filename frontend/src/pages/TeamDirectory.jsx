import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Users, Search, Mail, Phone, Calendar, MapPin, X, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TeamDirectory = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await api.get('/org/team/directory');
      setTeam(res.data || []);
    } catch (error) {
      console.error('Failed to fetch team directory', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const filteredTeam = team.filter(member => {
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || member.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const openProfileModal = (member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-text-dark dark:text-text-light flex items-center gap-2">
            <Users className="text-accent-gold" /> Team Directory
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Browse and view profiles of your direct reports.
          </p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search team member..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border-light dark:border-border-dark rounded-md bg-white dark:bg-gray-800 text-text-dark dark:text-text-light focus:ring-accent-gold focus:border-accent-gold outline-none text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading team members...</div>
      ) : filteredTeam.length === 0 ? (
        <div className="py-12 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-border-light dark:border-border-dark">
          No team members found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeam.map((member, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={member._id}
              onClick={() => openProfileModal(member)}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-border-light dark:border-border-dark hover:border-accent-gold/50 cursor-pointer transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-4 mb-4">
                  {member.profilePhoto ? (
                    <img 
                      src={`${import.meta.env.VITE_API_URL || ''}${member.profilePhoto}`} 
                      alt="avatar" 
                      className="w-14 h-14 rounded-full object-cover border border-gray-200 dark:border-gray-700" 
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-accent-gold/20 text-accent-bronze dark:text-accent-gold flex items-center justify-center font-bold text-lg">
                      {member.firstName[0]}{member.lastName[0]}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-text-dark dark:text-text-light group-hover:text-accent-gold transition-colors">
                      {member.firstName} {member.lastName}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">{member.employeeId}</p>
                    <p className="text-xs font-medium text-accent-gold mt-1">{member.designation}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 border-t border-border-light dark:border-border-dark pt-3">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-gray-400" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-400" />
                    <span>{member.contactNumber || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border-light dark:border-border-dark flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-450">Today's Status:</span>
                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${
                  member.attendanceStatus === 'Present' || member.attendanceStatus === 'On Leave'
                    ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                    : member.attendanceStatus === 'Late' || member.attendanceStatus === 'Half-day'
                      ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
                      : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                }`}>
                  {member.attendanceStatus}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Read-Only Profile Detail Modal */}
      <AnimatePresence>
        {isModalOpen && selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-border-light dark:border-border-dark flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                <h3 className="text-lg font-serif font-semibold text-text-dark dark:text-text-light flex items-center gap-2">
                  <UserCircle size={20} className="text-accent-gold" /> Team Member Profile
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                <div className="flex items-center gap-4">
                  {selectedMember.profilePhoto ? (
                    <img 
                      src={`${import.meta.env.VITE_API_URL || ''}${selectedMember.profilePhoto}`} 
                      alt="avatar" 
                      className="w-20 h-20 rounded-full object-cover border-2 border-accent-gold" 
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-accent-gold/20 text-accent-bronze dark:text-accent-gold flex items-center justify-center font-bold text-2xl border-2 border-accent-gold">
                      {selectedMember.firstName[0]}{selectedMember.lastName[0]}
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-text-dark dark:text-text-light">{selectedMember.firstName} {selectedMember.lastName}</h2>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{selectedMember.employeeId}</p>
                    <p className="text-sm font-semibold text-accent-gold mt-1">{selectedMember.designation} • {selectedMember.department}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-border-light dark:border-border-dark">
                  <div>
                    <p className="text-xs text-gray-400">Email Address</p>
                    <p className="font-medium text-text-dark dark:text-text-light mt-0.5 truncate">{selectedMember.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Contact Number</p>
                    <p className="font-medium text-text-dark dark:text-text-light mt-0.5">{selectedMember.contactNumber || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Location</p>
                    <p className="font-medium text-text-dark dark:text-text-light mt-0.5 flex items-center gap-1">
                      <MapPin size={14} className="text-gray-400" /> {selectedMember.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Date of Joining</p>
                    <p className="font-medium text-text-dark dark:text-text-light mt-0.5 flex items-center gap-1">
                      <Calendar size={14} className="text-gray-400" /> 
                      {selectedMember.dateOfJoining ? new Date(selectedMember.dateOfJoining).toLocaleDateString() : '-'}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border-light dark:border-border-dark">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Leave Balances</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedMember.balances && selectedMember.balances.length > 0 ? (
                      selectedMember.balances.map(b => (
                        <div key={b.name} className="p-3 bg-gray-50 dark:bg-gray-900 border border-border-light dark:border-border-dark rounded-lg flex justify-between items-center">
                          <span className="text-xs font-medium text-text-dark dark:text-text-light">{b.name}</span>
                          <span className="text-sm font-bold text-accent-gold">
                            {b.requiresBalance ? `${b.balance} / ${b.total}d` : 'Unlimited'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 col-span-2">No leave balance records found.</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamDirectory;
