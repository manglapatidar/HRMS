import { useState, useEffect } from 'react';
import { Download, Search, Users, Clock } from 'lucide-react';
import axios from '../api/axios';
import { toast } from 'react-toastify';

function CompanyReports() {
  const [activeTab, setActiveTab] = useState('overtime');
  
  // Overtime State
  const [otMonth, setOtMonth] = useState(new Date().getMonth() + 1);
  const [otYear, setOtYear] = useState(new Date().getFullYear());
  const [otData, setOtData] = useState([]);
  const [loadingOt, setLoadingOt] = useState(false);

  // Attrition State
  const [attrStart, setAttrStart] = useState('');
  const [attrEnd, setAttrEnd] = useState('');
  const [attrData, setAttrData] = useState(null);
  const [loadingAttr, setLoadingAttr] = useState(false);

  const fetchOvertime = async () => {
    try {
      setLoadingOt(true);
      const res = await axios.get(`/reports/overtime?month=${otMonth}&year=${otYear}`);
      setOtData(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch overtime data');
    } finally {
      setLoadingOt(false);
    }
  };

  const fetchAttrition = async () => {
    if (!attrStart || !attrEnd) {
      toast.error('Please select both start and end dates');
      return;
    }
    try {
      setLoadingAttr(true);
      const res = await axios.get(`/reports/attrition?startDate=${attrStart}&endDate=${attrEnd}`);
      setAttrData(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch attrition data');
    } finally {
      setLoadingAttr(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'overtime') {
      fetchOvertime();
    }
  }, [activeTab]);

  const downloadCSV = (type) => {
    let csvStr = '';
    let filename = '';

    if (type === 'overtime') {
      filename = `overtime_report_${otYear}_${otMonth}.csv`;
      csvStr = 'Employee ID,First Name,Last Name,Total Overtime (Hours)\n';
      otData.forEach(row => {
        csvStr += `${row.employee.employeeId},${row.employee.firstName},${row.employee.lastName},${row.totalOvertimeHours}\n`;
      });
    } else {
      if (!attrData) return;
      filename = `attrition_report.csv`;
      csvStr = 'Employee ID,First Name,Last Name,Exit Date\n';
      attrData.exitedEmployees.forEach(emp => {
        csvStr += `${emp.employeeId},${emp.firstName},${emp.lastName},${new Date(emp.exitDate).toLocaleDateString()}\n`;
      });
    }

    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Company Reports</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('overtime')}
              className={`${
                activeTab === 'overtime'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex-1 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm text-center`}
            >
              Overtime Report
            </button>
            <button
              onClick={() => setActiveTab('attrition')}
              className={`${
                activeTab === 'attrition'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } flex-1 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm text-center`}
            >
              Attrition Report
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overtime' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-auto">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Month</label>
                  <select
                    value={otMonth}
                    onChange={(e) => setOtMonth(e.target.value)}
                    className="w-full md:w-auto border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-text-dark dark:text-text-light"
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                    ))}
                  </select>
                </div>
                <div className="w-full md:w-auto">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
                  <input
                    type="number"
                    value={otYear}
                    onChange={(e) => setOtYear(e.target.value)}
                    className="w-full md:w-24 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-text-dark dark:text-text-light"
                  />
                </div>
                <div className="flex flex-col md:flex-row gap-3 items-start mt-2 md:mt-6">
                  <button onClick={fetchOvertime} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center w-full md:w-auto justify-center">
                    <Search className="w-4 h-4 mr-2" />
                    Generate
                  </button>
                  <button onClick={() => downloadCSV('overtime')} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center w-full md:w-auto justify-center">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </button>
                </div>
              </div>

              {loadingOt ? (
                <p className="text-gray-500">Loading overtime data...</p>
              ) : otData.length === 0 ? (
                <p className="text-gray-500">No overtime recorded for this period.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Overtime Hours</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {otData.map((row) => (
                        <tr key={row.employee._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {row.employee.firstName} {row.employee.lastName}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{row.employee.employeeId}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white flex items-center">
                              <Clock className="w-4 h-4 mr-2 text-yellow-500" />
                              {row.totalOvertimeHours} hrs
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'attrition' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-auto">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={attrStart}
                    onChange={(e) => setAttrStart(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-text-dark dark:text-text-light"
                  />
                </div>
                <div className="w-full md:w-auto">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                  <input
                    type="date"
                    value={attrEnd}
                    onChange={(e) => setAttrEnd(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-text-dark dark:text-text-light"
                  />
                </div>
                <div className="flex flex-col md:flex-row gap-3 items-start mt-2 md:mt-6 w-full md:w-auto">
                  <button onClick={fetchAttrition} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center justify-center w-full md:w-auto">
                    <Search className="w-4 h-4 mr-2" />
                    Generate
                  </button>
                  {attrData && (
                    <button onClick={() => downloadCSV('attrition')} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center w-full md:w-auto">
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </button>
                  )}
                </div>
              </div>

              {loadingAttr ? (
                <p className="text-gray-500">Loading attrition data...</p>
              ) : attrData && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Exits</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{attrData.exitsCount}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Start Headcount</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{attrData.startHeadcount}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">End Headcount</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{attrData.endHeadcount}</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center border border-red-100 dark:border-red-800">
                      <p className="text-sm text-red-600 dark:text-red-400 font-semibold">Attrition Rate</p>
                      <p className="text-3xl font-bold text-red-700 dark:text-red-300">{attrData.attritionRate}%</p>
                    </div>
                  </div>

                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-4">Exited Employees</h3>
                  {attrData.exitedEmployees.length === 0 ? (
                    <p className="text-gray-500">No exits recorded in this period.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Employee</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Join Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Exit Date</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {attrData.exitedEmployees.map((emp) => (
                            <tr key={emp._id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <Users className="w-5 h-5 text-gray-400 mr-3" />
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {emp.firstName} {emp.lastName}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{emp.employeeId}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {new Date(emp.dateOfJoining).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">
                                {new Date(emp.exitDate).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CompanyReports;
